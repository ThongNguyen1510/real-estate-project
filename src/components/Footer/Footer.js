import React from 'react';
import { Box, Container, Grid, Typography, Link, Divider } from '@mui/material';
import { Facebook, Twitter, Instagram, LinkedIn } from '@mui/icons-material';

const Footer = () => {
  return (
    <Box sx={{ bgcolor: 'background.paper', pt: 8, pb: 4 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Bất động sản HeHe
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Công ty bất động sản hàng đầu Việt Nam, mang đến cho bạn những giải pháp nhà ở tốt nhất.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Facebook color="primary" />
              <Twitter color="primary" />
              <Instagram color="primary" />
              <LinkedIn color="primary" />
            </Box>
          </Grid>
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Liên kết
            </Typography>
            <Link href="#" variant="body2" display="block" sx={{ mb: 1 }}>
              Trang chủ
            </Link>
            <Link href="#" variant="body2" display="block" sx={{ mb: 1 }}>
              Bất động sản
            </Link>
            <Link href="#" variant="body2" display="block" sx={{ mb: 1 }}>
              Về chúng tôi
            </Link>
            <Link href="#" variant="body2" display="block" sx={{ mb: 1 }}>
              Liên hệ
            </Link>
          </Grid>
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Dịch vụ
            </Typography>
            <Link href="#" variant="body2" display="block" sx={{ mb: 1 }}>
              Mua bán
            </Link>
            <Link href="#" variant="body2" display="block" sx={{ mb: 1 }}>
              Cho thuê
            </Link>
            <Link href="#" variant="body2" display="block" sx={{ mb: 1 }}>
              Tư vấn
            </Link>
            <Link href="#" variant="body2" display="block" sx={{ mb: 1 }}>
              Xây dựng
            </Link>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Liên hệ
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              123 Đường ABC, Quận 1, TP.HCM
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Email: info@batdongsanhehe.com
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Điện thoại: (028) 1234 5678
            </Typography>
          </Grid>
        </Grid>
        <Divider sx={{ my: 4 }} />
        <Typography variant="body2" color="text.secondary" align="center">
          © {new Date().getFullYear()} Bất động sản HeHe. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;