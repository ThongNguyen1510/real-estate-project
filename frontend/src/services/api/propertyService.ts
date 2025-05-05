import axios from 'axios';
import { getAccessToken } from './authUtils';

const API_URL = '/api';

// Lấy danh sách bất động sản
export const getProperties = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/properties`, { params });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    }
    return { success: false, message: error.message };
  }
};

// Lấy chi tiết bất động sản
export const getProperty = async (id: string | number) => {
  try {
    const response = await axios.get(`${API_URL}/properties/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    }
    return { success: false, message: error.message };
  }
};

// Thêm bất động sản mới
export const createProperty = async (data: any) => {
  try {
    const response = await axios.post(`${API_URL}/properties/create`, data, {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`
      }
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    }
    return { success: false, message: error.message };
  }
};

// Cập nhật bất động sản
export const updateProperty = async (id: string | number, data: any) => {
  try {
    const response = await axios.put(`${API_URL}/properties/${id}`, data, {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`
      }
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    }
    return { success: false, message: error.message };
  }
};

// Xóa bất động sản
export const deleteProperty = async (id: string | number) => {
  try {
    const response = await axios.delete(`${API_URL}/properties/${id}`, {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`
      }
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    }
    return { success: false, message: error.message };
  }
};

// Tìm kiếm bất động sản
export const searchProperties = async (params = {}) => {
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

// Upload images for a property
export const uploadImages = async (propertyId: string, formData: FormData) => {
  try {
    const response = await axios.post(`${API_URL}/images/property/${propertyId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${getAccessToken()}`
      }
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    }
    return { success: false, message: error.message };
  }
};

// Thêm/xóa bất động sản vào/khỏi yêu thích
export const toggleFavorite = async (id: string | number) => {
  try {
    const response = await axios.post(`${API_URL}/properties/${id}/favorite`, null, {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`
      }
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
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  searchProperties,
  uploadImages,
  toggleFavorite
}; 