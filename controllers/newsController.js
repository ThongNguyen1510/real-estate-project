const {
    getNews,
    getNewsById,
    getCategories,
    getRelatedNews,
    createNews,
    updateNews,
    deleteNews
} = require('../models/newsModel');

// Lấy danh sách tin tức
const listNews = async (req, res) => {
    try {
        const { page = 1, limit = 10, category = '', search = '' } = req.query;
        const result = await getNews(parseInt(page), parseInt(limit), category, search);
        
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Lỗi list news:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

// Lấy chi tiết tin tức
const getNewsDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const news = await getNewsById(id);
        
        if (!news) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tin tức'
            });
        }

        // Lấy tin tức liên quan
        const relatedNews = await getRelatedNews(id);
        
        res.json({
            success: true,
            data: {
                ...news,
                related_news: relatedNews
            }
        });
    } catch (error) {
        console.error('Lỗi get news detail:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

// Lấy danh mục tin tức
const listCategories = async (req, res) => {
    try {
        const categories = await getCategories();
        
        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Lỗi list categories:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

// Tạo tin tức mới
const createNewsItem = async (req, res) => {
    try {
        const { title, content, category_id, image_url, summary } = req.body;
        
        if (!title || !content || !category_id) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng điền đầy đủ thông tin'
            });
        }

        const newsData = {
            title,
            content,
            category_id,
            author_id: req.user.id,
            image_url,
            summary
        };

        const newsId = await createNews(newsData);
        
        res.status(201).json({
            success: true,
            message: 'Đã tạo tin tức thành công',
            data: { id: newsId }
        });
    } catch (error) {
        console.error('Lỗi create news:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

// Cập nhật tin tức
const updateNewsItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, category_id, image_url, summary } = req.body;
        
        if (!title || !content || !category_id) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng điền đầy đủ thông tin'
            });
        }

        const newsData = {
            title,
            content,
            category_id,
            image_url,
            summary
        };

        const updated = await updateNews(id, newsData);
        
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tin tức'
            });
        }

        res.json({
            success: true,
            message: 'Đã cập nhật tin tức thành công'
        });
    } catch (error) {
        console.error('Lỗi update news:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

// Xóa tin tức
const deleteNewsItem = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await deleteNews(id);
        
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tin tức'
            });
        }

        res.json({
            success: true,
            message: 'Đã xóa tin tức thành công'
        });
    } catch (error) {
        console.error('Lỗi delete news:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

module.exports = {
    listNews,
    getNewsDetail,
    listCategories,
    createNewsItem,
    updateNewsItem,
    deleteNewsItem
}; 