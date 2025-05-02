import React from 'react';
import { Container, Box, Typography, Button } from '@mui/material';
import { Home } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
      <Typography variant="h1" sx={{ fontSize: '4rem', fontWeight: 'bold', mb: 2 }}>
        404
      </Typography>
      <Typography variant="h4" gutterBottom>
        Trang không tồn tại
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Xin lỗi, chúng tôi không thể tìm thấy trang bạn yêu cầu.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        component={Link}
        to="/"
        startIcon={<Home />}
        size="large"
      >
        Về trang chủ
      </Button>
    </Container>
  );
};

export default NotFound;