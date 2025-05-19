import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  Message as MessageIcon,
  Favorite as FavoriteIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { useNotifications, Notification } from '../../contexts/NotificationContext';
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

const NotificationMenu: React.FC = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { 
    notifications, 
    unreadCount, 
    loading,
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    fetchNotifications
  } = useNotifications();
  
  // Reference to track if component is mounted
  const isMounted = useRef(true);
  
  // Set up effect to update isMounted ref on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Debug log for unreadCount
  useEffect(() => {
    console.log('NotificationMenu: unreadCount =', unreadCount);
  }, [unreadCount]);
  
  // Fetch notifications and unread count when menu is opened or on mount
  useEffect(() => {
    // Initial fetch of unread count
    fetchNotifications();
  }, []);
  
  // Fetch notifications when menu is opened
  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    fetchNotifications();
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
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
    
    handleClose();
  };
  
  // Handle marking all notifications as read
  const handleMarkAllAsRead = (event: React.MouseEvent) => {
    event.stopPropagation();
    markAllAsRead();
  };
  
  // Handle deleting a notification
  const handleDelete = (event: React.MouseEvent, id: number) => {
    event.stopPropagation();
    deleteNotification(id);
  };
  
  // Check if menu is open
  const open = Boolean(anchorEl);

  return (
    <>
      <Tooltip title="Thông báo">
        <IconButton
          color="inherit"
          onClick={handleOpen}
          aria-controls={open ? 'notification-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          size="large"
        >
          <Badge badgeContent={unreadCount > 0 ? unreadCount : null} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      
      <Menu
        id="notification-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 3,
          sx: { 
            width: 320,
            maxHeight: 500
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="div">
            Thông báo
          </Typography>
          
          {unreadCount > 0 && (
            <Button 
              size="small" 
              startIcon={<CheckCircleIcon />}
              onClick={handleMarkAllAsRead}
            >
              Đánh dấu đã đọc
            </Button>
          )}
        </Box>
        
        <Divider />
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="textSecondary">
              Bạn không có thông báo nào
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
                    backgroundColor: notification.is_read ? 'transparent' : 'rgba(0, 0, 0, 0.04)'
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
                        variant="subtitle2"
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
                        <Typography variant="body2" component="span" sx={{ display: 'block' }}>
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
                        size="small"
                        onClick={(e) => handleDelete(e, notification.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
        
        {notifications.length > 0 && (
          <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
            <Button 
              size="small" 
              onClick={() => {
                navigate('/thong-bao');
                handleClose();
              }}
            >
              Xem tất cả
            </Button>
          </Box>
        )}
      </Menu>
    </>
  );
};

export default NotificationMenu; 