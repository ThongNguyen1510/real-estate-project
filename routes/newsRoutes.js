const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const {
    listNews,
    getNewsDetail,
    listCategories,
    createNewsItem,
    updateNewsItem,
    deleteNewsItem
} = require('../controllers/newsController');

// Public routes
router.get('/', listNews);
router.get('/categories', listCategories);
router.get('/:id', getNewsDetail);

// Protected routes (require authentication)
router.use(auth);

// Admin routes (require admin role)
router.post('/', isAdmin, createNewsItem);
router.put('/:id', isAdmin, updateNewsItem);
router.delete('/:id', isAdmin, deleteNewsItem);

module.exports = router; 