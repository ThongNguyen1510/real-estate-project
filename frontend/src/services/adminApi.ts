import api from './api';

/**
 * Admin API service for dashboard, users, properties, and reports management
 */
export const adminService = {
  /**
   * Get dashboard statistics
   */
  getStats: async () => {
    try {
      const response = await api.get('/api/admin/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      throw error;
    }
  },

  /**
   * User Management
   */
  getUsers: async (page = 1, limit = 10, search = '') => {
    try {
      const response = await api.get('/api/admin/users', {
        params: { page, limit, search }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  updateUserStatus: async (userId: number, status: string) => {
    try {
      const response = await api.put(`/api/admin/users/${userId}`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  },

  deleteUser: async (userId: number) => {
    try {
      const response = await api.delete(`/api/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  /**
   * Property Management
   */
  getProperties: async (page = 1, limit = 10, search = '') => {
    try {
      const response = await api.get('/api/admin/properties', {
        params: { page, limit, search }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }
  },

  updatePropertyStatus: async (propertyId: number, status: string) => {
    try {
      const response = await api.put(`/api/admin/properties/${propertyId}`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating property status:', error);
      throw error;
    }
  },

  deleteProperty: async (propertyId: number) => {
    try {
      const response = await api.delete(`/api/admin/properties/${propertyId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting property:', error);
      throw error;
    }
  },

  /**
   * Report Management
   */
  getReports: async (page = 1, limit = 10, status = '') => {
    try {
      const response = await api.get('/api/admin/reports', {
        params: { page, limit, status }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw error;
    }
  },

  updateReportStatus: async (reportId: number, status: string, adminResponse?: string) => {
    try {
      const response = await api.put(`/api/admin/reports/${reportId}`, { 
        status,
        admin_response: adminResponse
      });
      return response.data;
    } catch (error) {
      console.error('Error updating report status:', error);
      throw error;
    }
  },

  /**
   * News Management
   */
  getNews: async (page = 1, limit = 10, search = '', status = '') => {
    try {
      const response = await api.get('/api/admin/news', {
        params: { page, limit, search, status }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching news:', error);
      throw error;
    }
  },

  getNewsCategories: async () => {
    try {
      const response = await api.get('/api/news/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching news categories:', error);
      throw error;
    }
  },

  createNews: async (newsData: any) => {
    try {
      const response = await api.post('/api/admin/news', newsData);
      return response.data;
    } catch (error) {
      console.error('Error creating news:', error);
      throw error;
    }
  },

  updateNews: async (newsId: number, newsData: any) => {
    try {
      const response = await api.put(`/api/admin/news/${newsId}`, newsData);
      return response.data;
    } catch (error) {
      console.error('Error updating news:', error);
      throw error;
    }
  },

  deleteNews: async (newsId: number) => {
    try {
      const response = await api.delete(`/api/admin/news/${newsId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting news:', error);
      throw error;
    }
  }
}; 