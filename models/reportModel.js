const { sql } = require('../config/database');

/**
 * Tạo báo cáo tin đăng
 * @param {Object} reportData - Thông tin báo cáo
 * @returns {Promise<Object>} - ID của báo cáo đã tạo
 */
const createPropertyReport = async (reportData) => {
    try {
        console.log('Bắt đầu tạo báo cáo với dữ liệu:', reportData);
        const { user_id, property_id, reason, details } = reportData;
        
        // Kiểm tra tham số đầu vào
        if (!user_id || !property_id || !reason) {
            throw new Error('Thiếu thông tin bắt buộc: user_id, property_id, reason');
        }
        
        // Kiểm tra dữ liệu hợp lệ
        if (typeof property_id !== 'number' || property_id <= 0) {
            throw new Error(`ID bất động sản không hợp lệ: ${property_id}`);
        }
        
        if (typeof user_id !== 'number' || user_id <= 0) {
            throw new Error(`ID người dùng không hợp lệ: ${user_id}`);
        }
        
        // Check if already reported by this user
        const checkRequest = new sql.Request();
        checkRequest.input('user_id', sql.Int, user_id);
        checkRequest.input('property_id', sql.Int, property_id);
        
        const checkQuery = `
            SELECT id FROM PropertyReports 
            WHERE user_id = @user_id AND property_id = @property_id AND status != 'resolved'
        `;
        
        console.log('Kiểm tra báo cáo trùng lặp với query:', checkQuery);
        const checkResult = await checkRequest.query(checkQuery);
        
        if (checkResult.recordset.length > 0) {
            const error = new Error('Bạn đã báo cáo tin đăng này và đang chờ xử lý');
            error.code = 'DUPLICATE_REPORT';
            throw error;
        }
        
        // Bắt đầu transaction
        const transaction = new sql.Transaction();
        await transaction.begin();
        const request = new sql.Request(transaction);
        
        try {
            // Create new report
            request.input('user_id', sql.Int, user_id);
            request.input('property_id', sql.Int, property_id);
            request.input('reason', sql.NVarChar, reason);
            request.input('details', sql.NVarChar, details || null);
            
            const query = `
                INSERT INTO PropertyReports (user_id, property_id, reason, details, status, created_at)
                VALUES (@user_id, @property_id, @reason, @details, 'pending', GETDATE())
                
                SELECT SCOPE_IDENTITY() AS id
            `;
            
            console.log('Thêm báo cáo mới với query:', query);
            const result = await request.query(query);
            const reportId = result.recordset[0].id;
            
            // Lấy thông tin property cho thông báo
            request.input('property_id_for_query', sql.Int, property_id);
            const propertyInfoQuery = `
                SELECT p.title, u.id as owner_id
                FROM Properties p
                JOIN Users u ON p.owner_id = u.id
                WHERE p.id = @property_id_for_query
            `;
            const propertyInfo = await request.query(propertyInfoQuery);
            
            if (propertyInfo.recordset.length > 0) {
                const propertyTitle = propertyInfo.recordset[0].title;
                
                // Tìm admin để gửi thông báo
                const adminQuery = `
                    SELECT id FROM Users WHERE role = 'admin'
                `;
                const adminResult = await request.query(adminQuery);
                
                if (adminResult.recordset.length > 0) {
                    // Gửi thông báo cho tất cả admin
                    for (const admin of adminResult.recordset) {
                        const notificationQuery = `
                            INSERT INTO Notifications (
                                user_id, title, message, 
                                notification_type, reference_id, is_read, created_at
                            )
                            VALUES (
                                @admin_id, 'Báo cáo tin đăng mới', 
                                @notification_content, 'property_report', @report_id, 0, GETDATE()
                            )
                        `;
                        
                        request.input('admin_id', sql.Int, admin.id);
                        request.input('notification_content', sql.NVarChar, `Có báo cáo mới về tin đăng "${propertyTitle}" cần được xử lý.`);
                        request.input('report_id', sql.Int, reportId);
                        
                        await request.query(notificationQuery);
                    }
                }
                
                // Gửi thông báo cho chủ sở hữu property
                const ownerNotificationQuery = `
                    INSERT INTO Notifications (
                        user_id, title, message, 
                        notification_type, reference_id, is_read, created_at
                    )
                    VALUES (
                        @owner_id, @owner_title, @owner_content, 
                        'property', @property_id_for_notification, 0, GETDATE()
                    )
                `;
                
                request.input('owner_id', sql.Int, propertyInfo.recordset[0].owner_id);
                request.input('owner_title', sql.NVarChar, `Tin đăng "${propertyTitle}" của bạn đã bị báo cáo`);
                request.input('owner_content', sql.NVarChar, `Tin đăng "${propertyTitle}" của bạn đã bị báo cáo. Quản trị viên sẽ xem xét báo cáo này.`);
                request.input('property_id_for_notification', sql.Int, property_id);
                
                await request.query(ownerNotificationQuery);
            }
            
            await transaction.commit();
            console.log('Tạo báo cáo thành công với ID:', reportId);
            
            return { id: reportId };
        } catch (error) {
            console.error('Lỗi trong transaction, rollback:', error);
            await transaction.rollback();
            throw error;
        }
    } catch (error) {
        console.error('Lỗi createPropertyReport:', error);
        throw error;
    }
};

