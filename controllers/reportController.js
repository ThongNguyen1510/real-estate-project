const reportModel = require('../models/reportModel');

/**
 * Báo cáo tin đăng
 */
const reportProperty = async (req, res) => {
    try {
        // Lấy ID người dùng từ token
        const userId = req.user.id;
        
        // Lấy ID bất động sản từ params
        const { propertyId } = req.params;
        
        console.log('Thông số báo cáo:', {
            userId: userId,
            propertyId: propertyId,
            propertyIdType: typeof propertyId
        });
        
        // Chuyển propertyId thành số nguyên
        const propertyIdInt = parseInt(propertyId, 10);
        if (isNaN(propertyIdInt)) {
            return res.status(400).json({
                success: false,
                message: 'ID bất động sản không hợp lệ'
            });
        }
        
        // Lấy lý do báo cáo từ body
        const { reason, details } = req.body;
        
        // Validate input
        if (!reason) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp lý do báo cáo'
            });
        }
        
        // Kiểm tra bất động sản tồn tại
        const { sql } = require('../config/database');
        const checkResult = await sql.query`
            SELECT id FROM Properties WHERE id = ${propertyIdInt}
        `;
        
        if (checkResult.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bất động sản với ID đã cung cấp'
            });
        }
        
        // Tạo báo cáo
        const reportData = {
            user_id: userId,
            property_id: propertyIdInt,
            reason,
            details
        };
        
        const result = await reportModel.createPropertyReport(reportData);
        
        res.status(201).json({
            success: true,
            message: 'Báo cáo tin đăng thành công',
            data: {
                id: result.id
            }
        });
    } catch (error) {
        console.error('Lỗi báo cáo tin đăng:', error);
        
        // Xử lý lỗi báo cáo trùng lặp
        if (error.code === 'DUPLICATE_REPORT') {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        
        // Xử lý lỗi khóa ngoại
        if (error.number === 547) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bất động sản hoặc người dùng với ID đã cung cấp'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi báo cáo tin đăng',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

/**
 * Lấy danh sách báo cáo của người dùng
 */
const getUserReports = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page, limit, status } = req.query;
        
        const result = await reportModel.getUserReports(userId, { page, limit, status });
        
        res.json({
            success: true,
            message: 'Lấy danh sách báo cáo thành công',
            data: result
        });
    } catch (error) {
        console.error('Lỗi lấy danh sách báo cáo:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy danh sách báo cáo',
            error: error.message
        });
    }
};

/**
 * Lấy danh sách tất cả báo cáo (dành cho admin)
 */
const getAllReports = async (req, res) => {
    try {
        // Kiểm tra quyền admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền truy cập tính năng này'
            });
        }
        
        const { page, limit, status, property_id } = req.query;
        
        const result = await reportModel.getAllPropertyReports({
            page, 
            limit, 
            status, 
            property_id
        });
        
        res.json({
            success: true,
            message: 'Lấy danh sách báo cáo thành công',
            data: result
        });
    } catch (error) {
        console.error('Lỗi lấy danh sách báo cáo (admin):', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy danh sách báo cáo',
            error: error.message
        });
    }
};

/**
 * Lấy chi tiết báo cáo
 */
const getReportDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        
        // Lấy chi tiết báo cáo
        const report = await reportModel.getReportDetail(id);
        
        // Kiểm tra quyền truy cập (chỉ admin hoặc người báo cáo)
        if (req.user.role !== 'admin' && report.user_id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền xem báo cáo này'
            });
        }
        
        res.json({
            success: true,
            message: 'Lấy chi tiết báo cáo thành công',
            data: report
        });
    } catch (error) {
        console.error('Lỗi lấy chi tiết báo cáo:', error);
        
        if (error.message === 'Không tìm thấy báo cáo') {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy báo cáo'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy chi tiết báo cáo',
            error: error.message
        });
    }
};

/**
 * Cập nhật trạng thái báo cáo (dành cho admin)
 */
const updateReportStatus = async (req, res) => {
    try {
        // Kiểm tra quyền admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền thực hiện hành động này'
            });
        }
        
        const { id } = req.params;
        const { status, admin_response } = req.body;
        
        // Validate input
        if (!status || !['pending', 'investigating', 'resolved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Trạng thái không hợp lệ'
            });
        }
        
        // Cập nhật trạng thái
        await reportModel.updateReportStatus(id, { status, admin_response });
        
        res.json({
            success: true,
            message: 'Cập nhật trạng thái báo cáo thành công'
        });
    } catch (error) {
        console.error('Lỗi cập nhật trạng thái báo cáo:', error);
        
        if (error.message === 'Không tìm thấy báo cáo') {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy báo cáo'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi cập nhật trạng thái báo cáo',
            error: error.message
        });
    }
};

module.exports = {
    reportProperty,
    getUserReports,
    getAllReports,
    getReportDetail,
    updateReportStatus
}; 