import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button,
  Paper,
  Tab,
  Tabs,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  AlertTitle
} from '@mui/material';
import {
  Email as EmailIcon,
  Home as HomeIcon,
  Campaign as CampaignIcon,
  Newspaper as NewspaperIcon,
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
import { useNotifications, Notification } from '../contexts/NotificationContext';
import PageHeader from '../components/common/PageHeader';

// Kiểu dữ liệu tab
type NotificationTabType = 'all' | 'unread' | 'property' | 'property_expired' | 'property_expiring_soon' | 'report' | 'report_approved' | 'report_rejected' | 'property_favorited' | 'message' | 'system' | 'news';

const NotificationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NotificationTabType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loadNotifications,
    markAsRead,
    markAllAsRead
  } = useNotifications();
  
  // Tải lại dữ liệu khi truy cập trang
  useEffect(() => {
    loadNotifications();
  }, []);
  
  // Lọc thông báo theo tab đang chọn
  const filterNotifications = () => {
    let filtered = [...notifications];
    
    // Lọc theo tab
    switch (activeTab) {
      case 'unread':
        filtered = filtered.filter(notification => !notification.isRead);
        break;
      case 'property':
        filtered = filtered.filter(notification => notification.type === 'property');
        break;
      case 'property_expired':
        filtered = filtered.filter(notification => notification.type === 'property_expired');
        break;
      case 'property_expiring_soon':
        filtered = filtered.filter(notification => notification.type === 'property_expiring_soon');
        break;
      case 'report':
        filtered = filtered.filter(notification => 
          notification.type === 'report_approved' || notification.type === 'report_rejected'
        );
        break;
      case 'property_favorited':
        filtered = filtered.filter(notification => notification.type === 'property_favorited');
        break;
      case 'message':
        filtered = filtered.filter(notification => notification.type === 'message');
        break;
      case 'system':
        filtered = filtered.filter(notification => notification.type === 'system');
        break;
      case 'news':
        filtered = filtered.filter(notification => notification.type === 'news');
        break;
      default:
        // Trường hợp 'all', không lọc gì thêm
        break;
    }
    
    // Lọc theo search term nếu có
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(term) || 
        notification.message.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  };

  const handleChangeTab = (event: React.SyntheticEvent, newValue: NotificationTabType) => {
    setActiveTab(newValue);
  };

  const handleNotificationClick = (notification: Notification) => {
    // Đánh dấu đã đọc nếu chưa đọc
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    
    // Chuyển hướng nếu có link
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
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

  // Format thời gian
  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'HH:mm dd/MM/yyyy', { locale: vi });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <PageHeader title="Thông báo" backButton />
      
      <Paper 
        elevation={2}
        sx={{ 
          borderRadius: 2,
          overflow: 'hidden',
          mb: 4
        }}
      >
        {/* Tabs phân loại thông báo */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs
            value={activeTab}
            onChange={handleChangeTab}
            variant="scrollable"
            scrollButtons="auto"
            indicatorColor="primary"
            aria-label="notification tabs"
          >
            <Tab label={`Tất cả (${notifications.length})`} value="all" />
            {unreadCount > 0 && <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <span>Chưa đọc</span>
                  <Chip 
                    label={unreadCount} 
                    color="error" 
                    size="small" 
                    sx={{ ml: 1, height: 20, minWidth: 20 }} 
                  />
                </Box>
              } 
              value="unread" 
            />}
            <Tab label="Tin đăng" value="property" />
            <Tab label="Tin hết hạn" value="property_expired" />
            <Tab label="Tin sắp hết hạn" value="property_expiring_soon" />
            <Tab label="Báo cáo" value="report" />
            <Tab label="Yêu thích" value="property_favorited" />
            <Tab label="Tin nhắn" value="message" />
            <Tab label="Hệ thống" value="system" />
            <Tab label="Tin tức" value="news" />
          </Tabs>
        </Box>
        
        {/* Nút đánh dấu đọc tất cả */}
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1">
            {(() => {
              switch(activeTab) {
                case 'all':
                  return `Tất cả thông báo (${notifications.length})`;
                case 'unread':
                  return `Thông báo chưa đọc (${unreadCount})`;
                case 'property':
                  return 'Thông báo tin đăng';
                case 'property_expired':
                  return 'Thông báo tin hết hạn';
                case 'property_expiring_soon':
                  return 'Thông báo tin sắp hết hạn';
                case 'report':
                  return 'Thông báo báo cáo';
                case 'report_approved':
                  return 'Thông báo báo cáo được chấp nhận';
                case 'report_rejected':
                  return 'Thông báo báo cáo bị từ chối';
                case 'property_favorited':
                  return 'Thông báo tin được yêu thích';
                case 'message':
                  return 'Thông báo tin nhắn';
                case 'system':
                  return 'Thông báo hệ thống';
                case 'news':
                  return 'Thông báo tin tức';
                default:
                  return 'Thông báo';
              }
            })()}
          </Typography>
          {unreadCount > 0 && (
            <Button 
              size="small" 
              onClick={handleMarkAllRead}
              startIcon={<DoneAllIcon />}
            >
              Đọc tất cả
            </Button>
          )}
        </Box>
        
        <Divider />
        
        {/* Danh sách thông báo */}
        {filterNotifications().length > 0 ? (
          <List>
            {filterNotifications().map((notification) => (
              <React.Fragment key={notification._id}>
                <ListItem 
                  alignItems="flex-start" 
                  button 
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    backgroundColor: !notification.isRead ? 'rgba(25, 118, 210, 0.05)' : 'transparent',
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
                      <>
                        <Typography 
                          component="span"
                          variant="subtitle1" 
                          fontWeight={!notification.isRead ? 'bold' : 'normal'}
                        >
                          {notification.title}
                        </Typography>
                        {!notification.isRead && (
                          <Chip 
                            label="Mới" 
                            color="primary" 
                            size="small" 
                            sx={{ ml: 1, height: 20, fontSize: '0.7rem' }} 
                          />
                        )}
                      </>
                    }
                    secondary={
                      <>
                        <Typography
                          variant="body2"
                          color="text.primary"
                          component="span"
                          sx={{
                            display: 'block',
                            mt: 0.5
                          }}
                        >
                          {notification.message}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          component="span"
                          sx={{ display: 'block', mt: 1 }}
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
        ) : (
          <Box sx={{ p: 5, textAlign: 'center' }}>
            <EmptyNotificationIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Không có thông báo
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {activeTab === 'unread' 
                ? 'Bạn đã đọc tất cả thông báo' 
                : 'Chưa có thông báo nào trong thư mục này'}
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default NotificationsPage; 