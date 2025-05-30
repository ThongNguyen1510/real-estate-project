import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import notificationService from '../services/api/notificationService';
import { useAuth } from './AuthContext';

// Định nghĩa kiểu dữ liệu cho thông báo
export interface Notification {
  _id: string;
  userId?: string;
  title: string;
  message: string;
  type: 'system' | 'property' | 'property_expired' | 'property_expiring_soon' | 'report_approved' | 'report_rejected' | 'property_favorited' | 'message' | 'news';
  isRead: boolean;
  link?: string;
  createdAt: string;
  reference_id?: number; // ID tham chiếu đến tin đăng hoặc báo cáo
}

export interface Announcement {
  _id: string;
  title: string;
  content: string;
  isImportant: boolean;
  createdAt: string;
  expiresAt?: string;
}

interface NotificationContextProps {
  notifications: Notification[];
  unreadCount: number;
  announcements: Announcement[];
  loadNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  hasNewAnnouncements: boolean;
  dismissAnnouncements: () => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [hasNewAnnouncements, setHasNewAnnouncements] = useState(false);
  const { isAuthenticated, user } = useAuth();

  // Đếm số thông báo chưa đọc
  const unreadCount = notifications.filter(notification => !notification.isRead).length;

  // Tải thông báo khi đăng nhập
  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
    } else {
      setNotifications([]);
    }
    
    // Luôn tải thông báo hệ thống, kể cả khi không đăng nhập
    loadSystemAnnouncements();
    
    // Thiết lập polling để kiểm tra thông báo mới (mỗi 30 giây)
    const interval = setInterval(() => {
      if (isAuthenticated) {
        checkForNewNotifications();
      }
      loadSystemAnnouncements();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  // Tải tất cả thông báo của người dùng
  const loadNotifications = async () => {
    try {
      const data = await notificationService.getUserNotifications();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Failed to load notifications', error);
    }
  };

  // Kiểm tra thông báo mới (chỉ tải các thông báo chưa đọc)
  const checkForNewNotifications = async () => {
    try {
      const data = await notificationService.getUnreadNotifications();
      if (data.notifications?.length > 0) {
        // Cập nhật lại danh sách thông báo nếu có thông báo mới
        loadNotifications();
      }
    } catch (error) {
      console.error('Failed to check for new notifications', error);
    }
  };

  // Tải thông báo hệ thống và tin tức
  const loadSystemAnnouncements = async () => {
    try {
      const data = await notificationService.getSystemAnnouncements();
      
      if (data.announcements && data.announcements.length > 0) {
        // Kiểm tra xem có thông báo mới không so với danh sách hiện tại
        const currentIds = announcements.map(a => a._id);
        const hasNewItems = data.announcements.some((a: Announcement) => !currentIds.includes(a._id));
        
        if (hasNewItems) {
          setAnnouncements(data.announcements);
          setHasNewAnnouncements(true);
        }
      }
    } catch (error) {
      console.error('Failed to load system announcements', error);
    }
  };

  // Đánh dấu một thông báo đã đọc
  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification._id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  // Đánh dấu tất cả thông báo đã đọc
  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prevNotifications =>
        prevNotifications.map(notification => ({ ...notification, isRead: true }))
      );
    } catch (error) {
      console.error('Failed to mark all notifications as read', error);
    }
  };

  // Bỏ qua các thông báo hệ thống
  const dismissAnnouncements = () => {
    setHasNewAnnouncements(false);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      announcements,
      loadNotifications,
      markAsRead,
      markAllAsRead,
      hasNewAnnouncements,
      dismissAnnouncements
    }}>
      {children}
    </NotificationContext.Provider>
  );
}; 