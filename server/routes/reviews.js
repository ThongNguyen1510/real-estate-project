const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// Define routes for reviews
router.post('/reviews', reviewController.createReview);
router.get('/reviews/:id', reviewController.getReview);
router.put('/reviews/:id', reviewController.updateReview);
router.delete('/reviews/:id', reviewController.deleteReview);

module.exports = router;
