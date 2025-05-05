const { sql } = require('../config/database');

/**
 * Lấy danh sách bất động sản yêu thích của người dùng
 * @param {number} userId - ID của người dùng
 * @param {Object} options - Các tùy chọn phân trang và lọc
 * @returns {Promise<Object>} - Danh sách bất động sản yêu thích và thông tin phân trang
 */
async function getUserFavorites(userId, options = {}) {
    try {
        const page = options.page || 1;
        const limit = options.limit || 10;
        const offset = (page - 1) * limit;

        // Tạo đối tượng request
        const request = new sql.Request();
        
        // Thêm tham số 
        request.input('userId', sql.Int, userId);
        request.input('offset', sql.Int, offset);
        request.input('limit', sql.Int, limit);

        // Lấy tổng số bản ghi để phân trang
        const countQuery = `
            SELECT COUNT(*) as total
            FROM Favorites f
            WHERE f.user_id = @userId
        `;
        
        const countResult = await request.query(countQuery);
        const total = countResult.recordset[0].total;
        const totalPages = Math.ceil(total / limit);

        // Lấy dữ liệu bất động sản yêu thích
        const query = `
            SELECT 
                p.*,
                l.address, l.city, l.district, l.ward, l.street, l.latitude, l.longitude,
                u.name as owner_name,
                (
                    SELECT STRING_AGG(image_url, ',')
                    FROM PropertyImages pi
                    WHERE pi.property_id = p.id
                ) as images,
                (
                    SELECT COUNT(*) 
                    FROM Favorites f2 
                    WHERE f2.property_id = p.id
                ) as favorite_count,
                (
                    SELECT AVG(CAST(rating as FLOAT))
                    FROM Reviews r
                    WHERE r.property_id = p.id
                ) as average_rating,
                f.created_at as favorited_at
            FROM Favorites f
            JOIN Properties p ON f.property_id = p.id
            LEFT JOIN Locations l ON p.location_id = l.id
            LEFT JOIN Users u ON p.owner_id = u.id
            WHERE f.user_id = @userId
            ORDER BY f.created_at DESC
            OFFSET @offset ROWS
            FETCH NEXT @limit ROWS ONLY
        `;

        const result = await request.query(query);

        return {
            properties: result.recordset.map(property => ({
                ...property,
                images: property.images ? property.images.split(',') : [],
                average_rating: property.average_rating || 0,
                favorite_count: property.favorite_count || 0
            })),
            pagination: {
                total,
                totalPages,
                currentPage: page,
                limit
            }
        };
    } catch (error) {
        console.error('Lỗi getUserFavorites:', error);
        throw error;
    }
}

/**
 * Thêm bất động sản vào danh sách yêu thích
 * @param {number} userId - ID của người dùng
 * @param {number} propertyId - ID của bất động sản
 * @returns {Promise<boolean>} - Trả về true nếu thành công
 */
async function addToFavorites(userId, propertyId) {
    try {
        const request = new sql.Request();
        request.input('userId', sql.Int, userId);
        request.input('propertyId', sql.Int, propertyId);

        // Kiểm tra xem bất động sản có tồn tại không
        const propertyCheck = await request.query(`
            SELECT id FROM Properties WHERE id = @propertyId
        `);

        if (propertyCheck.recordset.length === 0) {
            throw new Error('Không tìm thấy bất động sản');
        }

        // Kiểm tra xem đã thêm vào yêu thích chưa
        const favoriteCheck = await request.query(`
            SELECT id FROM Favorites 
            WHERE property_id = @propertyId AND user_id = @userId
        `);

        if (favoriteCheck.recordset.length > 0) {
            throw new Error('Bất động sản đã có trong danh sách yêu thích');
        }

        // Thêm vào danh sách yêu thích
        await request.query(`
            INSERT INTO Favorites (property_id, user_id, created_at)
            VALUES (@propertyId, @userId, GETDATE())
        `);

        return true;
    } catch (error) {
        console.error('Lỗi addToFavorites:', error);
        throw error;
    }
}

/**
 * Xóa bất động sản khỏi danh sách yêu thích
 * @param {number} userId - ID của người dùng
 * @param {number} propertyId - ID của bất động sản
 * @returns {Promise<boolean>} - Trả về true nếu xóa thành công
 */
async function removeFromFavorites(userId, propertyId) {
    try {
        const request = new sql.Request();
        request.input('userId', sql.Int, userId);
        request.input('propertyId', sql.Int, propertyId);

        // Xóa khỏi danh sách yêu thích
        const result = await request.query(`
            DELETE FROM Favorites
            WHERE user_id = @userId AND property_id = @propertyId
        `);

        return result.rowsAffected[0] > 0;
    } catch (error) {
        console.error('Lỗi removeFromFavorites:', error);
        throw error;
    }
}

/**
 * Kiểm tra xem một bất động sản có nằm trong danh sách yêu thích của người dùng không
 * @param {number} userId - ID của người dùng
 * @param {number} propertyId - ID của bất động sản
 * @returns {Promise<boolean>} - Trả về true nếu bất động sản đã được yêu thích
 */
async function isFavorite(userId, propertyId) {
    try {
        const request = new sql.Request();
        request.input('userId', sql.Int, userId);
        request.input('propertyId', sql.Int, propertyId);

        const result = await request.query(`
            SELECT 1 FROM Favorites 
            WHERE user_id = @userId AND property_id = @propertyId
        `);

        return result.recordset.length > 0;
    } catch (error) {
        console.error('Lỗi isFavorite:', error);
        throw error;
    }
}

/**
 * Lấy số lượng người dùng đã yêu thích một bất động sản
 * @param {number} propertyId - ID của bất động sản
 * @returns {Promise<number>} - Số lượng người dùng đã yêu thích
 */
async function getFavoriteCount(propertyId) {
    try {
        const request = new sql.Request();
        request.input('propertyId', sql.Int, propertyId);

        const result = await request.query(`
            SELECT COUNT(*) as count 
            FROM Favorites 
            WHERE property_id = @propertyId
        `);

        return result.recordset[0].count;
    } catch (error) {
        console.error('Lỗi getFavoriteCount:', error);
        throw error;
    }
}

module.exports = {
    getUserFavorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    getFavoriteCount
}; 