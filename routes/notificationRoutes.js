const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

// Lấy danh sách thông báo
router.get('/', auth, notificationController.getUserNotifications);

// Lấy số lượng thông báo chưa đọc
router.get('/unread-count', auth, notificationController.getUnreadCount);

// Đánh dấu tất cả thông báo đã đọc
router.put('/mark-all-read', auth, notificationController.markAllAsRead);

// Lấy cài đặt thông báo
router.get('/settings', auth, notificationController.getNotificationSettings);

// Cập nhật cài đặt thông báo
router.put('/settings', auth, notificationController.updateNotificationSettings);

// Đánh dấu thông báo đã đọc
router.put('/:id/read', auth, notificationController.markAsRead);

// Xóa thông báo
router.delete('/:id', auth, notificationController.deleteNotification);

module.exports = router; 