const { sql } = require('../config/database');
const {
    getUserMessages,
    getMessageById,
    createMessage,
    markAsRead,
    deleteMessage
} = require('../models/messageModel');

// Lấy danh sách tin nhắn của người dùng
const getMessages = async (req, res) => {
    try {
        const messages = await getUserMessages(req.user.id);
        res.json({
            success: true,
            data: messages
        });
    } catch (error) {
        console.error('Lỗi get messages:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

// Lấy chi tiết tin nhắn
const getMessage = async (req, res) => {
    try {
        const message = await getMessageById(req.params.id, req.user.id);
        
        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tin nhắn'
            });
        }

        res.json({
            success: true,
            data: message
        });
    } catch (error) {
        console.error('Lỗi get message:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

// Gửi tin nhắn mới
const sendMessage = async (req, res) => {
    try {
        const { receiver_id, content } = req.body;

        if (!receiver_id || !content) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin người nhận hoặc nội dung'
            });
        }

        const messageId = await createMessage(req.user.id, receiver_id, content);
        
        res.status(201).json({
            success: true,
            message: 'Đã gửi tin nhắn',
            data: { id: messageId }
        });
    } catch (error) {
        console.error('Lỗi send message:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

// Đánh dấu tin nhắn đã đọc
const readMessage = async (req, res) => {
    try {
        const messageId = req.params.id;
        const userId = req.user.id;

        console.log('Marking message as read:', { messageId, userId });

        // Kiểm tra tin nhắn có tồn tại và thuộc về người dùng không
        const message = await sql.query`
            SELECT id FROM Messages
            WHERE id = ${messageId} AND receiver_id = ${userId}
        `;

        if (message.recordset.length === 0) {
            console.log('Message not found or not owned by user');
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tin nhắn hoặc bạn không có quyền đánh dấu đã đọc'
            });
        }

        // Đánh dấu đã đọc
        await sql.query`
            UPDATE Messages
            SET is_read = 1
            WHERE id = ${messageId}
        `;

        console.log('Message marked as read successfully');
        res.json({
            success: true,
            message: 'Đã đánh dấu tin nhắn đã đọc'
        });
    } catch (error) {
        console.error('Lỗi mark message as read:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

// Xóa tin nhắn
const removeMessage = async (req, res) => {
    try {
        const deleted = await deleteMessage(req.params.id, req.user.id);
        
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tin nhắn'
            });
        }

        res.json({
            success: true,
            message: 'Đã xóa tin nhắn'
        });
    } catch (error) {
        console.error('Lỗi delete message:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

module.exports = {
    getMessages,
    getMessage,
    sendMessage,
    readMessage,
    removeMessage
}; 