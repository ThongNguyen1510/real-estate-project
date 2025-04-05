const express = require('express');
const router = express.Router();
const { searchByMap, searchByArea } = require('../controllers/searchController');

// Tìm kiếm theo bản đồ
router.get('/map', searchByMap);

// Tìm kiếm theo khu vực
router.get('/area', searchByArea);

module.exports = router; 