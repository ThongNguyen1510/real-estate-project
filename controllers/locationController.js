const {
    getCities,
    getDistricts,
    getWards,
    searchLocations,
    getLocationDetail,
    getLocationNames
} = require('../models/locationModel');

// Lấy danh sách thành phố
const listCities = async (req, res) => {
    try {
        console.log('Controller: Listing cities');
        const cities = await getCities();
        console.log('Controller: Found cities:', cities.length);
        
        res.json({
            success: true,
            data: cities
        });
    } catch (error) {
        console.error('Lỗi list cities:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

// Lấy danh sách quận/huyện theo thành phố
const listDistricts = async (req, res) => {
    try {
        const { city } = req.params;
        console.log('Controller: Listing districts for city:', city);
        const districts = await getDistricts(city);
        console.log('Controller: Found districts:', districts.length);
        
        res.json({
            success: true,
            data: districts
        });
    } catch (error) {
        console.error('Lỗi list districts:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

// Lấy danh sách phường/xã theo quận/huyện
const listWards = async (req, res) => {
    try {
        const { district } = req.params;
        console.log('Controller: Listing wards for district:', district);
        const wards = await getWards(district);
        console.log('Controller: Found wards:', wards.length);
        
        res.json({
            success: true,
            data: wards
        });
    } catch (error) {
        console.error('Lỗi list wards:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

// Tìm kiếm địa điểm
const searchLocation = async (req, res) => {
    try {
        const { keyword } = req.query;
        
        if (!keyword) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập từ khóa tìm kiếm'
            });
        }

        const locations = await searchLocations(keyword);
        
        res.json({
            success: true,
            data: locations
        });
    } catch (error) {
        console.error('Lỗi search location:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

// Lấy thông tin chi tiết địa điểm
const getLocation = async (req, res) => {
    try {
        const { id } = req.params;
        const location = await getLocationDetail(id);
        
        if (!location) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy địa điểm'
            });
        }

        res.json({
            success: true,
            data: location
        });
    } catch (error) {
        console.error('Lỗi get location:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

// Lấy tên địa điểm từ ID
const getLocationNamesByIds = async (req, res) => {
    try {
        const { cityId, districtId, wardId } = req.query;
        console.log('Controller: Getting location names for IDs:', { cityId, districtId, wardId });
        
        if (!cityId && !districtId && !wardId) {
            return res.status(400).json({
                success: false,
                message: 'No location IDs provided'
            });
        }
        
        const locationNames = await getLocationNames(cityId, districtId, wardId);
        
        res.json({
            success: true,
            data: locationNames
        });
    } catch (error) {
        console.error('Error getting location names:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while getting location names'
        });
    }
};

module.exports = {
    listCities,
    listDistricts,
    listWards,
    searchLocation,
    getLocation,
    getLocationNamesByIds
}; 