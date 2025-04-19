const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
    listTransactions,
    getTransaction,
    createNewTransaction,
    updateStatus,
    removeTransaction
} = require('../controllers/transactionController');

// Lấy danh sách giao dịch
router.get('/', auth, listTransactions);

// Lấy chi tiết giao dịch
router.get('/:id', auth, getTransaction);

// Tạo giao dịch mới
router.post('/', auth, createNewTransaction);

// Cập nhật trạng thái giao dịch
router.put('/:id/status', auth, updateStatus);

// Xóa giao dịch
router.delete('/:id', auth, removeTransaction);

module.exports = router; 