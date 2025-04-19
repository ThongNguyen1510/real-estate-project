const agentRatingModel = require('../models/agentRatingModel');
const userModel = require('../models/userModel'); // Để kiểm tra role

/**
 * Lấy danh sách đánh giá của một môi giới
 */
const getAgentRatings = async (req, res) => {
    try {
        const agentId = parseInt(req.params.agentId);
        
        // Kiểm tra xem agent_id có hợp lệ không
        if (isNaN(agentId)) {
            return res.status(400).json({ message: 'ID môi giới không hợp lệ' });
        }
        
        // Lấy thông tin agent để kiểm tra có phải là môi giới không
        const agent = await userModel.getUserById(agentId);
        if (!agent || agent.role !== 'agent') {
            return res.status(404).json({ message: 'Không tìm thấy môi giới' });
        }
        
        // Tham số phân trang
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        
        // Lấy danh sách đánh giá
        const ratings = await agentRatingModel.getAgentRatings({
            agent_id: agentId,
            page,
            limit
        });
        
        // Lấy thống kê đánh giá
        const stats = await agentRatingModel.getAgentRatingStats(agentId);
        
        res.json({
            ratings,
            stats,
            meta: {
                page,
                limit,
                agent: {
                    id: agent.id,
                    name: agent.name
                }
            }
        });
    } catch (error) {
        console.error('Lỗi getAgentRatings controller:', error);
        res.status(500).json({ message: 'Lỗi server: ' + error.message });
    }
};

/**
 * Lấy chi tiết một đánh giá
 */
const getAgentRatingDetail = async (req, res) => {
    try {
        const ratingId = parseInt(req.params.id);
        
        if (isNaN(ratingId)) {
            return res.status(400).json({ message: 'ID đánh giá không hợp lệ' });
        }
        
        const rating = await agentRatingModel.getAgentRatingById(ratingId);
        
        if (!rating) {
            return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
        }
        
        res.json(rating);
    } catch (error) {
        console.error('Lỗi getAgentRatingDetail controller:', error);
        res.status(500).json({ message: 'Lỗi server: ' + error.message });
    }
};

/**
 * Tạo đánh giá mới cho môi giới
 */
const createAgentRating = async (req, res) => {
    try {
        const userId = req.user.id;
        const { agent_id, rating, comment, transaction_id } = req.body;
        
        // Validate dữ liệu
        if (!agent_id || !rating) {
            return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
        }
        
        if (isNaN(parseFloat(rating)) || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Đánh giá phải từ 1 đến 5' });
        }
        
        // Kiểm tra xem agent có tồn tại và có phải môi giới không
        const agent = await userModel.getUserById(agent_id);
        if (!agent || agent.role !== 'agent') {
            return res.status(404).json({ message: 'Không tìm thấy môi giới' });
        }
        
        // Không thể tự đánh giá chính mình
        if (userId === agent_id) {
            return res.status(400).json({ message: 'Không thể đánh giá chính mình' });
        }
        
        // Tạo đánh giá mới
        const ratingData = {
            user_id: userId,
            agent_id,
            rating: parseFloat(rating),
            comment,
            transaction_id: transaction_id || null
        };
        
        const newRatingId = await agentRatingModel.createAgentRating(ratingData);
        
        // Lấy thông tin chi tiết đánh giá vừa tạo
        const newRating = await agentRatingModel.getAgentRatingById(newRatingId);
        
        res.status(201).json({
            message: 'Đã tạo đánh giá thành công',
            rating: newRating
        });
    } catch (error) {
        console.error('Lỗi createAgentRating controller:', error);
        
        if (error.code === 'DUPLICATE_RATING') {
            return res.status(400).json({ message: error.message });
        }
        
        res.status(500).json({ message: 'Lỗi server: ' + error.message });
    }
};

/**
 * Cập nhật đánh giá
 */
const updateAgentRating = async (req, res) => {
    try {
        const userId = req.user.id;
        const ratingId = parseInt(req.params.id);
        const { rating, comment } = req.body;
        
        if (isNaN(ratingId)) {
            return res.status(400).json({ message: 'ID đánh giá không hợp lệ' });
        }
        
        // Validate dữ liệu
        if (!rating) {
            return res.status(400).json({ message: 'Thiếu thông tin đánh giá' });
        }
        
        if (isNaN(parseFloat(rating)) || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Đánh giá phải từ 1 đến 5' });
        }
        
        // Kiểm tra xem đánh giá có tồn tại không
        const existingRating = await agentRatingModel.getAgentRatingById(ratingId);
        if (!existingRating) {
            return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
        }
        
        // Kiểm tra xem người dùng có quyền cập nhật không
        if (existingRating.user_id !== userId) {
            return res.status(403).json({ message: 'Bạn không có quyền cập nhật đánh giá này' });
        }
        
        // Cập nhật đánh giá
        const ratingData = {
            rating: parseFloat(rating),
            comment
        };
        
        const success = await agentRatingModel.updateAgentRating(ratingId, ratingData, userId);
        
        if (!success) {
            return res.status(400).json({ message: 'Cập nhật đánh giá thất bại' });
        }
        
        // Lấy thông tin chi tiết đánh giá đã cập nhật
        const updatedRating = await agentRatingModel.getAgentRatingById(ratingId);
        
        res.json({
            message: 'Đã cập nhật đánh giá thành công',
            rating: updatedRating
        });
    } catch (error) {
        console.error('Lỗi updateAgentRating controller:', error);
        res.status(500).json({ message: 'Lỗi server: ' + error.message });
    }
};

