const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment');
const { auth } = require('../middleware/auth');
const { isAdmin } = require('../middleware/auth');

// Tạo thanh toán mới
router.post('/', auth, paymentController.createPayment);

// Lấy danh sách thanh toán
router.get('/', auth, paymentController.getPayments);

// Lấy thanh toán theo giao dịch (phải đặt trước route có param)
router.get('/transaction/:transaction_id', auth, paymentController.getTransactionPayments);

// Lấy chi tiết thanh toán theo ID
router.get('/:id', auth, paymentController.getPaymentById);

// Cập nhật thanh toán
router.put('/:id', auth, paymentController.updatePayment);

// Xác minh thanh toán (chỉ admin)
router.put('/:id/verify', auth, isAdmin, paymentController.verifyPayment);

// Xóa thanh toán
router.delete('/:id', auth, paymentController.deletePayment);

module.exports = router; 