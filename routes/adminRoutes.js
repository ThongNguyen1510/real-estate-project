const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const {
    listUsers,
    updateUser,
    listProperties,
    updateProperty,
    listReports,
    updateReport,
    getStats
} = require('../controllers/adminController');

// Middleware kiểm tra quyền admin
router.use(auth, isAdmin);

// Quản lý người dùng
router.get('/users', listUsers);
router.put('/users/:userId', updateUser);

// Quản lý bất động sản
router.get('/properties', listProperties);
router.put('/properties/:propertyId', updateProperty);

// Quản lý báo cáo
router.get('/reports', listReports);
router.put('/reports/:reportId', updateReport);

// Thống kê hệ thống
router.get('/stats', getStats);

module.exports = router; 