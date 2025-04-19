const advancedPaymentModel = require('../models/advancedPaymentModel');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Cấu hình upload file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = './uploads/receipts';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'receipt-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedFileTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedFileTypes.test(file.mimetype);
    
    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Chỉ chấp nhận file hình ảnh (jpeg, jpg, png) hoặc PDF!'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: fileFilter
}).single('receipt');

const handleUpload = (req, res, next) => {
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({
                success: false,
                message: `Lỗi upload: ${err.message}`
            });
        } else if (err) {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }
        next();
    });
};

const advancedPaymentController = {
    // Middleware upload
    uploadMiddleware: handleUpload,
    
    // ------------------------------
    // CORE PAYMENT FUNCTIONS
    // ------------------------------
    
    // Lấy danh sách phương thức thanh toán
    getPaymentMethods: async (req, res) => {
        try {
            const paymentMethods = await advancedPaymentModel.getPaymentMethods();
            
            res.status(200).json({
                success: true,
                data: paymentMethods
            });
        } catch (error) {
            console.error('Error getting payment methods:', error);
            res.status(500).json({
                success: false,
                message: 'Đã xảy ra lỗi khi lấy danh sách phương thức thanh toán',
                error: error.message
            });
        }
    },
    
    // Lấy cấu hình thanh toán
    getPaymentConfig: async (req, res) => {
        try {
            const gateway = req.params.gateway;
            const config = await advancedPaymentModel.getPaymentConfig(gateway);
            
            if (!config && gateway) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy cấu hình cho cổng thanh toán này'
                });
            }
            
            res.status(200).json({
                success: true,
                data: config
            });
        } catch (error) {
            console.error('Error getting payment config:', error);
            res.status(500).json({
                success: false,
                message: 'Đã xảy ra lỗi khi lấy cấu hình thanh toán',
                error: error.message
            });
        }
    },
    
    // Tạo thanh toán thủ công (manual)
    createManualPayment: async (req, res) => {
        try {
            const paymentData = {
                transaction_id: req.body.transaction_id,
                user_id: req.user.id,
                amount: parseFloat(req.body.amount),
                payment_method: req.body.payment_method,
                payment_source: 'manual',
                gateway: req.body.payment_method, // Same as payment_method for manual
                currency: req.body.currency || 'VND',
                reference_number: req.body.reference_number,
                payment_date: req.body.payment_date ? new Date(req.body.payment_date) : new Date(),
                description: req.body.description,
                receipt_url: req.file ? req.file.path.replace(/\\/g, '/') : null,
                status: 'pending'
            };

            // Validate required fields
            if (!paymentData.transaction_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Mã giao dịch là bắt buộc'
                });
            }
            
            if (!paymentData.amount || paymentData.amount <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Số tiền thanh toán phải lớn hơn 0'
                });
            }
            
            if (!paymentData.payment_method) {
                return res.status(400).json({
                    success: false,
                    message: 'Phương thức thanh toán là bắt buộc'
                });
            }

            const paymentId = await advancedPaymentModel.createPayment(paymentData);
            
            res.status(201).json({
                success: true,
                message: 'Đã tạo thanh toán thành công. Vui lòng đợi xác nhận.',
                data: {
                    payment_id: paymentId
                }
            });
        } catch (error) {
            console.error('Error creating manual payment:', error);
            res.status(500).json({
                success: false,
                message: 'Đã xảy ra lỗi khi tạo thanh toán',
                error: error.message
            });
        }
    },
    
    // Lấy danh sách thanh toán
    getPayments: async (req, res) => {
        try {
            const filters = {
                transaction_id: req.query.transaction_id,
                user_id: req.user.is_admin ? req.query.user_id : req.user.id,
                status: req.query.status,
                payment_method: req.query.payment_method,
                gateway: req.query.gateway,
                start_date: req.query.start_date,
                end_date: req.query.end_date,
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 10
            };

            const result = await advancedPaymentModel.getPayments(filters);
            
            res.status(200).json({
                success: true,
                data: result.payments,
                pagination: result.pagination
            });
        } catch (error) {
            console.error('Error getting payments:', error);
            res.status(500).json({
                success: false,
                message: 'Đã xảy ra lỗi khi lấy danh sách thanh toán',
                error: error.message
            });
        }
    },

    // Lấy chi tiết thanh toán
    getPaymentById: async (req, res) => {
        try {
            const payment = await advancedPaymentModel.getPaymentById(req.params.id);
            
            if (!payment) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy thanh toán'
                });
            }

            // Kiểm tra quyền truy cập
            if (!req.user.is_admin && payment.user_id !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'Bạn không có quyền xem thanh toán này'
                });
            }

            res.status(200).json({
                success: true,
                data: payment
            });
        } catch (error) {
            console.error('Error getting payment:', error);
            res.status(500).json({
                success: false,
                message: 'Đã xảy ra lỗi khi lấy thông tin thanh toán',
                error: error.message
            });
        }
    },
    
    // Xác minh thanh toán (chỉ admin)
    verifyPayment: async (req, res) => {
        try {
            const paymentId = req.params.id;
            const payment = await advancedPaymentModel.getPaymentById(paymentId);
            
            if (!payment) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy thanh toán'
                });
            }

            // Chỉ admin có thể xác minh thanh toán
            if (!req.user.is_admin) {
                return res.status(403).json({
                    success: false,
                    message: 'Bạn không có quyền xác minh thanh toán'
                });
            }

            const status = req.body.status;
            if (!['completed', 'rejected'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Trạng thái không hợp lệ. Trạng thái phải là "completed" hoặc "rejected"'
                });
            }

            const verificationData = {
                gateway_payload: {
                    verification: {
                        verified_by: req.user.id,
                        verification_date: new Date(),
                        verification_notes: req.body.verification_notes || '',
                        previous_status: payment.status
                    }
                }
            };

            await advancedPaymentModel.updatePaymentStatus(paymentId, status, verificationData);
            
            res.status(200).json({
                success: true,
                message: status === 'completed' ? 'Đã xác nhận thanh toán thành công' : 'Đã từ chối thanh toán',
                data: {
                    payment_id: paymentId,
                    status: status
                }
            });
        } catch (error) {
            console.error('Error verifying payment:', error);
            res.status(500).json({
                success: false,
                message: 'Đã xảy ra lỗi khi xác minh thanh toán',
                error: error.message
            });
        }
    },
    
    // Lấy thanh toán theo giao dịch
    getTransactionPayments: async (req, res) => {
        try {
            const transactionId = req.params.transaction_id;
            
            const result = await advancedPaymentModel.getPayments({
                transaction_id: transactionId,
                user_id: req.user.is_admin ? null : req.user.id
            });
            
            res.status(200).json({
                success: true,
                data: result.payments
            });
        } catch (error) {
            console.error('Error getting transaction payments:', error);
            res.status(500).json({
                success: false,
                message: 'Đã xảy ra lỗi khi lấy danh sách thanh toán cho giao dịch',
                error: error.message
            });
        }
    },
    
    // ------------------------------
    // VNPAY PAYMENT FUNCTIONS
    // ------------------------------
    
    // Tạo thanh toán VNPay
    createVnpayPayment: async (req, res) => {
        try {
            const paymentData = {
                transaction_id: req.body.transaction_id,
                user_id: req.user.id,
                amount: parseFloat(req.body.amount),
                payment_method: 'vnpay',
                description: req.body.description || `Thanh toán cho giao dịch #${req.body.transaction_id}`,
                language: req.body.language || 'vn',
                currency: 'VND'
            };
            
            // Validate required fields
            if (!paymentData.transaction_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Mã giao dịch là bắt buộc'
                });
            }
            
            if (!paymentData.amount || paymentData.amount < 10000) {
                return res.status(400).json({
                    success: false,
                    message: 'Số tiền thanh toán phải lớn hơn 10,000 VND'
                });
            }
            
            const ipAddr = req.headers['x-forwarded-for'] || 
                req.connection.remoteAddress || 
                req.socket.remoteAddress || 
                req.connection.socket.remoteAddress;
            
            const result = await advancedPaymentModel.createVnpayPaymentUrl(paymentData, ipAddr);
            
            res.status(200).json({
                success: true,
                message: 'Đã tạo URL thanh toán VNPay',
                data: {
                    payment_id: result.paymentId,
                    payment_url: result.paymentUrl
                }
            });
        } catch (error) {
            console.error('Error creating VNPay payment:', error);
            res.status(500).json({
                success: false,
                message: 'Đã xảy ra lỗi khi tạo thanh toán VNPay',
                error: error.message
            });
        }
    },
    
    // Xử lý callback VNPay
    handleVnpayCallback: async (req, res) => {
        try {
            const vnpParams = req.query;
            
            const result = await advancedPaymentModel.processVnpayCallback(vnpParams);
            
            // Redirect to frontend with status
            const redirectUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            const status = result.success ? 'success' : 'failed';
            
            res.redirect(`${redirectUrl}/payment/result?status=${status}&payment_id=${result.payment.id}`);
            
        } catch (error) {
            console.error('Error handling VNPay callback:', error);
            
            // Redirect to frontend with error
            const redirectUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            res.redirect(`${redirectUrl}/payment/result?status=error&message=${encodeURIComponent(error.message)}`);
        }
    },
    
    // ------------------------------
    // MOMO PAYMENT FUNCTIONS
    // ------------------------------
    
    // Tạo thanh toán Momo
    createMomoPayment: async (req, res) => {
        try {
            const paymentData = {
                transaction_id: req.body.transaction_id,
                user_id: req.user.id,
                amount: parseFloat(req.body.amount),
                payment_method: 'momo',
                description: req.body.description || `Thanh toán cho giao dịch #${req.body.transaction_id}`,
                currency: 'VND'
            };
            
            // Validate required fields
            if (!paymentData.transaction_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Mã giao dịch là bắt buộc'
                });
            }
            
            if (!paymentData.amount || paymentData.amount < 10000) {
                return res.status(400).json({
                    success: false,
                    message: 'Số tiền thanh toán phải lớn hơn 10,000 VND'
                });
            }
            
            const result = await advancedPaymentModel.createMomoPayment(paymentData);
            
            res.status(200).json({
                success: true,
                message: 'Đã tạo thanh toán Momo',
                data: {
                    payment_id: result.paymentId,
                    payment_url: result.paymentUrl
                }
            });
        } catch (error) {
            console.error('Error creating Momo payment:', error);
            res.status(500).json({
                success: false,
                message: 'Đã xảy ra lỗi khi tạo thanh toán Momo',
                error: error.message
            });
        }
    },
    
    // Xử lý callback Momo
    handleMomoCallback: async (req, res) => {
        try {
            const momoParams = req.query;
            
            const result = await advancedPaymentModel.processMomoCallback(momoParams);
            
            // Redirect to frontend with status
            const redirectUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            const status = result.success ? 'success' : 'failed';
            
            res.redirect(`${redirectUrl}/payment/result?status=${status}&payment_id=${result.payment.id}`);
            
        } catch (error) {
            console.error('Error handling Momo callback:', error);
            
            // Redirect to frontend with error
            const redirectUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            res.redirect(`${redirectUrl}/payment/result?status=error&message=${encodeURIComponent(error.message)}`);
        }
    },
    
    // Xử lý IPN (Instant Payment Notification) Momo
    handleMomoIpn: async (req, res) => {
        try {
            const momoParams = req.body;
            
            const result = await advancedPaymentModel.processMomoCallback(momoParams);
            
            res.status(200).json({
                status: result.success ? 0 : 1,
                message: result.success ? 'success' : 'failed'
            });
            
        } catch (error) {
            console.error('Error handling Momo IPN:', error);
            res.status(500).json({
                status: 1,
                message: error.message
            });
        }
    },
    
    // ------------------------------
    // PAYPAL PAYMENT FUNCTIONS
    // ------------------------------
    
    // Implement PayPal methods here
    
    // ------------------------------
    // STRIPE PAYMENT FUNCTIONS
    // ------------------------------
    
    // Implement Stripe methods here
};

module.exports = advancedPaymentController; 