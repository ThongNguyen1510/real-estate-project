import { createSlice } from '@reduxjs/toolkit';

// Sample notifications for demo purposes
const sampleNotifications = [
  {
    id: 1,
    title: 'Giảm giá 10%',
    message: 'Nhận ưu đãi đặc biệt khi đăng tin trong tuần này!',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    read: false,
    type: 'promotion'
  },
  {
    id: 2,
    title: 'Cập nhật mới',
    message: 'Chúng tôi vừa cập nhật thêm nhiều tính năng mới trên website.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    read: false,
    type: 'system'
  },
  {
    id: 3,
    title: 'Bất động sản mới',
    message: 'Có 15 bất động sản mới phù hợp với tiêu chí tìm kiếm của bạn.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    read: true,
    type: 'property'
  }
];

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: sampleNotifications,
    unreadCount: sampleNotifications.filter(n => !n.read).length
  },
  reducers: {
    markAsRead: (state, action) => {
      const notification = state.items.find(item => item.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = state.unreadCount - 1;
      }
    },
    markAllAsRead: (state) => {
      state.items.forEach(item => {
        item.read = true;
      });
      state.unreadCount = 0;
    },
    addNotification: (state, action) => {
      state.items.unshift({
        id: Date.now(),
        timestamp: new Date().toISOString(),
        read: false,
        ...action.payload
      });
      state.unreadCount = state.unreadCount + 1;
    },
    removeNotification: (state, action) => {
      const notification = state.items.find(item => item.id === action.payload);
      if (notification && !notification.read) {
        state.unreadCount = state.unreadCount - 1;
      }
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    clearAllNotifications: (state) => {
      state.items = [];
      state.unreadCount = 0;
    }
  }
});

export const { 
  markAsRead, 
  markAllAsRead, 
  addNotification, 
  removeNotification, 
  clearAllNotifications 
} = notificationsSlice.actions;

export default notificationsSlice.reducer; 