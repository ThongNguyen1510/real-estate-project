const express = require('express');
const router = express.Router();
const {
  authenticateToken,
  getProperties,
  getPropertyById,
  addProperty,
  updateProperty,
  deleteProperty,
  searchProperties,
  addToFavorites,
  removeFromFavorites,
  getFavoriteProperties,
  createProperty
} = require('../controllers/propertyController');

// Public routes
router.get('/', getProperties);
router.get('/search', searchProperties);

// Favorite routes (đặt trước route /:id)
router.get('/favorites', authenticateToken, getFavoriteProperties);
router.post('/favorites/:id', authenticateToken, addToFavorites);
router.delete('/favorites/:id', authenticateToken, removeFromFavorites);

// Property detail route
router.get('/:id', getPropertyById);

// Protected routes
router.post('/', authenticateToken, addProperty);
router.post('/create', authenticateToken, createProperty);
router.put('/:id', authenticateToken, updateProperty);
router.delete('/:id', authenticateToken, deleteProperty);

module.exports = router;
