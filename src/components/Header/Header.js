import React from 'react';
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
  useTheme
} from '@mui/material';
import { 
  Home, 
  Search, 
  Favorite, 
  Person, 
  Phone, 
  PostAdd,
  Menu as MenuIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = React.useState(null);
  const dispatch = useDispatch();
  
  const favorites = useSelector(state => state.favorites.items);
  const { isAuthenticated, user } = useSelector(state => state.auth);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    handleMenuClose();
  };

  return (
    <AppBar position="static" color="transparent" elevation={0} sx={{ py: 2 }}>
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
              <IconButton
                edge="end"
                color="inherit"
                aria-label="menu"
                onClick={handleMenuOpen}
                sx={{ ml: 'auto' }}
              >
                <MenuIcon />
              </IconButton>
              
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
                <MenuItem component={Link} to="/" onClick={handleMenuClose}>
                  <Home sx={{ mr: 1 }} /> Trang chủ
                </MenuItem>
                <MenuItem component={Link} to="/properties" onClick={handleMenuClose}>
                  <Search sx={{ mr: 1 }} /> Tìm kiếm
                </MenuItem>
                
                {isAuthenticated && (
                  <MenuItem component={Link} to="/post-management" onClick={handleMenuClose}>
                    <PostAdd sx={{ mr: 1 }} /> Đăng bài
                  </MenuItem>
                )}
                
                <MenuItem component={Link} to="/favorites" onClick={handleMenuClose}>
                  <Badge badgeContent={favorites.length} color="error" sx={{ mr: 1 }}>
                    <Favorite />
                  </Badge>
                  Yêu thích
                </MenuItem>
                
                {isAuthenticated ? (
                  <>
                    <MenuItem component={Link} to="/profile" onClick={handleMenuClose}>
                      <Avatar sx={{ width: 24, height: 24, mr: 1 }} /> Tài khoản
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
                      <Person sx={{ mr: 1 }} /> Đăng xuất
                    </MenuItem>
                  </>
                ) : (
                  <>
                    <MenuItem component={Link} to="/login" onClick={handleMenuClose}>
                      <Person sx={{ mr: 1 }} /> Đăng nhập
                    </MenuItem>
                    <MenuItem 
                      component={Link} 
                      to="/register" 
                      onClick={handleMenuClose}
                      sx={{ color: 'primary.main' }}
                    >
                      Đăng ký
                    </MenuItem>
                  </>
                )}
              </Menu>
            </>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Navigation Links */}
              <Button color="inherit" component={Link} to="/" startIcon={<Home />}>
                Trang chủ
              </Button>
              <Button color="inherit" component={Link} to="/properties" startIcon={<Search />}>
                Tìm kiếm
              </Button>
              
              {isAuthenticated && (
                <Button color="inherit" component={Link} to="/post-management" startIcon={<PostAdd />}>
                  Đăng bài
                </Button>
              )}
              
              <Button 
                color="inherit" 
                component={Link} 
                to="/favorites" 
                startIcon={
                  <Badge badgeContent={favorites.length} color="error">
                    <Favorite />
                  </Badge>
                }
              >
                Yêu thích
              </Button>

              {/* Auth Section */}
              {isAuthenticated ? (
                <>
                  <IconButton component={Link} to="/profile" sx={{ ml: 1 }}>
                    <Avatar 
                      sx={{ width: 32, height: 32 }} 
                      alt={user?.name} 
                      src={user?.avatar} 
                    />
                  </IconButton>
                  <Button color="inherit" onClick={handleLogout}>
                    Đăng xuất
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    color="inherit" 
                    component={Link} 
                    to="/login" 
                    startIcon={<Person />}
                  >
                    Đăng nhập
                  </Button>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    component={Link}
                    to="/register"
                  >
                    Đăng ký
                  </Button>
                </>
              )}

              <Button 
                variant="outlined" 
                color="primary" 
                component={Link}
                to="/contact"
                startIcon={<Phone />}
                sx={{ ml: 1 }}
              >
                Liên hệ
              </Button>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;