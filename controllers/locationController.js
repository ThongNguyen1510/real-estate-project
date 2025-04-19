const {
    getCities,
    getDistricts,
    getWards,
    searchLocations,
    getLocationDetail
} = require('../models/locationModel');

// Lấy danh sách thành phố
const listCities = async (req, res) => {
    try {
        const cities = await getCities();
        
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
        const districts = await getDistricts(city);
        
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
        const wards = await getWards(district);
        
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

module.exports = {
    listCities,
    listDistricts,
    listWards,
    searchLocation,
    getLocation
}; 