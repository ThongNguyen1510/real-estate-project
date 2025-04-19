const express = require('express');
const router = express.Router();
const paymentsController = require('../controllers/payments');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Tạo thanh toán mới
router.post('/', auth, paymentsController.createPayment);

// Lấy danh sách thanh toán
router.get('/', auth, paymentsController.getPayments);

// Lấy thanh toán theo giao dịch (phải đặt trước route có param)
router.get('/transaction/:transaction_id', auth, paymentsController.getTransactionPayments);

// Lấy chi tiết thanh toán theo ID
router.get('/:id', auth, paymentsController.getPaymentById);

// Cập nhật thanh toán
router.put('/:id', auth, paymentsController.updatePayment);

// Xác minh thanh toán (chỉ admin)
router.put('/:id/verify', auth, adminAuth, paymentsController.verifyPayment);

// Xóa thanh toán
router.delete('/:id', auth, paymentsController.deletePayment);

module.exports = router; 