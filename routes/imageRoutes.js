const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../controllers/propertyController');
const {
  uploadImages,
  getPropertyImages,
  deleteImage,
  setPrimaryImage
} = require('../controllers/imageController');

// Get all images of a property
router.get('/property/:property_id', getPropertyImages);

// Upload images for a property (protected)
router.post('/property/:property_id', authenticateToken, uploadImages);

// Delete an image (protected)
router.delete('/property/:property_id/:image_id', authenticateToken, deleteImage);

// Set primary image (protected)
router.put('/property/:property_id/:image_id/primary', authenticateToken, setPrimaryImage);

module.exports = router; 