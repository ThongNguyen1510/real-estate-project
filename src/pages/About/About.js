import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const About = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
        Về chúng tôi
      </Typography>
      <Box sx={{ my: 4 }}>
        <Typography variant="body1" paragraph>
          LuxState là công ty bất động sản hàng đầu tại Việt Nam, với hơn 10 năm kinh nghiệm trong lĩnh vực môi giới và tư vấn bất động sản.
        </Typography>
        <Typography variant="body1" paragraph>
          Chúng tôi cam kết mang đến cho khách hàng những giải pháp nhà ở tốt nhất với dịch vụ chuyên nghiệp và minh bạch.
        </Typography>
      </Box>
    </Container>
  );
};

export default About;