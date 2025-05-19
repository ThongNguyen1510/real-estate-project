import React from 'react';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Home as HomeIcon,
  Settings as SettingsIcon,
  Article as ArticleIcon,
  Notifications as NotificationsIcon,
  Report as ReportIcon
} from '@mui/icons-material';

// Define sidebar menu items
export const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
  { text: 'Quản lý người dùng', icon: <PeopleIcon />, path: '/admin/users' },
  { text: 'Quản lý tin đăng', icon: <HomeIcon />, path: '/admin/properties' },
  { text: 'Quản lý báo cáo', icon: <ReportIcon />, path: '/admin/reports' },
  { text: 'Quản lý tin tức', icon: <ArticleIcon />, path: '/admin/news' },
  { text: 'Quản lý thông báo', icon: <NotificationsIcon />, path: '/admin/notifications' },
  { text: 'Cài đặt hệ thống', icon: <SettingsIcon />, path: '/admin/settings' }
];

// Create a simple AdminLayout component
const AdminLayout: React.FC = () => {
  return (
    <div>
      {/* This is a placeholder for the actual admin layout implementation */}
      <h1>Admin Layout</h1>
    </div>
  );
};

export default AdminLayout; 