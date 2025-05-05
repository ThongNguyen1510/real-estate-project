import axios from 'axios';

const API_URL = '/api';

// Interface cho search params
interface SearchParams {
  keyword?: string;
  property_type?: string;
  city?: string;
  district?: string;
  ward?: string;
  price_min?: number;
  price_max?: number;
  area_min?: number;
  area_max?: number;
  bedrooms?: number;
  bathrooms?: number;
  sort_by?: string;
  sort_direction?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

// Tìm kiếm bất động sản
export const searchProperties = async (params: SearchParams = {}) => {
  try {
    const response = await axios.get(`${API_URL}/properties/search`, { params });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    }
    return { success: false, message: error.message };
  }
};

// Tìm kiếm nhanh với từ khóa
export const quickSearch = async (keyword: string, limit = 5) => {
  try {
    const response = await axios.get(`${API_URL}/properties/quick-search`, { 
      params: { keyword, limit }
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    }
    return { success: false, message: error.message };
  }
};

// Lấy dữ liệu tìm kiếm phổ biến
export const getPopularSearches = async () => {
  try {
    const response = await axios.get(`${API_URL}/search/popular`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    }
    return { success: false, message: error.message };
  }
};

export default {
  searchProperties,
  quickSearch,
  getPopularSearches
}; 