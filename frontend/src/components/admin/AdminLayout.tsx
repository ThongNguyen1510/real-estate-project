import React, { useState } from 'react';
import { 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  List, 
  Typography, 
  Divider, 
  IconButton, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Avatar,
  useTheme,
  useMediaQuery,
  Container,
  Breadcrumbs,
  Link as MuiLink,
  Tooltip,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  HomeWork as PropertyIcon,
  Report as ReportIcon,
  Newspaper as NewsIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  AccountCircle,
  Logout as LogoutIcon,
  NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 240;

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [open, setOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const handleDrawerToggle = () => {
    setOpen(!open);
  };
  
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/login');
  };
  
  // Create breadcrumbs from path
  const pathnames = location.pathname.split('/').filter(x => x);
  
  // Admin menu items
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
    { text: 'Quản lý người dùng', icon: <PersonIcon />, path: '/admin/users' },
    { text: 'Quản lý bất động sản', icon: <PropertyIcon />, path: '/admin/properties' },
    { text: 'Quản lý báo cáo', icon: <ReportIcon />, path: '/admin/reports' },
    { text: 'Quản lý tin tức', icon: <NewsIcon />, path: '/admin/news' },
  ];
  
  const secondaryMenuItems = [
    { text: 'Cài đặt hệ thống', icon: <SettingsIcon />, path: '/admin/settings' },
    { text: 'Thông báo', icon: <NotificationsIcon />, path: '/admin/notifications' },
  ];
  
  return (
    <Box sx={{ display: 'flex' }}>
      {/* Admin AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${open ? drawerWidth : 0}px)` },
          ml: { md: open ? `${drawerWidth}px` : 0 },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          bgcolor: 'primary.main',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          
          {/* Admin user menu */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}>
              {user?.name || user?.email}
            </Typography>
            
            <Tooltip title="Tài khoản">
              <IconButton
                size="large"
                edge="end"
                aria-label="account of current user"
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                color="inherit"
              >
                {user?.avatar ? (
                  <Avatar 
                    alt={user.name || user.email} 
                    src={user.avatar} 
                    sx={{ width: 32, height: 32 }}
                  />
                ) : (
                  <AccountCircle />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Profile menu */}
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem component={Link} to="/ho-so" onClick={handleMenuClose}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Hồ sơ của tôi</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Đăng xuất</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* Drawer for admin sidebar */}
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant={isMobile ? "temporary" : "persistent"}
        anchor="left"
        open={open}
        onClose={isMobile ? handleDrawerToggle : undefined}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: theme.spacing(1, 1),
          ...theme.mixins.toolbar,
          bgcolor: 'primary.main',
          color: 'white'
        }}>
          <Typography variant="h6" sx={{ pl: 1 }}>
            Admin Panel
          </Typography>
          <IconButton onClick={handleDrawerToggle} sx={{ color: 'white' }}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </Box>
        
        <Divider />
        
        {/* Main menu */}
        <List>
          {menuItems.map((item) => (
            <ListItem 
              button 
              key={item.text} 
              component={Link} 
              to={item.path}
              selected={location.pathname === item.path}
              sx={{
                '&.Mui-selected': {
                  bgcolor: 'primary.light',
                  color: 'primary.contrastText',
                  '& .MuiListItemIcon-root': {
                    color: 'primary.contrastText',
                  },
                },
                '&.Mui-selected:hover': {
                  bgcolor: 'primary.light',
                },
              }}
            >
              <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.contrastText' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
        
        <Divider />
        
        {/* Secondary menu */}
        <List>
          {secondaryMenuItems.map((item) => (
            <ListItem 
              button 
              key={item.text} 
              component={Link} 
              to={item.path}
              selected={location.pathname === item.path}
              sx={{
                '&.Mui-selected': {
                  bgcolor: 'primary.light',
                  color: 'primary.contrastText',
                  '& .MuiListItemIcon-root': {
                    color: 'primary.contrastText',
                  },
                },
                '&.Mui-selected:hover': {
                  bgcolor: 'primary.light',
                },
              }}
            >
              <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.contrastText' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Drawer>
      
      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${open ? drawerWidth : 0}px)` },
          ml: { md: open ? `${drawerWidth}px` : 0 },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Box sx={{ ...theme.mixins.toolbar }} /> {/* Spacing for AppBar */}
        
        {/* Breadcrumbs */}
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />} 
          aria-label="breadcrumb"
          sx={{ mb: 2 }}
        >
          <MuiLink
            component={Link}
            underline="hover"
            color="inherit"
            to="/admin"
          >
            Admin
          </MuiLink>
          
          {pathnames.slice(1).map((value, index) => {
            const last = index === pathnames.slice(1).length - 1;
            const to = `/admin/${pathnames.slice(1, index + 2).join('/')}`;
            
            // Convert path to user-friendly format
            const displayName = {
              users: 'Người dùng',
              properties: 'Bất động sản',
              reports: 'Báo cáo',
              news: 'Tin tức',
              settings: 'Cài đặt',
              notifications: 'Thông báo',
            }[value] || value;
            
            return last ? (
              <Typography color="text.primary" key={to}>
                {displayName}
              </Typography>
            ) : (
              <MuiLink
                component={Link}
                underline="hover"
                color="inherit"
                to={to}
                key={to}
              >
                {displayName}
              </MuiLink>
            );
          })}
        </Breadcrumbs>
        
        <Container maxWidth="xl">
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default AdminLayout; 