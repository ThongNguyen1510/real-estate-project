import axios from 'axios';
import { getAccessToken } from './authUtils';

const API_URL = '/api';

// Lấy danh sách bất động sản của người dùng
const getProperties = async (page = 1, limit = 10) => {
  try {
    const response = await axios.get(`${API_URL}/auth/properties`, {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`
      },
      params: { page, limit }
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    }
    return { success: false, message: error.message };
  }
};

// Xóa một bất động sản
const deleteProperty = async (propertyId: number) => {
  try {
    const response = await axios.delete(`${API_URL}/properties/${propertyId}`, {
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

// Lấy thông tin chi tiết một bất động sản để chỉnh sửa
const getPropertyForEdit = async (propertyId: number) => {
  try {
    const response = await axios.get(`${API_URL}/properties/${propertyId}/edit`, {
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

// Cập nhật thông tin bất động sản
const updateProperty = async (propertyId: number, data: any) => {
  try {
    const response = await axios.put(`${API_URL}/properties/${propertyId}`, data, {
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

// Lấy danh sách các bất động sản yêu thích
const getFavorites = async (page?: number, limit?: number) => {
  try {
    const params: Record<string, any> = {};
    if (page) params.page = page;
    if (limit) params.limit = limit;

    const response = await axios.get(`${API_URL}/users/favorites`, {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`
      },
      params
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    }
    return { success: false, message: error.message };
  }
};

// Thêm bất động sản vào yêu thích
const addToFavorites = async (propertyId: number) => {
  try {
    const response = await axios.post(`${API_URL}/properties/${propertyId}/favorite`, null, {
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

// Xóa bất động sản khỏi danh sách yêu thích
const removeFromFavorites = async (propertyId: number) => {
  try {
    const response = await axios.delete(`${API_URL}/properties/${propertyId}/favorite`, {
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

// Lấy thông tin người dùng
const getUserProfile = async () => {
  try {
    const response = await axios.get(`${API_URL}/auth/profile`, {
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

// Cập nhật thông tin người dùng
const updateProfile = async (data: any) => {
  try {
    const response = await axios.put(`${API_URL}/auth/profile`, data, {
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

// Thay đổi mật khẩu
const changePassword = async (data: { current_password: string, new_password: string }) => {
  try {
    const response = await axios.put(`${API_URL}/auth/password`, data, {
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

// Lấy thông tin người dùng theo ID
const getUserInfo = async (userId: number) => {
  try {
    const response = await axios.get(`${API_URL}/users/${userId}`, {
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

// Get user profile
const getProfile = async () => {
  try {
    const response = await axios.get(`${API_URL}/users/profile`, {
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

// Update user avatar
const updateAvatar = async (formData: FormData) => {
  try {
    const response = await axios.post(`${API_URL}/users/avatar`, formData, {
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

// Get user by ID
const getUserById = async (id: number) => {
  try {
    const response = await axios.get(`${API_URL}/users/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    }
    return { success: false, message: error.message };
  }
};

// Đếm số lượng tin đăng của người dùng
const getUserPropertyCount = async () => {
  try {
    const response = await axios.get(`${API_URL}/users/property-count`, {
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

// Đếm số lượng tin yêu thích của người dùng
const getUserFavoriteCount = async () => {
  try {
    const response = await axios.get(`${API_URL}/users/favorite-count`, {
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
  deleteProperty,
  getPropertyForEdit,
  updateProperty,
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  getUserProfile,
  updateProfile,
  changePassword,
  getUserInfo,
  getProfile,
  updateAvatar,
  getUserById,
  getUserPropertyCount,
  getUserFavoriteCount
}; 