const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  getPropertyReviews,
  addReview,
  deleteReview
} = require('../controllers/reviewController');

// Lấy đánh giá của một bất động sản
router.get('/property/:propertyId/reviews', getPropertyReviews);

// Thêm đánh giá mới (yêu cầu đăng nhập)
router.post('/property/:propertyId/reviews', auth, addReview);

// Xóa đánh giá (yêu cầu đăng nhập)
router.delete('/property/reviews/:reviewId', auth, deleteReview);

module.exports = router; 