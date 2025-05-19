import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { notificationService } from '../services/api';
import { authService } from '../services/api';

// Define types for notifications
export interface Notification {
  id: number;
  type: string;
  title: string;
  content: string;
  related_id?: number;
  is_read: boolean;
  created_at: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  fetchNotifications: () => Promise<void>;
}

// Create the context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Create the provider component
export const NotificationProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch notifications when user is authenticated
  const fetchNotifications = async () => {
    // Only fetch if user is authenticated
    if (!authService.checkAuth()) return;
    
    setLoading(true);
    try {
      console.log('Fetching notifications...');
      const response = await notificationService.getNotifications();
      console.log('Notifications response:', response);
      
      if (response.success) {
        const notificationsList = response.data.notifications || [];
        setNotifications(notificationsList);
        
        // Calculate unread count from fetched notifications
        const unreadNotifications = notificationsList.filter((n: Notification) => !n.is_read).length;
        console.log('Calculated unread count:', unreadNotifications);
        setUnreadCount(unreadNotifications);
      } else {
        console.error('Failed to fetch notifications:', response);
        setError('Không thể tải thông báo');
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Không thể tải thông báo');
    } finally {
      setLoading(false);
    }
    
    // Always fetch the unread count separately
    fetchUnreadCount();
  };

  // Get unread count
  const fetchUnreadCount = async () => {
    // Only fetch if user is authenticated
    if (!authService.checkAuth()) return;
    
    try {
      console.log('Fetching unread count...');
      const response = await notificationService.getUnreadCount();
      console.log('Unread count response:', response);
      
      if (response.success) {
        const count = response.data.unread_count || 0;
        console.log('Setting unread count to:', count);
        setUnreadCount(count);
      } else {
        console.error('Failed to fetch unread count:', response);
      }
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  // Mark notification as read
  const markAsRead = async (id: number) => {
    try {
      const response = await notificationService.markAsRead(id);
      if (response.success) {
        // Update the notification in state
        setNotifications(prevNotifications => 
          prevNotifications.map(notification => 
            notification.id === id 
              ? { ...notification, is_read: true } 
              : notification
          )
        );
        
        // Update unread count
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError('Không thể đánh dấu đã đọc');
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const response = await notificationService.markAllAsRead();
      if (response.success) {
        // Update all notifications in state
        setNotifications(prevNotifications => 
          prevNotifications.map(notification => ({ ...notification, is_read: true }))
        );
        
        // Reset unread count
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      setError('Không thể đánh dấu tất cả đã đọc');
    }
  };

  // Delete a notification
  const deleteNotification = async (id: number) => {
    try {
      const response = await notificationService.deleteNotification(id);
      if (response.success) {
        // Remove the notification from state
        setNotifications(prevNotifications => 
          prevNotifications.filter(notification => notification.id !== id)
        );
        
        // If the deleted notification was unread, update the count
        const deletedNotification = notifications.find((n: Notification) => n.id === id);
        if (deletedNotification && !deletedNotification.is_read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
      setError('Không thể xóa thông báo');
    }
  };

  // Initial fetch and setup periodic refresh
  useEffect(() => {
    if (authService.checkAuth()) {
      console.log('Initial fetch of notifications and unread count');
      fetchNotifications();
      
      // Set up interval to refresh notifications every 60 seconds
      const intervalId = setInterval(() => {
        console.log('Periodic refresh of unread count');
        fetchUnreadCount();
      }, 60000);
      
      return () => clearInterval(intervalId);
    }
  }, []);

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use the notification context
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext; 