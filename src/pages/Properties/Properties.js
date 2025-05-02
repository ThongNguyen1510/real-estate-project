import React from 'react';
import { Container, Typography, Box, Grid } from '@mui/material';
import PropertyCard from '../../components/PropertyCard/PropertyCard';

const Properties = () => {
  // Dummy data - bạn nên thay bằng dữ liệu thực từ API
  const properties = [
    {
      id: 1,
      title: 'Biệt thự ven hồ',
      location: 'Quận 2, TP.HCM',
      price: '12 tỷ',
      bedrooms: 4,
      bathrooms: 3,
      area: 250,
      type: 'Biệt thự',
      image: 'https://source.unsplash.com/random/600x400/?villa'
    },
    // Thêm các property khác nếu cần
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        Danh sách bất động sản
      </Typography>
      <Grid container spacing={4}>
        {properties.map((property) => (
          <Grid item key={property.id} xs={12} sm={6} md={4} lg={3}>
            <PropertyCard property={property} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Properties;