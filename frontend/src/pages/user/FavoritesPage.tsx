import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, Box, Paper, CircularProgress, Button, Alert } from '@mui/material';
import { Favorite as FavoriteIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { getFavorites } from '../../services/api/userService';
import { useFavorites } from '../../contexts/FavoritesContext';
import PropertyCard from '../../components/property/PropertyCard';

interface Property {
  id: number;
  title: string;
  price: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  city: string;
  district: string;
  address: string;
  full_address: string;
  property_type: string;
  status: string;
  primary_image_url?: string;
  image_url?: string;
  images?: string[];
  owner_name?: string;
  owner_phone?: string;
}

const FavoritesPage: React.FC = () => {
  const [favoriteProperties, setFavoriteProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { favorites, toggleFavorite, loadFavorites } = useFavorites();

  useEffect(() => {
    fetchFavoriteProperties();
  }, []);

  const fetchFavoriteProperties = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getFavorites();
      console.log('Favorites response:', response);
      
      if (response.success && response.data) {
        // Chuyển đổi dữ liệu nếu cần
        const properties = response.data.map((property: any) => ({
          ...property,
          // Đảm bảo các trường bắt buộc có giá trị mặc định
          bedrooms: property.bedrooms || 0,
          bathrooms: property.bathrooms || 0,
          area: property.area || 0,
          district: property.district || '',
          city: property.city || '',
          address: property.address || property.full_address || '',
          full_address: property.full_address || `${property.address || ''}, ${property.district || ''}, ${property.city || ''}`.trim()
        }));
        
        setFavoriteProperties(properties);
        // Cập nhật context danh sách yêu thích
        loadFavorites();
      } else {
        setError('Không thể tải danh sách yêu thích. Vui lòng thử lại sau.');
        setFavoriteProperties([]);
      }
    } catch (error: any) {
      console.error('Error fetching favorites:', error);
      setError('Đã xảy ra lỗi khi tải danh sách yêu thích.');
      setFavoriteProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = async (propertyId: number) => {
    await toggleFavorite(propertyId);
    // Sau khi bỏ yêu thích, cập nhật lại danh sách
    setFavoriteProperties(prevProperties => 
      prevProperties.filter(property => property.id !== propertyId)
    );
  };

  const handleRefresh = () => {
    loadFavorites();
    fetchFavoriteProperties();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FavoriteIcon color="error" sx={{ mr: 1, fontSize: 28 }} />
            <Typography variant="h4" component="h1">
              Bất động sản yêu thích
            </Typography>
          </Box>
          <Button 
            variant="outlined" 
            onClick={handleRefresh}
            startIcon={<RefreshIcon />}
          >
            Làm mới danh sách
          </Button>
        </Box>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Danh sách các bất động sản bạn đã lưu để xem lại sau
        </Typography>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Thử lại
            </Button>
          }
        >
          {error}
        </Alert>
      ) : favoriteProperties.length === 0 ? (
        <Box 
          sx={{ 
            textAlign: 'center', 
            py: 6,
            backgroundColor: '#f5f5f5',
            borderRadius: 2
          }}
        >
          <Typography variant="h6" gutterBottom color="text.secondary">
            Bạn chưa có bất động sản yêu thích nào
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Hãy thêm bất động sản vào danh sách yêu thích để xem lại sau
          </Typography>
          <Button 
            variant="contained" 
            href="/mua-ban"
            size="large"
          >
            Xem bất động sản
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {favoriteProperties.map((property) => (
            <Grid item xs={12} sm={6} md={4} key={property.id}>
              <PropertyCard 
                property={{
                  ...property,
                  isFavorite: true
                }} 
                onFavoriteToggle={handleFavoriteToggle}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default FavoritesPage; 