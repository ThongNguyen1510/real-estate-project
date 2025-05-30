import React, { useState } from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  IconButton,
  Collapse,
  Button,
  Typography,
  Divider
} from '@mui/material';
import {
  Close as CloseIcon,
  CampaignOutlined as AnnouncementIcon,
  KeyboardArrowDown as ExpandIcon,
  KeyboardArrowUp as CollapseIcon
} from '@mui/icons-material';
import { useNotifications } from '../../contexts/NotificationContext';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const GlobalAnnouncement: React.FC = () => {
  const { announcements, dismissAnnouncements, hasNewAnnouncements } = useNotifications();
  const [open, setOpen] = useState(hasNewAnnouncements);
  const [expanded, setExpanded] = useState(false);

  // Nếu không có thông báo, không hiển thị gì cả
  if (!announcements || announcements.length === 0) {
    return null;
  }

  // Lấy thông báo mới nhất và quan trọng nhất
  const importantAnnouncements = announcements
    .filter(a => a.isImportant)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const recentAnnouncements = announcements
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const announcement = importantAnnouncements.length > 0 
    ? importantAnnouncements[0] 
    : recentAnnouncements[0];

  if (!announcement) {
    return null;
  }

  const handleClose = () => {
    setOpen(false);
    dismissAnnouncements();
  };

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: vi });
    } catch (error) {
      return '';
    }
  };

  return (
    <Collapse in={open}>
      <Box sx={{ mb: 2, mx: 2 }}>
        <Alert 
          severity={announcement.isImportant ? "warning" : "info"}
          icon={<AnnouncementIcon />}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={handleClose}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          sx={{ 
            borderRadius: 2,
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}
        >
          <AlertTitle>{announcement.title}</AlertTitle>
          
          <Collapse in={expanded} collapsedSize={60}>
            <Typography 
              variant="body2" 
              component="div"
              sx={{ 
                whiteSpace: 'pre-line',
                mb: 1
              }}
            >
              {announcement.content}
            </Typography>
            
            <Typography variant="caption" color="text.secondary">
              Ngày đăng: {formatDate(announcement.createdAt)}
            </Typography>
            
            {importantAnnouncements.length > 1 && (
              <>
                <Divider sx={{ my: 1.5 }} />
                <Typography variant="subtitle2">
                  Còn {importantAnnouncements.length - 1} thông báo quan trọng khác
                </Typography>
              </>
            )}
          </Collapse>
          
          {announcement.content.length > 100 && (
            <Button 
              size="small" 
              onClick={toggleExpand} 
              sx={{ mt: 1 }}
              endIcon={expanded ? <CollapseIcon /> : <ExpandIcon />}
            >
              {expanded ? 'Thu gọn' : 'Xem thêm'}
            </Button>
          )}
        </Alert>
      </Box>
    </Collapse>
  );
};

export default GlobalAnnouncement; 