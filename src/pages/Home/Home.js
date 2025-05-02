import React from 'react';
import { Container, Box, Typography, Grid, Button, useMediaQuery, useTheme } from '@mui/material';
import SearchBar from '../../components/SearchBar/SearchBar';
import PropertyCard from '../../components/PropertyCard/PropertyCard';

const heroImage = 'https://source.unsplash.com/random/1600x900/?real-estate';

const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const featuredProperties = [
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
    {
      id: 2,
      title: 'Căn hộ cao cấp',
      location: 'Quận 1, TP.HCM',
      price: '5.5 tỷ',
      bedrooms: 3,
      bathrooms: 2,
      area: 120,
      type: 'Căn hộ',
      image: 'https://source.unsplash.com/random/600x400/?apartment'
    },
    {
      id: 3,
      title: 'Nhà phố mặt tiền',
      location: 'Quận 3, TP.HCM',
      price: '8 tỷ',
      bedrooms: 4,
      bathrooms: 3,
      area: 180,
      type: 'Nhà phố',
      image: 'https://source.unsplash.com/random/600x400/?house'
    },
    {
      id: 4,
      title: 'Đất nền dự án',
      location: 'Quận 9, TP.HCM',
      price: '3.2 tỷ',
      bedrooms: 0,
      bathrooms: 0,
      area: 100,
      type: 'Đất',
      image: 'https://source.unsplash.com/random/600x400/?land'
    },
  ];

  return (
    <Box sx={{ overflowX: 'hidden' }}>
      {/* Hero Section */}
      <Box sx={{ 
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), url(${heroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: isMobile ? '65vh' : '75vh',
        display: 'flex',
        alignItems: 'center',
        color: 'white',
        textAlign: 'center',
        px: 2,
        mb: isMobile ? 10 : 12
      }}>
        <Container maxWidth="md">
          <Typography 
            variant={isMobile ? 'h3' : 'h2'} 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
            }}
          >
            Tìm Ngôi Nhà Mơ Ước Của Bạn
          </Typography>
          <Typography 
            variant={isMobile ? 'h6' : 'h5'} 
            sx={{ 
              mb: 4,
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
            }}
          >
            Hơn 10,000 bất động sản cao cấp trên khắp cả nước
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            size={isMobile ? 'medium' : 'large'}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              boxShadow: 3
            }}
          >
            Khám phá ngay
          </Button>
        </Container>
      </Box>
      
      {/* Search Section */}
      <Container 
        maxWidth="lg" 
        sx={{ 
          position: 'relative',
          top: isMobile ? '-60px' : '-40px',
          px: isMobile ? 2 : 3,
          mb: isMobile ? 4 : 6,
          zIndex: 2
        }}
      >
        <SearchBar />
      </Container>
      
      {/* Featured Properties */}
      <Container maxWidth="lg" sx={{ 
        py: 8,
        px: isMobile ? 2 : 3
      }}>
        <Typography 
          variant="h4" 
          component="h2" 
          gutterBottom 
          sx={{ 
            fontWeight: 'bold', 
            mb: 4,
            textAlign: isMobile ? 'center' : 'left'
          }}
        >
          Bất động sản nổi bật
        </Typography>
        <Grid container spacing={isMobile ? 2 : 4}>
          {featuredProperties.map((property) => (
            <Grid 
              item 
              key={property.id} 
              xs={12} 
              sm={6} 
              md={6} 
              lg={3}
              sx={{
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <PropertyCard property={property} />
            </Grid>
          ))}
        </Grid>
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button 
            variant="outlined" 
            color="primary" 
            size="large"
            sx={{
              px: 6,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 'bold'
            }}
          >
            Xem thêm
          </Button>
        </Box>
      </Container>
      
      {/* Services Section */}
      <Box sx={{ 
        bgcolor: 'background.paper', 
        py: 8,
        px: isMobile ? 2 : 0
      }}>
        <Container maxWidth="lg">
          <Typography 
            variant="h4" 
            component="h2" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold', 
              mb: 6, 
              textAlign: 'center',
              px: isMobile ? 2 : 0
            }}
          >
            Dịch vụ của chúng tôi
          </Typography>
          <Grid container spacing={4}>
            {[
              { icon: '🏠', title: 'Mua bán', description: 'Hỗ trợ mua bán bất động sản với giá tốt nhất' },
              { icon: '💰', title: 'Cho thuê', description: 'Cho thuê các loại bất động sản với hợp đồng minh bạch' },
              { icon: '📊', title: 'Tư vấn', description: 'Tư vấn đầu tư bất động sản hiệu quả' },
              { icon: '🏗️', title: 'Xây dựng', description: 'Thiết kế và thi công công trình chất lượng' },
            ].map((service, index) => (
              <Grid 
                item 
                key={index} 
                xs={12} 
                sm={6} 
                md={3}
                sx={{
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                <Box sx={{ 
                  textAlign: 'center', 
                  p: 3, 
                  height: '100%',
                  width: '100%',
                  maxWidth: 300,
                  borderRadius: 2,
                  boxShadow: 1,
                  '&:hover': {
                    boxShadow: 3,
                    transform: 'translateY(-5px)',
                    transition: 'all 0.3s ease'
                  }
                }}>
                  <Typography variant="h2" sx={{ mb: 2 }}>{service.icon}</Typography>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>{service.title}</Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>{service.description}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;