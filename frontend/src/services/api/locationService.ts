import axios from 'axios';

const API_URL = '/api';

// Lấy danh sách tỉnh/thành phố
export const getCities = async () => {
  try {
    const response = await axios.get(`${API_URL}/locations/cities`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    }
    return { success: false, message: error.message };
  }
};

// Lấy danh sách quận/huyện theo tỉnh/thành phố
export const getDistrictsByCity = async (city: string) => {
  try {
    const response = await axios.get(`${API_URL}/locations/districts/${encodeURIComponent(city)}`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    }
    return { success: false, message: error.message };
  }
};

// Lấy danh sách phường/xã theo quận/huyện
export const getWardsByDistrict = async (district: string) => {
  try {
    const response = await axios.get(`${API_URL}/locations/wards/${encodeURIComponent(district)}`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    }
    return { success: false, message: error.message };
  }
};

// Tìm kiếm địa điểm
export const searchLocations = async (keyword: string) => {
  try {
    const response = await axios.get(`${API_URL}/locations/search`, {
      params: { keyword }
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    }
    return { success: false, message: error.message };
  }
};

// Lấy thông tin địa điểm theo tọa độ
export const getLocationByCoordinates = async (latitude: number, longitude: number) => {
  try {
    const response = await axios.get(`${API_URL}/locations/coordinates`, {
      params: { latitude, longitude }
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    }
    return { success: false, message: error.message };
  }
};

export default {
  getCities,
  getDistrictsByCity,
  getWardsByDistrict,
  searchLocations,
  getLocationByCoordinates
}; 