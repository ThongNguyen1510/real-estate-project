const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
    getMessages,
    getMessage,
    sendMessage,
    readMessage,
    removeMessage
} = require('../controllers/messageController');

// Lấy danh sách tin nhắn
router.get('/', auth, getMessages);

// Lấy chi tiết tin nhắn
router.get('/:id', auth, getMessage);

// Gửi tin nhắn mới
router.post('/', auth, sendMessage);

// Đánh dấu tin nhắn đã đọc
router.put('/:id/read', auth, readMessage);

// Xóa tin nhắn
router.delete('/:id', auth, removeMessage);

module.exports = router; 