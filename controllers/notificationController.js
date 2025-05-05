const notificationModel = require('../models/notificationModel');

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
            marketing_notifications,
            property_updates,
            messages,
            system_notifications
        } = req.body;
        
        // Validate input
        const settings = {
            email_notifications: Boolean(email_notifications),
            push_notifications: Boolean(push_notifications),
            sms_notifications: Boolean(sms_notifications),
            marketing_notifications: Boolean(marketing_notifications),
            property_updates: Boolean(property_updates),
            messages: Boolean(messages),
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

module.exports = {
    getUserNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getNotificationSettings,
    updateNotificationSettings,
    createNotification
}; 