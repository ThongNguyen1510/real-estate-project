import React, { useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  ListItemSecondaryAction, 
  Avatar, 
  IconButton, 
  Button, 
  Divider, 
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Message as MessageIcon,
  Favorite as FavoriteIcon,
  Home as HomeIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useNotifications, Notification } from '../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

// Helper to get icon based on notification type
const getIconForType = (type: string) => {
  switch (type) {
    case 'message':
      return <MessageIcon color="primary" />;
    case 'favorite':
      return <FavoriteIcon color="error" />;
    case 'property':
      return <HomeIcon color="secondary" />;
    default:
      return <InfoIcon color="info" />;
  }
};

// Format date to relative time (e.g. "2 hours ago")
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true, locale: vi });
  } catch (error) {
    console.error('Date formatting error:', error);
    return dateString;
  }
};

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    notifications, 
    unreadCount, 
    loading, 
    error,
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    fetchNotifications 
  } = useNotifications();

  useEffect(() => {
    // Fetch notifications when the page loads
    fetchNotifications();
  }, [fetchNotifications]);

  // Handle clicking a notification
  const handleNotificationClick = (notification: Notification) => {
    // Mark the notification as read
    markAsRead(notification.id);
    
    // Handle navigation based on notification type
    if (notification.type === 'message' && notification.related_id) {
      navigate(`/messages/${notification.related_id}`);
    } else if (notification.type === 'property' && notification.related_id) {
      navigate(`/chi-tiet-bat-dong-san/${notification.related_id}`);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Thông báo của bạn
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Xem và quản lý tất cả thông báo từ hệ thống
        </Typography>
      </Box>

      <Paper 
        elevation={2} 
        sx={{ 
          borderRadius: 2,
          overflow: 'hidden',
          mb: 4
        }}
      >
        <Box 
          sx={{ 
            p: 2, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            bgcolor: 'background.default'
          }}
        >
          <Typography variant="h6">
            {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Tất cả thông báo'}
          </Typography>
          
          <Box>
            {unreadCount > 0 && (
              <Button 
                startIcon={<CheckCircleIcon />}
                onClick={() => markAllAsRead()}
                sx={{ mr: 1 }}
                size="small"
              >
                Đánh dấu tất cả đã đọc
              </Button>
            )}
            
            <Button 
              startIcon={<RefreshIcon />}
              onClick={() => fetchNotifications()}
              size="small"
              color="secondary"
            >
              Làm mới
            </Button>
          </Box>
        </Box>
        
        <Divider />
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="error">{error}</Typography>
            <Button 
              onClick={() => fetchNotifications()} 
              sx={{ mt: 2 }}
              variant="outlined"
            >
              Thử lại
            </Button>
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <InfoIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Không có thông báo nào
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Bạn sẽ nhận được thông báo khi có tin mới về bất động sản hoặc tin nhắn
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((notification) => (
              <React.Fragment key={notification.id}>
                <ListItem 
                  button 
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    p: 2,
                    backgroundColor: notification.is_read ? 'transparent' : 'rgba(25, 118, 210, 0.05)'
                  }}
                >
                  <ListItemAvatar>
                    <Avatar 
                      sx={{ 
                        bgcolor: notification.is_read ? 'grey.200' : 'primary.light'
                      }}
                    >
                      {getIconForType(notification.type)}
                    </Avatar>
                  </ListItemAvatar>
                  
                  <ListItemText 
                    primary={
                      <Typography
                        variant="subtitle1"
                        sx={{ 
                          fontWeight: notification.is_read ? 'normal' : 'bold',
                          color: notification.is_read ? 'text.secondary' : 'text.primary'
                        }}
                      >
                        {notification.title}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography 
                          variant="body2" 
                          component="span" 
                          sx={{ 
                            display: 'block',
                            color: notification.is_read ? 'text.secondary' : 'text.primary' 
                          }}
                        >
                          {notification.content}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(notification.created_at)}
                        </Typography>
                      </>
                    }
                  />
                  
                  <ListItemSecondaryAction>
                    <Tooltip title="Xóa thông báo">
                      <IconButton
                        edge="end"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
};

export default NotificationsPage; 