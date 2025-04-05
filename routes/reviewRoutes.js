const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../controllers/propertyController');
const {
  addReview,
  getPropertyReviews,
  deleteReview
} = require('../controllers/reviewController');

// Reviews routes
router.get('/property/:propertyId/reviews', getPropertyReviews);
router.post('/property/:propertyId/reviews', authenticateToken, addReview);
router.delete('/property/reviews/:reviewId', authenticateToken, deleteReview);

module.exports = router; 