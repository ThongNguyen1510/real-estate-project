import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Avatar, 
  Box, 
  Tab, 
  Tabs, 
  Divider, 
  Alert, 
  IconButton,
  Badge,
  Snackbar,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useTheme,
  FormControlLabel,
  Switch,
  Chip
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  Home,
  Edit,
  Save,
  PhotoCamera,
  Security,
  Notifications,
  BookmarkBorder,
  PostAdd,
  Favorite,
  History,
  VerifiedUser
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from '@mui/material/styles';
import { loginSuccess } from '../../store/authSlice';
import { useNavigate } from 'react-router-dom';
import NotificationTester from '../../components/NotificationTester/NotificationTester';
import VerifyUser from '../../components/VerifyUser';

// Styled component for file input
const Input = styled('input')({
  display: 'none',
});

const Profile = () => {
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    avatar: null
  });
  
  // Load user data
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (user) {
      setProfileData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        bio: user.bio || '',
        avatar: user.avatar || null
      });
    }
  }, [user, isAuthenticated, navigate]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };
  
  const handleAvatarUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // In a real app, you would upload this to a server
      // For now, just create a local URL
      const avatarUrl = URL.createObjectURL(file);
      
      setProfileData({
        ...profileData,
        avatar: avatarUrl
      });
    }
  };
  
  const handleSaveProfile = () => {
    // Validation
    if (!profileData.fullName.trim()) {
      setNotification({
        open: true,
        message: 'Vui lòng nhập họ tên',
        severity: 'error'
      });
      return;
    }
    
    // Phone validation
    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (profileData.phone && !phoneRegex.test(profileData.phone)) {
      setNotification({
        open: true,
        message: 'Số điện thoại không hợp lệ',
        severity: 'error'
      });
      return;
    }
    
    // Email validation
    if (profileData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      setNotification({
        open: true,
        message: 'Email không hợp lệ',
        severity: 'error'
      });
      return;
    }
    
    // In a real app, you would send this to a server
    // For now, just update the local state
    const updatedUser = {
      ...user,
      ...profileData
    };
    
    // Update Redux store
    dispatch(loginSuccess(updatedUser));
    
    setEditMode(false);
    setNotification({
      open: true,
      message: 'Cập nhật thông tin thành công',
      severity: 'success'
    });
  };
  
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Grid container spacing={4}>
        {/* Left sidebar with profile summary */}
        <Grid item xs={12} md={3}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              mb: 3, 
              borderRadius: 2,
              background: `linear-gradient(to bottom, ${theme.palette.primary.light}15, #ffffff)`,
              border: '1px solid',
              borderColor: 'divider',
              transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
              '&:hover': {
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                transform: 'translateY(-4px)'
              }
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  editMode && (
                    <label htmlFor="icon-button-file">
                      <Input accept="image/*" id="icon-button-file" type="file" onChange={handleAvatarUpload} />
                      <IconButton
                        color="primary"
                        aria-label="upload picture"
                        component="span"
                        sx={{
                          backgroundColor: 'white',
                          '&:hover': { backgroundColor: '#f5f5f5' }
                        }}
                      >
                        <PhotoCamera />
                      </IconButton>
                    </label>
                  )
                }
              >
                <Avatar
                  src={profileData.avatar}
                  alt={profileData.fullName}
                  sx={{
                    width: 120,
                    height: 120,
                    mb: 2,
                    border: `3px solid ${theme.palette.primary.main}`,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                  }}
                />
              </Badge>
              <Typography variant="h5" sx={{ mb: 0.5, fontWeight: 'bold' }}>
                {profileData.fullName}
              </Typography>
              {user.isVerified && (
                <Chip
                  icon={<VerifiedUser fontSize="small" />}
                  label="Đã xác thực"
                  color="success"
                  size="small"
                  sx={{ mb: 2 }}
                />
              )}
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center', fontStyle: 'italic' }}>
                {profileData.bio || "Chưa cập nhật thông tin giới thiệu"}
              </Typography>
              
              {!editMode && (
                <Button
                  variant="contained"
                  startIcon={<Edit />}
                  onClick={() => setEditMode(true)}
                  fullWidth
                  sx={{
                    borderRadius: '24px',
                    textTransform: 'none',
                    py: 1
                  }}
                >
                  Chỉnh sửa hồ sơ
                </Button>
              )}
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            <List dense>
              <ListItem 
                button 
                selected={tabValue === 0}
                onClick={() => setTabValue(0)}
                sx={{ 
                  borderRadius: 1,
                  mb: 1,
                  '&.Mui-selected': {
                    backgroundColor: `${theme.palette.primary.main}15`,
                  },
                  '&:hover': {
                    backgroundColor: `${theme.palette.primary.main}25`,
                  }
                }}
              >
                <ListItemIcon>
                  <Person color={tabValue === 0 ? "primary" : "inherit"} />
                </ListItemIcon>
                <ListItemText 
                  primary="Thông tin cá nhân" 
                  secondary="Xem và cập nhật thông tin cá nhân"
                  primaryTypographyProps={{ 
                    fontWeight: tabValue === 0 ? 'bold' : 'normal',
                    color: tabValue === 0 ? 'primary.main' : 'inherit'
                  }}
                />
              </ListItem>
              
              <ListItem 
                button
                selected={tabValue === 1}
                onClick={() => setTabValue(1)}
                sx={{ 
                  borderRadius: 1,
                  mb: 1,
                  '&.Mui-selected': {
                    backgroundColor: `${theme.palette.primary.main}15`,
                  },
                  '&:hover': {
                    backgroundColor: `${theme.palette.primary.main}25`,
                  }
                }}
              >
                <ListItemIcon>
                  <PostAdd color={tabValue === 1 ? "primary" : "inherit"} />
                </ListItemIcon>
                <ListItemText 
                  primary="Tin đã đăng" 
                  secondary="Quản lý tin bất động sản của bạn"
                  primaryTypographyProps={{ 
                    fontWeight: tabValue === 1 ? 'bold' : 'normal',
                    color: tabValue === 1 ? 'primary.main' : 'inherit'
                  }}
                />
              </ListItem>
              
              <ListItem 
                button
                selected={tabValue === 2}
                onClick={() => setTabValue(2)}
                sx={{ 
                  borderRadius: 1,
                  mb: 1,
                  '&.Mui-selected': {
                    backgroundColor: `${theme.palette.primary.main}15`,
                  },
                  '&:hover': {
                    backgroundColor: `${theme.palette.primary.main}25`,
                  }
                }}
              >
                <ListItemIcon>
                  <Favorite color={tabValue === 2 ? "primary" : "inherit"} />
                </ListItemIcon>
                <ListItemText 
                  primary="Tin đã lưu" 
                  secondary="Xem các tin bất động sản đã lưu"
                  primaryTypographyProps={{ 
                    fontWeight: tabValue === 2 ? 'bold' : 'normal',
                    color: tabValue === 2 ? 'primary.main' : 'inherit'
                  }}
                />
              </ListItem>
              
              <ListItem 
                button
                selected={tabValue === 3}
                onClick={() => setTabValue(3)}
                sx={{ 
                  borderRadius: 1,
                  mb: 1,
                  '&.Mui-selected': {
                    backgroundColor: `${theme.palette.primary.main}15`,
                  },
                  '&:hover': {
                    backgroundColor: `${theme.palette.primary.main}25`,
                  }
                }}
              >
                <ListItemIcon>
                  <Security color={tabValue === 3 ? "primary" : "inherit"} />
                </ListItemIcon>
                <ListItemText 
                  primary="Bảo mật" 
                  secondary="Mật khẩu và thiết lập bảo mật"
                  primaryTypographyProps={{ 
                    fontWeight: tabValue === 3 ? 'bold' : 'normal',
                    color: tabValue === 3 ? 'primary.main' : 'inherit'
                  }}
                />
              </ListItem>
              
              <ListItem 
                button
                selected={tabValue === 4}
                onClick={() => setTabValue(4)}
                sx={{ 
                  borderRadius: 1,
                  mb: 1,
                  '&.Mui-selected': {
                    backgroundColor: `${theme.palette.primary.main}15`,
                  },
                  '&:hover': {
                    backgroundColor: `${theme.palette.primary.main}25`,
                  }
                }}
              >
                <ListItemIcon>
                  <VerifiedUser color={tabValue === 4 ? "primary" : "inherit"} />
                </ListItemIcon>
                <ListItemText 
                  primary="Xác thực tài khoản" 
                  secondary="Xác thực danh tính và chứng chỉ"
                  primaryTypographyProps={{ 
                    fontWeight: tabValue === 4 ? 'bold' : 'normal',
                    color: tabValue === 4 ? 'primary.main' : 'inherit'
                  }}
                />
              </ListItem>
              
              <ListItem 
                button
                selected={tabValue === 5}
                onClick={() => setTabValue(5)}
                sx={{ 
                  borderRadius: 1,
                  mb: 1,
                  '&.Mui-selected': {
                    backgroundColor: `${theme.palette.primary.main}15`,
                  },
                  '&:hover': {
                    backgroundColor: `${theme.palette.primary.main}25`,
                  }
                }}
              >
                <ListItemIcon>
                  <Notifications color={tabValue === 5 ? "primary" : "inherit"} />
                </ListItemIcon>
                <ListItemText 
                  primary="Thông báo" 
                  secondary="Quản lý thông báo của bạn"
                  primaryTypographyProps={{ 
                    fontWeight: tabValue === 5 ? 'bold' : 'normal',
                    color: tabValue === 5 ? 'primary.main' : 'inherit'
                  }}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
        
        {/* Main content area */}
        <Grid item xs={12} md={9}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              minHeight: '70vh'
            }}
          >
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="scrollable"
              scrollButtons="auto"
              sx={{ 
                mb: 4,
                '& .MuiTab-root': {
                  minHeight: '60px',
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.95rem'
                }
              }}
            >
              <Tab icon={<Person />} label="Thông tin cá nhân" iconPosition="start" />
              <Tab icon={<PostAdd />} label="Tin đã đăng" iconPosition="start" />
              <Tab icon={<Favorite />} label="Tin đã lưu" iconPosition="start" />
              <Tab icon={<Security />} label="Bảo mật" iconPosition="start" />
              <Tab icon={<VerifiedUser />} label="Xác thực tài khoản" iconPosition="start" />
              <Tab icon={<Notifications />} label="Thông báo" iconPosition="start" />
            </Tabs>
            
            {/* Personal Information Tab */}
            {tabValue === 0 && (
              <Box sx={{ animation: 'fadeIn 0.5s ease-in-out', '@keyframes fadeIn': { from: { opacity: 0 }, to: { opacity: 1 } } }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  mb: 4,
                  pb: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider'
                }}>
                  <Typography variant="h5" fontWeight="bold" color="primary.main">
                    Thông tin cá nhân
                  </Typography>
                  {!editMode ? (
                    <Button
                      variant="outlined"
                      startIcon={<Edit />}
                      onClick={() => setEditMode(true)}
                      sx={{
                        borderRadius: '20px',
                        textTransform: 'none'
                      }}
                    >
                      Chỉnh sửa
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={handleSaveProfile}
                      sx={{
                        borderRadius: '20px',
                        textTransform: 'none'
                      }}
                    >
                      Lưu thay đổi
                    </Button>
                  )}
                </Box>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Họ và tên"
                      name="fullName"
                      value={profileData.fullName}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      required
                      InputProps={{
                        startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={profileData.email}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      InputProps={{
                        startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Số điện thoại"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      InputProps={{
                        startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Địa chỉ"
                      name="address"
                      value={profileData.address}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      InputProps={{
                        startAdornment: <Home sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Giới thiệu bản thân"
                      name="bio"
                      value={profileData.bio}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      multiline
                      rows={4}
                      placeholder="Giới thiệu ngắn về bản thân (công việc, sở thích, v.v.)"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
            
            {/* My Properties Tab */}
            {tabValue === 1 && (
              <Box sx={{ animation: 'fadeIn 0.5s ease-in-out', '@keyframes fadeIn': { from: { opacity: 0 }, to: { opacity: 1 } } }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  mb: 4,
                  pb: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider'
                }}>
                  <Typography variant="h5" fontWeight="bold" color="primary.main">
                    Tin bất động sản đã đăng
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PostAdd />}
                    onClick={() => navigate('/post-management')}
                    sx={{
                      borderRadius: '20px',
                      textTransform: 'none'
                    }}
                  >
                    Đăng tin mới
                  </Button>
                </Box>
                
                <Alert 
                  severity="info" 
                  sx={{ 
                    mb: 4,
                    borderRadius: '10px',
                    '& .MuiAlert-icon': {
                      fontSize: '1.5rem'
                    }
                  }}
                >
                  <Typography variant="body1">
                    Bạn có thể quản lý tất cả các tin đăng của mình tại trang Quản lý tin đăng.
                  </Typography>
                </Alert>
                
                <Button 
                  variant="outlined" 
                  onClick={() => navigate('/post-management')}
                  fullWidth
                  sx={{
                    py: 1.5,
                    borderRadius: '20px',
                    textTransform: 'none',
                    fontWeight: 500
                  }}
                >
                  Đi đến trang quản lý tin đăng
                </Button>
              </Box>
            )}
            
            {/* Saved Properties Tab */}
            {tabValue === 2 && (
              <Box sx={{ animation: 'fadeIn 0.5s ease-in-out', '@keyframes fadeIn': { from: { opacity: 0 }, to: { opacity: 1 } } }}>
                <Box sx={{ 
                  mb: 4,
                  pb: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider'
                }}>
                  <Typography variant="h5" fontWeight="bold" color="primary.main">
                    Tin bất động sản đã lưu
                  </Typography>
                </Box>
                
                <Alert 
                  severity="info" 
                  sx={{ 
                    mb: 4,
                    borderRadius: '10px',
                    '& .MuiAlert-icon': {
                      fontSize: '1.5rem'
                    }
                  }}
                >
                  <Typography variant="body1">
                    Bạn có thể xem tất cả các tin đã lưu tại trang Yêu thích.
                  </Typography>
                </Alert>
                
                <Button 
                  variant="outlined" 
                  onClick={() => navigate('/favorites')}
                  fullWidth
                  sx={{
                    py: 1.5,
                    borderRadius: '20px',
                    textTransform: 'none',
                    fontWeight: 500
                  }}
                >
                  Đi đến trang yêu thích
                </Button>
              </Box>
            )}
            
            {/* Security Tab */}
            {tabValue === 3 && (
              <Box sx={{ animation: 'fadeIn 0.5s ease-in-out', '@keyframes fadeIn': { from: { opacity: 0 }, to: { opacity: 1 } } }}>
                <Box sx={{ 
                  mb: 4,
                  pb: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider'
                }}>
                  <Typography variant="h5" fontWeight="bold" color="primary.main">
                    Cài đặt bảo mật
                  </Typography>
                </Box>
                
                <Card 
                  variant="outlined" 
                  sx={{ 
                    mb: 4,
                    borderRadius: '16px',
                    overflow: 'hidden',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <CardHeader 
                    title="Thay đổi mật khẩu" 
                    titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                    sx={{
                      backgroundColor: `${theme.palette.primary.main}10`,
                      borderBottom: '1px solid',
                      borderColor: 'divider'
                    }}
                  />
                  <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Mật khẩu hiện tại"
                          type="password"
                          name="currentPassword"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px'
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Mật khẩu mới"
                          type="password"
                          name="newPassword"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px'
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Xác nhận mật khẩu mới"
                          type="password"
                          name="confirmPassword"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px'
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button 
                          variant="contained" 
                          color="primary"
                          sx={{
                            py: 1,
                            px: 3,
                            borderRadius: '20px',
                            textTransform: 'none',
                            fontWeight: 500
                          }}
                        >
                          Cập nhật mật khẩu
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
                
                <Card 
                  variant="outlined"
                  sx={{ 
                    borderRadius: '16px',
                    overflow: 'hidden',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <CardHeader 
                    title="Cài đặt bảo mật khác" 
                    titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                    sx={{
                      backgroundColor: `${theme.palette.primary.main}10`,
                      borderBottom: '1px solid',
                      borderColor: 'divider'
                    }}
                  />
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="body1" color="text.secondary">
                      Các cài đặt bảo mật khác sẽ được cập nhật trong phiên bản tiếp theo.
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            )}
            
            {/* Verification Tab */}
            {tabValue === 4 && (
              <Box sx={{ animation: 'fadeIn 0.5s ease-in-out', '@keyframes fadeIn': { from: { opacity: 0 }, to: { opacity: 1 } } }}>
                <VerifyUser />
              </Box>
            )}
            
            {/* Notifications Tab */}
            {tabValue === 5 && (
              <Box sx={{ animation: 'fadeIn 0.5s ease-in-out', '@keyframes fadeIn': { from: { opacity: 0 }, to: { opacity: 1 } } }}>
                <Box sx={{ 
                  mb: 4,
                  pb: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider'
                }}>
                  <Typography variant="h5" fontWeight="bold" color="primary.main">
                    Quản lý thông báo
                  </Typography>
                </Box>
                
                <Card 
                  sx={{ 
                    mb: 4,
                    borderRadius: '16px',
                    overflow: 'hidden',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <CardHeader 
                    title="Cài đặt thông báo"
                    titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                    sx={{
                      backgroundColor: `${theme.palette.primary.main}10`,
                      borderBottom: '1px solid',
                      borderColor: 'divider'
                    }}
                  />
                  <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Switch 
                              defaultChecked 
                              color="primary"
                              sx={{ 
                                '& .MuiSwitch-switchBase.Mui-checked': {
                                  color: theme.palette.primary.main
                                },
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                  backgroundColor: theme.palette.primary.main
                                }
                              }}
                            />
                          }
                          label={<Typography variant="body1">Thông báo qua email</Typography>}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Switch 
                              defaultChecked 
                              color="primary"
                              sx={{ 
                                '& .MuiSwitch-switchBase.Mui-checked': {
                                  color: theme.palette.primary.main
                                },
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                  backgroundColor: theme.palette.primary.main
                                }
                              }}
                            />
                          }
                          label={<Typography variant="body1">Thông báo trong ứng dụng</Typography>}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Switch 
                              color="primary"
                              sx={{ 
                                '& .MuiSwitch-switchBase.Mui-checked': {
                                  color: theme.palette.primary.main
                                },
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                  backgroundColor: theme.palette.primary.main
                                }
                              }}
                            />
                          }
                          label={<Typography variant="body1">Thông báo qua SMS</Typography>}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
                
                <Card 
                  sx={{ 
                    mb: 4,
                    borderRadius: '16px',
                    overflow: 'hidden',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <CardHeader 
                    title="Loại thông báo"
                    titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                    sx={{
                      backgroundColor: `${theme.palette.primary.main}10`,
                      borderBottom: '1px solid',
                      borderColor: 'divider'
                    }}
                  />
                  <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Switch 
                              defaultChecked 
                              color="primary"
                              sx={{ 
                                '& .MuiSwitch-switchBase.Mui-checked': {
                                  color: theme.palette.primary.main
                                },
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                  backgroundColor: theme.palette.primary.main
                                }
                              }}
                            />
                          }
                          label={<Typography variant="body1">Thông báo về tin đăng đã lưu</Typography>}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Switch 
                              defaultChecked 
                              color="primary"
                              sx={{ 
                                '& .MuiSwitch-switchBase.Mui-checked': {
                                  color: theme.palette.primary.main
                                },
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                  backgroundColor: theme.palette.primary.main
                                }
                              }}
                            />
                          }
                          label={<Typography variant="body1">Thông báo về trạng thái tin đăng</Typography>}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Switch 
                              defaultChecked 
                              color="primary"
                              sx={{ 
                                '& .MuiSwitch-switchBase.Mui-checked': {
                                  color: theme.palette.primary.main
                                },
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                  backgroundColor: theme.palette.primary.main
                                }
                              }}
                            />
                          }
                          label={<Typography variant="body1">Thông báo về xác thực tài khoản</Typography>}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Switch 
                              defaultChecked 
                              color="primary"
                              sx={{ 
                                '& .MuiSwitch-switchBase.Mui-checked': {
                                  color: theme.palette.primary.main
                                },
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                  backgroundColor: theme.palette.primary.main
                                }
                              }}
                            />
                          }
                          label={<Typography variant="body1">Thông báo khuyến mãi và tin tức</Typography>}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
                
                <Card 
                  sx={{ 
                    borderRadius: '16px',
                    overflow: 'hidden',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <CardHeader 
                    title="Kiểm thử thông báo"
                    titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                    sx={{
                      backgroundColor: `${theme.palette.primary.main}10`,
                      borderBottom: '1px solid',
                      borderColor: 'divider'
                    }}
                  />
                  <CardContent sx={{ p: 3 }}>
                    <NotificationTester />
                  </CardContent>
                </Card>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          variant="filled"
          sx={{ 
            width: '100%',
            borderRadius: '12px'
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Profile; 