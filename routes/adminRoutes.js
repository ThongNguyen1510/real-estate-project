const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// Middleware kiểm tra quyền admin
router.use(auth, isAdmin);

// Quản lý người dùng
router.get('/users', adminController.listUsers);
router.put('/users/:userId', adminController.updateUser);
router.delete('/users/:userId', adminController.deleteUser);

// Quản lý bất động sản
router.get('/properties', adminController.listProperties);
router.put('/properties/:propertyId', adminController.updateProperty);

// Quản lý báo cáo
router.get('/reports', adminController.listReports);
router.put('/reports/:reportId', adminController.updateReport);

// Thống kê hệ thống
router.get('/stats', adminController.getStats);

// Chi tiết báo cáo - nếu có phương thức cụ thể khác
router.get('/reports/:id', adminController.getPropertyReportById);
router.delete('/reports/:id', adminController.deletePropertyReport);

module.exports = router; 