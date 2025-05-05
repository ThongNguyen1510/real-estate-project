const { sql } = require('../config/database');

// Lấy danh sách tin nhắn của người dùng
const getUserMessages = async (userId) => {
    try {
        const messages = await sql.query`
            SELECT m.*, 
                   u1.name as sender_name, u1.avatar_url as sender_avatar,
                   u2.name as receiver_name, u2.avatar_url as receiver_avatar
            FROM Messages m
            INNER JOIN Users u1 ON m.sender_id = u1.id
            INNER JOIN Users u2 ON m.receiver_id = u2.id
            WHERE m.sender_id = ${userId} OR m.receiver_id = ${userId}
            ORDER BY m.created_at DESC
        `;
        return messages.recordset;
    } catch (error) {
        console.error('Lỗi get user messages:', error);
        throw error;
    }
};

// Lấy chi tiết tin nhắn
const getMessageById = async (messageId, userId) => {
    try {
        const message = await sql.query`
            SELECT m.*, 
                   u1.name as sender_name, u1.avatar_url as sender_avatar,
                   u2.name as receiver_name, u2.avatar_url as receiver_avatar
            FROM Messages m
            INNER JOIN Users u1 ON m.sender_id = u1.id
            INNER JOIN Users u2 ON m.receiver_id = u2.id
            WHERE m.id = ${messageId} 
            AND (m.sender_id = ${userId} OR m.receiver_id = ${userId})
        `;
        return message.recordset[0];
    } catch (error) {
        console.error('Lỗi get message by id:', error);
        throw error;
    }
};

// Gửi tin nhắn mới
const createMessage = async (senderId, receiverId, content) => {
    try {
        const result = await sql.query`
            INSERT INTO Messages (sender_id, receiver_id, content, created_at)
            VALUES (${senderId}, ${receiverId}, ${content}, GETDATE());
            
            SELECT SCOPE_IDENTITY() as id
        `;
        return result.recordset[0].id;
    } catch (error) {
        console.error('Lỗi create message:', error);
        throw error;
    }
};

// Đánh dấu tin nhắn đã đọc
const markAsRead = async (messageId, userId) => {
    try {
        await sql.query`
            UPDATE Messages
            SET is_read = 1,
                read_at = GETDATE()
            WHERE id = ${messageId} 
            AND receiver_id = ${userId}
        `;
    } catch (error) {
        console.error('Lỗi mark message as read:', error);
        throw error;
    }
};

// Xóa tin nhắn
const deleteMessage = async (messageId, userId) => {
    try {
        const result = await sql.query`
            DELETE FROM Messages
            WHERE id = ${messageId} 
            AND (sender_id = ${userId} OR receiver_id = ${userId})
        `;
        return result.rowsAffected[0] > 0;
    } catch (error) {
        console.error('Lỗi delete message:', error);
        throw error;
    }
};

module.exports = {
    getUserMessages,
    getMessageById,
    createMessage,
    markAsRead,
    deleteMessage
}; 