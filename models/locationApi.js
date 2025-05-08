const axios = require('axios');

const API_BASE_URL = 'https://provinces.open-api.vn/api';

// Lấy danh sách tỉnh/thành phố
const getProvinces = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/`);
        return response.data.map(province => ({
            name: province.name,
            id: province.code,
            division_type: province.division_type
        }));
    } catch (error) {
        console.error('Lỗi khi lấy danh sách tỉnh/thành:', error);
        throw error;
    }
};

// Lấy danh sách quận/huyện theo tỉnh/thành
const getDistrictsByProvince = async (provinceCode) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/p/${provinceCode}?depth=2`);
        return response.data.districts.map(district => ({
            name: district.name,
            id: district.code,
            division_type: district.division_type
        }));
    } catch (error) {
        console.error('Lỗi khi lấy danh sách quận/huyện:', error);
        throw error;
    }
};

// Lấy danh sách phường/xã theo quận/huyện
const getWardsByDistrict = async (districtCode) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/d/${districtCode}?depth=2`);
        return response.data.wards.map(ward => ({
            name: ward.name,
            id: ward.code,
            division_type: ward.division_type
        }));
    } catch (error) {
        console.error('Lỗi khi lấy danh sách phường/xã:', error);
        throw error;
    }
};

// Tìm kiếm địa điểm
const searchLocations = async (keyword) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/search/?q=${encodeURIComponent(keyword)}`);
        return response.data.map(location => ({
            name: location.name,
            id: location.code,
            matches: location.matches,
            score: location.score
        }));
    } catch (error) {
        console.error('Lỗi khi tìm kiếm địa điểm:', error);
        throw error;
    }
};

module.exports = {
    getProvinces,
    getDistrictsByProvince,
    getWardsByDistrict,
    searchLocations
}; 