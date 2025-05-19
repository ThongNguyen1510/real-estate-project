const express = require('express');
const router = express.Router();
const { sql } = require('../config/database');
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
  createProperty,
  reportProperty,
  renewProperty
} = require('../controllers/propertyController');

// Public routes
router.get('/', getProperties);
router.get('/search', searchProperties);

// Favorite routes (đặt trước route /:id)
router.get('/favorites', authenticateToken, getFavoriteProperties);
router.post('/favorites/:id', authenticateToken, addToFavorites);
router.delete('/favorites/:id', authenticateToken, removeFromFavorites);

// Toggle favorite (thêm mới)
router.post('/:id/favorite', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  try {
    // Kiểm tra xem đã thêm vào favorite chưa
    const request = new sql.Request();
    request.input('userId', sql.Int, userId);
    request.input('propertyId', sql.Int, id);
    
    const favoriteCheck = await request.query(`
      SELECT id FROM Favorites 
      WHERE property_id = @propertyId AND user_id = @userId
    `);
    
    if (favoriteCheck.recordset.length > 0) {
      // Nếu đã yêu thích, xóa khỏi danh sách yêu thích
      await request.query(`
        DELETE FROM Favorites
        WHERE property_id = @propertyId AND user_id = @userId
      `);
      
      return res.json({
        success: true,
        message: 'Đã xóa khỏi danh sách yêu thích',
        action: 'removed'
      });
    } else {
      // Nếu chưa yêu thích, thêm vào danh sách yêu thích
      await request.query(`
        INSERT INTO Favorites (property_id, user_id, created_at)
        VALUES (@propertyId, @userId, GETDATE())
      `);
      
      return res.json({
        success: true,
        message: 'Đã thêm vào danh sách yêu thích',
        action: 'added'
      });
    }
  } catch (error) {
    console.error('Lỗi khi toggle favorite:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
});

// Property detail route
router.get('/:id', getPropertyById);

// Protected routes
router.post('/', authenticateToken, addProperty);
router.post('/create', authenticateToken, createProperty);
router.put('/:id', authenticateToken, updateProperty);
router.delete('/:id', authenticateToken, deleteProperty);

// Report a property
router.post("/:id/report", authenticateToken, reportProperty);

// Renew an expired property
router.post("/:id/renew", authenticateToken, renewProperty);

module.exports = router;
