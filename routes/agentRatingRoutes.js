const express = require('express');
const router = express.Router();
const agentRatingController = require('../controllers/agentRatingController');
const { auth } = require('../middleware/auth');

// Lấy danh sách đánh giá của một môi giới
router.get('/agents/:agentId/ratings', agentRatingController.getAgentRatings);

// Lấy thống kê đánh giá của một môi giới
router.get('/agents/:agentId/ratings/stats', agentRatingController.getAgentRatingStats);

// Lấy chi tiết một đánh giá
router.get('/agents/ratings/:id', agentRatingController.getAgentRatingDetail);

// Lấy danh sách đánh giá từ người dùng hiện tại (yêu cầu đăng nhập)
router.get('/agent-ratings/my-ratings', auth, agentRatingController.getMyAgentRatings);

// Tạo đánh giá mới (yêu cầu đăng nhập)
router.post('/agents/ratings', auth, agentRatingController.createAgentRating);

// Cập nhật đánh giá (yêu cầu đăng nhập)
router.put('/agents/ratings/:id', auth, agentRatingController.updateAgentRating);

// Xóa đánh giá (yêu cầu đăng nhập)
router.delete('/agents/ratings/:id', auth, agentRatingController.deleteAgentRating);

// Báo cáo đánh giá không phù hợp (yêu cầu đăng nhập)
router.post('/agents/ratings/:id/report', auth, agentRatingController.reportAgentRating);

module.exports = router; 