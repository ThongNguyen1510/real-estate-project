import React from 'react';
import { 
  Box, 
  Typography, 
  Container,
  useTheme
} from '@mui/material';

const HeroSection: React.FC = () => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        position: 'relative',
        height: { xs: '300px', md: '400px' },
        backgroundImage: 'url(/img/wallpaperhcm.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#555',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        marginBottom: 0,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.2)'
        }
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          px: { xs: 2, sm: 3 }
        }}
      >
        <Typography
          variant="h2"
          component="h1"
          sx={{
            fontWeight: 'bold',
            mb: 2,
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' }
          }}
        >
          Tìm Ngôi Nhà Mơ Ước Của Bạn
        </Typography>

        <Typography
          variant="h5"
          sx={{
            maxWidth: '800px',
            fontSize: { xs: '1rem', sm: '1.25rem' }
          }}
        >
          Khám phá hàng ngàn bất động sản chất lượng từ khắp Việt Nam
        </Typography>
      </Container>
    </Box>
  );
};

export default HeroSection; 