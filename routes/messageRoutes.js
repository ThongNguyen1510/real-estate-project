const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

// Temporarily comment out the non-existent controller
// const {
//     getMessages,
//     getMessage,
//     sendMessage,
//     readMessage,
//     removeMessage
// } = require('../controllers/messageController');

// Temporary handler for disabled routes
const tempHandler = (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Tính năng tin nhắn đang được phát triển'
    });
};

// Lấy danh sách tin nhắn
router.get('/', auth, tempHandler);

// Lấy chi tiết tin nhắn
router.get('/:id', auth, tempHandler);

// Gửi tin nhắn mới
router.post('/', auth, tempHandler);

// Đánh dấu tin nhắn đã đọc
router.put('/:id/read', auth, tempHandler);

// Xóa tin nhắn
router.delete('/:id', auth, tempHandler);

module.exports = router; 