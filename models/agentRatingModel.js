const { sql } = require('../config/database');

/**
 * Lấy danh sách đánh giá của một môi giới
 * @param {Object} filters - Các tham số lọc
 * @returns {Promise<Array>} Danh sách đánh giá
 */
const getAgentRatings = async (filters = {}) => {
    try {
        const request = new sql.Request();
        let query = `
            SELECT ar.*,
                   u.name AS user_name,
                   u.avatar_url AS user_avatar
            FROM AgentRatings ar
            JOIN Users u ON ar.user_id = u.id
            WHERE 1=1
        `;

        // Lọc theo ID của môi giới
        if (filters.agent_id) {
            query += ' AND ar.agent_id = @agent_id';
            request.input('agent_id', sql.Int, filters.agent_id);
        }

        // Lọc theo ID người dùng (xem các đánh giá mình đã tạo)
        if (filters.user_id) {
            query += ' AND ar.user_id = @user_id';
            request.input('user_id', sql.Int, filters.user_id);
        }

        // Lọc theo giao dịch
        if (filters.transaction_id) {
            query += ' AND ar.transaction_id = @transaction_id';
            request.input('transaction_id', sql.Int, filters.transaction_id);
        }

        // Sắp xếp
        query += ' ORDER BY ar.created_at DESC';

        // Phân trang
        if (filters.page && filters.limit) {
            const offset = (filters.page - 1) * filters.limit;
            query += ' OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY';
            request.input('offset', sql.Int, offset);
            request.input('limit', sql.Int, filters.limit);
        }

        const result = await request.query(query);
        return result.recordset;
    } catch (error) {
        console.error('Lỗi getAgentRatings:', error);
        throw error;
    }
};

/**
 * Lấy chi tiết một đánh giá môi giới
 * @param {number} id - ID của đánh giá
 * @returns {Promise<Object>} Chi tiết đánh giá
 */
const getAgentRatingById = async (id) => {
    try {
        const request = new sql.Request();
        request.input('id', sql.Int, id);
        
        const result = await request.query(`
            SELECT ar.*,
                   u.name AS user_name,
                   u.avatar_url AS user_avatar,
                   a.name AS agent_name
            FROM AgentRatings ar
            JOIN Users u ON ar.user_id = u.id
            JOIN Users a ON ar.agent_id = a.id
            WHERE ar.id = @id
        `);
        
        return result.recordset[0];
    } catch (error) {
        console.error('Lỗi getAgentRatingById:', error);
        throw error;
    }
};

/**
 * Tạo đánh giá mới cho môi giới
 * @param {Object} ratingData - Dữ liệu đánh giá
 * @returns {Promise<number>} ID của đánh giá vừa tạo
 */
const createAgentRating = async (ratingData) => {
    try {
        const { user_id, agent_id, rating, comment, transaction_id } = ratingData;
        
        // Kiểm tra xem người dùng đã đánh giá môi giới này chưa
        if (transaction_id) {
            const checkRequest = new sql.Request();
            checkRequest.input('user_id', sql.Int, user_id);
            checkRequest.input('transaction_id', sql.Int, transaction_id);
            
            const checkResult = await checkRequest.query(`
                SELECT id FROM AgentRatings 
                WHERE user_id = @user_id AND transaction_id = @transaction_id
            `);
            
            if (checkResult.recordset.length > 0) {
                const error = new Error('Bạn đã đánh giá môi giới cho giao dịch này');
                error.code = 'DUPLICATE_RATING';
                throw error;
            }
        }
        
        const request = new sql.Request();
        request.input('user_id', sql.Int, user_id);
        request.input('agent_id', sql.Int, agent_id);
        request.input('rating', sql.Decimal(2, 1), rating);
        request.input('comment', sql.NVarChar, comment);
        
        if (transaction_id) {
            request.input('transaction_id', sql.Int, transaction_id);
            
            const result = await request.query(`
                INSERT INTO AgentRatings (
                    user_id, agent_id, rating, comment, transaction_id, created_at
                )
                VALUES (
                    @user_id, @agent_id, @rating, @comment, @transaction_id, GETDATE()
                );
                
                SELECT SCOPE_IDENTITY() AS id;
            `);
            
            return result.recordset[0].id;
        } else {
            const result = await request.query(`
                INSERT INTO AgentRatings (
                    user_id, agent_id, rating, comment, created_at
                )
                VALUES (
                    @user_id, @agent_id, @rating, @comment, GETDATE()
                );
                
                SELECT SCOPE_IDENTITY() AS id;
            `);
            
            return result.recordset[0].id;
        }
    } catch (error) {
        console.error('Lỗi createAgentRating:', error);
        throw error;
    }
};

