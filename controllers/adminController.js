const {
    getUsers,
    updateUserStatus,
    getProperties,
    updatePropertyStatus,
    getReports,
    updateReportStatus,
    getStatistics
} = require('../models/adminModel');

// Lấy danh sách người dùng
const listUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const result = await getUsers(parseInt(page), parseInt(limit), search);
        
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Lỗi list users:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

// Cập nhật trạng thái người dùng
const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { status } = req.body;

        if (!status || !['active', 'inactive', 'banned'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Trạng thái không hợp lệ'
            });
        }

        const updated = await updateUserStatus(userId, status);
        
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        res.json({
            success: true,
            message: 'Đã cập nhật trạng thái người dùng'
        });
    } catch (error) {
        console.error('Lỗi update user:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

// Lấy danh sách bất động sản
const listProperties = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const result = await getProperties(parseInt(page), parseInt(limit), search);
        
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Lỗi list properties:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

// Cập nhật trạng thái bất động sản
const updateProperty = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const { status } = req.body;

        if (!status || !['available', 'rented', 'sold', 'maintenance'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Trạng thái không hợp lệ'
            });
        }

        const updated = await updatePropertyStatus(propertyId, status);
        
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bất động sản'
            });
        }

        res.json({
            success: true,
            message: 'Đã cập nhật trạng thái bất động sản'
        });
    } catch (error) {
        console.error('Lỗi update property:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

// Lấy danh sách báo cáo
const listReports = async (req, res) => {
    try {
        const { page = 1, limit = 10, status = '' } = req.query;
        const result = await getReports(parseInt(page), parseInt(limit), status);
        
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Lỗi list reports:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

// Cập nhật trạng thái báo cáo
const updateReport = async (req, res) => {
    try {
        const { reportId } = req.params;
        const { status } = req.body;

        if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Trạng thái không hợp lệ'
            });
        }

        const updated = await updateReportStatus(reportId, status);
        
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy báo cáo'
            });
        }

        res.json({
            success: true,
            message: 'Đã cập nhật trạng thái báo cáo'
        });
    } catch (error) {
        console.error('Lỗi update report:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

// Lấy thống kê hệ thống
const getStats = async (req, res) => {
    try {
        const stats = await getStatistics();
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Lỗi get stats:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

module.exports = {
    listUsers,
    updateUser,
    listProperties,
    updateProperty,
    listReports,
    updateReport,
    getStats
}; 