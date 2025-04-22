const { sql, connectToDatabase } = require('../config/database');

// Lấy danh sách người dùng (có phân trang)
const getUsers = async (page = 1, limit = 10, search = '') => {
    try {
        const offset = (page - 1) * limit;
        const pool = await connectToDatabase();
        
        const users = await pool.request()
            .input('offset', sql.Int, offset)
            .input('limit', sql.Int, limit)
            .input('search', sql.NVarChar, search)
            .query(`
                SELECT id, username, name, email, phone, role, status, 
                       last_login, created_at, avatar_url
                FROM Users
                WHERE (@search = '' OR 
                       username LIKE '%' + @search + '%' OR 
                       name LIKE '%' + @search + '%' OR 
                       email LIKE '%' + @search + '%')
                ORDER BY created_at DESC
                OFFSET @offset ROWS
                FETCH NEXT @limit ROWS ONLY
            `);

        const total = await pool.request()
            .input('search', sql.NVarChar, search)
            .query(`
                SELECT COUNT(*) as total
                FROM Users
                WHERE (@search = '' OR 
                       username LIKE '%' + @search + '%' OR 
                       name LIKE '%' + @search + '%' OR 
                       email LIKE '%' + @search + '%')
            `);

        return {
            users: users.recordset,
            total: total.recordset[0].total,
            page,
            limit
        };
    } catch (error) {
        console.error('Lỗi get users:', error);
        throw error;
    }
};

// Cập nhật trạng thái người dùng
const updateUserStatus = async (userId, status) => {
    try {
        const pool = await connectToDatabase();
        const result = await pool.request()
            .input('userId', sql.Int, userId)
            .input('status', sql.VarChar(50), status)
            .query('UPDATE Users SET status = @status WHERE id = @userId');
            
        return result.rowsAffected[0] > 0;
    } catch (error) {
        console.error('Lỗi update user status:', error);
        throw error;
    }
};

// Lấy danh sách bất động sản (có phân trang)
const getProperties = async (page = 1, limit = 10, search = '') => {
    try {
        const offset = (page - 1) * limit;
        const pool = await connectToDatabase();
        
        const properties = await pool.request()
            .input('offset', sql.Int, offset)
            .input('limit', sql.Int, limit)
            .input('search', sql.NVarChar, search)
            .query(`
                SELECT p.*, u.name as owner_name, u.email as owner_email,
                       l.address, l.city, l.district, l.ward
                FROM Properties p
                INNER JOIN Users u ON p.owner_id = u.id
                INNER JOIN Locations l ON p.location_id = l.id
                WHERE (@search = '' OR 
                       p.title LIKE '%' + @search + '%' OR 
                       p.description LIKE '%' + @search + '%' OR
                       u.name LIKE '%' + @search + '%')
                ORDER BY p.created_at DESC
                OFFSET @offset ROWS
                FETCH NEXT @limit ROWS ONLY
            `);

        const total = await pool.request()
            .input('search', sql.NVarChar, search)
            .query(`
                SELECT COUNT(*) as total
                FROM Properties p
                INNER JOIN Users u ON p.owner_id = u.id
                WHERE (@search = '' OR 
                       p.title LIKE '%' + @search + '%' OR 
                       p.description LIKE '%' + @search + '%' OR
                       u.name LIKE '%' + @search + '%')
            `);

        return {
            properties: properties.recordset,
            total: total.recordset[0].total,
            page,
            limit
        };
    } catch (error) {
        console.error('Lỗi get properties:', error);
        throw error;
    }
};

// Cập nhật trạng thái bất động sản
const updatePropertyStatus = async (propertyId, status) => {
    try {
        const pool = await connectToDatabase();
        const result = await pool.request()
            .input('propertyId', sql.Int, propertyId)
            .input('status', sql.VarChar(50), status)
            .query('UPDATE Properties SET status = @status WHERE id = @propertyId');
            
        return result.rowsAffected[0] > 0;
    } catch (error) {
        console.error('Lỗi update property status:', error);
        throw error;
    }
};

// Lấy danh sách báo cáo (có phân trang)
const getReports = async (page = 1, limit = 10, status = '') => {
    try {
        const offset = (page - 1) * limit;
        const pool = await connectToDatabase();
        
        const reports = await pool.request()
            .input('offset', sql.Int, offset)
            .input('limit', sql.Int, limit)
            .input('status', sql.VarChar(50), status)
            .query(`
                SELECT r.*, 
                       u1.name as reporter_name, u1.email as reporter_email,
                       p.owner_id as reported_id,
                       u2.name as reported_name, u2.email as reported_email,
                       p.title as property_title
                FROM PropertyReports r
                INNER JOIN Users u1 ON r.user_id = u1.id
                INNER JOIN Properties p ON r.property_id = p.id
                INNER JOIN Users u2 ON p.owner_id = u2.id
                WHERE (@status = '' OR r.status = @status)
                ORDER BY r.created_at DESC
                OFFSET @offset ROWS
                FETCH NEXT @limit ROWS ONLY
            `);

        const total = await pool.request()
            .input('status', sql.VarChar(50), status)
            .query(`
                SELECT COUNT(*) as total
                FROM PropertyReports
                WHERE (@status = '' OR status = @status)
            `);

        return {
            reports: reports.recordset,
            total: total.recordset[0].total,
            page,
            limit
        };
    } catch (error) {
        console.error('Lỗi get reports:', error);
        throw error;
    }
};

// Cập nhật trạng thái báo cáo
const updateReportStatus = async (reportId, status, adminResponse = null) => {
    try {
        const pool = await connectToDatabase();
        const result = await pool.request()
            .input('reportId', sql.Int, reportId)
            .input('status', sql.VarChar(50), status)
            .input('adminResponse', sql.NVarChar, adminResponse)
            .query(`
                UPDATE PropertyReports
                SET status = @status,
                    admin_response = @adminResponse,
                    resolved_at = CASE WHEN @status IN ('resolved', 'rejected') THEN GETDATE() ELSE resolved_at END
                WHERE id = @reportId
            `);
            
        return result.rowsAffected[0] > 0;
    } catch (error) {
        console.error('Lỗi update report status:', error);
        throw error;
    }
};

// Lấy thống kê hệ thống
const getStatistics = async () => {
    try {
        const pool = await connectToDatabase();
        const stats = await pool.request().query(`
            SELECT 
                (SELECT COUNT(*) FROM Users) as total_users,
                (SELECT COUNT(*) FROM Users WHERE role = 'admin') as total_admins,
                (SELECT COUNT(*) FROM Users WHERE role = 'agent') as total_agents,
                (SELECT COUNT(*) FROM Properties) as total_properties,
                (SELECT COUNT(*) FROM Properties WHERE status = 'available') as available_properties,
                (SELECT COUNT(*) FROM Properties WHERE status = 'sold') as sold_properties,
                (SELECT COUNT(*) FROM Reviews) as total_reviews,
                (SELECT COUNT(*) FROM Messages) as total_messages,
                (SELECT COUNT(*) FROM PropertyReports WHERE status = 'pending') as pending_reports
        `);

        return stats.recordset[0];
    } catch (error) {
        console.error('Lỗi get statistics:', error);
        throw error;
    }
};

module.exports = {
    getUsers,
    updateUserStatus,
    getProperties,
    updatePropertyStatus,
    getReports,
    updateReportStatus,
    getStatistics
}; 