/**
 * Lấy danh sách báo cáo của người dùng
 * @param {number} userId - ID của người dùng
 * @param {Object} params - Các tham số lọc và phân trang
 * @returns {Promise<Object>} - Danh sách báo cáo và thông tin phân trang
 */
const getUserReports = async (userId, params = {}) => {
    try {
        const { page = 1, limit = 10, status } = params;
        const offset = (page - 1) * limit;
        
        const request = new sql.Request();
        request.input('user_id', sql.Int, userId);
        request.input('offset', sql.Int, offset);
        request.input('limit', sql.Int, limit);
        
        let whereClause = 'WHERE r.user_id = @user_id';
        
        if (status) {
            whereClause += ' AND r.status = @status';
            request.input('status', sql.NVarChar, status);
        }
        
        // Get total count
        const countQuery = `
            SELECT COUNT(*) as total 
            FROM PropertyReports r
            ${whereClause}
        `;
        
        const countResult = await request.query(countQuery);
        const total = countResult.recordset[0].total;
        const totalPages = Math.ceil(total / limit);
        
        // Get reports with property info
        const query = `
            SELECT 
                r.id, r.property_id, r.reason, r.details, r.status, r.created_at,
                r.admin_response, r.resolved_at,
                p.title as property_title,
                (SELECT TOP 1 image_url FROM PropertyImages WHERE property_id = p.id) as property_image
            FROM PropertyReports r
            JOIN Properties p ON r.property_id = p.id
            ${whereClause}
            ORDER BY r.created_at DESC
            OFFSET @offset ROWS
            FETCH NEXT @limit ROWS ONLY
        `;
        
        const result = await request.query(query);
        
        return {
            reports: result.recordset,
            pagination: {
                total,
                totalPages,
                currentPage: parseInt(page),
                limit: parseInt(limit)
            }
        };
    } catch (error) {
        console.error('Lỗi getUserReports:', error);
        throw error;
    }
};

/**
 * Lấy danh sách báo cáo tin đăng (cho admin)
 * @param {Object} params - Các tham số lọc và phân trang 
 * @returns {Promise<Object>} - Danh sách báo cáo và thông tin phân trang
 */
