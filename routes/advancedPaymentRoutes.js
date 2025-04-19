const express = require('express');
const router = express.Router();
const advancedPaymentController = require('../controllers/advancedPaymentController');
const { auth } = require('../middleware/auth');
const { isAdmin } = require('../middleware/auth');

// ------------------------------
// PUBLIC ROUTES
// ------------------------------

// VNPay callback (không yêu cầu auth vì là callback từ VNPay)
router.get('/vnpay/callback', advancedPaymentController.handleVnpayCallback);

// Momo callback (không yêu cầu auth vì là callback từ Momo)
router.get('/momo/callback', advancedPaymentController.handleMomoCallback);

// Momo IPN - Instant Payment Notification (không yêu cầu auth)
router.post('/momo/ipn', advancedPaymentController.handleMomoIpn);

// ------------------------------
// AUTHENTICATED ROUTES
// ------------------------------

// Lấy danh sách phương thức thanh toán
router.get('/methods', auth, advancedPaymentController.getPaymentMethods);

// Lấy cấu hình cổng thanh toán
router.get('/config/:gateway?', auth, advancedPaymentController.getPaymentConfig);

// Tạo thanh toán thủ công với upload hóa đơn
router.post('/manual', auth, advancedPaymentController.uploadMiddleware, advancedPaymentController.createManualPayment);

// Tạo thanh toán qua VNPay
router.post('/vnpay', auth, advancedPaymentController.createVnpayPayment);

// Tạo thanh toán qua Momo
router.post('/momo', auth, advancedPaymentController.createMomoPayment);

// Lấy danh sách thanh toán
router.get('/', auth, advancedPaymentController.getPayments);

// Lấy danh sách thanh toán theo giao dịch
router.get('/transaction/:transaction_id', auth, advancedPaymentController.getTransactionPayments);

// Lấy chi tiết thanh toán
router.get('/:id', auth, advancedPaymentController.getPaymentById);

// Xác nhận thanh toán (admin)
router.put('/:id/verify', auth, isAdmin, advancedPaymentController.verifyPayment);

module.exports = router; 