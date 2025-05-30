import axios from 'axios';
import { API_URL } from '../../config';

const notificationService = {
  // Lấy tất cả thông báo cho người dùng hiện tại
  getUserNotifications: async () => {
    try {
      const response = await axios.get(`${API_URL}/notifications/user`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      throw error;
    }
  },

  // Lấy các thông báo chưa đọc
  getUnreadNotifications: async () => {
    try {
      const response = await axios.get(`${API_URL}/notifications/unread`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      throw error;
    }
  },

  // Đánh dấu thông báo đã đọc
  markAsRead: async (notificationId: string) => {
    try {
      const response = await axios.put(`${API_URL}/notifications/${notificationId}/read`, {}, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  // Đánh dấu tất cả thông báo đã đọc
  markAllAsRead: async () => {
    try {
      const response = await axios.put(`${API_URL}/notifications/read-all`, {}, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  // Lấy thông báo hệ thống và tin tức mới từ admin
  getSystemAnnouncements: async () => {
    try {
      const response = await axios.get(`${API_URL}/announcements`);
      return response.data;
    } catch (error) {
      console.error('Error fetching system announcements:', error);
      throw error;
    }
  }
};

export default notificationService; 