const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../controllers/propertyController');
const reportController = require('../controllers/reportController');

// Báo cáo tin đăng
router.post('/properties/:propertyId/report', authenticateToken, reportController.reportProperty);

// Xem danh sách báo cáo của người dùng
router.get('/my-reports', authenticateToken, reportController.getUserReports);

// Xem chi tiết báo cáo (cần xác thực - chỉ người báo cáo hoặc admin mới xem được)
router.get('/reports/:id', authenticateToken, reportController.getReportDetail);

// Các route cho admin
router.get('/admin/reports', authenticateToken, reportController.getAllReports);
router.put('/admin/reports/:id', authenticateToken, reportController.updateReportStatus);

module.exports = router; 