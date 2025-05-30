import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Container,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Badge,
  Avatar,
  useTheme,
  useMediaQuery,
  Divider
} from '@mui/material';
import {
  Menu as MenuIcon,
  Favorite as FavoriteIcon, 
  Search as SearchIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  Info as InfoIcon,
  ContactSupport as ContactIcon,
  Article as NewsIcon,
  Add as AddIcon,
  Dashboard as DashboardIcon,
  Map as MapIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import NotificationMenu from '../notifications/NotificationMenu';
import GlobalAnnouncement from '../notifications/GlobalAnnouncement';

const Header: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  
  const { isAuthenticated, user, logout } = useAuth();
  
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<null | HTMLElement>(null);
  
  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchorEl(event.currentTarget);
  };
  
  const handleMobileMenuClose = () => {
    setMobileMenuAnchorEl(null);
  };
  
  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchorEl(event.currentTarget);
  };
  
  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null);
  };
  
  const handleLogout = () => {
    // Logout using auth context
    logout();
    handleUserMenuClose();
  };
  
  const handleLoginClick = () => {
    // Sử dụng window.location để đảm bảo trang được tải lại hoàn toàn
    window.location.href = '/login';
  };

  const handleRegisterClick = () => {
    // Sử dụng window.location để đảm bảo trang được tải lại hoàn toàn
    window.location.href = '/register';
  };
  
  // Scroll to section functions
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
      
      // After scrolling down, schedule a scroll back to top after a delay
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 5000); // 5 seconds delay before scrolling back up
    }
  };

  const handleGioiThieuClick = (e: React.MouseEvent) => {
    e.preventDefault();
    scrollToSection('gioi-thieu');
  };

  const handleLienHeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    scrollToSection('lien-he');
  };
  
  // Define MenuItem type
  type MenuItem = {
    title: string;
    path: string;
    icon: React.ReactNode;
    onClick?: (e: React.MouseEvent) => void;
  };

  const menuItems: MenuItem[] = [
    { title: 'Nhà đất bán', path: '/tim-kiem?listing_type=sale', icon: <HomeIcon /> },
    { title: 'Nhà đất cho thuê', path: '/tim-kiem?listing_type=rent', icon: <HomeIcon /> },
    { title: 'Bản đồ', path: '/ban-do', icon: <MapIcon /> },
    { title: 'Đăng tin', path: '/dang-tin', icon: <AddIcon /> },
    { title: 'Tin tức', path: '/tin-tuc', icon: <NewsIcon /> },
    { title: 'Giới thiệu', path: '#gioi-thieu', icon: <InfoIcon />, onClick: handleGioiThieuClick },
    { title: 'Liên hệ', path: '#lien-he', icon: <ContactIcon />, onClick: handleLienHeClick },
  ];

  // Avatar rendering with cache busting
  const renderAvatar = () => {
    if (!user) return <PersonIcon />;
    
    console.log('Header - Rendering avatar for user:', user.name);
    console.log('Header - Avatar path from user object:', user.avatar);
    console.log('Header - User role:', user.role);
    
    const timestamp = new Date().getTime();
    
    if (!user.avatar) {
      return (
        <Avatar 
          alt={user.name}
          sx={{ 
            width: isMobile ? 30 : 35, 
            height: isMobile ? 30 : 35,
            border: '2px solid',
            borderColor: user.role === 'admin' ? 'error.main' : 'primary.main'
          }}
        >
          {user.name.charAt(0)}
        </Avatar>
      );
    }
    
    // Force avoid cache with direct img tag and timestamp
    const avatarSrc = `${user.avatar}${user.avatar.includes('?') ? '&' : '?'}t=${timestamp}`;
    console.log('Header - Generated avatar URL:', avatarSrc);
    
    return (
      <Box
        component="img"
        src={avatarSrc}
        alt={user.name}
        onError={(e) => {
          console.error("Error loading avatar image in header:", e);
          // If image fails to load, use initial
          if (!e.currentTarget.dataset.retried) {
            e.currentTarget.dataset.retried = 'true';
            // Retry with a different timestamp
            const retryTimestamp = new Date().getTime() + 100;
            // Add null check before using includes
            if (user.avatar) {
              e.currentTarget.src = `${user.avatar}${user.avatar.includes('?') ? '&' : '?'}t=${retryTimestamp}`;
            }
          } else {
            // If still failing, use initial avatar
            e.currentTarget.onerror = null;
            e.currentTarget.src = '';
          }
        }}
        sx={{ 
          width: isMobile ? 30 : 35, 
          height: isMobile ? 30 : 35,
          borderRadius: '50%',
          border: '2px solid',
          borderColor: user.role === 'admin' ? 'error.main' : 'primary.main',
          objectFit: 'cover'
        }}
      />
    );
  };

  // Common styles for consistent button/icon alignment
  const iconButtonStyle = {
    p: 1,
    height: '40px',
    width: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const navButtonStyle = {
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    px: 1.2,
    mx: 0.5,
    lineHeight: 1,
    fontSize: '0.95rem',
    fontWeight: 500,
    color: 'text.primary',
    whiteSpace: 'nowrap',
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '0%',
      height: '2px',
      backgroundColor: 'primary.main',
      transition: 'width 0.3s ease',
    },
    '&:hover': {
      backgroundColor: 'transparent',
      color: 'primary.main',
    },
    '&:hover::after': {
      width: '100%',
    },
    '&.active': {
      color: 'primary.main',
      fontWeight: 600,
    }
  };

  const authButtonStyle = {
    height: '36px',
    minHeight: '36px',
    minWidth: '100px',
    textTransform: 'none',
    lineHeight: 1,
    whiteSpace: 'nowrap',
    py: 0,
    borderRadius: '18px',
    fontWeight: 500
  };

  return (
    <>
      <AppBar position="sticky" color="default" elevation={1}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between', height: '64px' }}>
            {/* Logo */}
            <Typography
              variant="h6"
              component={Link}
              to="/"
              sx={{
                fontWeight: 700,
                color: 'primary.main',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                height: '40px',
                whiteSpace: 'nowrap',
                lineHeight: 1,
                minWidth: '160px'
              }}
            >
              <HomeIcon sx={{ mr: 1 }} />
              BĐS Việt Nam
            </Typography>
            
            {/* Desktop Navigation */}
            {!isMobile && (
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  height: '40px', 
                  justifyContent: 'center',
                  flexGrow: 1,
                  ml: -2
                }}
              >
                {menuItems.map((item) => (
                  <Button
                    key={item.path}
                    component={item.onClick ? 'button' : Link}
                    to={item.onClick ? undefined : item.path}
                    onClick={item.onClick}
                    sx={navButtonStyle}
                    className={
                      item.path.startsWith('#') 
                        ? location.hash === item.path ? 'active' : ''
                        : item.path.includes('listing_type=rent') && location.search.includes('listing_type=rent')
                          ? 'active'
                          : item.path.includes('listing_type=sale') && location.search.includes('listing_type=sale')
                            ? 'active'
                            : location.pathname === item.path ? 'active' : ''
                    }
                  >
                    {item.title}
                  </Button>
                ))}
              </Box>
            )}
            
            {/* User Actions Area */}
            {!isMobile && (
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  height: '40px',
                  minWidth: '160px',
                  justifyContent: 'flex-end'
                }}
              >
                {/* Authenticated user controls */}
                {isAuthenticated && user ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', height: '40px' }}>
                    <IconButton 
                      component={Link} 
                      to="/user/favorites"
                      color="primary"
                      sx={{ ...iconButtonStyle, mr: 1 }}
                    >
                      <Badge color="secondary">
                        <FavoriteIcon />
                      </Badge>
                    </IconButton>
                    
                    <NotificationMenu />
                    
                    <IconButton
                      onClick={handleUserMenuOpen}
                      sx={{ ...iconButtonStyle, p: 0.5 }}
                    >
                      {renderAvatar()}
                    </IconButton>
                    
                    <Menu
                      anchorEl={userMenuAnchorEl}
                      open={Boolean(userMenuAnchorEl)}
                      onClose={handleUserMenuClose}
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
                          mt: 1.5, 
                          width: 220, 
                          borderRadius: '8px',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                          overflow: 'visible',
                          '&:before': {
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            top: 0,
                            right: 14,
                            width: 10,
                            height: 10,
                            bgcolor: 'background.paper',
                            transform: 'translateY(-50%) rotate(45deg)',
                            zIndex: 0,
                          },
                        }
                      }}
                    >
                      <MenuItem 
                        component={Link} 
                        to="/ho-so" 
                        onClick={handleUserMenuClose}
                        sx={{ py: 1.2 }}
                      >
                        <PersonIcon sx={{ mr: 1.5, fontSize: 20, color: 'primary.main' }} /> 
                        <Typography sx={{ lineHeight: 1 }}>Hồ sơ cá nhân</Typography>
                      </MenuItem>
                      <MenuItem 
                        component={Link} 
                        to="/user/my-properties" 
                        onClick={handleUserMenuClose}
                        sx={{ py: 1.2 }}
                      >
                        <HomeIcon sx={{ mr: 1.5, fontSize: 20, color: 'primary.main' }} /> 
                        <Typography sx={{ lineHeight: 1 }}>Tin đã đăng</Typography>
                      </MenuItem>
                      <MenuItem 
                        component={Link} 
                        to="/user/favorites" 
                        onClick={handleUserMenuClose}
                        sx={{ py: 1.2 }}
                      >
                        <FavoriteIcon sx={{ mr: 1.5, fontSize: 20, color: 'primary.main' }} /> 
                        <Typography sx={{ lineHeight: 1 }}>Bất động sản yêu thích</Typography>
                      </MenuItem>
                      
                      {/* Admin Dashboard Link - Only visible for admin users */}
                      {user?.role === 'admin' && (
                        <MenuItem 
                          component={Link} 
                          to="/admin" 
                          onClick={handleUserMenuClose}
                          sx={{ py: 1.2 }}
                        >
                          <Box sx={{ color: 'error.main', display: 'flex', alignItems: 'center', width: '100%' }}>
                            <DashboardIcon sx={{ mr: 1.5, fontSize: 20 }} /> 
                            <Typography sx={{ lineHeight: 1 }}>Quản trị hệ thống</Typography>
                          </Box>
                        </MenuItem>
                      )}
                      
                      <Divider sx={{ my: 1 }} />
                      <MenuItem 
                        onClick={handleLogout}
                        sx={{ py: 1.2 }}
                      >
                        <Box sx={{ color: 'error.main', display: 'flex', alignItems: 'center' }}>
                          <PersonIcon sx={{ mr: 1.5, fontSize: 20 }} /> 
                          <Typography sx={{ lineHeight: 1 }}>Đăng xuất</Typography>
                        </Box>
                      </MenuItem>
                    </Menu>
                  </Box>
                ) : (
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    height: '40px',
                    justifyContent: 'flex-end'
                  }}>
                    <IconButton 
                      onClick={handleLoginClick}
                      color="primary"
                      sx={{ ...iconButtonStyle, mr: 1 }}
                      title="Yêu thích - Đăng nhập để sử dụng"
                    >
                      <Badge color="secondary">
                        <FavoriteIcon />
                      </Badge>
                    </IconButton>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', height: '40px' }}>
                      <Button
                        variant="outlined" 
                        onClick={handleLoginClick}
                        sx={{ 
                          ...authButtonStyle,
                          mr: 1
                        }}
                      >
                        Đăng nhập
                      </Button>
                      <Button
                        variant="contained" 
                        onClick={handleRegisterClick}
                        color="primary"
                        sx={authButtonStyle}
                      >
                        Đăng ký
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>
            )}
            
            {/* Mobile Navigation */}
            {isMobile && (
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  height: '40px',
                  flexGrow: 1,
                  justifyContent: 'flex-end'
                }}
              >
                {isAuthenticated && user ? (
                  <Box sx={{ mr: 1, display: 'flex', alignItems: 'center', height: '40px' }}>
                    <IconButton 
                      component={Link} 
                      to="/user/favorites"
                      color="primary"
                      sx={{ ...iconButtonStyle, p: 0.8 }}
                    >
                      <Badge color="secondary">
                        <FavoriteIcon fontSize="small" />
                      </Badge>
                    </IconButton>
                  </Box>
                ) : (
                  <Box sx={{ mr: 1, display: 'flex', alignItems: 'center', height: '40px' }}>
                    <IconButton 
                      onClick={handleLoginClick}
                      color="primary"
                      sx={{ ...iconButtonStyle, p: 0.8 }}
                      title="Yêu thích - Đăng nhập để sử dụng"
                    >
                      <Badge color="secondary">
                        <FavoriteIcon fontSize="small" />
                      </Badge>
                    </IconButton>
                  </Box>
                )}
                
                <IconButton
                  edge="end"
                  color="inherit"
                  aria-label="menu"
                  onClick={handleMobileMenuOpen}
                  sx={{ ...iconButtonStyle, p: 0.8 }}
                >
                  <MenuIcon />
                </IconButton>
                
                <Menu
                  anchorEl={mobileMenuAnchorEl}
                  open={Boolean(mobileMenuAnchorEl)}
                  onClose={handleMobileMenuClose}
                  PaperProps={{
                    sx: { 
                      width: 240,
                      mt: 1,
                      borderRadius: '8px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  {menuItems.map((item) => {
                    // Common styling for menu items
                    const menuItemSx = {
                      py: 1.5, 
                      lineHeight: 1, 
                      whiteSpace: 'nowrap',
                      borderLeft: (item.path.startsWith('#') ? location.hash === item.path : location.pathname === item.path) 
                        ? '3px solid' 
                        : '3px solid transparent',
                      borderColor: (item.path.startsWith('#') ? location.hash === item.path : location.pathname === item.path) 
                        ? 'primary.main' 
                        : 'transparent',
                      bgcolor: (item.path.startsWith('#') ? location.hash === item.path : location.pathname === item.path) 
                        ? 'rgba(25, 118, 210, 0.08)' 
                        : 'transparent',
                      pl: (item.path.startsWith('#') ? location.hash === item.path : location.pathname === item.path) 
                        ? 2 
                        : 2.3,
                      transition: 'all 0.2s ease'
                    };

                    // Menu item content (icon and text)
                    const menuItemContent = (
                      <>
                        {React.isValidElement(item.icon) ? 
                          React.cloneElement(item.icon, {
                            ...(location.pathname === item.path ? {color: 'primary'} : {color: 'inherit'}) as any,
                            sx: { fontSize: '1.2rem' }
                          }) : 
                          item.icon
                        }
                        <Typography 
                          sx={{ 
                            ml: 1.5, 
                            lineHeight: 1,
                            fontWeight: location.pathname === item.path ? 600 : 400,
                            color: location.pathname === item.path ? 'primary.main' : 'inherit'
                          }}
                        >
                          {item.title}
                        </Typography>
                      </>
                    );
                    
                    // Return the appropriate MenuItem based on whether it has onClick or not
                    return item.onClick ? (
                      <MenuItem
                        key={item.path}
                        onClick={(e: React.MouseEvent<HTMLLIElement>) => {
                          item.onClick && item.onClick(e);
                          handleMobileMenuClose();
                        }}
                        sx={menuItemSx}
                      >
                        {menuItemContent}
                      </MenuItem>
                    ) : (
                      <MenuItem
                        key={item.path}
                        component={Link}
                        to={item.path}
                        onClick={() => handleMobileMenuClose()}
                        sx={menuItemSx}
                      >
                        {menuItemContent}
                      </MenuItem>
                    );
                  })}
                  
                  {/* Admin Dashboard Link in Mobile Menu - Only visible for admin users */}
                  {isAuthenticated && user?.role === 'admin' && (
                    <MenuItem
                      component={Link}
                      to="/admin"
                      onClick={handleMobileMenuClose}
                      sx={{ 
                        py: 1.5, 
                        lineHeight: 1, 
                        whiteSpace: 'nowrap',
                        borderLeft: location.pathname === '/admin' ? '3px solid' : '3px solid transparent',
                        borderColor: location.pathname === '/admin' ? 'error.main' : 'transparent',
                        bgcolor: location.pathname === '/admin' ? 'rgba(211, 47, 47, 0.08)' : 'transparent',
                        pl: location.pathname === '/admin' ? 2 : 2.3,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <DashboardIcon
                        color={location.pathname === '/admin' ? 'error' : 'inherit'}
                        sx={{ fontSize: '1.2rem' }}
                      />
                      <Typography sx={{ ml: 2, color: 'error.main', fontWeight: 'medium' }}>Quản trị hệ thống</Typography>
                    </MenuItem>
                  )}
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Box sx={{ borderTop: '1px solid', borderColor: 'divider', mt: 1 }}>
                    {isAuthenticated && user ? (
                      <>
                        <MenuItem component={Link} to="/ho-so" onClick={handleMobileMenuClose}>
                          <PersonIcon sx={{ mr: 1 }} /> 
                          <Typography sx={{ lineHeight: 1 }}>Hồ sơ cá nhân</Typography>
                        </MenuItem>
                        <MenuItem component={Link} to="/user/my-properties" onClick={handleMobileMenuClose}>
                          <HomeIcon sx={{ mr: 1 }} /> 
                          <Typography sx={{ lineHeight: 1 }}>Tin đã đăng</Typography>
                        </MenuItem>
                        <MenuItem component={Link} to="/user/favorites" onClick={handleMobileMenuClose}>
                          <FavoriteIcon sx={{ mr: 1 }} /> 
                          <Typography sx={{ lineHeight: 1 }}>Bất động sản yêu thích</Typography>
                        </MenuItem>
                        <MenuItem onClick={handleLogout}>
                          <Box sx={{ color: 'error.main', display: 'flex', alignItems: 'center' }}>
                            <PersonIcon sx={{ mr: 1 }} /> 
                            <Typography sx={{ lineHeight: 1 }}>Đăng xuất</Typography>
                          </Box>
                        </MenuItem>
                      </>
                    ) : (
                      <>
                        <MenuItem onClick={(e) => { handleMobileMenuClose(); handleLoginClick(); }}>
                          <PersonIcon sx={{ mr: 1 }} /> 
                          <Typography sx={{ lineHeight: 1 }}>Đăng nhập</Typography>
                        </MenuItem>
                        <MenuItem onClick={(e) => { handleMobileMenuClose(); handleRegisterClick(); }}>
                          <PersonIcon sx={{ mr: 1 }} /> 
                          <Typography sx={{ lineHeight: 1 }}>Đăng ký</Typography>
                        </MenuItem>
                      </>
                    )}
                  </Box>
                </Menu>
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>
      
      {/* Global announcements from admin */}
      <GlobalAnnouncement />
    </>
  );
};

export default Header; 