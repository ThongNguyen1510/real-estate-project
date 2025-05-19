import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Avatar,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Business as BusinessIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import userService from '../services/api/userService';
import { getProperties } from '../services/api/propertyService';
import PropertyCard from '../components/property/PropertyCard';

interface UserProfileData {
  id?: number;
  name?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  avatar_url?: string;
  role?: string;
  properties_count?: number;
}

const PublicProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  
  // States
  const [userData, setUserData] = useState<UserProfileData | null>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch user data and properties
  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        setError('ID người dùng không hợp lệ');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        // Fetch user data
        const userResponse = await userService.getUserInfo(Number(userId));
        if (!userResponse.success) {
          throw new Error(userResponse.message || 'Không thể tải thông tin người dùng');
        }
        
        setUserData(userResponse.data);
        
        // Fetch user's properties
        const propertyResponse = await getProperties({
          owner_id: Number(userId),
          status: 'available',
          limit: 10
        });
        
        if (propertyResponse.success && Array.isArray(propertyResponse.data?.properties)) {
          setProperties(propertyResponse.data.properties);
        }
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [userId]);
  
  // Render avatar
  const renderAvatar = () => {
    if (!userData) return null;
    
    const avatarUrl = userData.avatar_url || userData.avatar;
    
    if (!avatarUrl) {
      return (
        <Avatar
          sx={{
            width: 120,
            height: 120,
            bgcolor: 'primary.main',
            fontSize: '3rem'
          }}
        >
          {(userData.full_name || userData.name || 'U').charAt(0).toUpperCase()}
        </Avatar>
      );
    }
    
    return (
      <Avatar
        src={avatarUrl}
        alt={userData.full_name || userData.name || 'User'}
        sx={{
          width: 120,
          height: 120,
          border: '4px solid white',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}
      />
    );
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error || !userData) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Không tìm thấy thông tin người dùng'}
        </Alert>
        <Button component={Link} to="/" variant="outlined" startIcon={<ArrowBackIcon />}>
          Quay lại trang chủ
        </Button>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* User info sidebar */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {renderAvatar()}
            </Box>
            
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {userData.full_name || userData.name}
            </Typography>
            
            <Chip 
              icon={<BusinessIcon fontSize="small" />} 
              label="Nhà môi giới bất động sản" 
              color="primary" 
              size="small"
              sx={{ mb: 2 }}
            />
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ textAlign: 'left', mt: 2 }}>
              <Box sx={{ display: 'flex', mb: 2, alignItems: 'center' }}>
                <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body1">
                  {userData.phone || 'Chưa cập nhật số điện thoại'}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', mb: 2, alignItems: 'center' }}>
                <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body1">
                  {userData.email || 'Chưa cập nhật email'}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        {/* User's properties */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Tin đăng của {userData.full_name || userData.name}
            </Typography>
            
            <Divider sx={{ mb: 3 }} />
            
            {properties.length > 0 ? (
              <Grid container spacing={2}>
                {properties.map((property) => (
                  <Grid item xs={12} md={6} key={property.id}>
                    <PropertyCard property={property} />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ py: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  Người dùng chưa có tin đăng nào
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PublicProfilePage; 