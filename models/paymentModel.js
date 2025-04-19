const { sql } = require('../config/database');

const paymentModel = {
    // Tạo thanh toán mới
    createPayment: async (paymentData) => {
        try {
            const pool = await sql.connect();
            const result = await pool.request()
                .input('transaction_id', sql.Int, paymentData.transaction_id)
                .input('user_id', sql.Int, paymentData.user_id)
                .input('amount', sql.Decimal(18, 2), paymentData.amount)
                .input('payment_method', sql.NVarChar, paymentData.payment_method)
                .input('payment_source', sql.NVarChar, paymentData.payment_source || 'manual')
                .input('reference_number', sql.NVarChar, paymentData.reference_number)
                .input('payment_date', sql.DateTime, paymentData.payment_date || new Date())
                .input('description', sql.NVarChar, paymentData.description)
                .input('receipt_url', sql.NVarChar, paymentData.receipt_url)
                .input('status', sql.NVarChar, paymentData.status || 'pending')
                .query(`
                    INSERT INTO Payments (
                        transaction_id, user_id, amount, payment_method, 
                        payment_source, reference_number, payment_date, 
                        description, receipt_url, status
                    )
                    OUTPUT INSERTED.id
                    VALUES (
                        @transaction_id, @user_id, @amount, @payment_method,
                        @payment_source, @reference_number, @payment_date,
                        @description, @receipt_url, @status
                    )
                `);
            return result.recordset[0].id;
        } catch (error) {
            console.error('Error creating payment:', error);
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
                FROM Payments p
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
            
            if (filters.start_date) {
                query += ' AND p.payment_date >= @start_date';
                request.input('start_date', sql.DateTime, new Date(filters.start_date));
            }
            
            if (filters.end_date) {
                query += ' AND p.payment_date <= @end_date';
                request.input('end_date', sql.DateTime, new Date(filters.end_date));
            }
            
            query += ' ORDER BY p.payment_date DESC';
            
            if (filters.page && filters.limit) {
                const offset = (filters.page - 1) * filters.limit;
                query += ' OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY';
                request.input('offset', sql.Int, offset);
                request.input('limit', sql.Int, filters.limit);
            }
            
            const result = await request.query(query);
            return result.recordset;
        } catch (error) {
            console.error('Error getting payments:', error);
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
                    FROM Payments p
                    LEFT JOIN Transactions t ON p.transaction_id = t.id
                    LEFT JOIN Users u ON p.user_id = u.id
                    LEFT JOIN Properties pr ON t.property_id = pr.id
                    WHERE p.id = @payment_id
                `);
            return result.recordset[0];
        } catch (error) {
            console.error('Error getting payment:', error);
            throw error;
        }
    },

    // Cập nhật trạng thái thanh toán
    updatePaymentStatus: async (paymentId, status, verificationData = {}) => {
        try {
            const pool = await sql.connect();
            const request = pool.request()
                .input('payment_id', sql.Int, paymentId)
                .input('status', sql.NVarChar, status)
                .input('verified_by', sql.Int, verificationData.verified_by)
                .input('verification_date', sql.DateTime, new Date())
                .input('verification_notes', sql.NVarChar, verificationData.verification_notes);
            
            let query = `
                UPDATE Payments SET 
                    status = @status, 
                    verification_date = @verification_date
            `;
            
            if (verificationData.verified_by) {
                query += ', verified_by = @verified_by';
            }
            
            if (verificationData.verification_notes) {
                query += ', verification_notes = @verification_notes';
            }
            
            query += ' WHERE id = @payment_id';
            
            await request.query(query);
            return true;
        } catch (error) {
            console.error('Error updating payment status:', error);
            throw error;
        }
    },

    // Cập nhật thông tin thanh toán
    updatePayment: async (paymentId, updateData) => {
        try {
            const pool = await sql.connect();
            const request = pool.request()
                .input('payment_id', sql.Int, paymentId);
            
            let query = 'UPDATE Payments SET ';
            const updateFields = [];
            
            if (updateData.amount) {
                updateFields.push('amount = @amount');
                request.input('amount', sql.Decimal(18, 2), updateData.amount);
            }
            
            if (updateData.payment_method) {
                updateFields.push('payment_method = @payment_method');
                request.input('payment_method', sql.NVarChar, updateData.payment_method);
            }
            
            if (updateData.reference_number) {
                updateFields.push('reference_number = @reference_number');
                request.input('reference_number', sql.NVarChar, updateData.reference_number);
            }
            
            if (updateData.payment_date) {
                updateFields.push('payment_date = @payment_date');
                request.input('payment_date', sql.DateTime, new Date(updateData.payment_date));
            }
            
            if (updateData.description) {
                updateFields.push('description = @description');
                request.input('description', sql.NVarChar, updateData.description);
            }
            
            if (updateData.receipt_url) {
                updateFields.push('receipt_url = @receipt_url');
                request.input('receipt_url', sql.NVarChar, updateData.receipt_url);
            }
            
            query += updateFields.join(', ');
            query += ' WHERE id = @payment_id';
            
            await request.query(query);
            return true;
        } catch (error) {
            console.error('Error updating payment:', error);
            throw error;
        }
    },

    // Xóa thanh toán
    deletePayment: async (paymentId) => {
        try {
            const pool = await sql.connect();
            await pool.request()
                .input('payment_id', sql.Int, paymentId)
                .query('DELETE FROM Payments WHERE id = @payment_id');
            return true;
        } catch (error) {
            console.error('Error deleting payment:', error);
            throw error;
        }
    },

    // Lấy tổng số tiền đã thanh toán cho một giao dịch
    getTotalPaymentsByTransaction: async (transactionId) => {
        try {
            const pool = await sql.connect();
            const result = await pool.request()
                .input('transaction_id', sql.Int, transactionId)
                .query(`
                    SELECT SUM(amount) as total_paid
                    FROM Payments
                    WHERE transaction_id = @transaction_id
                    AND status = 'completed'
                `);
            return result.recordset[0].total_paid || 0;
        } catch (error) {
            console.error('Error getting total payments:', error);
            throw error;
        }
    }
};

module.exports = paymentModel; 