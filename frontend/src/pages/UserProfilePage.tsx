import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Tabs,
  Tab,
  Divider,
  IconButton,
  Alert,
  CircularProgress,
  InputAdornment,
  Snackbar
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  CameraAlt as CameraIcon,
  VpnKey as KeyIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/api';
import userService from '../services/api/userService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const UserProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateProfile, updateAvatar, changePassword, logout, setUser } = useAuth();
  
  // Thêm timestamp cho avatar để tránh cache
  const getAvatarUrl = (avatarPath: string | null | undefined) => {
    console.log('getAvatarUrl input:', avatarPath);
    if (!avatarPath) {
      console.log('Avatar path is empty, returning undefined');
      return undefined;
    }
    const timestamp = new Date().getTime();
    const result = `${avatarPath}${avatarPath.includes('?') ? '&' : '?'}t=${timestamp}`;
    console.log('Generated avatar URL:', result);
    return result;
  };
  
  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);
  
  // Tab state
  const [tabValue, setTabValue] = useState(0);
  
  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  
  // Form data
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  
  // Password change form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Add new states for counts
  const [propertiesCount, setPropertiesCount] = useState<number>(0);
  const [favoritesCount, setFavoritesCount] = useState<number>(0);
  const [countsLoading, setCountsLoading] = useState<boolean>(true);
  
  // Update profile data when user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name,
        email: user.email,
        phone: user.phone || ''
      });
    }
  }, [user]);
  
  // Add useEffect to refresh user data periodically
  useEffect(() => {
    if (!user) return;
    
    // Initial load of fresh user data
    const refreshUserData = async () => {
      try {
        // Fetch fresh user data from server
        const response = await authService.getProfile();
        if (response && response.data) {
          // Update local storage with fresh data
          localStorage.setItem('user', JSON.stringify(response.data));
          // Update state with fresh data
          setUser(response.data);
          console.log('User data refreshed from server:', response.data);
        }
      } catch (err) {
        console.error('Error refreshing user data:', err);
      }
    };
    
    // Refresh immediately
    refreshUserData();
    
    // No need for interval refresh as it might cause UI flicker
  }, [user?.id, setUser]);
  
  // Add useEffect to explicitly fetch fresh user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        console.log('UserProfilePage - Fetching fresh user data on mount');
        const response = await authService.getProfile();
        if (response && response.data) {
          // Make sure the avatar field is properly mapped
          if (response.data.avatar_url && !response.data.avatar) {
            response.data.avatar = response.data.avatar_url;
          }
          
          // Update localStorage
          localStorage.setItem('user', JSON.stringify(response.data));
          
          // Update user context
          setUser(response.data);
          console.log('UserProfilePage - User data refreshed:', response.data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    
    fetchUserData();
  }, []);
  
  // Add useEffect to fetch counts
  useEffect(() => {
    const fetchCounts = async () => {
      if (!user) return;
      
      try {
        setCountsLoading(true);
        // Fetch property count
        const propertyResponse = await userService.getUserPropertyCount();
        if (propertyResponse.success) {
          setPropertiesCount(propertyResponse.data.count || 0);
        }
        
        // Fetch favorites count
        const favoriteResponse = await userService.getUserFavoriteCount();
        if (favoriteResponse.success) {
          setFavoritesCount(favoriteResponse.data.count || 0);
        }
      } catch (error) {
        console.error('Error fetching counts:', error);
      } finally {
        setCountsLoading(false);
      }
    };
    
    fetchCounts();
  }, [user]);
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Handle form input changes
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle password input changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Toggle edit mode
  const handleToggleEdit = () => {
    setIsEditing(!isEditing);
    
    // Reset form if canceling edit
    if (isEditing && user) {
      setProfileData({
        name: user.name,
        email: user.email,
        phone: user.phone || ''
      });
    }
  };
  
  // Handle profile update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isEditing) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await updateProfile({
        name: profileData.name,
        phone: profileData.phone
      });
      
      setSuccess('Cập nhật hồ sơ thành công!');
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi cập nhật hồ sơ');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle avatar change
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    console.log("Selected file:", file.name, file.type, file.size);
    
    const formData = new FormData();
    formData.append('avatar', file);
    
    setLoading(true);
    setError(null);
    
    try {
      console.log("Uploading avatar file...");
      const response = await updateAvatar(formData);
      console.log('Avatar update response:', response);
      
      // Handle response and update state
      if (response && response.data && response.data.avatar) {
        console.log("Avatar updated successfully, new path:", response.data.avatar);
        
        // Force update the state with the new avatar URL (with timestamp)
        const avatarUrl = response.data.avatar;
        const timestamp = new Date().getTime();
        const avatarWithTimestamp = `${avatarUrl}${avatarUrl.includes('?') ? '&' : '?'}t=${timestamp}`;
        
        // Update localStorage directly to ensure data persistence
        if (user) {
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
          currentUser.avatar = avatarUrl;
          localStorage.setItem('user', JSON.stringify(currentUser));
          
          // Set success message
          setSuccess('Cập nhật ảnh đại diện thành công!');
        }
      } else {
        console.error("Avatar URL not found in response:", response);
        setError('Cập nhật avatar thành công nhưng không nhận được đường dẫn mới.');
      }
    } catch (err: any) {
      console.error('Avatar update error:', err);
      setError(err.message || 'Có lỗi xảy ra khi cập nhật ảnh đại diện');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle password change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Mật khẩu mới không khớp với mật khẩu xác nhận');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      
      // Reset form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setSuccess('Đổi mật khẩu thành công!');
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi đổi mật khẩu');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSuccess(null);
  };
  
  // Cập nhật phương thức hiển thị avatar
  const renderAvatar = () => {
    const timestamp = new Date().getTime();
    
    if (!user || !user.avatar) {
      return (
        <Avatar
          alt={user?.name || 'User'}
          sx={{
            width: 120,
            height: 120,
            border: '4px solid',
            borderColor: 'primary.main',
            margin: '0 auto'
          }}
        >
          {user?.name.charAt(0) || 'U'}
        </Avatar>
      );
    }
    
    // Always use a fresh timestamp to prevent caching
    const avatarUrl = `${user.avatar}${user.avatar.includes('?') ? '&' : '?'}t=${timestamp}`;
    console.log("Avatar rendering with URL:", avatarUrl);
    
    return (
      <Box
        component="img"
        src={avatarUrl}
        alt={user.name}
        onError={(e) => {
          console.error("Error loading avatar image:", e);
          // If image fails to load, fallback to initial
          (e.currentTarget as HTMLImageElement).onerror = null;
          // Use a data attribute to prevent infinite retries
          if (!(e.currentTarget as HTMLImageElement).dataset.retried && user) {
            (e.currentTarget as HTMLImageElement).dataset.retried = 'true';
            console.log("Retrying with user initial");
            // Force re-render with empty src to show the fallback UI
            setUser({...user, avatar: ''});
          }
        }}
        sx={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          border: '4px solid',
          borderColor: 'primary.main',
          objectFit: 'cover'
        }}
      />
    );
  };
  
  // If user is not loaded yet
  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Grid container spacing={4}>
          {/* Profile Sidebar */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              {/* Avatar */}
              <Box sx={{ position: 'relative', mb: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {renderAvatar()}
                
                {/* Upload button */}
                <label htmlFor="avatar-upload">
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleAvatarChange}
                  />
                  <IconButton
                    component="span"
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      backgroundColor: 'primary.main',
                      color: 'white',
                      '&:hover': { backgroundColor: 'primary.dark' },
                    }}
                    disabled={loading}
                  >
                    <CameraIcon />
                  </IconButton>
                </label>
              </Box>
              
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {user.name}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {user.email}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Button 
                variant="outlined"
                color="error"
                fullWidth
                sx={{ mt: 3 }}
                onClick={logout}
              >
                Đăng xuất
              </Button>
            </Paper>
          </Grid>
          
          {/* Profile Content */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 0 }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant="fullWidth"
              >
                <Tab label="Thông tin cá nhân" icon={<PersonIcon />} iconPosition="start" />
                <Tab label="Đổi mật khẩu" icon={<KeyIcon />} iconPosition="start" />
              </Tabs>
              
              {/* Profile Tab */}
              <TabPanel value={tabValue} index={0}>
                {error && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                )}
                
                <Box
                  component="form"
                  onSubmit={handleUpdateProfile}
                  sx={{ px: 2 }}
                >
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        Thông tin cá nhân
                        <IconButton onClick={handleToggleEdit} color={isEditing ? 'primary' : 'default'}>
                          {isEditing ? <SaveIcon /> : <EditIcon />}
                        </IconButton>
                      </Typography>
                      <Divider sx={{ mt: 1, mb: 3 }} />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Họ và tên"
                        name="name"
                        value={profileData.name}
                        onChange={handleProfileChange}
                        disabled={!isEditing || loading}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        value={profileData.email}
                        disabled={true} // Email cannot be changed
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <EmailIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Số điện thoại"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleProfileChange}
                        disabled={!isEditing || loading}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PhoneIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    
                    {isEditing && (
                      <Grid item xs={12}>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          sx={{ mt: 2 }}
                          disabled={loading}
                          fullWidth
                        >
                          {loading ? <CircularProgress size={24} /> : 'Cập nhật thông tin'}
                        </Button>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              </TabPanel>
              
              {/* Password Change Tab */}
              <TabPanel value={tabValue} index={1}>
                {error && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                )}
                
                <Box
                  component="form"
                  onSubmit={handleChangePassword}
                  sx={{ px: 2 }}
                >
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Typography variant="h6" fontWeight="bold">
                        Đổi mật khẩu
                      </Typography>
                      <Divider sx={{ mt: 1, mb: 3 }} />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Mật khẩu hiện tại"
                        name="currentPassword"
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        required
                        disabled={loading}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <KeyIcon />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                edge="end"
                              >
                                {showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Mật khẩu mới"
                        name="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        required
                        disabled={loading}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <KeyIcon />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                edge="end"
                              >
                                {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Xác nhận mật khẩu mới"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                        disabled={loading}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <KeyIcon />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                edge="end"
                              >
                                {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        disabled={loading}
                      >
                        {loading ? <CircularProgress size={24} /> : 'Đổi mật khẩu'}
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </TabPanel>
            </Paper>
          </Grid>
        </Grid>
      </Box>
      
      {/* Success snackbar */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={success}
      />
    </Container>
  );
};

export default UserProfilePage; 