/**
 * Cập nhật đánh giá môi giới
 * @param {number} id - ID của đánh giá
 * @param {Object} ratingData - Dữ liệu cập nhật
 * @param {number} userId - ID của người dùng thực hiện cập nhật
 * @returns {Promise<boolean>} Kết quả cập nhật
 */
const updateAgentRating = async (id, ratingData, userId) => {
    try {
        const { rating, comment } = ratingData;
        
        const request = new sql.Request();
        request.input('id', sql.Int, id);
        request.input('rating', sql.Decimal(2, 1), rating);
        request.input('comment', sql.NVarChar, comment);
        request.input('userId', sql.Int, userId);
        request.input('updated_at', sql.DateTime, new Date());
        
        const result = await request.query(`
            UPDATE AgentRatings
            SET rating = @rating,
                comment = @comment,
                updated_at = @updated_at
            WHERE id = @id AND user_id = @userId;
            
            SELECT @@ROWCOUNT AS affectedRows;
        `);
        
        return result.recordset[0].affectedRows > 0;
    } catch (error) {
        console.error('Lỗi updateAgentRating:', error);
        throw error;
    }
};

/**
 * Xóa đánh giá môi giới
 * @param {number} id - ID của đánh giá
 * @param {number} userId - ID của người dùng thực hiện xóa
 * @param {boolean} isAdmin - Có phải admin không
 * @returns {Promise<boolean>} Kết quả xóa
 */
const deleteAgentRating = async (id, userId, isAdmin = false) => {
    try {
        const request = new sql.Request();
        request.input('id', sql.Int, id);
        
        let query = `DELETE FROM AgentRatings WHERE id = @id`;
        
        // Nếu không phải admin, chỉ được xóa đánh giá của mình
        if (!isAdmin) {
            query += ` AND user_id = @userId`;
            request.input('userId', sql.Int, userId);
        }
        
        const result = await request.query(query);
        return result.rowsAffected[0] > 0;
    } catch (error) {
        console.error('Lỗi deleteAgentRating:', error);
        throw error;
    }
};

/**
 * Lấy thống kê đánh giá của một môi giới
 * @param {number} agentId - ID của môi giới
 * @returns {Promise<Object>} Thống kê đánh giá
 */
const getAgentRatingStats = async (agentId) => {
    try {
        const request = new sql.Request();
        request.input('agentId', sql.Int, agentId);
        
        const result = await request.query(`
            SELECT 
                COUNT(*) AS total_ratings,
                AVG(rating) AS average_rating,
                COUNT(CASE WHEN rating = 5 THEN 1 END) AS five_star,
                COUNT(CASE WHEN rating = 4 THEN 1 END) AS four_star,
                COUNT(CASE WHEN rating = 3 THEN 1 END) AS three_star,
                COUNT(CASE WHEN rating = 2 THEN 1 END) AS two_star,
                COUNT(CASE WHEN rating = 1 THEN 1 END) AS one_star
            FROM AgentRatings
            WHERE agent_id = @agentId
        `);
        
        return result.recordset[0];
    } catch (error) {
        console.error('Lỗi getAgentRatingStats:', error);
        throw error;
    }
};

/**
 * Báo cáo đánh giá không phù hợp
 * @param {number} id - ID của đánh giá
 * @returns {Promise<boolean>} Kết quả báo cáo
 */
const reportAgentRating = async (id) => {
    try {
        const request = new sql.Request();
        request.input('id', sql.Int, id);
        
        const result = await request.query(`
            UPDATE AgentRatings
            SET is_reported = 1
            WHERE id = @id;
            
            SELECT @@ROWCOUNT AS affectedRows;
        `);
        
        return result.recordset[0].affectedRows > 0;
    } catch (error) {
        console.error('Lỗi reportAgentRating:', error);
        throw error;
    }
};

module.exports = {
    getAgentRatings,
    getAgentRatingById,
    createAgentRating,
    updateAgentRating,
    deleteAgentRating,
    getAgentRatingStats,
    reportAgentRating
}; 