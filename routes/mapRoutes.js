const express = require('express');
const router = express.Router();
const {
    geocode,
    geocodeAddress,
    getNearbyPlaces,
    getPlaceDetails,
    getTrafficInfo,
    getNearbyAmenities
} = require('../controllers/mapController');

// Lấy thông tin địa điểm từ tọa độ
router.get('/geocode', geocode);

// Lấy thông tin tọa độ từ địa chỉ
router.get('/geocode/address', geocodeAddress);

// Lấy các điểm lân cận
router.get('/nearby', getNearbyPlaces);

// Lấy ranh giới khu vực
router.get('/place-details', getPlaceDetails);

// Lấy thông tin giao thông
router.get('/traffic', getTrafficInfo);

// Lấy thông tin tiện ích xung quanh
router.get('/amenities', getNearbyAmenities);

module.exports = router; 