const getAllPropertyReports = async (params = {}) => {
    try {
        const { page = 1, limit = 10, status, property_id } = params;
        const offset = (page - 1) * limit;
        
        const request = new sql.Request();
        request.input('offset', sql.Int, offset);
        request.input('limit', sql.Int, limit);
        
        let whereClause = 'WHERE 1=1';
        
        if (status) {
            whereClause += ' AND r.status = @status';
            request.input('status', sql.NVarChar, status);
        }
        
        if (property_id) {
            whereClause += ' AND r.property_id = @property_id';
            request.input('property_id', sql.Int, property_id);
        }
        
        // Get total count
        const countQuery = `
            SELECT COUNT(*) as total 
            FROM PropertyReports r
            ${whereClause}
        `;
        
        const countResult = await request.query(countQuery);
        const total = countResult.recordset[0].total;
        const totalPages = Math.ceil(total / limit);
        
        // Get reports with property and user info
        const query = `
            SELECT 
                r.id, r.property_id, r.user_id, r.reason, r.details, r.status, 
                r.created_at, r.admin_response, r.resolved_at,
                p.title as property_title,
                (SELECT TOP 1 image_url FROM PropertyImages WHERE property_id = p.id) as property_image,
                u.name as reporter_name,
                u.email as reporter_email
            FROM PropertyReports r
            JOIN Properties p ON r.property_id = p.id
            JOIN Users u ON r.user_id = u.id
            ${whereClause}
            ORDER BY 
                CASE 
                    WHEN r.status = 'pending' THEN 0
                    WHEN r.status = 'investigating' THEN 1
                    ELSE 2
                END,
                r.created_at DESC
            OFFSET @offset ROWS
            FETCH NEXT @limit ROWS ONLY
        `;
        
        const result = await request.query(query);
        
        return {
            reports: result.recordset,
            pagination: {
                total,
                totalPages,
                currentPage: parseInt(page),
                limit: parseInt(limit)
            }
        };
    } catch (error) {
        console.error('Lỗi getAllPropertyReports:', error);
        throw error;
    }
};

/**
 * Cập nhật trạng thái báo cáo
 * @param {number} reportId - ID của báo cáo
 * @param {Object} updateData - Dữ liệu cập nhật
 * @returns {Promise<Object>} - Kết quả cập nhật
 */
