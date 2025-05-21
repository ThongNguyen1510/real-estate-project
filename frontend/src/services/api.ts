import axios from 'axios';

// Base API configuration - thay đổi để sử dụng proxy
const API_URL = '';  // Để trống để sử dụng proxy

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Accept': '*/*',
    'Access-Control-Allow-Origin': '*'
  },
  timeout: 10000, // Tăng timeout lên 10 giây
  withCredentials: false // Đặt thành false để tránh gửi cookies
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle unauthorized errors
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: async (email: string, password: string) => {
    try {
      console.log('API Service: Đang gửi yêu cầu đăng nhập', { username: email });
      const response = await api.post('/api/auth/login', { username: email, password });
      console.log('API Service: Nhận phản hồi đăng nhập:', response.data);
      
      // Kiểm tra phản hồi
      if (!response.data || !response.data.success) {
        console.error('API Service: Phản hồi không thành công:', response.data);
        throw new Error(response.data?.message || 'Đăng nhập thất bại');
      }
      
      // Kiểm tra dữ liệu trong phản hồi
      if (!response.data.data || !response.data.data.token || !response.data.data.user) {
        console.error('API Service: Phản hồi thiếu dữ liệu cần thiết:', response.data);
        throw new Error('Dữ liệu phản hồi không hợp lệ');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('API Service: Lỗi đăng nhập:', error.response?.data || error.message);
      if (error.response && error.response.status === 401) {
        throw new Error('Username/Email hoặc mật khẩu không đúng');
      } else if (error.response && error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Đăng nhập thất bại. Vui lòng thử lại sau.');
      }
    }
  },
  register: async (userData: any) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },
  forgotPassword: async (email: string) => {
    const response = await api.post('/api/auth/forgot-password', { email });
    return response.data;
  },
  resetPassword: async (token: string, new_password: string) => {
    const response = await api.post('/api/auth/reset-password', { token, new_password });
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/api/users/profile');
    
    // Ensure avatar field is correctly mapped
    if (response.data && response.data.data) {
      if (response.data.data.avatar_url && !response.data.data.avatar) {
        response.data.data.avatar = response.data.data.avatar_url;
      }
    }
    
    return response.data;
  },
  updateProfile: async (profileData: any) => {
    const response = await api.put('/api/users/profile', profileData);
    return response.data;
  },
  verifyEmail: async (token: string) => {
    const response = await api.post('/api/auth/verify-email', { token });
    return response.data;
  },
  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.post('/api/users/changePassword', { current_password: currentPassword, new_password: newPassword });
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },
  checkAuth: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

// User services
export const userService = {
  // Get user details
  getUserDetails: async (userId: number) => {
    const response = await api.get(`/api/users/${userId}`);
    return response.data;
  },
  
  // Get user info by ID
  getUserInfo: async (userId: number) => {
    const response = await api.get(`/api/users/${userId}`);
    return response.data;
  },
  
  // Update user avatar
  updateAvatar: async (formData: FormData) => {
    try {
      console.log('Sending avatar update request with formData:', formData.get('avatar'));
      const response = await api.post('/api/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Avatar update response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Avatar update error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },
  
  // Get user properties (listings)
  getUserProperties: async (params: any = {}) => {
    const response = await api.get('/api/users/properties', { params });
    return response.data;
  },
  
  // Get user activity logs
  getActivityLogs: async (params: any = {}) => {
    const response = await api.get('/api/users/activities', { params });
    return response.data;
  },
  
  // Get user notifications
  getNotifications: async (params: any = {}) => {
    const response = await api.get('/api/users/notifications', { params });
    return response.data;
  },
  
  // Mark notification as read
  markNotificationAsRead: async (notificationId: number) => {
    const response = await api.put(`/api/users/notifications/${notificationId}/read`);
    return response.data;
  },
  
  // Mark all notifications as read
  markAllNotificationsAsRead: async () => {
    const response = await api.put('/api/users/notifications/read-all');
    return response.data;
  },
  
  // Delete a notification
  deleteNotification: async (notificationId: number) => {
    const response = await api.delete(`/api/users/notifications/${notificationId}`);
    return response.data;
  },
  
  // Update user settings
  updateSettings: async (settings: any) => {
    const response = await api.put('/api/users/settings', settings);
    return response.data;
  },
  
  // Get user saved searches
  getSavedSearches: async () => {
    const response = await api.get('/api/users/saved-searches');
    return response.data;
  },
  
  // Save a search
  saveSearch: async (searchParams: any) => {
    const response = await api.post('/api/users/saved-searches', searchParams);
    return response.data;
  },
  
  // Delete a saved search
  deleteSavedSearch: async (searchId: number) => {
    const response = await api.delete(`/api/users/saved-searches/${searchId}`);
    return response.data;
  },
  
  // Get user statistics (dashboard)
  getUserStats: async () => {
    const response = await api.get('/api/users/stats');
    return response.data;
  },
  
  // Add a property to user's recently viewed
  addRecentlyViewed: async (propertyId: number) => {
    const response = await api.post('/api/users/recently-viewed', { property_id: propertyId });
    return response.data;
  },
  
  // Get user's recently viewed properties
  getRecentlyViewed: async () => {
    const response = await api.get('/api/users/recently-viewed');
    return response.data;
  }
};

// Property services
export const propertyService = {
  getProperties: async (params: any) => {
    const response = await api.get('/api/properties', { params });
    return response.data;
  },
  getProperty: async (id: string) => {
    const response = await api.get(`/api/properties/${id}`);
    return response.data;
  },
  createProperty: async (propertyData: any) => {
    try {
      console.log('Sending property data:', propertyData);
      
      // Ensure location data is properly structured
      const formattedData = {
        title: propertyData.title,
        description: propertyData.description,
        price: Number(propertyData.price),
        area: Number(propertyData.area),
        property_type: propertyData.property_type,
        bedrooms: propertyData.bedrooms ? Number(propertyData.bedrooms) : null,
        bathrooms: propertyData.bathrooms ? Number(propertyData.bathrooms) : null,
        listing_type: propertyData.listing_type || 'sale',
        amenities: propertyData.amenities,
        contact_info: propertyData.contact_info,
        location: {
          address: propertyData.location.address,
          street: propertyData.location.street,
          city: propertyData.location.city,
          city_name: propertyData.location.city_name,
          district: propertyData.location.district,
          district_name: propertyData.location.district_name,
          ward: propertyData.location.ward,
          ward_name: propertyData.location.ward_name,
          latitude: Number(propertyData.location.latitude),
          longitude: Number(propertyData.location.longitude)
        },
        status: 'pending'
      };

      console.log('Formatted data being sent:', formattedData);

      // Call API to create property
      const response = await api.post('/api/properties/create', formattedData);
      console.log('Property creation response:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Lỗi khi tạo bất động sản');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Error creating property:', error);
      if (error.response && error.response.data) {
        console.error('Server error response:', error.response.data);
        throw new Error(error.response.data.message || 'Lỗi khi tạo bất động sản');
      }
      throw error;
    }
  },
  updateProperty: async (id: string, propertyData: any) => {
    const response = await api.put(`/api/properties/${id}`, propertyData);
    return response.data;
  },
  deleteProperty: async (id: string) => {
    const response = await api.delete(`/api/properties/${id}`);
    return response.data;
  },
  uploadImages: async (id: string, formData: FormData) => {
    try {
      console.log('Uploading images for property:', id);
      const response = await api.post(`/api/images/property/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total!);
          console.log(`Upload progress: ${percentCompleted}%`);
        }
      });
      
      console.log('Image upload response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error uploading images:', error);
      if (error.response && error.response.data) {
        throw new Error(error.response.data.message || 'Lỗi khi tải lên hình ảnh');
      }
      throw error;
    }
  },
  setFeaturedImage: async (propertyId: string, imageId: string) => {
    const response = await api.put(`/api/properties/${propertyId}/images/${imageId}/primary`);
    return response.data;
  },
};

// Search services
export const searchService = {
  searchProperties: async (params: any) => {
    const response = await api.get('/api/search', { params });
    return response.data;
  },
};

// Location services
export const locationService = {
  getCities: async () => {
    console.log('API: Getting cities');
    let retries = 3;
    
    while (retries > 0) {
      try {
        // Thêm timestamp để tránh cache
        const timestamp = new Date().getTime();
        // Sử dụng fetch API thay thế axios để thử
        const response = await fetch(`/api/locations/cities?_t=${timestamp}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
          }
        });
        
        if (!response.ok) {
          throw new Error(`Status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API: Cities data received:', data);
        return data;
      } catch (error) {
        console.error(`API: Error getting cities (Attempts left: ${retries})`, error);
        retries--;
        if (retries === 0) {
          console.error('API: All retry attempts failed');
          throw error;
        }
        // Đợi 1 giây trước khi thử lại
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  },
  getDistricts: async (cityId: string) => {
    console.log('API: Getting districts for city', cityId);
    try {
      // Thêm timestamp để tránh cache
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/locations/districts/${cityId}?_t=${timestamp}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        }
      });
      
      if (!response.ok) {
        throw new Error(`Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API: Districts data received:', data);
      return data;
    } catch (error) {
      console.error('API: Error getting districts', error);
      throw error;
    }
  },
  getWards: async (districtId: string) => {
    console.log('API: Getting wards for district', districtId);
    try {
      // Thêm timestamp để tránh cache
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/locations/wards/${districtId}?_t=${timestamp}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        }
      });
      
      if (!response.ok) {
        throw new Error(`Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API: Wards data received:', data);
      return data;
    } catch (error) {
      console.error('API: Error getting wards', error);
      throw error;
    }
  },
};

// Favorites services
export const favoritesService = {
  getFavorites: async () => {
    const response = await api.get('/api/favorites');
    return response.data;
  },
  addFavorite: async (propertyId: string) => {
    const response = await api.post('/api/favorites', { property_id: propertyId });
    return response.data;
  },
  removeFavorite: async (favoriteId: string) => {
    const response = await api.delete(`/api/favorites/${favoriteId}`);
    return response.data;
  },
};

// Notification services
export const notificationService = {
  // Get all notifications
  getNotifications: async (params: any = {}) => {
    try {
      console.log('API: Calling getNotifications with params:', params);
      const response = await api.get('/api/notifications', { params });
      console.log('API: getNotifications response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Error in getNotifications:', error);
      // Return a fallback response so the UI doesn't break
      return { 
        success: false, 
        message: 'Failed to fetch notifications',
        data: { notifications: [] } 
      };
    }
  },
  
  // Get unread notification count
  getUnreadCount: async () => {
    try {
      console.log('API: Calling getUnreadCount');
      const response = await api.get('/api/notifications/unread-count');
      console.log('API: getUnreadCount response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Error in getUnreadCount:', error);
      // Return a fallback response so the UI doesn't break
      return { success: false, data: { unread_count: 0 } };
    }
  },
  
  // Mark a notification as read
  markAsRead: async (notificationId: number) => {
    try {
      console.log('API: Marking notification as read:', notificationId);
      const response = await api.put(`/api/notifications/${notificationId}/read`);
      console.log('API: markAsRead response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Error in markAsRead:', error);
      return { success: false, message: 'Failed to mark notification as read' };
    }
  },
  
  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      console.log('API: Marking all notifications as read');
      const response = await api.put('/api/notifications/read-all');
      console.log('API: markAllAsRead response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Error in markAllAsRead:', error);
      return { success: false, message: 'Failed to mark all notifications as read' };
    }
  },
  
  // Delete a notification
  deleteNotification: async (notificationId: number) => {
    try {
      console.log('API: Deleting notification:', notificationId);
      const response = await api.delete(`/api/notifications/${notificationId}`);
      console.log('API: deleteNotification response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Error in deleteNotification:', error);
      return { success: false, message: 'Failed to delete notification' };
    }
  },
  
  // Get notification settings
  getSettings: async () => {
    try {
      console.log('API: Getting notification settings');
      const response = await api.get('/api/notifications/settings');
      console.log('API: getSettings response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Error in getSettings:', error);
      return { success: false, data: {} };
    }
  },
  
  // Update notification settings
  updateSettings: async (settings: any) => {
    try {
      console.log('API: Updating notification settings:', settings);
      const response = await api.put('/api/notifications/settings', settings);
      console.log('API: updateSettings response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Error in updateSettings:', error);
      return { success: false, message: 'Failed to update notification settings' };
    }
  }
};

export default api; 