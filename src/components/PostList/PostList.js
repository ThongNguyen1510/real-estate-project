import React, { useMemo, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Grid, 
  Chip, 
  Divider,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Stack,
  Tooltip,
  IconButton
} from '@mui/material';
import { 
  Edit, 
  Delete, 
  Visibility, 
  LocationOn,
  Bathtub,
  Hotel,
  Straighten,
  LocalOffer,
  Phone,
  Email,
  Person,
  HourglassEmpty,
  CheckCircle,
  Cancel,
  LocalParking,
  Security,
  Wifi,
  Pool,
  Elevator,
  AcUnit,
  Kitchen,
  Pets,
  DirectionsCar
} from '@mui/icons-material';

const StatusChip = ({ status }) => {
  switch (status) {
    case 'approved':
      return <Chip icon={<CheckCircle />} label="Đã duyệt" color="success" size="small" />;
    case 'rejected':
      return <Chip icon={<Cancel />} label="Từ chối" color="error" size="small" />;
    case 'pending':
    default:
      return <Chip icon={<HourglassEmpty />} label="Chờ duyệt" color="warning" size="small" />;
  }
};

const AmenityIcon = ({ amenity, available }) => {
  if (!available) return null;
  
  const icons = {
    parking: <LocalParking fontSize="small" />,
    security: <Security fontSize="small" />,
    wifi: <Wifi fontSize="small" />,
    pool: <Pool fontSize="small" />,
    elevator: <Elevator fontSize="small" />,
    airConditioner: <AcUnit fontSize="small" />,
    kitchen: <Kitchen fontSize="small" />,
    petFriendly: <Pets fontSize="small" />,
    garage: <DirectionsCar fontSize="small" />
  };
  
  return (
    <Tooltip title={amenity}>
      <Box component="span" sx={{ mx: 0.5 }}>
        {icons[amenity]}
      </Box>
    </Tooltip>
  );
};

const PropertyTypeLabel = (type) => {
  switch (type) {
    case 'apartment': return 'Căn hộ';
    case 'house': return 'Nhà ở';
    case 'villa': return 'Biệt thự';
    case 'land': return 'Đất';
    default: return type;
  }
};

