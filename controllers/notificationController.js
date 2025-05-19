const notificationModel = require('../models/notificationModel');
const userModel = require('../models/userModel');

// Lấy danh sách thông báo của người dùng đã đăng nhập
const getUserNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = req.query.page || 1;
        const limit = req.query.limit || 10;
        const readStatus = req.query.read_status !== undefined 
            ? req.query.read_status === 'true' 
            : undefined;
        const type = req.query.type;
        
        const result = await notificationModel.getUserNotifications(userId, {
            page,
            limit,
            read_status: readStatus,
            type
        });
        
        res.status(200).json({
            success: true,
            data: result.notifications,
            pagination: result.pagination
        });
    } catch (error) {
        console.error('Error getting notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi lấy danh sách thông báo',
            error: error.message
        });
    }
};

// Lấy số lượng thông báo chưa đọc
const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const unreadCount = await notificationModel.getUnreadCount(userId);
        
        res.status(200).json({
            success: true,
            data: {
                unread_count: unreadCount
            }
        });
    } catch (error) {
        console.error('Error getting unread count:', error);
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi lấy số lượng thông báo chưa đọc',
            error: error.message
        });
    }
};

// Đánh dấu thông báo đã đọc
const markAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const notificationId = req.params.id;
        
        const success = await notificationModel.markAsRead(notificationId, userId);
        
        if (!success) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thông báo hoặc không có quyền cập nhật'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Đã đánh dấu thông báo là đã đọc'
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi đánh dấu thông báo đã đọc',
            error: error.message
        });
    }
};

// Đánh dấu tất cả thông báo đã đọc
const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const count = await notificationModel.markAllAsRead(userId);
        
        res.status(200).json({
            success: true,
            message: `Đã đánh dấu ${count} thông báo là đã đọc`
        });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi đánh dấu tất cả thông báo đã đọc',
            error: error.message
        });
    }
};

// Xóa thông báo
const deleteNotification = async (req, res) => {
    try {
        const userId = req.user.id;
        const notificationId = req.params.id;
        
        const success = await notificationModel.deleteNotification(notificationId, userId);
        
        if (!success) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thông báo hoặc không có quyền xóa'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Đã xóa thông báo thành công'
        });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi xóa thông báo',
            error: error.message
        });
    }
};

// Lấy cài đặt thông báo
const getNotificationSettings = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const settings = await notificationModel.getNotificationSettings(userId);
        
        res.status(200).json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error('Error getting notification settings:', error);
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi lấy cài đặt thông báo',
            error: error.message
        });
    }
};

// Cập nhật cài đặt thông báo
const updateNotificationSettings = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            email_notifications,
            push_notifications,
            sms_notifications,
            property_expiration_notifications,
            admin_notifications,
            system_notifications
        } = req.body;
        
        // Validate input
        const settings = {
            email_notifications: Boolean(email_notifications),
            push_notifications: Boolean(push_notifications),
            sms_notifications: Boolean(sms_notifications),
            property_expiration_notifications: Boolean(property_expiration_notifications),
            admin_notifications: Boolean(admin_notifications),
            system_notifications: Boolean(system_notifications)
        };
        
        await notificationModel.updateNotificationSettings(userId, settings);
        
        res.status(200).json({
            success: true,
            message: 'Đã cập nhật cài đặt thông báo',
            data: settings
        });
    } catch (error) {
        console.error('Error updating notification settings:', error);
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi cập nhật cài đặt thông báo',
            error: error.message
        });
    }
};

// Tạo thông báo mới (thường sẽ dùng nội bộ từ các API khác)
const createNotification = async (notificationData) => {
    try {
        const notificationId = await notificationModel.createNotification(notificationData);
        return notificationId;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};

// Tạo thông báo khi tin đăng hết hạn
const createPropertyExpirationNotification = async (property) => {
    try {
        // Kiểm tra xem người dùng có bật thông báo về tin đăng hết hạn không
        const userSettings = await notificationModel.getNotificationSettings(property.owner_id);
        
        if (userSettings.property_expiration_notifications) {
            await notificationModel.createPropertyExpirationNotification(property);
            console.log(`Created expiration notification for property ${property.id}`);
        }
    } catch (error) {
        console.error('Error creating property expiration notification:', error);
    }
};

// Gửi thông báo từ admin đến người dùng theo tiêu chí
const sendAdminNotificationToUsers = async (adminNotificationId) => {
    try {
        const { sql } = require('../config/database');
        const request = new sql.Request();
        
        // Lấy thông tin admin notification
        request.input('id', sql.Int, adminNotificationId);
        const result = await request.query(`
            SELECT * FROM AdminNotifications WHERE id = @id
        `);
        
        if (result.recordset.length === 0) {
            console.error(`Admin notification with ID ${adminNotificationId} not found`);
            return false;
        }
        
        const adminNotification = result.recordset[0];
        
        // Lấy danh sách user dựa trên target_type
        let userIds = [];
        
        if (adminNotification.target_type === 'all_users') {
            // Lấy tất cả người dùng
            const usersResult = await request.query(`
                SELECT id FROM Users WHERE is_active = 1
            `);
            userIds = usersResult.recordset.map(user => user.id);
        } 
        else if (adminNotification.target_type === 'property_owners') {
            // Lấy các chủ sở hữu bất động sản
            const ownersResult = await request.query(`
                SELECT DISTINCT owner_id as id FROM Properties
            `);
            userIds = ownersResult.recordset.map(owner => owner.id);
        }
        else if (adminNotification.target_type === 'specific_users' && adminNotification.target_users) {
            // Parse JSON array từ target_users
            try {
                userIds = JSON.parse(adminNotification.target_users);
            } catch (e) {
                console.error('Error parsing target_users JSON:', e);
                return false;
            }
        }
        
        // Tạo thông báo cho từng người dùng
        let successCount = 0;
        for (const userId of userIds) {
            // Kiểm tra settings của người dùng
            const userSettings = await notificationModel.getNotificationSettings(userId);
            
            if (userSettings.admin_notifications) {
                await notificationModel.createAdminNotification(userId, adminNotification);
                successCount++;
            }
        }
        
        console.log(`Sent admin notification to ${successCount} users`);
        return successCount;
    } catch (error) {
        console.error('Error sending admin notification to users:', error);
        return false;
    }
};

module.exports = {
    getUserNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getNotificationSettings,
    updateNotificationSettings,
    createNotification,
    createPropertyExpirationNotification,
    sendAdminNotificationToUsers
}; 