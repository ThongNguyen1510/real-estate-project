const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Tạo thanh toán mới
router.post('/', auth, paymentController.uploadMiddleware, paymentController.createPayment);

// Lấy danh sách thanh toán
router.get('/', auth, paymentController.getPayments);

// Lấy thanh toán theo giao dịch (phải đặt trước route có param)
router.get('/transaction/:transaction_id', auth, paymentController.getTransactionPayments);

// Lấy chi tiết thanh toán theo ID
router.get('/:id', auth, paymentController.getPaymentById);

// Cập nhật thanh toán
router.put('/:id', auth, paymentController.uploadMiddleware, paymentController.updatePayment);

// Xác minh thanh toán (chỉ admin)
router.put('/:id/verify', auth, adminAuth, paymentController.verifyPayment);

// Xóa thanh toán
router.delete('/:id', auth, paymentController.deletePayment);

module.exports = router; 