const PostList = ({ posts, onEdit, onDelete }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  // Create safe image URLs for posts
  const postsWithImageUrls = useMemo(() => {
    return posts.map(post => {
      let imageUrl = "https://via.placeholder.com/300x200?text=No+Image";
      
      if (post.images && post.images.length > 0) {
        try {
          // Try to create URL from file object
          imageUrl = URL.createObjectURL(post.images[0]);
        } catch (error) {
          console.error("Error creating URL for image:", error);
        }
      }
      
      return { ...post, imageUrl };
    });
  }, [posts]);

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      postsWithImageUrls.forEach(post => {
        if (post.imageUrl && post.imageUrl.startsWith('blob:')) {
          URL.revokeObjectURL(post.imageUrl);
        }
      });
    };
  }, [postsWithImageUrls]);

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        Quản lý bài đăng
      </Typography>
      
      {posts.length === 0 ? (
        <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
          Bạn chưa có bài đăng nào
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {postsWithImageUrls.map((post) => (
            <Grid item xs={12} key={post.id}>
              <Card elevation={2}>
                <Grid container>
                  <Grid item xs={12} md={3}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={post.imageUrl}
                      alt={post.title}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={9}>
                    <CardContent sx={{ pb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {post.title}
                        </Typography>
                        <StatusChip status={post.status} />
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'text.secondary' }}>
                        <LocationOn fontSize="small" sx={{ mr: 0.5 }} />
                        <Typography variant="body2">{post.location}</Typography>
                      </Box>
                      
                      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                        <Chip 
                          label={PropertyTypeLabel(post.type)} 
                          size="small" 
                          color="primary" 
                          variant="outlined" 
                        />
                        <Chip 
                          label={post.propertyStatus === 'for-sale' ? 'Bán' : 'Cho thuê'} 
                          size="small" 
                          color={post.propertyStatus === 'for-sale' ? 'info' : 'secondary'} 
                          variant="outlined" 
                        />
                        {post.category && (
                          <Chip 
                            label={post.category === 'residential' ? 'Nhà ở' : 
                              post.category === 'commercial' ? 'Thương mại' : 
                              post.category === 'industrial' ? 'Công nghiệp' : 'Nông nghiệp'} 
                            size="small" 
                            variant="outlined" 
                          />
                        )}
                      </Stack>
                      
                      <Grid container spacing={2} sx={{ mb: 1 }}>
                        <Grid item xs={6} sm={3}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LocalOffer fontSize="small" sx={{ mr: 0.5, color: 'error.main' }} />
                            <Typography variant="subtitle1" fontWeight="bold" color="error.main">
                              {formatPrice(post.price)} VNĐ
                              {post.propertyStatus === 'for-rent' && <Typography component="span" variant="caption">/tháng</Typography>}
                            </Typography>
                          </Box>
                        </Grid>
                        
                        {post.area && (
                          <Grid item xs={6} sm={3}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Straighten fontSize="small" sx={{ mr: 0.5 }} />
                              <Typography variant="body2">{post.area} m²</Typography>
                            </Box>
                          </Grid>
                        )}
                        
                        {post.bedrooms && (
                          <Grid item xs={6} sm={3}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Hotel fontSize="small" sx={{ mr: 0.5 }} />
                              <Typography variant="body2">{post.bedrooms} phòng ngủ</Typography>
                            </Box>
                          </Grid>
                        )}
                        
                        {post.bathrooms && (
                          <Grid item xs={6} sm={3}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Bathtub fontSize="small" sx={{ mr: 0.5 }} />
                              <Typography variant="body2">{post.bathrooms} phòng tắm</Typography>
                            </Box>
                          </Grid>
                        )}
                      </Grid>
                      
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          display: '-webkit-box', 
                          WebkitLineClamp: 2, 
                          WebkitBoxOrient: 'vertical', 
                          overflow: 'hidden',
                          mb: 1.5
                        }}
                      >
                        {post.description}
                      </Typography>
                      
                      {post.amenities && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" color="text.secondary">Tiện ích:</Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', mt: 0.5, color: 'primary.main' }}>
                            <AmenityIcon amenity="parking" available={post.amenities.parking} />
                            <AmenityIcon amenity="security" available={post.amenities.security} />
                            <AmenityIcon amenity="wifi" available={post.amenities.wifi} />
                            <AmenityIcon amenity="pool" available={post.amenities.pool} />
                            <AmenityIcon amenity="elevator" available={post.amenities.elevator} />
                            <AmenityIcon amenity="airConditioner" available={post.amenities.airConditioner} />
                            <AmenityIcon amenity="kitchen" available={post.amenities.kitchen} />
                            <AmenityIcon amenity="petFriendly" available={post.amenities.petFriendly} />
                            <AmenityIcon amenity="garage" available={post.amenities.garage} />
                          </Box>
                        </Box>
                      )}
                      
                      <Divider sx={{ my: 1 }} />
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        {post.contactName && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Person fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                            <Typography variant="body2">{post.contactName}</Typography>
                          </Box>
                        )}
                        
                        {post.contactPhone && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Phone fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                            <Typography variant="body2">{post.contactPhone}</Typography>
                          </Box>
                        )}
                        
                        {post.contactEmail && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Email fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                            <Typography variant="body2">{post.contactEmail}</Typography>
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                    
                    <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
                      <Button 
                        variant="outlined" 
                        startIcon={<Visibility />}
                        size="small"
                      >
                        Xem
                      </Button>
                      <Button 
                        variant="outlined" 
                        startIcon={<Edit />}
                        size="small"
                        onClick={() => onEdit(post)}
                      >
                        Sửa
                      </Button>
                      <Button 
                        variant="outlined" 
                        color="error"
                        startIcon={<Delete />}
                        size="small"
                        onClick={() => onDelete(post.id)}
                      >
                        Xóa
                      </Button>
                    </CardActions>
                  </Grid>
                </Grid>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default PostList;