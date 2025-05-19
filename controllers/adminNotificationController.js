const { sql } = require('../config/database');
const notificationController = require('./notificationController');

// Lấy danh sách thông báo admin đã tạo
const getAdminNotifications = async (req, res) => {
    try {
        // Kiểm tra quyền admin
        if (!req.user.is_admin) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền truy cập tính năng này'
            });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        
        const request = new sql.Request();
        
        // Query lấy danh sách thông báo
        const queryResult = await request.query(`
            SELECT 
                an.*,
                u.full_name as created_by_name
            FROM AdminNotifications an
            LEFT JOIN Users u ON an.created_by = u.id
            ORDER BY an.created_at DESC
            OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY
        `);
        
        // Query đếm tổng số thông báo
        const countResult = await request.query(`
            SELECT COUNT(*) as total FROM AdminNotifications
        `);
        
        const total = countResult.recordset[0].total;
        
        res.status(200).json({
            success: true,
            data: {
                notifications: queryResult.recordset,
                pagination: {
                    total,
                    page,
                    limit,
                    total_pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Error getting admin notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi lấy danh sách thông báo admin',
            error: error.message
        });
    }
};

// Lấy chi tiết một thông báo admin
const getAdminNotification = async (req, res) => {
    try {
        // Kiểm tra quyền admin
        if (!req.user.is_admin) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền truy cập tính năng này'
            });
        }
        
        const notificationId = req.params.id;
        const request = new sql.Request();
        request.input('id', sql.Int, notificationId);
        
        const result = await request.query(`
            SELECT 
                an.*,
                u.full_name as created_by_name
            FROM AdminNotifications an
            LEFT JOIN Users u ON an.created_by = u.id
            WHERE an.id = @id
        `);
        
        if (result.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thông báo'
            });
        }
        
        res.status(200).json({
            success: true,
            data: result.recordset[0]
        });
    } catch (error) {
        console.error('Error getting admin notification details:', error);
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi lấy chi tiết thông báo admin',
            error: error.message
        });
    }
};

// Tạo thông báo mới (bởi admin)
const createAdminNotification = async (req, res) => {
    try {
        // Kiểm tra quyền admin
        if (!req.user.is_admin) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền truy cập tính năng này'
            });
        }
        
        const { 
            title, 
            message, 
            target_type, 
            target_users,
            is_active, 
            start_date, 
            end_date 
        } = req.body;
        
        // Validate input
        if (!title || !message || !target_type) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp đầy đủ thông tin: title, message, target_type'
            });
        }
        
        // Validate target_type
        const validTargetTypes = ['all_users', 'property_owners', 'specific_users'];
        if (!validTargetTypes.includes(target_type)) {
            return res.status(400).json({
                success: false,
                message: 'target_type không hợp lệ. Chỉ chấp nhận: all_users, property_owners, specific_users'
            });
        }
        
        // Validate target_users nếu target_type là specific_users
        if (target_type === 'specific_users') {
            if (!target_users || !Array.isArray(JSON.parse(target_users))) {
                return res.status(400).json({
                    success: false,
                    message: 'target_users phải là một mảng các ID người dùng'
                });
            }
        }
        
        const request = new sql.Request();
        request.input('title', sql.NVarChar, title);
        request.input('message', sql.NVarChar, message);
        request.input('target_type', sql.NVarChar, target_type);
        request.input('target_users', sql.NVarChar, target_users ? target_users : null);
        request.input('is_active', sql.Bit, is_active === false ? 0 : 1);
        request.input('start_date', sql.DateTime, start_date || new Date());
        request.input('end_date', sql.DateTime, end_date || null);
        request.input('created_by', sql.Int, req.user.id);
        
        const result = await request.query(`
            INSERT INTO AdminNotifications (
                title,
                message,
                target_type,
                target_users,
                is_active,
                start_date,
                end_date,
                created_by,
                created_at
            )
            VALUES (
                @title,
                @message,
                @target_type,
                @target_users,
                @is_active,
                @start_date,
                @end_date,
                @created_by,
                GETDATE()
            );
            
            SELECT SCOPE_IDENTITY() AS id;
        `);
        
        const notificationId = result.recordset[0].id;
        
        // Nếu thông báo hoạt động và ngày bắt đầu là hôm nay hoặc trước đó,
        // gửi thông báo ngay lập tức đến các người dùng
        if (is_active !== false) {
            const startDateObj = start_date ? new Date(start_date) : new Date();
            const currentDate = new Date();
            
            if (startDateObj <= currentDate) {
                // Gửi thông báo bất đồng bộ để không chặn response API
                notificationController.sendAdminNotificationToUsers(notificationId)
                    .then(count => {
                        console.log(`Đã gửi thông báo admin tới ${count} người dùng`);
                    })
                    .catch(error => {
                        console.error('Lỗi khi gửi thông báo admin:', error);
                    });
            }
        }
        
        res.status(201).json({
            success: true,
            message: 'Tạo thông báo thành công',
            data: {
                id: notificationId,
                title,
                message,
                target_type,
                target_users: target_users ? JSON.parse(target_users) : null,
                is_active: is_active !== false,
                start_date,
                end_date,
                created_by: req.user.id,
                created_at: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error creating admin notification:', error);
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi tạo thông báo admin',
            error: error.message
        });
    }
};

