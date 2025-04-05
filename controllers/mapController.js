const { client, GOOGLE_MAPS_API_KEY } = require('../config/googleMaps');

// Lấy thông tin địa điểm từ tọa độ
const geocode = async (req, res) => {
    try {
        const { lat, lng } = req.query;
        
        if (!lat || !lng) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin tọa độ'
            });
        }

        const response = await client.reverseGeocode({
            params: {
                latlng: `${lat},${lng}`,
                key: GOOGLE_MAPS_API_KEY,
                language: 'vi'
            }
        });

        res.json({
            success: true,
            data: response.data.results[0]
        });
    } catch (error) {
        console.error('Lỗi geocode:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

// Lấy thông tin tọa độ từ địa chỉ
const geocodeAddress = async (req, res) => {
    try {
        const { address } = req.query;
        
        if (!address) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu địa chỉ'
            });
        }

        const response = await client.geocode({
            params: {
                address: address,
                key: GOOGLE_MAPS_API_KEY,
                language: 'vi'
            }
        });

        res.json({
            success: true,
            data: response.data.results[0]
        });
    } catch (error) {
        console.error('Lỗi geocode address:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

// Lấy các điểm lân cận
const getNearbyPlaces = async (req, res) => {
    try {
        const { lat, lng, type, radius = 1000 } = req.query;
        
        if (!lat || !lng || !type) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin tọa độ hoặc loại địa điểm'
            });
        }

        const response = await client.placesNearby({
            params: {
                location: `${lat},${lng}`,
                radius: radius,
                type: type,
                key: GOOGLE_MAPS_API_KEY,
                language: 'vi'
            }
        });

        res.json({
            success: true,
            data: response.data.results
        });
    } catch (error) {
        console.error('Lỗi get nearby places:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

// Lấy ranh giới khu vực
const getPlaceDetails = async (req, res) => {
    try {
        const { place_id } = req.query;
        
        if (!place_id) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu place_id'
            });
        }

        const response = await client.placeDetails({
            params: {
                place_id: place_id,
                key: GOOGLE_MAPS_API_KEY,
                language: 'vi',
                fields: ['geometry', 'formatted_address', 'name', 'address_components']
            }
        });

        res.json({
            success: true,
            data: response.data.result
        });
    } catch (error) {
        console.error('Lỗi get place details:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

// Lấy thông tin giao thông
const getTrafficInfo = async (req, res) => {
    try {
        const { lat, lng, radius = 1000 } = req.query;
        
        if (!lat || !lng) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin tọa độ'
            });
        }

        const response = await client.directions({
            params: {
                origin: `${lat},${lng}`,
                destination: `${lat},${lng}`,
                mode: 'driving',
                key: GOOGLE_MAPS_API_KEY,
                language: 'vi',
                traffic_model: 'best_guess',
                departure_time: 'now'
            }
        });

        res.json({
            success: true,
            data: response.data.routes[0]
        });
    } catch (error) {
        console.error('Lỗi get traffic info:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

// Lấy thông tin tiện ích xung quanh
const getNearbyAmenities = async (req, res) => {
    try {
        const { lat, lng, radius = 1000, type } = req.query;
        
        if (!lat || !lng) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin tọa độ'
            });
        }

        const response = await client.placesNearby({
            params: {
                location: `${lat},${lng}`,
                radius: radius,
                type: type || 'point_of_interest',
                key: GOOGLE_MAPS_API_KEY,
                language: 'vi'
            }
        });

        res.json({
            success: true,
            data: response.data.results
        });
    } catch (error) {
        console.error('Lỗi get nearby amenities:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

module.exports = {
    geocode,
    geocodeAddress,
    getNearbyPlaces,
    getPlaceDetails,
    getTrafficInfo,
    getNearbyAmenities
}; 