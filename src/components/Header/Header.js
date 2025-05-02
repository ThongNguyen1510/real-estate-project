import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Container, 
  Box, 
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  Fab,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemButton,
  ListItemIcon,
  Popover,
  Card,
  CardHeader,
  CardContent,
  CardActions
} from '@mui/material';
import { 
  Home, 
  Search, 
  Favorite, 
  Person, 
  Phone, 
  PostAdd,
  Menu as MenuIcon,
  AddCircle,
  AppRegistration,
  AccountCircle,
  Settings,
  ExitToApp,
  Notifications,
  NotificationsActive,
  CampaignOutlined,
  SystemUpdateAlt,
  Home as HomeIcon,
  CheckCircle,
  DeleteOutline,
  MarkChatRead
} from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';
import { markAsRead, markAllAsRead, removeNotification, clearAllNotifications } from '../../store/notificationsSlice';

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const favorites = useSelector(state => state.favorites.items);
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const { items: notifications, unreadCount } = useSelector(state => state.notifications);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileMenuOpen = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };
  
  const handleNotificationsOpen = (event) => {
    setNotificationsAnchorEl(event.currentTarget);
  };
  
  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    handleMenuClose();
    handleProfileMenuClose();
  };

  const handlePostButtonClick = () => {
    navigate('/post-management');
    handleMenuClose();
    handleProfileMenuClose();
  };

  const handleProfileClick = () => {
    navigate('/profile');
    handleMenuClose();
    handleProfileMenuClose();
  };
  
  const handleNotificationClick = (notification) => {
    dispatch(markAsRead(notification.id));
    
    // Navigate based on notification type
    switch (notification.type) {
      case 'property':
        navigate('/properties');
        break;
      case 'promotion':
        navigate('/post-management');
        break;
      case 'system':
      default:
        // Just mark as read, no navigation
        break;
    }
    
    handleNotificationsClose();
  };
  
  const handleMarkAllRead = () => {
    dispatch(markAllAsRead());
  };
  
  const handleClearNotifications = () => {
    dispatch(clearAllNotifications());
    handleNotificationsClose();
  };
  
  const handleRemoveNotification = (e, id) => {
    e.stopPropagation();
    dispatch(removeNotification(id));
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Format notification time
  const formatNotificationTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);
    
    if (diffSec < 60) return 'Vừa xong';
    if (diffMin < 60) return `${diffMin} phút trước`;
    if (diffHour < 24) return `${diffHour} giờ trước`;
    if (diffDay === 1) return 'Hôm qua';
    return `${diffDay} ngày trước`;
  };
  
  // Get icon for notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'property':
        return <HomeIcon color="primary" />;
      case 'promotion':
        return <CampaignOutlined color="warning" />;
      case 'system':
        return <SystemUpdateAlt color="info" />;
      default:
        return <Notifications color="action" />;
    }
  };

  // Enhanced active button style for better visibility
  const activeButtonStyle = {
    borderBottom: `3px solid ${theme.palette.primary.main}`,
    fontWeight: 'bold',
    borderRadius: 0,
    paddingBottom: '6px',
    color: theme.palette.primary.main,
    backgroundColor: 'rgba(25, 118, 210, 0.08)'
  };

  // Standard button style for consistency
  const standardButtonStyle = {
    borderRadius: 4,
    paddingLeft: 2,
    paddingRight: 2,
    textTransform: 'none',
    fontWeight: 500
  };

  // Active menu item style
  const activeMenuItemStyle = {
    backgroundColor: 'rgba(25, 118, 210, 0.08)',
    fontWeight: 'bold',
    color: theme.palette.primary.main
  };

  return (
    <>
      <AppBar position="static" color="default" elevation={1} sx={{ py: 1 }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            {/* Logo */}
            <Typography
              variant="h4"
              component={Link}
              to="/"
              sx={{
                fontWeight: 'bold',
                color: 'primary.main',
                textDecoration: 'none',
                mr: 4
              }}
            >
              Bất động sản HeHe
            </Typography>

            {isMobile ? (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
                  {/* Notification Icon - Mobile */}
                  <Tooltip title="Thông báo">
                    <IconButton 
                      color="inherit"
                      onClick={handleNotificationsOpen}
                      sx={{ mr: 1 }}
                    >
                      <Badge badgeContent={unreadCount} color="error">
                        {unreadCount > 0 ? <NotificationsActive color="action" /> : <Notifications color="action" />}
                      </Badge>
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Đăng tin bất động sản">
                    <Button
                      variant={isActive('/post-management') ? "contained" : "outlined"}
                      color="primary"
                      startIcon={<PostAdd />}
                      component={Link}
                      to="/post-management"
                      size="small"
                      sx={{ 
                        fontWeight: isActive('/post-management') ? 'bold' : 'normal',
                        display: { xs: 'flex', sm: 'none' },
                        ...standardButtonStyle
                      }}
                    >
                      Đăng tin
                    </Button>
                  </Tooltip>
                  
                  {isAuthenticated && (
                    <Tooltip title="Trang cá nhân">
                      <IconButton
                        color={isActive('/profile') ? "primary" : "default"}
                        onClick={handleProfileMenuOpen}
                        sx={{ 
                          mr: 1,
                          bgcolor: isActive('/profile') ? 'rgba(25, 118, 210, 0.08)' : 'transparent'
                        }}
                      >
                        {user?.avatar ? (
                          <Avatar 
                            src={user.avatar} 
                            alt={user.fullName || "User"}
                            sx={{ 
                              width: 32, 
                              height: 32,
                              border: isActive('/profile') ? `2px solid ${theme.palette.primary.main}` : 'none' 
                            }} 
                          />
                        ) : (
                          <AccountCircle 
                            color={isActive('/profile') ? "primary" : "inherit"} 
                            sx={{ fontSize: 32 }} 
                          />
                        )}
                      </IconButton>
                    </Tooltip>
                  )}
                  
                  <IconButton
                    edge="end"
                    color="inherit"
                    aria-label="menu"
                    onClick={handleMenuOpen}
                  >
                    <MenuIcon />
                  </IconButton>
                </Box>
                
                {/* Profile Menu for Mobile */}
                <Menu
                  anchorEl={profileAnchorEl}
                  open={Boolean(profileAnchorEl)}
                  onClose={handleProfileMenuClose}
                  PaperProps={{
                    sx: {
                      width: 200,
                      p: 1
                    }
                  }}
                >
                  {isAuthenticated && (
                    <Box sx={{ px: 2, py: 1.5 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {user?.fullName || "Tài khoản"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user?.email || ""}
                      </Typography>
                    </Box>
                  )}
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <MenuItem onClick={handleProfileClick} sx={isActive('/profile') ? activeMenuItemStyle : {}}>
                    <Person sx={{ mr: 1 }} /> Trang cá nhân
                  </MenuItem>
                  
                  <MenuItem onClick={handlePostButtonClick} sx={isActive('/post-management') ? activeMenuItemStyle : {}}>
                    <PostAdd sx={{ mr: 1 }} /> Quản lý tin đăng
                  </MenuItem>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <MenuItem onClick={handleLogout}>
                    <ExitToApp sx={{ mr: 1 }} /> Đăng xuất
                  </MenuItem>
                </Menu>
                
                {/* Main Menu for Mobile */}
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  PaperProps={{
                    sx: {
                      width: 200,
                      p: 1
                    }
                  }}
                >
                  <MenuItem 
                    component={Link} 
                    to="/" 
                    onClick={handleMenuClose}
                    sx={isActive('/') ? activeMenuItemStyle : {}}
                  >
                    <Home sx={{ mr: 1 }} /> Trang chủ
                  </MenuItem>
                  <MenuItem 
                    component={Link} 
                    to="/properties" 
                    onClick={handleMenuClose}
                    sx={isActive('/properties') ? activeMenuItemStyle : {}}
                  >
                    <Search sx={{ mr: 1 }} /> Tìm kiếm
                  </MenuItem>
                  
                  <MenuItem 
                    component={Link} 
                    to="/favorites" 
                    onClick={handleMenuClose}
                    sx={isActive('/favorites') ? activeMenuItemStyle : {}}
                  >
                    <Badge badgeContent={favorites.length} color="error" sx={{ mr: 1 }}>
                      <Favorite />
                    </Badge>
                    Yêu thích
                  </MenuItem>
                  
                  {isAuthenticated ? (
                    <>
                      <MenuItem 
                        component={Link} 
                        to="/profile" 
                        onClick={handleMenuClose}
                        sx={isActive('/profile') ? activeMenuItemStyle : {}}
                      >
                        <Person sx={{ mr: 1 }} /> Tài khoản
                      </MenuItem>
                      <MenuItem onClick={handleLogout}>
                        <ExitToApp sx={{ mr: 1 }} /> Đăng xuất
                      </MenuItem>
                    </>
                  ) : (
                    <>
                      <MenuItem 
                        component={Link} 
                        to="/login" 
                        onClick={handleMenuClose}
                        sx={isActive('/login') ? activeMenuItemStyle : {}}
                      >
                        <Person sx={{ mr: 1 }} /> Đăng nhập
                      </MenuItem>
                      <MenuItem 
                        component={Link} 
                        to="/register" 
                        onClick={handleMenuClose}
                        sx={isActive('/register') ? activeMenuItemStyle : {}}
                      >
                        <AppRegistration sx={{ mr: 1 }} /> Đăng ký
                      </MenuItem>
                    </>
                  )}
                </Menu>
              </>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {/* Navigation Links */}
                <Button 
                  color={isActive('/') ? "primary" : "inherit"} 
                  component={Link} 
                  to="/" 
                  startIcon={<Home />}
                  sx={{
                    ...standardButtonStyle,
                    ...(isActive('/') && activeButtonStyle)
                  }}
                >
                  Trang chủ
                </Button>
                <Button 
                  color={isActive('/properties') ? "primary" : "inherit"} 
                  component={Link} 
                  to="/properties" 
                  startIcon={<Search />}
                  sx={{
                    ...standardButtonStyle,
                    ...(isActive('/properties') && activeButtonStyle)
                  }}
                >
                  Tìm kiếm
                </Button>
                
                <Button 
                  color={isActive('/favorites') ? "primary" : "inherit"} 
                  component={Link} 
                  to="/favorites" 
                  startIcon={
                    <Badge badgeContent={favorites.length} color="error">
                      <Favorite />
                    </Badge>
                  }
                  sx={{
                    ...standardButtonStyle,
                    ...(isActive('/favorites') && activeButtonStyle)
                  }}
                >
                  Yêu thích
                </Button>
                
                {/* Notification Icon - Desktop */}
                <Tooltip title="Thông báo">
                  <IconButton 
                    color="inherit"
                    onClick={handleNotificationsOpen}
                    sx={{ 
                      ml: 1,
                      ...(Boolean(notificationsAnchorEl) && {
                        bgcolor: 'rgba(25, 118, 210, 0.08)',
                      })
                    }}
                  >
                    <Badge badgeContent={unreadCount} color="error">
                      {unreadCount > 0 ? <NotificationsActive color="primary" /> : <Notifications color="action" />}
                    </Badge>
                  </IconButton>
                </Tooltip>
                
                <Button
                  variant={isActive('/post-management') ? "contained" : "outlined"}
                  color="primary"
                  startIcon={<PostAdd />}
                  component={Link}
                  to="/post-management"
                  sx={{ 
                    ml: 2,
                    fontWeight: isActive('/post-management') ? 'bold' : 'normal',
                    ...standardButtonStyle
                  }}
                >
                  Đăng tin
                </Button>
                
                {isAuthenticated ? (
                  <Tooltip title="Trang cá nhân">
                    <IconButton
                      color={isActive('/profile') ? "primary" : "default"}
                      onClick={handleProfileMenuOpen}
                      sx={{ 
                        ml: 1,
                        bgcolor: isActive('/profile') ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                        p: 0.5,
                        border: isActive('/profile') ? `2px solid ${theme.palette.primary.main}` : 'none'
                      }}
                    >
                      {user?.avatar ? (
                        <Avatar 
                          src={user.avatar} 
                          alt={user.fullName || "User"}
                          sx={{ width: 40, height: 40 }} 
                        />
                      ) : (
                        <AccountCircle 
                          color={isActive('/profile') ? "primary" : "inherit"} 
                          sx={{ fontSize: 40 }} 
                        />
                      )}
                    </IconButton>
                  </Tooltip>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      color={isActive('/login') ? "primary" : "inherit"}
                      variant={isActive('/login') ? "contained" : "text"}
                      component={Link}
                      to="/login"
                      startIcon={<Person />}
                      sx={{
                        ...standardButtonStyle
                      }}
                    >
                      Đăng nhập
                    </Button>
                    <Button
                      color={isActive('/register') ? "primary" : "inherit"}
                      variant={isActive('/register') ? "contained" : "text"}
                      component={Link}
                      to="/register"
                      startIcon={<AppRegistration />}
                      sx={{
                        ...standardButtonStyle
                      }}
                    >
                      Đăng ký
                    </Button>
                  </Box>
                )}
                
                {/* Profile Menu for Desktop */}
                <Menu
                  anchorEl={profileAnchorEl}
                  open={Boolean(profileAnchorEl)}
                  onClose={handleProfileMenuClose}
                  PaperProps={{
                    sx: {
                      width: 240,
                      p: 1
                    }
                  }}
                >
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {user?.fullName || "Tài khoản"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user?.email || ""}
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <MenuItem onClick={handleProfileClick} sx={isActive('/profile') ? activeMenuItemStyle : {}}>
                    <Person sx={{ mr: 1 }} /> Trang cá nhân
                  </MenuItem>
                  
                  <MenuItem onClick={handlePostButtonClick} sx={isActive('/post-management') ? activeMenuItemStyle : {}}>
                    <PostAdd sx={{ mr: 1 }} /> Quản lý tin đăng
                  </MenuItem>
                  
                  <MenuItem component={Link} to="/favorites" onClick={handleProfileMenuClose} sx={isActive('/favorites') ? activeMenuItemStyle : {}}>
                    <Favorite sx={{ mr: 1 }} /> Tin đã lưu
                  </MenuItem>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <MenuItem onClick={handleLogout}>
                    <ExitToApp sx={{ mr: 1 }} /> Đăng xuất
                  </MenuItem>
                </Menu>
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>
      
      {/* Notifications Popover */}
      <Popover
        anchorEl={notificationsAnchorEl}
        open={Boolean(notificationsAnchorEl)}
        onClose={handleNotificationsClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: { xs: '90vw', sm: 400 },
            maxHeight: 500,
            mt: 1,
            overflow: 'hidden',
            boxShadow: 3,
            borderRadius: 2
          }
        }}
      >
        <Card sx={{ width: '100%', height: '100%', boxShadow: 'none' }}>
          <CardHeader
            title="Thông báo"
            titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
            action={
              <Tooltip title="Đánh dấu tất cả là đã đọc">
                <IconButton onClick={handleMarkAllRead} disabled={unreadCount === 0}>
                  <MarkChatRead color={unreadCount === 0 ? "disabled" : "primary"} />
                </IconButton>
              </Tooltip>
            }
            sx={{ 
              pb: 1,
              borderBottom: 1,
              borderColor: 'divider',
            }}
          />
          <CardContent sx={{ 
            p: 0, 
            maxHeight: 350, 
            overflow: 'auto',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderRadius: '4px',
            },
          }}>
            {notifications.length > 0 ? (
              <List sx={{ p: 0 }}>
                {notifications.map((notification) => (
                  <ListItemButton 
                    key={notification.id} 
                    onClick={() => handleNotificationClick(notification)}
                    sx={{
                      bgcolor: notification.read ? 'transparent' : 'rgba(25, 118, 210, 0.05)',
                      py: 1,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '&:hover': {
                        bgcolor: 'rgba(0, 0, 0, 0.04)'
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {getNotificationIcon(notification.type)}
                    </ListItemIcon>
                    <ListItemText 
                      primary={
                        <Typography variant="subtitle2" sx={{ 
                          fontWeight: notification.read ? 'normal' : 'bold',
                          color: notification.read ? 'text.secondary' : 'text.primary'
                        }}>
                          {notification.title}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" noWrap>
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatNotificationTime(notification.timestamp)}
                          </Typography>
                        </>
                      }
                      sx={{ my: 0 }}
                    />
                    <IconButton 
                      size="small" 
                      onClick={(e) => handleRemoveNotification(e, notification.id)}
                      sx={{ ml: 1 }}
                    >
                      <DeleteOutline fontSize="small" />
                    </IconButton>
                  </ListItemButton>
                ))}
              </List>
            ) : (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Notifications sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                <Typography color="text.secondary">
                  Không có thông báo nào
                </Typography>
              </Box>
            )}
          </CardContent>
          <CardActions sx={{ justifyContent: 'center', p: 1, borderTop: 1, borderColor: 'divider' }}>
            <Button 
              color="secondary" 
              size="small" 
              onClick={handleClearNotifications}
              disabled={notifications.length === 0}
            >
              Xóa tất cả
            </Button>
          </CardActions>
        </Card>
      </Popover>
    </>
  );
};

export default Header;