/**
 * Xóa đánh giá
 */
const deleteAgentRating = async (req, res) => {
    try {
        const userId = req.user.id;
        const isAdmin = req.user.role === 'admin';
        const ratingId = parseInt(req.params.id);
        
        if (isNaN(ratingId)) {
            return res.status(400).json({ message: 'ID đánh giá không hợp lệ' });
        }
        
        // Kiểm tra xem đánh giá có tồn tại không
        const existingRating = await agentRatingModel.getAgentRatingById(ratingId);
        if (!existingRating) {
            return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
        }
        
        // Nếu không phải admin và không phải chủ đánh giá
        if (!isAdmin && existingRating.user_id !== userId) {
            return res.status(403).json({ message: 'Bạn không có quyền xóa đánh giá này' });
        }
        
        // Xóa đánh giá
        const success = await agentRatingModel.deleteAgentRating(ratingId, userId, isAdmin);
        
        if (!success) {
            return res.status(400).json({ message: 'Xóa đánh giá thất bại' });
        }
        
        res.json({ message: 'Đã xóa đánh giá thành công' });
    } catch (error) {
        console.error('Lỗi deleteAgentRating controller:', error);
        res.status(500).json({ message: 'Lỗi server: ' + error.message });
    }
};

/**
 * Báo cáo đánh giá không phù hợp
 */
const reportAgentRating = async (req, res) => {
    try {
        const ratingId = parseInt(req.params.id);
        
        if (isNaN(ratingId)) {
            return res.status(400).json({ message: 'ID đánh giá không hợp lệ' });
        }
        
        // Kiểm tra xem đánh giá có tồn tại không
        const existingRating = await agentRatingModel.getAgentRatingById(ratingId);
        if (!existingRating) {
            return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
        }
        
        // Báo cáo đánh giá
        const success = await agentRatingModel.reportAgentRating(ratingId);
        
        if (!success) {
            return res.status(400).json({ message: 'Báo cáo đánh giá thất bại' });
        }
        
        res.json({ message: 'Đã báo cáo đánh giá thành công' });
    } catch (error) {
        console.error('Lỗi reportAgentRating controller:', error);
        res.status(500).json({ message: 'Lỗi server: ' + error.message });
    }
};

/**
 * Lấy thống kê đánh giá của một môi giới
 */
const getAgentRatingStats = async (req, res) => {
    try {
        const agentId = parseInt(req.params.agentId);
        
        if (isNaN(agentId)) {
            return res.status(400).json({ message: 'ID môi giới không hợp lệ' });
        }
        
        // Kiểm tra xem agent có tồn tại và có phải môi giới không
        const agent = await userModel.getUserById(agentId);
        if (!agent || agent.role !== 'agent') {
            return res.status(404).json({ message: 'Không tìm thấy môi giới' });
        }
        
        // Lấy thống kê đánh giá
        const stats = await agentRatingModel.getAgentRatingStats(agentId);
        
        res.json({
            agent: {
                id: agent.id,
                name: agent.name
            },
            stats
        });
    } catch (error) {
        console.error('Lỗi getAgentRatingStats controller:', error);
        res.status(500).json({ message: 'Lỗi server: ' + error.message });
    }
};

/**
 * Lấy danh sách đánh giá từ người dùng hiện tại
 */
const getMyAgentRatings = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Tham số phân trang
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        
        // Lấy danh sách đánh giá
        const ratings = await agentRatingModel.getAgentRatings({
            user_id: userId,
            page,
            limit
        });
        
        res.json({
            ratings,
            meta: {
                page,
                limit
            }
        });
    } catch (error) {
        console.error('Lỗi getMyAgentRatings controller:', error);
        res.status(500).json({ message: 'Lỗi server: ' + error.message });
    }
};

module.exports = {
    getAgentRatings,
    getAgentRatingDetail,
    createAgentRating,
    updateAgentRating,
    deleteAgentRating,
    reportAgentRating,
    getAgentRatingStats,
    getMyAgentRatings
}; 