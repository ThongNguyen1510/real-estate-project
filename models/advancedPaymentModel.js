const { sql } = require('../config/database');
const crypto = require('crypto');
const axios = require('axios');
const qs = require('qs');
const paymentGateways = require('../config/paymentConfig');
const moment = require('moment');

const advancedPaymentModel = {
    // ------------------------------
    // Core Payment Methods
    // ------------------------------
    
    // Tạo thanh toán mới
    createPayment: async (paymentData) => {
        try {
            const pool = await sql.connect();
            const result = await pool.request()
                .input('transaction_id', sql.Int, paymentData.transaction_id)
                .input('user_id', sql.Int, paymentData.user_id)
                .input('amount', sql.Decimal(18, 2), paymentData.amount)
                .input('payment_method', sql.NVarChar, paymentData.payment_method)
                .input('payment_source', sql.NVarChar, paymentData.payment_source)
                .input('gateway', sql.NVarChar, paymentData.gateway)
                .input('currency', sql.NVarChar, paymentData.currency || 'VND')
                .input('gateway_transaction_id', sql.NVarChar, paymentData.gateway_transaction_id)
                .input('gateway_payload', sql.NVarChar(sql.MAX), JSON.stringify(paymentData.gateway_payload || {}))
                .input('reference_number', sql.NVarChar, paymentData.reference_number)
                .input('payment_date', sql.DateTime, paymentData.payment_date || new Date())
                .input('description', sql.NVarChar, paymentData.description)
                .input('receipt_url', sql.NVarChar, paymentData.receipt_url)
                .input('status', sql.NVarChar, paymentData.status || 'pending')
                .query(`
                    INSERT INTO AdvancedPayments (
                        transaction_id, user_id, amount, payment_method, payment_source,
                        gateway, currency, gateway_transaction_id, gateway_payload,
                        reference_number, payment_date, description, receipt_url, status
                    )
                    OUTPUT INSERTED.id
                    VALUES (
                        @transaction_id, @user_id, @amount, @payment_method, @payment_source,
                        @gateway, @currency, @gateway_transaction_id, @gateway_payload,
                        @reference_number, @payment_date, @description, @receipt_url, @status
                    )
                `);
            return result.recordset[0].id;
        } catch (error) {
            console.error('Error creating advanced payment:', error);
            throw error;
        }
    },

    // Lấy danh sách thanh toán
    getPayments: async (filters = {}) => {
        try {
            const pool = await sql.connect();
            let query = `
                SELECT p.*, t.title as transaction_title, u.full_name as user_name,
                    pr.title as property_title
                FROM AdvancedPayments p
                LEFT JOIN Transactions t ON p.transaction_id = t.id
                LEFT JOIN Users u ON p.user_id = u.id
                LEFT JOIN Properties pr ON t.property_id = pr.id
                WHERE 1=1
            `;
            
            const request = pool.request();
            
            if (filters.transaction_id) {
                query += ' AND p.transaction_id = @transaction_id';
                request.input('transaction_id', sql.Int, filters.transaction_id);
            }
            
            if (filters.user_id) {
                query += ' AND p.user_id = @user_id';
                request.input('user_id', sql.Int, filters.user_id);
            }
            
            if (filters.status) {
                query += ' AND p.status = @status';
                request.input('status', sql.NVarChar, filters.status);
            }
            
            if (filters.payment_method) {
                query += ' AND p.payment_method = @payment_method';
                request.input('payment_method', sql.NVarChar, filters.payment_method);
            }
            
            if (filters.gateway) {
                query += ' AND p.gateway = @gateway';
                request.input('gateway', sql.NVarChar, filters.gateway);
            }
            
            if (filters.start_date) {
                query += ' AND p.payment_date >= @start_date';
                request.input('start_date', sql.DateTime, new Date(filters.start_date));
            }
            
            if (filters.end_date) {
                query += ' AND p.payment_date <= @end_date';
                request.input('end_date', sql.DateTime, new Date(filters.end_date));
            }
            
            // Count total for pagination
            const countQuery = query.replace('p.*, t.title as transaction_title, u.full_name as user_name, pr.title as property_title', 'COUNT(*) as total');
            const countResult = await request.query(countQuery);
            const total = countResult.recordset[0].total;
            
            // Apply sorting and pagination
            query += ' ORDER BY p.payment_date DESC';
            
            if (filters.page && filters.limit) {
                const offset = (filters.page - 1) * filters.limit;
                query += ' OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY';
                request.input('offset', sql.Int, offset);
                request.input('limit', sql.Int, filters.limit);
            }
            
            const result = await request.query(query);
            
            return {
                payments: result.recordset,
                pagination: {
                    total,
                    page: filters.page || 1,
                    limit: filters.limit || result.recordset.length
                }
            };
        } catch (error) {
            console.error('Error getting advanced payments:', error);
            throw error;
        }
    },

    // Lấy chi tiết thanh toán theo ID
    getPaymentById: async (paymentId) => {
        try {
            const pool = await sql.connect();
            const result = await pool.request()
                .input('payment_id', sql.Int, paymentId)
                .query(`
                    SELECT p.*, t.title as transaction_title, u.full_name as user_name,
                        pr.title as property_title
                    FROM AdvancedPayments p
                    LEFT JOIN Transactions t ON p.transaction_id = t.id
                    LEFT JOIN Users u ON p.user_id = u.id
                    LEFT JOIN Properties pr ON t.property_id = pr.id
                    WHERE p.id = @payment_id
                `);
            return result.recordset[0];
        } catch (error) {
            console.error('Error getting advanced payment:', error);
            throw error;
        }
    },

    // Cập nhật trạng thái thanh toán
    updatePaymentStatus: async (paymentId, status, transactionData = {}) => {
        try {
            const pool = await sql.connect();
            const request = pool.request()
                .input('payment_id', sql.Int, paymentId)
                .input('status', sql.NVarChar, status)
                .input('gateway_transaction_id', sql.NVarChar, transactionData.gateway_transaction_id)
                .input('updated_at', sql.DateTime, new Date());
            
            let query = `
                UPDATE AdvancedPayments SET 
                    status = @status, 
                    updated_at = @updated_at
            `;
            
            if (transactionData.gateway_transaction_id) {
                query += ', gateway_transaction_id = @gateway_transaction_id';
            }
            
            if (transactionData.gateway_payload) {
                query += ', gateway_payload = JSON_MODIFY(gateway_payload, \'$.response\', @gateway_payload)';
                request.input('gateway_payload', sql.NVarChar(sql.MAX), JSON.stringify(transactionData.gateway_payload));
            }
            
            query += ' WHERE id = @payment_id';
            
            await request.query(query);
            return true;
        } catch (error) {
            console.error('Error updating payment status:', error);
            throw error;
        }
    },

    // ------------------------------
    // VNPay Methods
    // ------------------------------
    
    // Tạo URL thanh toán VNPay
    createVnpayPaymentUrl: async (paymentData, ipAddr) => {
        try {
            const tmnCode = paymentGateways.vnpay.tmnCode;
            const secretKey = paymentGateways.vnpay.secretKey;
            const returnUrl = paymentGateways.vnpay.returnUrl;
            
            // Save initial payment record
            const paymentId = await advancedPaymentModel.createPayment({
                ...paymentData,
                gateway: 'vnpay',
                payment_source: 'online',
                status: 'pending',
                gateway_payload: { request: paymentData }
            });
            
            // Create VNPay payment data
            const date = new Date();
            const createDate = moment(date).format('YYYYMMDDHHmmss');
            const orderId = moment(date).format('HHmmss') + paymentId;
            
            const vnpParams = {
                vnp_Version: '2.1.0',
                vnp_Command: 'pay',
                vnp_TmnCode: tmnCode,
                vnp_Locale: paymentData.language || 'vn',
                vnp_CurrCode: 'VND',
                vnp_TxnRef: orderId,
                vnp_OrderInfo: paymentData.description || `Thanh toán cho giao dịch #${paymentData.transaction_id}`,
                vnp_OrderType: 'other',
                vnp_Amount: Math.round(paymentData.amount * 100), // VNPay requires amount in VND x 100
                vnp_ReturnUrl: returnUrl,
                vnp_IpAddr: ipAddr,
                vnp_CreateDate: createDate
            };
            
            // Sort params for signature
            const sortedParams = sortObject(vnpParams);
            
            // Create signature
            let signData = qs.stringify(sortedParams, { encode: false });
            const hmac = crypto.createHmac('sha512', secretKey);
            const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
            
            // Add signature to params
            sortedParams.vnp_SecureHash = signed;
            
            // Update payment record with VNPay orderId
            await advancedPaymentModel.updatePaymentStatus(paymentId, 'pending', {
                gateway_transaction_id: orderId,
                gateway_payload: { vnp_params: sortedParams }
            });
            
            // Create payment URL
            const vnpUrl = paymentGateways.vnpay.vnpUrl + '?' + qs.stringify(sortedParams, { encode: false });
            
            return {
                paymentId: paymentId,
                paymentUrl: vnpUrl
            };
        } catch (error) {
            console.error('Error creating VNPay payment URL:', error);
            throw error;
        }
    },
    
    // Xử lý callback từ VNPay
    processVnpayCallback: async (vnpParams) => {
        try {
            const secureHash = vnpParams.vnp_SecureHash;
            const orderId = vnpParams.vnp_TxnRef;
            const responseCode = vnpParams.vnp_ResponseCode;
            
            // Remove secure hash to validate signature
            delete vnpParams.vnp_SecureHash;
            delete vnpParams.vnp_SecureHashType;
            
            // Validate signature
            const sortedParams = sortObject(vnpParams);
            const signData = qs.stringify(sortedParams, { encode: false });
            const hmac = crypto.createHmac('sha512', paymentGateways.vnpay.secretKey);
            const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
            
            // Find payment by vnpay orderId
            const pool = await sql.connect();
            const result = await pool.request()
                .input('gateway_transaction_id', sql.NVarChar, orderId)
                .query(`
                    SELECT id, amount, transaction_id
                    FROM AdvancedPayments
                    WHERE gateway = 'vnpay' AND gateway_transaction_id = @gateway_transaction_id
                `);
            
            if (!result.recordset[0]) {
                throw new Error('Invalid payment');
            }
            
            const payment = result.recordset[0];
            
            // Update payment status
            let status = 'failed';
            if (secureHash === signed && responseCode === '00') {
                status = 'completed';
            }
            
            await advancedPaymentModel.updatePaymentStatus(payment.id, status, {
                gateway_payload: vnpParams
            });
            
            return {
                success: status === 'completed',
                payment: {
                    id: payment.id,
                    transaction_id: payment.transaction_id,
                    amount: payment.amount,
                    status
                }
            };
        } catch (error) {
            console.error('Error processing VNPay callback:', error);
            throw error;
        }
    },
    
    // ------------------------------
    // Momo Methods
    // ------------------------------
    
    // Tạo thanh toán Momo
    createMomoPayment: async (paymentData) => {
        try {
            // Save initial payment record
            const paymentId = await advancedPaymentModel.createPayment({
                ...paymentData,
                gateway: 'momo',
                payment_source: 'online',
                status: 'pending',
                gateway_payload: { request: paymentData }
            });
            
            // Create Momo payment request
            const momoConfig = paymentGateways.momo;
            const orderId = moment().format('HHmmss') + paymentId;
            const requestId = moment().format('HHmmssSSS') + paymentId;
            
            const requestData = {
                partnerCode: momoConfig.partnerCode,
                accessKey: momoConfig.accessKey,
                requestId: requestId,
                amount: Math.round(paymentData.amount),
                orderId: orderId,
                orderInfo: paymentData.description || `Thanh toán cho giao dịch #${paymentData.transaction_id}`,
                returnUrl: momoConfig.returnUrl,
                notifyUrl: momoConfig.notifyUrl,
                requestType: "captureMoMoWallet",
                extraData: btoa(JSON.stringify({
                    payment_id: paymentId,
                    transaction_id: paymentData.transaction_id
                }))
            };
            
            // Create signature
            const rawSignature = `partnerCode=${requestData.partnerCode}&accessKey=${requestData.accessKey}&requestId=${requestData.requestId}&amount=${requestData.amount}&orderId=${requestData.orderId}&orderInfo=${requestData.orderInfo}&returnUrl=${requestData.returnUrl}&notifyUrl=${requestData.notifyUrl}&extraData=${requestData.extraData}`;
            const signature = crypto.createHmac('sha256', momoConfig.secretKey)
                .update(rawSignature)
                .digest('hex');
            
            requestData.signature = signature;
            
            // Send request to Momo
            const response = await axios.post(momoConfig.apiEndpoint, requestData);
            
            // Update payment with Momo orderId
            await advancedPaymentModel.updatePaymentStatus(paymentId, 'pending', {
                gateway_transaction_id: orderId,
                gateway_payload: { 
                    momo_request: requestData, 
                    momo_response: response.data 
                }
            });
            
            if (response.data.errorCode !== 0) {
                throw new Error(response.data.message || 'Momo payment creation failed');
            }
            
            return {
                paymentId: paymentId,
                paymentUrl: response.data.payUrl
            };
        } catch (error) {
            console.error('Error creating Momo payment:', error);
            throw error;
        }
    },
    
    // Xử lý callback từ Momo
    processMomoCallback: async (momoParams) => {
        try {
            const { orderId, resultCode, message, amount, extraData } = momoParams;
            
            // Parse extra data
            const decodedExtraData = JSON.parse(atob(extraData));
            const paymentId = decodedExtraData.payment_id;
            
            // Find payment
            const payment = await advancedPaymentModel.getPaymentById(paymentId);
            if (!payment) {
                throw new Error('Invalid payment');
            }
            
            // Validate signature
            // Note: Add additional signature validation here for production
            
            // Update payment status
            let status = 'failed';
            if (resultCode === '0') {
                status = 'completed';
            }
            
            await advancedPaymentModel.updatePaymentStatus(paymentId, status, {
                gateway_payload: momoParams
            });
            
            return {
                success: status === 'completed',
                payment: {
                    id: payment.id,
                    transaction_id: payment.transaction_id,
                    amount: payment.amount,
                    status
                }
            };
        } catch (error) {
            console.error('Error processing Momo callback:', error);
            throw error;
        }
    },
    
    // ------------------------------
    // PayPal Methods
    // ------------------------------
    
    // Implement PayPal method here
    
    // ------------------------------
    // Stripe Methods
    // ------------------------------
    
    // Implement Stripe methods here
    
    // ------------------------------
    // Utility Methods
    // ------------------------------
    
    // Lấy tất cả phương thức thanh toán
    getPaymentMethods: async () => {
        try {
            const paymentMethods = [
                {
                    id: 'vnpay',
                    name: 'VNPay',
                    description: 'Thanh toán qua cổng VNPay',
                    icon: '/assets/images/payment/vnpay.png',
                    supported_currencies: ['VND'],
                    is_online: true
                },
                {
                    id: 'momo',
                    name: 'Momo',
                    description: 'Ví điện tử Momo',
                    icon: '/assets/images/payment/momo.png',
                    supported_currencies: ['VND'],
                    is_online: true
                },
                {
                    id: 'bank_transfer',
                    name: 'Chuyển khoản ngân hàng',
                    description: 'Chuyển khoản trực tiếp vào tài khoản ngân hàng',
                    icon: '/assets/images/payment/bank.png',
                    supported_currencies: ['VND'],
                    is_online: false
                },
                {
                    id: 'cash',
                    name: 'Tiền mặt',
                    description: 'Thanh toán bằng tiền mặt',
                    icon: '/assets/images/payment/cash.png',
                    supported_currencies: ['VND'],
                    is_online: false
                }
            ];
            
            return paymentMethods;
        } catch (error) {
            console.error('Error getting payment methods:', error);
            throw error;
        }
    },
    
    // Lấy thông tin cấu hình thanh toán
    getPaymentConfig: async (gateway) => {
        // Return public config info only
        try {
            const configs = {
                vnpay: {
                    name: 'VNPay',
                    description: 'Thanh toán qua cổng VNPay',
                    icon: '/assets/images/payment/vnpay.png',
                    supported_currencies: ['VND'],
                    min_amount: 10000,
                    max_amount: 100000000
                },
                momo: {
                    name: 'Momo',
                    description: 'Ví điện tử Momo',
                    icon: '/assets/images/payment/momo.png',
                    supported_currencies: ['VND'],
                    min_amount: 10000,
                    max_amount: 50000000
                }
            };
            
            if (gateway) {
                return configs[gateway] || null;
            }
            
            return configs;
        } catch (error) {
            console.error('Error getting payment config:', error);
            throw error;
        }
    }
};

// ------------------------------
// Helper Functions
// ------------------------------

function sortObject(obj) {
    let sorted = {};
    let keys = Object.keys(obj).sort();
    
    for (let i = 0; i < keys.length; i++) {
        sorted[keys[i]] = obj[keys[i]];
    }
    
    return sorted;
}

module.exports = advancedPaymentModel; 