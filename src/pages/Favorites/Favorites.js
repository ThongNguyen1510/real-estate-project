import React from 'react';
import { Container, Box, Typography, Grid, Button, Paper } from '@mui/material';
import { Favorite, ArrowBack, Delete } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import PropertyCard from '../../components/PropertyCard/PropertyCard';
import { clearFavorites, selectFavorites } from '../../store/favoritesSlice';

const Favorites = () => {
  const dispatch = useDispatch();
  const favorites = useSelector(selectFavorites);

  const handleClearFavorites = () => {
    if (window.confirm('Bạn có chắc muốn xóa tất cả bài viết yêu thích?')) {
      dispatch(clearFavorites());
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Button 
          component={Link}
          to="/"
          startIcon={<ArrowBack />}
          sx={{ mr: 2 }}
        >
          Trở về
        </Button>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
          <Favorite color="error" sx={{ mr: 1, verticalAlign: 'middle' }} />
          Danh sách yêu thích
        </Typography>
        {favorites.length > 0 && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={handleClearFavorites}
          >
            Xóa tất cả
          </Button>
        )}
      </Box>

      {favorites.length === 0 ? (
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Favorite color="disabled" sx={{ fontSize: 80, mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Bạn chưa có bất động sản yêu thích nào
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Nhấn vào biểu tượng ♥ trên các bài đăng để thêm vào danh sách yêu thích
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            component={Link}
            to="/properties"
            size="large"
          >
            Khám phá ngay
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={4}>
          {favorites.map((property) => (
            <Grid item key={property.id} xs={12} sm={6} md={4} lg={3}>
              <PropertyCard property={property} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Favorites;