const updateReportStatus = async (reportId, updateData) => {
    try {
        const { status, admin_response } = updateData;
        
        // Bắt đầu transaction
        const transaction = new sql.Transaction();
        await transaction.begin();
        const request = new sql.Request(transaction);
        
        try {
            request.input('id', sql.Int, reportId);
            request.input('status', sql.NVarChar, status);
            request.input('admin_response', sql.NVarChar, admin_response || null);
            
            let updateQuery = `
                UPDATE PropertyReports 
                SET status = @status, admin_response = @admin_response
            `;
            
            if (status === 'resolved') {
                updateQuery += `, resolved_at = GETDATE()`;
            }
            
            updateQuery += ` WHERE id = @id`;
            
            const result = await request.query(updateQuery);
            
            if (result.rowsAffected[0] === 0) {
                await transaction.rollback();
                throw new Error('Không tìm thấy báo cáo');
            }
            
            // Lấy thông tin báo cáo và bất động sản
            const reportInfoQuery = `
                SELECT 
                    r.user_id as reporter_id, r.property_id, 
                    p.title as property_title, p.owner_id
                FROM PropertyReports r
                JOIN Properties p ON r.property_id = p.id
                WHERE r.id = @report_id
            `;
            
            request.input('report_id', sql.Int, reportId);
            const reportInfo = await request.query(reportInfoQuery);
            
            if (reportInfo.recordset.length > 0) {
                const info = reportInfo.recordset[0];
                
                // Thông báo cho người báo cáo
                let reporterTitle = '';
                let reporterContent = '';
                
                if (status === 'investigating') {
                    reporterTitle = 'Báo cáo của bạn đang được xem xét';
                    reporterContent = `Báo cáo của bạn về tin đăng "${info.property_title}" đang được xem xét. Chúng tôi sẽ thông báo khi có kết quả.`;
                } else if (status === 'resolved') {
                    reporterTitle = 'Báo cáo của bạn đã được giải quyết';
                    reporterContent = `Báo cáo của bạn về tin đăng "${info.property_title}" đã được giải quyết. ${admin_response ? 'Phản hồi: ' + admin_response : ''}`;
                } else if (status === 'rejected') {
                    reporterTitle = 'Báo cáo của bạn đã bị từ chối';
                    reporterContent = `Báo cáo của bạn về tin đăng "${info.property_title}" đã bị từ chối. ${admin_response ? 'Lý do: ' + admin_response : ''}`;
                }
                
                if (reporterTitle) {
                    const reporterNotificationQuery = `
                        INSERT INTO Notifications (
                            user_id, title, message, 
                            notification_type, reference_id, is_read, created_at
                        )
                        VALUES (
                            @reporter_id, @reporter_title, 
                            @reporter_content, 'property_report', @report_id_for_notification, 0, GETDATE()
                        )
                    `;
                    
                    request.input('reporter_id', sql.Int, info.reporter_id);
                    request.input('reporter_title', sql.NVarChar, reporterTitle);
                    request.input('reporter_content', sql.NVarChar, reporterContent);
                    request.input('report_id_for_notification', sql.Int, reportId);
                    
                    await request.query(reporterNotificationQuery);
                }
                
                // Thông báo cho chủ bất động sản nếu báo cáo được giải quyết hoặc bị từ chối
                if (status === 'resolved' || status === 'rejected') {
                    let ownerTitle = '';
                    let ownerContent = '';
                    
                    if (status === 'resolved') {
                        ownerTitle = 'Báo cáo về tin đăng của bạn đã được giải quyết';
                        ownerContent = `Báo cáo về tin đăng "${info.property_title}" của bạn đã được giải quyết. ${admin_response ? 'Phản hồi: ' + admin_response : ''}`;
                    } else {
                        ownerTitle = 'Báo cáo về tin đăng của bạn đã bị từ chối';
                        ownerContent = `Báo cáo về tin đăng "${info.property_title}" của bạn đã bị từ chối. Tin đăng của bạn không vi phạm quy định.`;
                    }
                    
                    const ownerNotificationQuery = `
                        INSERT INTO Notifications (
                            user_id, title, message, 
                            notification_type, reference_id, is_read, created_at
                        )
                        VALUES (
                            @owner_id, @owner_title, @owner_content, 
                            'property', @property_id_for_notification, 0, GETDATE()
                        )
                    `;
                    
                    request.input('owner_id', sql.Int, info.owner_id);
                    request.input('owner_title', sql.NVarChar, ownerTitle);
                    request.input('owner_content', sql.NVarChar, ownerContent);
                    request.input('property_id_for_notification', sql.Int, info.property_id);
                    
                    await request.query(ownerNotificationQuery);
                }
            }
            
            await transaction.commit();
            return { success: true };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    } catch (error) {
        console.error('Lỗi updateReportStatus:', error);
        throw error;
    }
};

/**
 * Lấy chi tiết báo cáo
 * @param {number} reportId - ID của báo cáo
 * @returns {Promise<Object>} - Thông tin chi tiết báo cáo
 */
const getReportDetail = async (reportId) => {
    try {
        const result = await sql.query`
            SELECT 
                r.id, r.property_id, r.user_id, r.reason, r.details, r.status, 
                r.created_at, r.admin_response, r.resolved_at,
                p.title as property_title, p.description as property_description,
                p.price, p.area, p.property_type, p.status as property_status,
                u.name as reporter_name, u.email as reporter_email,
                owner.name as owner_name, owner.email as owner_email,
                (SELECT TOP 1 image_url FROM PropertyImages WHERE property_id = p.id) as property_image
            FROM PropertyReports r
            JOIN Properties p ON r.property_id = p.id
            JOIN Users u ON r.user_id = u.id
            JOIN Users owner ON p.owner_id = owner.id
            WHERE r.id = ${reportId}
        `;
        
        if (result.recordset.length === 0) {
            throw new Error('Không tìm thấy báo cáo');
        }
        
        return result.recordset[0];
    } catch (error) {
        console.error('Lỗi getReportDetail:', error);
        throw error;
    }
};

/**
 * Lấy thông tin báo cáo theo ID
 */
const getReportById = async (reportId) => {
    try {
        const request = new sql.Request();
        request.input('reportId', sql.Int, reportId);
        
        const result = await request.query(`
            SELECT r.id, r.reason, r.description, r.status, r.reporter_id,
                   p.id as property_id, p.title as property_title, p.owner_id as property_owner_id
            FROM PropertyReports r
            JOIN Properties p ON r.property_id = p.id
            WHERE r.id = @reportId
        `);
        
        if (result.recordset.length > 0) {
            return result.recordset[0];
        }
        return null;
    } catch (error) {
        console.error('Error getting report by ID:', error);
        throw error;
    }
};

module.exports = {
    createPropertyReport,
    getUserReports,
    getAllPropertyReports,
    updateReportStatus,
    getReportDetail,
    getReportById
}; 