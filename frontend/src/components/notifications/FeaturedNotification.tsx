import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  IconButton,
  Collapse,
  Alert,
  AlertTitle,
  Snackbar,
  Button,
  Stack,
} from '@mui/material';
import {
  Close as CloseIcon,
  Notifications as NotificationsIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import axios from 'axios';
import { API_URL } from '../../config';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface FeaturedNotification {
  id: number;
  title: string;
  message: string;
  created_at: string;
  created_by_name: string;
}

const FeaturedNotificationComponent: React.FC = () => {
  const [notification, setNotification] = useState<FeaturedNotification | null>(null);
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  // @ts-ignore - Ignoring token property missing in AuthContext
  const { token } = useAuth();

  const fetchFeaturedNotification = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/global-featured-notification`);
      
      if (response.data.success) {
        setNotification(response.data.data);
        
        // Kiểm tra xem người dùng đã đóng thông báo này chưa
        const dismissedNotifications = JSON.parse(localStorage.getItem('dismissedNotifications') || '{}');
        if (dismissedNotifications[response.data.data.id]) {
          setOpen(false);
        } else {
          setOpen(true);
        }
      } else {
        setNotification(null);
        setOpen(false);
      }
    } catch (error) {
      console.error('Error fetching featured notification:', error);
      setNotification(null);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeaturedNotification();
  }, []);

  const handleClose = () => {
    setOpen(false);
    
    // Lưu trạng thái đóng vào localStorage
    if (notification) {
      const dismissedNotifications = JSON.parse(localStorage.getItem('dismissedNotifications') || '{}');
      dismissedNotifications[notification.id] = true;
      localStorage.setItem('dismissedNotifications', JSON.stringify(dismissedNotifications));
    }
  };

  const handleToggleExpand = () => {
    setExpanded(!expanded);
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true,
        locale: vi
      });
    } catch (e) {
      return dateString;
    }
  };

  if (!notification || !open || loading) {
    return null;
  }

  return (
    <Box sx={{ mb: 2, position: 'relative', zIndex: 10 }}>
      <Alert 
        severity="info" 
        icon={<NotificationsIcon fontSize="inherit" />}
        action={
          <Stack direction="row" spacing={1}>
            <IconButton
              aria-label="expand"
              color="inherit"
              size="small"
              onClick={handleToggleExpand}
            >
              {expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={handleClose}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          </Stack>
        }
        sx={{ 
          mb: 2,
          '& .MuiAlert-icon': {
            mr: 2,
            alignItems: 'center',
            fontSize: '1.5rem'
          },
          boxShadow: 2,
          border: '1px solid',
          borderColor: 'primary.light',
          backgroundColor: 'rgba(235, 245, 255, 0.95)'
        }}
      >
        <AlertTitle sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
          {notification.title}
        </AlertTitle>
        
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box sx={{ mt: 1, mb: 1 }}>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
              {notification.message}
            </Typography>
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" color="text.secondary">
                Người gửi: {notification.created_by_name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDate(notification.created_at)}
              </Typography>
            </Box>
          </Box>
        </Collapse>
        
        {!expanded && (
          <Typography 
            variant="body2" 
            sx={{ 
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              cursor: 'pointer'
            }}
            onClick={handleToggleExpand}
          >
            {notification.message.substring(0, 100)}
            {notification.message.length > 100 ? '...' : ''}
          </Typography>
        )}
      </Alert>
    </Box>
  );
};

export default FeaturedNotificationComponent; 