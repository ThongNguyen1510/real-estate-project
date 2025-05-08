const express = require('express');
const router = express.Router();
const {
    listCities,
    listDistricts,
    listWards,
    searchLocation,
    getLocation,
    getLocationNamesByIds
} = require('../controllers/locationController');

// Disable caching for all location routes
router.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Expires', '-1');
    res.set('Pragma', 'no-cache');
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    next();
});

// Lấy danh sách thành phố
router.get('/cities', (req, res, next) => {
    // Thêm CORS headers cho endpoint cities
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    next();
}, listCities);

// Lấy danh sách quận/huyện theo thành phố
router.get('/districts/:city', listDistricts);

// Lấy danh sách phường/xã theo quận/huyện
router.get('/wards/:district', listWards);

// Lấy tên địa điểm theo ID
router.get('/names', getLocationNamesByIds);

// Tìm kiếm địa điểm
router.get('/search', searchLocation);

// Lấy thông tin chi tiết địa điểm
router.get('/:id', getLocation);

module.exports = router; 