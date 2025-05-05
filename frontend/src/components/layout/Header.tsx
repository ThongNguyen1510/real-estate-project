import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Favorite as FavoriteIcon, 
  Search as SearchIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  Info as InfoIcon,
  ContactSupport as ContactIcon,
  Article as NewsIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  
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
  
  const menuItems = [
    { title: 'Trang chủ', path: '/', icon: <HomeIcon /> },
    { title: 'Mua bán', path: '/mua-ban', icon: <SearchIcon /> },
    { title: 'Cho thuê', path: '/cho-thue', icon: <HomeIcon /> },
    { title: 'Đăng tin', path: '/dang-tin', icon: <AddIcon /> },
    { title: 'Tin tức', path: '/tin-tuc', icon: <NewsIcon /> },
    { title: 'Giới thiệu', path: '/gioi-thieu', icon: <InfoIcon /> },
    { title: 'Liên hệ', path: '/lien-he', icon: <ContactIcon /> },
  ];

  // Avatar rendering with cache busting
  const renderAvatar = () => {
    if (!user) return <PersonIcon />;
    
    console.log('Header - Rendering avatar for user:', user.name);
    console.log('Header - Avatar path from user object:', user.avatar);
    
    const timestamp = new Date().getTime();
    
    if (!user.avatar) {
      return (
        <Avatar 
          alt={user.name}
          sx={{ 
            width: isMobile ? 30 : 35, 
            height: isMobile ? 30 : 35,
            border: '2px solid',
            borderColor: 'primary.main'
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
          borderColor: 'primary.main',
          objectFit: 'cover'
        }}
      />
    );
  };

  return (
    <AppBar position="sticky" color="default" elevation={1}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
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
            }}
          >
            <HomeIcon sx={{ mr: 1 }} />
            BĐSN Việt Nam
          </Typography>
          
          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {menuItems.map((item) => (
                <Button
                  key={item.path}
                  component={Link}
                  to={item.path}
                  sx={{ 
                    mx: 1,
                    position: 'relative',
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
                    '&:hover::after': {
                      width: '100%',
                    }
                  }}
                >
                  {item.title}
                </Button>
              ))}
              
              {/* Authenticated user controls */}
              {isAuthenticated && user ? (
                <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                  <IconButton 
                    component={Link} 
                    to="/yeu-thich"
                    color="primary"
                    sx={{ mr: 1 }}
                  >
                    <Badge badgeContent={3} color="secondary">
                      <FavoriteIcon />
                    </Badge>
                  </IconButton>
                  
                  <IconButton 
                    component={Link} 
                    to="/thong-bao"
                    color="primary"
                    sx={{ mr: 2 }}
                  >
                    <Badge badgeContent={5} color="secondary">
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                  
                  <IconButton
                    onClick={handleUserMenuOpen}
                    sx={{ p: 0 }}
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
                      sx: { mt: 1.5, width: 200 }
                    }}
                  >
                    <MenuItem component={Link} to="/ho-so" onClick={handleUserMenuClose}>
                      <PersonIcon sx={{ mr: 1, fontSize: 20 }} /> Hồ sơ cá nhân
                    </MenuItem>
                    <MenuItem component={Link} to="/user/my-properties" onClick={handleUserMenuClose}>
                      <HomeIcon sx={{ mr: 1, fontSize: 20 }} /> Tin đã đăng
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
                      <Box sx={{ color: 'error.main', display: 'flex', alignItems: 'center' }}>
                        <PersonIcon sx={{ mr: 1, fontSize: 20 }} /> Đăng xuất
                      </Box>
                    </MenuItem>
                  </Menu>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', ml: 2 }}>
                  <Button 
                    variant="outlined" 
                    onClick={handleLoginClick}
                    sx={{ mr: 1 }}
                  >
                    Đăng nhập
                  </Button>
                  <Button 
                    variant="contained" 
                    onClick={handleRegisterClick}
                    color="primary"
                  >
                    Đăng ký
                  </Button>
                </Box>
              )}
            </Box>
          )}
          
          {/* Mobile Navigation */}
          {isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {isAuthenticated && user && (
                <Box sx={{ mr: 1 }}>
                  <IconButton 
                    component={Link} 
                    to="/yeu-thich"
                    color="primary"
                    size="small"
                  >
                    <Badge badgeContent={3} color="secondary">
                      <FavoriteIcon fontSize="small" />
                    </Badge>
                  </IconButton>
                  
                  <IconButton 
                    component={Link} 
                    to="/thong-bao"
                    color="primary"
                    size="small"
                  >
                    <Badge badgeContent={5} color="secondary">
                      <NotificationsIcon fontSize="small" />
                    </Badge>
                  </IconButton>
                </Box>
              )}
              
              <IconButton
                edge="end"
                color="inherit"
                aria-label="menu"
                onClick={handleMobileMenuOpen}
              >
                <MenuIcon />
              </IconButton>
              
              <Menu
                anchorEl={mobileMenuAnchorEl}
                open={Boolean(mobileMenuAnchorEl)}
                onClose={handleMobileMenuClose}
                PaperProps={{
                  sx: { width: 250 }
                }}
              >
                {menuItems.map((item) => (
                  <MenuItem 
                    key={item.path}
                    component={Link}
                    to={item.path}
                    onClick={handleMobileMenuClose}
                    sx={{ py: 1.5 }}
                  >
                    {item.icon}
                    <Typography sx={{ ml: 1 }}>{item.title}</Typography>
                  </MenuItem>
                ))}
                
                <Box sx={{ borderTop: '1px solid', borderColor: 'divider', mt: 1 }}>
                  {isAuthenticated && user ? (
                    <>
                      <MenuItem component={Link} to="/ho-so" onClick={handleMobileMenuClose}>
                        <PersonIcon sx={{ mr: 1 }} /> Hồ sơ cá nhân
                      </MenuItem>
                      <MenuItem component={Link} to="/user/my-properties" onClick={handleMobileMenuClose}>
                        <HomeIcon sx={{ mr: 1 }} /> Tin đã đăng
                      </MenuItem>
                      <MenuItem onClick={handleLogout}>
                        <Box sx={{ color: 'error.main', display: 'flex', alignItems: 'center' }}>
                          <PersonIcon sx={{ mr: 1 }} /> Đăng xuất
                        </Box>
                      </MenuItem>
                    </>
                  ) : (
                    <>
                      <MenuItem onClick={(e) => { handleMobileMenuClose(); handleLoginClick(); }}>
                        <PersonIcon sx={{ mr: 1 }} /> Đăng nhập
                      </MenuItem>
                      <MenuItem onClick={(e) => { handleMobileMenuClose(); handleRegisterClick(); }}>
                        <PersonIcon sx={{ mr: 1 }} /> Đăng ký
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
  );
};

export default Header; 