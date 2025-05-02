import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Grid, 
  Button, 
  Chip, 
  Divider, 
  Paper,
  IconButton,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { 
  LocationOn, 
  KingBed, 
  Bathtub, 
  SquareFoot, 
  Favorite, 
  Share, 
  Phone,
  ArrowBack
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';
import ChatWidget from '../../components/ChatWidget/ChatWidget';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock data - Thay bằng API call thực tế
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        // Giả lập API call
        const mockData = {
          id: 1,
          title: 'Biệt thự ven hồ cao cấp',
          price: '12.5 tỷ VNĐ',
          address: '123 Đường Nguyễn Văn Linh, Quận 7, TP.HCM',
          description: 'Biệt thự mới xây, view hồ thoáng mát, nội thất cao cấp. Diện tích 250m², 4 phòng ngủ, 3 phòng tắm. Khu vực an ninh 24/24, tiện ích đầy đủ: hồ bơi, gym, công viên.',
          type: 'Biệt thự',
          bedrooms: 4,
          bathrooms: 3,
          area: 250,
          yearBuilt: 2020,
          amenities: ['Hồ bơi', 'Gym', 'Chỗ đậu xe', 'Bảo vệ 24/7', 'Thang máy'],
          images: [
            { original: 'https://source.unsplash.com/random/800x600/?luxury-villa', thumbnail: 'https://source.unsplash.com/random/150x100/?luxury-villa' },
            { original: 'https://source.unsplash.com/random/800x600/?living-room', thumbnail: 'https://source.unsplash.com/random/150x100/?living-room' },
            { original: 'https://source.unsplash.com/random/800x600/?bedroom', thumbnail: 'https://source.unsplash.com/random/150x100/?bedroom' },
          ],
          contact: {
            name: 'Nguyễn Văn A',
            phone: '0901234567',
            email: 'nguyenvana@example.com'
          },
          postedDate: '2023-05-15'
        };
        
        setProperty(mockData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching property:', error);
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Đang tải thông tin...</Typography>
      </Container>
    );
  }

  if (!property) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Không tìm thấy thông tin bất động sản</Typography>
      </Container>
    );
  }

  return (
    <Box>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
          Quay lại
        </Button>

        {/* Tiêu đề và giá */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            {property.title}
          </Typography>
          <Typography variant="h5" color="primary" gutterBottom>
            {property.price}
          </Typography>
          <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <LocationOn color="primary" sx={{ mr: 1 }} />
            {property.address}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Chip label={property.type} color="primary" />
            <Chip icon={<SquareFoot />} label={`${property.area} m²`} />
            <Chip icon={<KingBed />} label={`${property.bedrooms} phòng ngủ`} />
            <Chip icon={<Bathtub />} label={`${property.bathrooms} phòng tắm`} />
          </Box>
        </Box>

        <Grid container spacing={4}>
          {/* Phần hình ảnh */}
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
              <ImageGallery
                items={property.images}
                showPlayButton={false}
                showFullscreenButton={!isMobile}
                showNav={!isMobile}
                showThumbnails={!isMobile}
                thumbnailPosition={isMobile ? 'bottom' : 'left'}
              />
            </Paper>

            {/* Mô tả chi tiết */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Mô tả chi tiết
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1" paragraph>
                {property.description}
              </Typography>
              
              <Typography variant="h6" gutterBottom sx={{ mt: 3, fontWeight: 'bold' }}>
                Thông tin bổ sung
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={6} sm={4}>
                  <Typography variant="body2"><strong>Năm xây dựng:</strong> {property.yearBuilt}</Typography>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Typography variant="body2"><strong>Ngày đăng:</strong> {property.postedDate}</Typography>
                </Grid>
              </Grid>

              {/* Tiện ích */}
              <Typography variant="h6" gutterBottom sx={{ mt: 3, fontWeight: 'bold' }}>
                Tiện ích
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {property.amenities.map((amenity, index) => (
                  <Chip key={index} label={amenity} variant="outlined" />
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Phần thông tin liên hệ */}
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2, position: 'sticky', top: 20 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Liên hệ người đăng
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  {property.contact.name}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Điện thoại:</strong> {property.contact.phone}
                </Typography>
                <Typography variant="body2">
                  <strong>Email:</strong> {property.contact.email}
                </Typography>
              </Box>

              <Button
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                startIcon={<Phone />}
                sx={{ mb: 2 }}
              >
                Gọi ngay
              </Button>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Favorite />}
                >
                  Yêu thích
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Share />}
                >
                  Chia sẻ
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
      <ChatWidget />
    </Box>
  );
};

export default PropertyDetails;