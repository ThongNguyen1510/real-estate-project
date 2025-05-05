import axios from 'axios';
import { getAccessToken, setAccessToken, removeAccessToken } from './authUtils';

const API_URL = '/api';

// Interface cho user login
interface LoginCredentials {
  username: string;
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

// Đăng nhập
export const login = async (credentials: LoginCredentials) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    
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
    if (error.response) {
      return error.response.data;
    }
    return { success: false, message: error.message };
  }
};

// Đăng xuất
export const logout = () => {
  removeAccessToken();
  return { success: true };
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

export default {
  login,
  register,
  logout,
  checkAuthStatus
}; 