const express = require('express');
const router = express.Router();
const adminNotificationController = require('../controllers/adminNotificationController');
const { auth, isAdmin } = require('../middleware/auth');

// Yêu cầu xác thực và quyền admin cho tất cả các routes
router.use(auth);
router.use(isAdmin);

// Lấy danh sách thông báo admin
router.get('/', adminNotificationController.getAdminNotifications);

// Lấy chi tiết thông báo
router.get('/:id', adminNotificationController.getAdminNotification);

// Tạo thông báo mới
router.post('/', adminNotificationController.createAdminNotification);

// Cập nhật thông báo
router.put('/:id', adminNotificationController.updateAdminNotification);

// Xóa thông báo
router.delete('/:id', adminNotificationController.deleteAdminNotification);

// Gửi thông báo
router.post('/:id/send', adminNotificationController.sendAdminNotification);

module.exports = router; 