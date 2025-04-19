const express = require('express');
const router = express.Router();
const {
    listCities,
    listDistricts,
    listWards,
    searchLocation,
    getLocation
} = require('../controllers/locationController');

// Lấy danh sách thành phố
router.get('/cities', listCities);

// Lấy danh sách quận/huyện theo thành phố
router.get('/districts/:city', listDistricts);

// Lấy danh sách phường/xã theo quận/huyện
router.get('/wards/:district', listWards);

// Tìm kiếm địa điểm
router.get('/search', searchLocation);

// Lấy thông tin chi tiết địa điểm
router.get('/:id', getLocation);

module.exports = router; 