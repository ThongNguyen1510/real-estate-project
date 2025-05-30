const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { auth } = require('../middleware/auth');

// Yêu cầu xác thực cho tất cả các routes
router.use(auth);

// Lấy danh sách thông báo của người dùng
router.get('/', notificationController.getUserNotifications);

// Lấy số lượng thông báo chưa đọc
router.get('/unread-count', notificationController.getUnreadCount);

// Lấy thông báo nổi bật của người dùng
router.get('/featured', notificationController.getFeaturedNotifications);

// Đánh dấu thông báo đã đọc
router.put('/:id/read', notificationController.markAsRead);

// Đánh dấu tất cả thông báo đã đọc
router.put('/read-all', notificationController.markAllAsRead);

// Xóa thông báo
router.delete('/:id', notificationController.deleteNotification);

// Lấy cài đặt thông báo
router.get('/settings', notificationController.getNotificationSettings);

// Cập nhật cài đặt thông báo
router.put('/settings', notificationController.updateNotificationSettings);

module.exports = router; 