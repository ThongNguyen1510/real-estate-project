import React from 'react';
import { Box, Container, Typography, Grid, Button, Paper, useTheme } from '@mui/material';
import {
  LocationOn as LocationIcon,
  Home as HomeIcon,
  Apartment as ApartmentIcon,
  Business as BusinessIcon,
  Landscape as LawnIcon,
  AccountBalance as AccountBalanceIcon,
  Search as SearchIcon,
  DomainAdd as DomainAddIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import HeroSection from '../components/home/HeroSection';
import FeaturedProperties from '../components/home/FeaturedProperties';

const HomePage: React.FC = () => {
  const theme = useTheme();
  
  // Mock statistics
  const statistics = [
    { value: '15,000+', label: 'Bất động sản', icon: <HomeIcon color="primary" fontSize="large" /> },
    { value: '10,000+', label: 'Khách hàng hài lòng', icon: <NotificationsIcon color="primary" fontSize="large" /> },
    { value: '500+', label: 'Đại lý tin cậy', icon: <DomainAddIcon color="primary" fontSize="large" /> },
    { value: '20+', label: 'Tỉnh thành phủ sóng', icon: <LocationIcon color="primary" fontSize="large" /> },
  ];
  
  // Mock property types
  const propertyTypes = [
    { 
      title: 'Căn hộ', 
      icon: <ApartmentIcon sx={{ fontSize: 48, color: theme.palette.primary.main }} />,
      count: 1250,
      path: '/tim-kiem?property_type=apartment'
    },
    { 
      title: 'Nhà phố', 
      icon: <HomeIcon sx={{ fontSize: 48, color: theme.palette.primary.main }} />,
      count: 856,
      path: '/tim-kiem?property_type=house'
    },
    { 
      title: 'Biệt thự', 
      icon: <AccountBalanceIcon sx={{ fontSize: 48, color: theme.palette.primary.main }} />,
      count: 325,
      path: '/tim-kiem?property_type=villa'
    },
    { 
      title: 'Đất nền', 
      icon: <LawnIcon sx={{ fontSize: 48, color: theme.palette.primary.main }} />,
      count: 720,
      path: '/tim-kiem?property_type=land'
    },
    { 
      title: 'Văn phòng', 
      icon: <BusinessIcon sx={{ fontSize: 48, color: theme.palette.primary.main }} />,
      count: 185,
      path: '/tim-kiem?property_type=office'
    },
  ];
  
  // Mock popular locations
  const popularLocations = [
    {
      name: 'TP. Hồ Chí Minh',
      image: '/img/locations/hcm.jpg',
      count: 4250,
      path: '/tim-kiem?city_id=1'
    },
    {
      name: 'Hà Nội',
      image: '/img/locations/hanoi.jpg',
      count: 3180,
      path: '/tim-kiem?city_id=2'
    },
    {
      name: 'Đà Nẵng',
      image: '/img/locations/danang.jpg',
      count: 1250,
      path: '/tim-kiem?city_id=3'
    },
    {
      name: 'Nha Trang',
      image: '/img/locations/nhatrang.jpg',
      count: 950,
      path: '/tim-kiem?city_id=4'
    },
  ];
  
  return (
    <Box>
      {/* Hero Section */}
      <HeroSection />
      
      {/* Statistics Section */}
      <Box sx={{ py: 6, bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Grid container spacing={3} justifyContent="center">
            {statistics.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Box 
                  sx={{ 
                    textAlign: 'center',
                    p: 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Box sx={{ mb: 2 }}>
                    {stat.icon}
                  </Box>
                  <Typography 
                    variant="h4" 
                    component="div"
                    color="primary"
                    sx={{ 
                      fontWeight: 'bold', 
                      mb: 0.5,
                      fontSize: { xs: '1.5rem', md: '2rem' }
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography 
                    variant="subtitle1" 
                    color="text.secondary"
                  >
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      
      {/* Featured Properties Section */}
      <FeaturedProperties />
      
      {/* Property Types Section */}
      <Box sx={{ py: 8, bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography 
              variant="h4" 
              component="h2" 
              sx={{ 
                fontWeight: 'bold',
                mb: 1,
                position: 'relative',
                display: 'inline-block',
                '&:after': {
                  content: '""',
                  display: 'block',
                  width: 80,
                  height: 3,
                  backgroundColor: theme.palette.secondary.main,
                  position: 'absolute',
                  bottom: -12,
                  left: '50%',
                  transform: 'translateX(-50%)'
                }
              }}
            >
              Loại bất động sản
            </Typography>
            
            <Typography 
              variant="subtitle1" 
              color="text.secondary"
              sx={{ 
                mt: 3, 
                mb: 4,
                maxWidth: 700,
                mx: 'auto'
              }}
            >
              Tìm kiếm bất động sản phù hợp với nhu cầu của bạn trong các danh mục đa dạng
            </Typography>
          </Box>
          
          <Grid container spacing={3} justifyContent="center">
            {propertyTypes.map((type, index) => (
              <Grid item xs={6} sm={4} md={2.4} key={index}>
                <Paper
                  component="a"
                  href={type.path}
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none',
                    color: 'inherit',
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-10px)',
                      boxShadow: '0 12px 20px rgba(0,0,0,0.1)',
                      '& .icon-container': {
                        bgcolor: theme.palette.primary.main,
                        '& svg': {
                          color: 'white'
                        }
                      }
                    }
                  }}
                >
                  <Box 
                    className="icon-container"
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'rgba(27, 79, 114, 0.1)',
                      mb: 2,
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {type.icon}
                  </Box>
                  
                  <Typography 
                    variant="h6" 
                    component="h3"
                    sx={{ 
                      fontWeight: 'bold',
                      mb: 1,
                      fontSize: { xs: '1rem', md: '1.25rem' }
                    }}
                  >
                    {type.title}
                  </Typography>
                  
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                  >
                    {type.count} tin đăng
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      
      {/* Popular Locations Section */}
      <Box sx={{ py: 8, bgcolor: theme.palette.grey[50] }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography 
              variant="h4" 
              component="h2" 
              sx={{ 
                fontWeight: 'bold',
                mb: 1,
                position: 'relative',
                display: 'inline-block',
                '&:after': {
                  content: '""',
                  display: 'block',
                  width: 80,
                  height: 3,
                  backgroundColor: theme.palette.secondary.main,
                  position: 'absolute',
                  bottom: -12,
                  left: '50%',
                  transform: 'translateX(-50%)'
                }
              }}
            >
              Khu vực phổ biến
            </Typography>
            
            <Typography 
              variant="subtitle1" 
              color="text.secondary"
              sx={{ 
                mt: 3, 
                mb: 4,
                maxWidth: 700,
                mx: 'auto'
              }}
            >
              Khám phá các bất động sản tại các khu vực hàng đầu với tiềm năng phát triển và sinh lời cao
            </Typography>
          </Box>
          
          <Grid container spacing={3}>
            {popularLocations.map((location, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Box
                  component="a"
                  href={location.path}
                  sx={{
                    position: 'relative',
                    height: 250,
                    borderRadius: 3,
                    overflow: 'hidden',
                    display: 'block',
                    textDecoration: 'none',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-10px)',
                      boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                      '& .overlay': {
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      },
                      '& img': {
                        transform: 'scale(1.1)',
                      }
                    }
                  }}
                >
                  {/* Background Image */}
                  <Box
                    component="img"
                    src={location.image}
                    alt={location.name}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.5s ease',
                    }}
                  />
                  
                  {/* Overlay */}
                  <Box
                    className="overlay"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: 3,
                    }}
                  >
                    <Typography
                      variant="h5"
                      component="h3"
                      color="white"
                      sx={{
                        fontWeight: 'bold',
                        mb: 1,
                        textAlign: 'center',
                      }}
                    >
                      {location.name}
                    </Typography>
                    
                    <Typography
                      variant="body1"
                      color="white"
                      sx={{ opacity: 0.9 }}
                    >
                      {location.count} bất động sản
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      
      {/* Call to Action Section */}
      <Box 
        sx={{ 
          py: 10, 
          textAlign: 'center',
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), linear-gradient(135deg, #1B4F72 0%, #2E86C1 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
        }}
      >
        <Container maxWidth="md">
          <Typography 
            variant="h3" 
            component="h2" 
            sx={{ 
              fontWeight: 'bold',
              mb: 3,
              fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' },
            }}
          >
            Bạn muốn bán hoặc cho thuê bất động sản?
          </Typography>
          
          <Typography 
            variant="subtitle1"
            sx={{ 
              mb: 4,
              opacity: 0.9,
              fontSize: { xs: '1rem', md: '1.25rem' },
              maxWidth: 800,
              mx: 'auto'
            }}
          >
            Đăng tin nhanh chóng, tiếp cận hàng triệu khách hàng tiềm năng và được hỗ trợ bởi đội ngũ chuyên gia bất động sản
          </Typography>
          
          <Button 
            variant="contained" 
            color="secondary"
            size="large"
            href="/dang-tin"
            sx={{ 
              px: 4, 
              py: 1.5,
              fontWeight: 'bold',
              fontSize: '1.1rem'
            }}
            startIcon={<DomainAddIcon />}
          >
            Đăng tin ngay
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage; 