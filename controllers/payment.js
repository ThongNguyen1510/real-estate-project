const paymentModel = require('../models/paymentModel');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Cấu hình multer để lưu biên lai thanh toán
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/receipts';
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

// Tạo middleware upload riêng biệt
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG and PDF are allowed.'));
        }
    }
}).single('receipt');

// Tạo thanh toán mới - tích hợp upload
const createPayment = (req, res) => {
    upload(req, res, async function(err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        
        try {
            const paymentData = {
                transaction_id: req.body.transaction_id,
                user_id: req.user.id,
                amount: parseFloat(req.body.amount),
                payment_method: req.body.payment_method,
                payment_source: req.body.payment_source || 'manual',
                reference_number: req.body.reference_number,
                payment_date: req.body.payment_date ? new Date(req.body.payment_date) : new Date(),
                description: req.body.description,
                receipt_url: req.file ? req.file.path : null,
                status: 'pending'
            };

            // Validate required fields
            if (!paymentData.transaction_id) {
                return res.status(400).json({ error: 'Transaction ID is required' });
            }
            
            if (!paymentData.amount || paymentData.amount <= 0) {
                return res.status(400).json({ error: 'Valid amount is required' });
            }
            
            if (!paymentData.payment_method) {
                return res.status(400).json({ error: 'Payment method is required' });
            }

            const paymentId = await paymentModel.createPayment(paymentData);
            
            res.status(201).json({
                message: 'Payment created successfully',
                payment_id: paymentId
            });
        } catch (error) {
            console.error('Error creating payment:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
};

// Lấy danh sách thanh toán
const getPayments = async (req, res) => {
    try {
        const filters = {
            transaction_id: req.query.transaction_id,
            user_id: req.query.user_id,
            status: req.query.status,
            payment_method: req.query.payment_method,
            start_date: req.query.start_date,
            end_date: req.query.end_date,
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 10
        };

        // Kiểm tra quyền truy cập, admin có thể xem tất cả
        if (!req.user.is_admin) {
            // Người dùng thông thường chỉ có thể xem thanh toán của chính họ
            filters.user_id = req.user.id;
        }

        const payments = await paymentModel.getPayments(filters);
        res.json(payments);
    } catch (error) {
        console.error('Error getting payments:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Lấy chi tiết thanh toán
const getPaymentById = async (req, res) => {
    try {
        const payment = await paymentModel.getPaymentById(req.params.id);
        
        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        // Kiểm tra quyền truy cập
        if (!req.user.is_admin && payment.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Permission denied' });
        }

        res.json(payment);
    } catch (error) {
        console.error('Error getting payment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Cập nhật thanh toán - tích hợp upload
const updatePayment = (req, res) => {
    upload(req, res, async function(err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        
        try {
            const payment = await paymentModel.getPaymentById(req.params.id);
            
            if (!payment) {
                return res.status(404).json({ error: 'Payment not found' });
            }

            // Kiểm tra quyền truy cập
            if (!req.user.is_admin && payment.user_id !== req.user.id) {
                return res.status(403).json({ error: 'Permission denied' });
            }

            // Chỉ cho phép cập nhật khi thanh toán đang ở trạng thái pending
            if (payment.status !== 'pending') {
                return res.status(400).json({ error: 'Cannot update payment that is not in pending status' });
            }

            const updateData = {
                amount: req.body.amount ? parseFloat(req.body.amount) : undefined,
                payment_method: req.body.payment_method,
                reference_number: req.body.reference_number,
                payment_date: req.body.payment_date ? new Date(req.body.payment_date) : undefined,
                description: req.body.description
            };

            // Nếu có file mới uploaded
            if (req.file) {
                // Xóa file cũ nếu có
                if (payment.receipt_url && fs.existsSync(payment.receipt_url)) {
                    fs.unlinkSync(payment.receipt_url);
                }
                updateData.receipt_url = req.file.path;
            }

            await paymentModel.updatePayment(req.params.id, updateData);
            
            res.json({ message: 'Payment updated successfully' });
        } catch (error) {
            console.error('Error updating payment:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
};

// Xác minh thanh toán (chỉ admin)
const verifyPayment = async (req, res) => {
    try {
        const payment = await paymentModel.getPaymentById(req.params.id);
        
        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        // Chỉ admin có thể xác minh thanh toán
        if (!req.user.is_admin) {
            return res.status(403).json({ error: 'Permission denied: Only administrators can verify payments' });
        }

        const status = req.body.status;
        if (!['completed', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status. Status must be either "completed" or "rejected"' });
        }

        const verificationData = {
            verified_by: req.user.id,
            verification_notes: req.body.verification_notes
        };

        await paymentModel.updatePaymentStatus(req.params.id, status, verificationData);
        
        res.json({ 
            message: `Payment ${status === 'completed' ? 'verified' : 'rejected'} successfully` 
        });
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Xóa thanh toán
const deletePayment = async (req, res) => {
    try {
        const payment = await paymentModel.getPaymentById(req.params.id);
        
        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        // Chỉ admin và chủ sở hữu có thể xóa thanh toán đang ở trạng thái pending
        if (!req.user.is_admin && payment.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Permission denied' });
        }

        // Chỉ có thể xóa thanh toán ở trạng thái pending
        if (payment.status !== 'pending') {
            return res.status(400).json({ error: 'Cannot delete payment that is not in pending status' });
        }

        // Xóa file biên lai nếu có
        if (payment.receipt_url && fs.existsSync(payment.receipt_url)) {
            fs.unlinkSync(payment.receipt_url);
        }

        await paymentModel.deletePayment(req.params.id);
        
        res.json({ message: 'Payment deleted successfully' });
    } catch (error) {
        console.error('Error deleting payment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Lấy tổng số tiền đã thanh toán cho một giao dịch
const getTransactionPayments = async (req, res) => {
    try {
        const transactionId = req.params.transaction_id;
        
        // Lấy danh sách thanh toán
        const payments = await paymentModel.getPayments({ transaction_id: transactionId });
        
        // Tính tổng tiền đã thanh toán (các thanh toán đã hoàn thành)
        const totalPaid = await paymentModel.getTotalPaymentsByTransaction(transactionId);
        
        res.json({
            transaction_id: transactionId,
            payments: payments,
            total_paid: totalPaid
        });
    } catch (error) {
        console.error('Error getting transaction payments:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    createPayment,
    getPayments,
    getPaymentById,
    updatePayment,
    verifyPayment,
    deletePayment,
    getTransactionPayments
}; 