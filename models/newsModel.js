const { sql, connectToDatabase } = require('../config/database');

// Lấy danh sách tin tức (có phân trang)
const getNews = async (page = 1, limit = 10, category = '', search = '') => {
    try {
        const offset = (page - 1) * limit;
        const pool = await connectToDatabase();
        
        const news = await pool.request()
            .input('offset', sql.Int, offset)
            .input('limit', sql.Int, limit)
            .input('category', sql.VarChar(50), category)
            .input('search', sql.NVarChar, search)
            .query(`
                SELECT n.*, c.name as category_name, u.name as author_name
                FROM News n
                LEFT JOIN Categories c ON n.category_id = c.id
                LEFT JOIN Users u ON n.author_id = u.id
                WHERE (@category = '' OR n.category_id = @category)
                AND (@search = '' OR 
                     n.title LIKE '%' + @search + '%' OR 
                     n.content LIKE '%' + @search + '%')
                ORDER BY n.created_at DESC
                OFFSET @offset ROWS
                FETCH NEXT @limit ROWS ONLY
            `);

        const total = await pool.request()
            .input('category', sql.VarChar(50), category)
            .input('search', sql.NVarChar, search)
            .query(`
                SELECT COUNT(*) as total
                FROM News n
                WHERE (@category = '' OR n.category_id = @category)
                AND (@search = '' OR 
                     n.title LIKE '%' + @search + '%' OR 
                     n.content LIKE '%' + @search + '%')
            `);

        return {
            news: news.recordset,
            total: total.recordset[0].total,
            page,
            limit
        };
    } catch (error) {
        console.error('Lỗi get news:', error);
        throw error;
    }
};

// Lấy chi tiết tin tức
const getNewsById = async (id) => {
    try {
        const pool = await connectToDatabase();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT n.*, c.name as category_name, u.name as author_name
                FROM News n
                LEFT JOIN Categories c ON n.category_id = c.id
                LEFT JOIN Users u ON n.author_id = u.id
                WHERE n.id = @id
            `);

        if (result.recordset.length === 0) {
            return null;
        }

        return result.recordset[0];
    } catch (error) {
        console.error('Lỗi get news by id:', error);
        throw error;
    }
};

// Lấy danh mục tin tức
const getCategories = async () => {
    try {
        const pool = await connectToDatabase();
        const result = await pool.request()
            .query('SELECT * FROM Categories ORDER BY name');

        return result.recordset;
    } catch (error) {
        console.error('Lỗi get categories:', error);
        throw error;
    }
};

// Lấy tin tức liên quan
const getRelatedNews = async (newsId, limit = 5) => {
    try {
        const pool = await connectToDatabase();
        const result = await pool.request()
            .input('newsId', sql.Int, newsId)
            .input('limit', sql.Int, limit)
            .query(`
                SELECT TOP (@limit) n.*, c.name as category_name
                FROM News n
                LEFT JOIN Categories c ON n.category_id = c.id
                WHERE n.id != @newsId
                AND n.category_id = (
                    SELECT category_id 
                    FROM News 
                    WHERE id = @newsId
                )
                ORDER BY n.created_at DESC
            `);

        return result.recordset;
    } catch (error) {
        console.error('Lỗi get related news:', error);
        throw error;
    }
};

// Tạo tin tức mới
const createNews = async (newsData) => {
    try {
        const pool = await connectToDatabase();
        const result = await pool.request()
            .input('title', sql.NVarChar, newsData.title)
            .input('content', sql.NVarChar, newsData.content)
            .input('category_id', sql.Int, newsData.category_id)
            .input('author_id', sql.Int, newsData.author_id)
            .input('image_url', sql.NVarChar, newsData.image_url)
            .input('summary', sql.NVarChar, newsData.summary)
            .query(`
                INSERT INTO News (
                    title, content, category_id, author_id, 
                    image_url, summary, created_at
                )
                OUTPUT INSERTED.id
                VALUES (
                    @title, @content, @category_id, @author_id,
                    @image_url, @summary, GETDATE()
                )
            `);

        return result.recordset[0].id;
    } catch (error) {
        console.error('Lỗi create news:', error);
        throw error;
    }
};

// Cập nhật tin tức
const updateNews = async (id, newsData) => {
    try {
        const pool = await connectToDatabase();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('title', sql.NVarChar, newsData.title)
            .input('content', sql.NVarChar, newsData.content)
            .input('category_id', sql.Int, newsData.category_id)
            .input('image_url', sql.NVarChar, newsData.image_url)
            .input('summary', sql.NVarChar, newsData.summary)
            .query(`
                UPDATE News
                SET title = @title,
                    content = @content,
                    category_id = @category_id,
                    image_url = @image_url,
                    summary = @summary,
                    updated_at = GETDATE()
                WHERE id = @id
            `);

        return result.rowsAffected[0] > 0;
    } catch (error) {
        console.error('Lỗi update news:', error);
        throw error;
    }
};

// Xóa tin tức
const deleteNews = async (id) => {
    try {
        const pool = await connectToDatabase();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM News WHERE id = @id');

        return result.rowsAffected[0] > 0;
    } catch (error) {
        console.error('Lỗi delete news:', error);
        throw error;
    }
};

// Bỏ từ khóa 'static'
async function updateResetToken(id, token) {
    try {
        const request = new sql.Request();
        request.input('id', sql.Int, id);
        request.input('token', sql.NVarChar, token);
        request.input('resetTokenExpires', sql.DateTime, new Date(Date.now() + 3600000)); // 1 giờ

        const result = await request.query(`
            UPDATE Users 
            SET reset_token = @token,
                reset_token_expires = @resetTokenExpires
            WHERE id = @id
        `);

        return result.rowsAffected[0] > 0;
    } catch (error) {
        console.error('Lỗi updateResetToken:', error);
        throw error;
    }
}

module.exports = {
    getNews,
    getNewsById,
    getCategories,
    getRelatedNews,
    createNews,
    updateNews,
    deleteNews,
    updateResetToken
}; 