// Cập nhật thông báo admin
const updateAdminNotification = async (req, res) => {
    try {
        // Kiểm tra quyền admin
        if (!req.user.is_admin) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền truy cập tính năng này'
            });
        }
        
        const notificationId = req.params.id;
        const { 
            title, 
            message, 
            target_type, 
            target_users,
            is_active, 
            start_date, 
            end_date 
        } = req.body;
        
        // Validate target_type nếu được cung cấp
        if (target_type) {
            const validTargetTypes = ['all_users', 'property_owners', 'specific_users'];
            if (!validTargetTypes.includes(target_type)) {
                return res.status(400).json({
                    success: false,
                    message: 'target_type không hợp lệ. Chỉ chấp nhận: all_users, property_owners, specific_users'
                });
            }
        }
        
        // Kiểm tra nếu thông báo tồn tại
        const request = new sql.Request();
        request.input('id', sql.Int, notificationId);
        
        const checkResult = await request.query(`
            SELECT * FROM AdminNotifications WHERE id = @id
        `);
        
        if (checkResult.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thông báo'
            });
        }
        
        const existingNotification = checkResult.recordset[0];
        
        // Cập nhật các trường được cung cấp
        request.input('title', sql.NVarChar, title || existingNotification.title);
        request.input('message', sql.NVarChar, message || existingNotification.message);
        request.input('target_type', sql.NVarChar, target_type || existingNotification.target_type);
        request.input('target_users', sql.NVarChar, target_users !== undefined ? target_users : existingNotification.target_users);
        request.input('is_active', sql.Bit, is_active !== undefined ? (is_active ? 1 : 0) : existingNotification.is_active);
        request.input('start_date', sql.DateTime, start_date || existingNotification.start_date);
        request.input('end_date', sql.DateTime, end_date !== undefined ? end_date : existingNotification.end_date);
        
        await request.query(`
            UPDATE AdminNotifications
            SET 
                title = @title,
                message = @message,
                target_type = @target_type,
                target_users = @target_users,
                is_active = @is_active,
                start_date = @start_date,
                end_date = @end_date,
                updated_at = GETDATE()
            WHERE id = @id
        `);
        
        res.status(200).json({
            success: true,
            message: 'Cập nhật thông báo thành công',
            data: {
                id: notificationId,
                title: title || existingNotification.title,
                message: message || existingNotification.message,
                target_type: target_type || existingNotification.target_type,
                target_users: target_users !== undefined ? target_users : existingNotification.target_users,
                is_active: is_active !== undefined ? is_active : Boolean(existingNotification.is_active),
                start_date: start_date || existingNotification.start_date,
                end_date: end_date !== undefined ? end_date : existingNotification.end_date,
                updated_at: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error updating admin notification:', error);
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi cập nhật thông báo admin',
            error: error.message
        });
    }
};

// Xóa thông báo admin
const deleteAdminNotification = async (req, res) => {
    try {
        // Kiểm tra quyền admin
        if (!req.user.is_admin) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền truy cập tính năng này'
            });
        }
        
        const notificationId = req.params.id;
        const request = new sql.Request();
        request.input('id', sql.Int, notificationId);
        
        const result = await request.query(`
            DELETE FROM AdminNotifications
            WHERE id = @id
        `);
        
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thông báo'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Đã xóa thông báo thành công'
        });
    } catch (error) {
        console.error('Error deleting admin notification:', error);
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi xóa thông báo admin',
            error: error.message
        });
    }
};

// Gửi thông báo admin đến người dùng
const sendAdminNotification = async (req, res) => {
    try {
        // Kiểm tra quyền admin
        if (!req.user.is_admin) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền truy cập tính năng này'
            });
        }
        
        const notificationId = req.params.id;
        
        const count = await notificationController.sendAdminNotificationToUsers(notificationId);
        
        if (count === false) {
            return res.status(400).json({
                success: false,
                message: 'Không thể gửi thông báo. Kiểm tra lại thông tin thông báo.'
            });
        }
        
        res.status(200).json({
            success: true,
            message: `Đã gửi thông báo đến ${count} người dùng`,
            data: {
                sent_count: count
            }
        });
    } catch (error) {
        console.error('Error sending admin notification:', error);
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi gửi thông báo admin',
            error: error.message
        });
    }
};

module.exports = {
    getAdminNotifications,
    getAdminNotification,
    createAdminNotification,
    updateAdminNotification,
    deleteAdminNotification,
    sendAdminNotification
}; 