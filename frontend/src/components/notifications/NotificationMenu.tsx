import React, { useState } from 'react';
import { 
  Badge, 
  IconButton, 
  Menu, 
  MenuItem, 
  Typography, 
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button,
  Divider,
  Tooltip
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  Campaign as CampaignIcon,
  Newspaper as NewspaperIcon,
  Done as DoneIcon,
  DoneAll as DoneAllIcon,
  NotificationsNone as EmptyNotificationIcon,
  AccessTimeOutlined as ExpiringIcon,
  AccessTime as ExpiredIcon,
  Favorite as FavoriteIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { useNotifications, Notification } from '../../contexts/NotificationContext';

const NotificationMenu: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const { 
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead
  } = useNotifications();
  
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification: Notification) => {
    // Đánh dấu là đã đọc
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    
    // Điều hướng đến link nếu có
    if (notification.link) {
      navigate(notification.link);
    }
    
    handleClose();
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
  };

  const handleViewAll = () => {
    navigate('/thong-bao');
    handleClose();
  };

  // Lấy icon tương ứng với loại thông báo
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'property':
        return <HomeIcon color="primary" />;
      case 'property_expired':
        return <ExpiredIcon color="error" />;
      case 'property_expiring_soon':
        return <ExpiringIcon color="warning" />;
      case 'report_approved':
        return <ApprovedIcon color="success" />;
      case 'report_rejected':
        return <RejectedIcon color="error" />;
      case 'property_favorited':
        return <FavoriteIcon style={{ color: '#ff6d75' }} />;
      case 'message':
        return <EmailIcon color="info" />;
      case 'news':
        return <NewspaperIcon color="success" />;
      case 'system':
      default:
        return <CampaignIcon color="warning" />;
    }
  };

  // Format thời gian hiển thị
  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy HH:mm', { locale: vi });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <>
      <Tooltip title="Thông báo">
        <IconButton
          size="large"
          color="inherit"
          onClick={handleClick}
        >
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          elevation: 3,
          sx: {
            minWidth: 320,
            maxWidth: 400,
            maxHeight: 500,
            overflow: 'auto',
            borderRadius: 2,
            mt: 1.5
          }
        }}
      >
        <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Thông báo của bạn
          </Typography>
          <Typography variant="body2">
            {unreadCount > 0 ? `Bạn có ${unreadCount} thông báo mới` : 'Không có thông báo mới'}
          </Typography>
        </Box>

        {notifications.length > 0 ? (
          <>
            <List sx={{ p: 0 }}>
              {notifications.slice(0, 5).map((notification) => (
                <React.Fragment key={notification._id}>
                  <ListItem 
                    alignItems="flex-start"
                    button
                    onClick={() => handleNotificationClick(notification)}
                    sx={{
                      backgroundColor: !notification.isRead ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)'
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'background.paper' }}>
                        {getNotificationIcon(notification.type)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography 
                          variant="body1" 
                          fontWeight={!notification.isRead ? 'bold' : 'normal'}
                        >
                          {notification.title}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography
                            variant="body2"
                            color="text.primary"
                            component="span"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              display: '-webkit-box'
                            }}
                          >
                            {notification.message}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            component="span"
                            sx={{ display: 'block', mt: 0.5 }}
                          >
                            {formatTime(notification.createdAt)}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>

            {notifications.length > 5 && (
              <Box sx={{ textAlign: 'center', p: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Hiển thị 5/{notifications.length} thông báo
                </Typography>
              </Box>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, bgcolor: 'background.paper' }}>
              <Button 
                size="small" 
                onClick={handleMarkAllRead}
                disabled={unreadCount === 0}
                startIcon={<DoneAllIcon />}
              >
                Đánh dấu đã đọc tất cả
              </Button>
              <Button 
                size="small" 
                color="primary"
                onClick={handleViewAll}
              >
                Xem tất cả
              </Button>
            </Box>
          </>
        ) : (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <EmptyNotificationIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              Không có thông báo
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Các thông báo sẽ xuất hiện ở đây khi có hoạt động mới
            </Typography>
          </Box>
        )}
      </Menu>
    </>
  );
};

export default NotificationMenu; 