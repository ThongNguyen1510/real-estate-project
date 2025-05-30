import axios from 'axios';
import { getAccessToken, setAccessToken, removeAccessToken } from './authUtils';

const API_URL = '/api';

// Interface cho user login
interface LoginCredentials {
  identifier: string;  // Có thể là số điện thoại hoặc email
  password: string;
}

// Interface cho user registration
interface RegisterData {
  username: string;
  name: string;
  email: string;
  password: string;
  phone: string;
}

// Interface cho user profile
interface User {
  id: number;
  username?: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  avatar?: string;
  avatar_url?: string;
}

// Đăng nhập
export const login = async (identifier: string, password: string) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, { 
      username: identifier, // Vẫn gửi là username do backend chưa được cập nhật
      password 
    });
    
    if (response.data.success && response.data.data.token) {
      setAccessToken(response.data.data.token);
    }
    
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    }
    return { success: false, message: error.message };
  }
};

// Đăng ký
export const register = async (data: RegisterData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, data);
    
    if (response.data.success && response.data.data.token) {
      setAccessToken(response.data.data.token);
    }
    
    return response.data;
  } catch (error: any) {
    console.log('Registration error:', error.response?.data || error.message);
    
    // Return the error response directly instead of wrapping it
    if (error.response && error.response.data) {
      return error.response.data;
    }
    
    // Only if there's no error.response.data, create our own error structure
    return { success: false, message: error.message || 'Đăng ký thất bại, vui lòng thử lại sau' };
  }
};

// Đăng xuất
export const logout = () => {
  removeAccessToken();
  return { success: true };
};

// Lấy thông tin người dùng từ server
export const getProfile = async () => {
  try {
    const token = getAccessToken();
    
    if (!token) {
      return { success: false, message: 'Chưa đăng nhập' };
    }
    
    const response = await axios.get(`${API_URL}/auth/profile`, {
      headers: {
        Authorization: `Bearer ${token}`
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

// Lấy thông tin người dùng từ localStorage
export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem('user');
  if (userJson) {
    try {
      return JSON.parse(userJson);
    } catch (e) {
      console.error('Error parsing user from localStorage', e);
      return null;
    }
  }
  return null;
};

// Cập nhật thông tin người dùng
export const updateProfile = async (data: Partial<User>) => {
  try {
    const token = getAccessToken();
    
    if (!token) {
      return { success: false, message: 'Chưa đăng nhập' };
    }
    
    const response = await axios.put(`${API_URL}/auth/profile`, data, {
      headers: {
        Authorization: `Bearer ${token}`
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

// Đổi mật khẩu
export const changePassword = async (currentPassword: string, newPassword: string) => {
  try {
    const token = getAccessToken();
    
    if (!token) {
      return { success: false, message: 'Chưa đăng nhập' };
    }
    
    const response = await axios.post(`${API_URL}/auth/changePassword`, {
      current_password: currentPassword,
      new_password: newPassword
    }, {
      headers: {
        Authorization: `Bearer ${token}`
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

// Kiểm tra trạng thái đăng nhập
export const checkAuthStatus = async () => {
  try {
    const token = getAccessToken();
    
    if (!token) {
      return { success: false, message: 'Chưa đăng nhập' };
    }
    
    const response = await axios.get(`${API_URL}/auth/profile`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 401) {
      removeAccessToken();
    }
    return { success: false, message: 'Token không hợp lệ hoặc đã hết hạn' };
  }
};

// Kiểm tra nhanh xem đã đăng nhập chưa (không gọi API)
export const checkAuth = (): boolean => {
  return !!getAccessToken();
};

export default {
  login,
  register,
  logout,
  getProfile,
  getCurrentUser,
  updateProfile,
  changePassword,
  checkAuthStatus,
  checkAuth
}; 