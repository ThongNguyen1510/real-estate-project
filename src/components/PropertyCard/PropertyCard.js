import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addFavorite, removeFavorite } from '../../store/favoritesSlice';
import { Card, CardMedia, CardContent, CardActions, Typography, Button, Chip, Box, IconButton, Tooltip, Grid, Paper, CardActionArea } from '@mui/material';
import { Favorite, Share, LocationOn, KingBed, Bathtub, SquareFoot, Navigation, AttachMoney, Home, Apartment, Business, Landscape, FavoriteBorder, VerifiedUser, GppMaybe } from '@mui/icons-material';
import { SvgIcon } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

// Custom Villa icon since MUI doesn't have one
const Villa = (props) => (
  <SvgIcon {...props}>
    <path d="M19 10c-1.1 0-2 .9-2 2h-1V3L3 8v13h18v-9c0-1.1-.9-2-2-2zM5 9.37l9-3.46V12H9v7H5V9.37zM19 19h-3v-3h-2v3h-2v-7h7v7z" />
  </SvgIcon>
);

const PropertyCard = ({ property, mode = 'grid' }) => {
  const dispatch = useDispatch();
  const favorites = useSelector(state => state.favorites.items);
  const isFavorite = favorites.some(item => item.id === property.id);
  const navigate = useNavigate();

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    if (isFavorite) {
      dispatch(removeFavorite(property.id));
    } else {
      dispatch(addFavorite({
        id: property.id,
        title: property.title,
        price: property.price,
        location: property.location,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        area: property.area,
        type: property.type,
        image: property.image
      }));
    }
  };

  // Format price to VND currency 
  const formatPrice = (price) => {
    if (!price) return '0 ₫';
    
    // Format with separators
    const formattedPrice = new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
    
    // For values over 1 billion, show in billions
    if (price >= 1000000000) {
      return `${(price / 1000000000).toLocaleString('vi-VN', {minimumFractionDigits: 1, maximumFractionDigits: 1})} tỷ`;
    }
    
    // For values over 1 million, show in millions
    if (price >= 1000000) {
      return `${(price / 1000000).toLocaleString('vi-VN', {minimumFractionDigits: 0, maximumFractionDigits: 0})} triệu`;
    }
    
    return formattedPrice;
  };

  // Get property type icon
  const getPropertyTypeIcon = (type) => {
    switch (type) {
      case 'apartment':
        return <Apartment fontSize="small" />;
      case 'house':
        return <Home fontSize="small" />;
      case 'villa':
        return <Villa fontSize="small" />;
      case 'land':
        return <Landscape fontSize="small" />;
      default:
        return <Business fontSize="small" />;
    }
  };

  // Get property type label in Vietnamese
  const getPropertyTypeLabel = (type) => {
    switch (type) {
      case 'apartment':
        return 'Căn hộ';
      case 'house':
        return 'Nhà ở';
      case 'villa':
        return 'Biệt thự';
      case 'land':
        return 'Đất';
      default:
        return type;
    }
  };

  // Get direction label in Vietnamese
  const getDirectionLabel = (direction) => {
    const directions = {
      east: 'Đông',
      west: 'Tây',
      south: 'Nam',
      north: 'Bắc',
      northeast: 'Đông Bắc',
      northwest: 'Tây Bắc',
      southeast: 'Đông Nam',
      southwest: 'Tây Nam'
    };
    return directions[direction] || '';
  };

  // Purpose label (Mua/Thuê)
  const getPurposeLabel = (purpose) => {
    return purpose === 'rent' ? 'Cho thuê' : 'Bán';
  };

  const getVerificationIcon = () => {
    switch(property.verificationStatus) {
      case 'verified':
        return (
          <Tooltip title="Tin đăng đã được xác thực">
            <VerifiedUser color="success" fontSize="small" />
          </Tooltip>
        );
      case 'pending':
        return (
          <Tooltip title="Tin đăng đang chờ xác thực">
            <GppMaybe color="warning" fontSize="small" />
          </Tooltip>
        );
      default:
        return null;
    }
  };

  // Render as Grid Card
  if (mode === 'grid') {
    return (
      <Card 
        component={Link}
        to={`/property/${property.id}`}
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          textDecoration: 'none',
          transition: 'transform 0.3s, box-shadow 0.3s',
          borderRadius: 2,
          overflow: 'hidden',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: 6
          }
        }}
      >
        <Box sx={{ position: 'relative', paddingTop: '66%' }}>
          <CardMedia
            component="img"
            image={property.image}
            alt={property.title}
            sx={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover' 
            }}
          />
          <Chip
            icon={getPropertyTypeIcon(property.type)}
            label={getPropertyTypeLabel(property.type)}
            color="primary"
            size="small"
            sx={{ 
              position: 'absolute', 
              top: 16, 
              left: 16,
              fontWeight: 'bold'
            }}
          />
          <Chip
            label={getPurposeLabel(property.purpose)}
            color={property.purpose === 'rent' ? 'success' : 'warning'}
            size="small"
            sx={{ 
              position: 'absolute', 
              top: 16, 
              right: 56,
              fontWeight: 'bold'
            }}
          />
          <Tooltip title={isFavorite ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}>
            <IconButton
              onClick={handleFavoriteClick}
              sx={{ 
                position: 'absolute',
                top: 16,
                right: 16,
                color: isFavorite ? 'red' : 'white',
                backgroundColor: 'rgba(0,0,0,0.5)',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.7)'
                }
              }}
            >
              {isFavorite ? <Favorite /> : <FavoriteBorder />}
            </IconButton>
          </Tooltip>
          {property.verificationStatus && (
            <Box 
              sx={{ 
                position: 'absolute', 
                bottom: 10, 
                right: 10, 
                bgcolor: 'rgba(255,255,255,0.8)',
                borderRadius: '50%',
                p: 0.5
              }}
            >
              {getVerificationIcon()}
            </Box>
          )}
        </Box>
        <CardContent>
          <Typography 
            gutterBottom 
            variant="h6" 
            component="div" 
            sx={{ 
              fontWeight: 'bold',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              height: '3.6em',
              lineHeight: '1.2em'
            }}
          >
            {property.title}
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              mb: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            <LocationOn color="primary" fontSize="small" sx={{ mr: 0.5, mt: 0.2 }} />
            {property.location}
          </Typography>
          <Typography 
            variant="h6" 
            color="primary" 
            sx={{ 
              fontWeight: 'bold',
              my: 1
            }}
          >
            {formatPrice(property.price)}
            {property.purpose === 'rent' && <Typography component="span" variant="caption" color="text.secondary">/tháng</Typography>}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            {property.bedrooms > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <KingBed color="action" sx={{ mr: 0.5 }} />
                <Typography variant="body2">{property.bedrooms}</Typography>
              </Box>
            )}
            {property.bathrooms > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Bathtub color="action" sx={{ mr: 0.5 }} />
                <Typography variant="body2">{property.bathrooms}</Typography>
              </Box>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <SquareFoot color="action" sx={{ mr: 0.5 }} />
              <Typography variant="body2">{property.area} m²</Typography>
            </Box>
            {property.direction && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Navigation color="action" sx={{ mr: 0.5 }} />
                <Typography variant="body2">{getDirectionLabel(property.direction)}</Typography>
              </Box>
            )}
          </Box>
        </CardContent>
        <CardActions sx={{ justifyContent: 'center', px: 2, pb: 2, mt: 'auto' }}>
          <Button size="small" variant="contained" color="primary" fullWidth>
            Xem chi tiết
          </Button>
        </CardActions>
      </Card>
    );
  }
  
  // Render as List Card
  return (
    <Paper
      component={Link}
      to={`/property/${property.id}`}
      sx={{ 
        textDecoration: 'none',
        display: 'flex',
        height: '100%',
        transition: 'transform 0.3s, box-shadow 0.3s',
        borderRadius: 2,
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateX(5px)',
          boxShadow: 6
        }
      }}
    >
      <Box sx={{ 
        position: 'relative',
        width: '35%',
        minHeight: 200,
        overflow: 'hidden'
      }}>
        <CardMedia
          component="img"
          image={property.image}
          alt={property.title}
          sx={{ 
            height: '100%',
            objectFit: 'cover'
          }}
        />
        <Chip
          icon={getPropertyTypeIcon(property.type)}
          label={getPropertyTypeLabel(property.type)}
          color="primary"
          size="small"
          sx={{ position: 'absolute', top: 8, left: 8 }}
        />
        <Tooltip title={isFavorite ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}>
          <IconButton
            onClick={handleFavoriteClick}
            sx={{ 
              position: 'absolute',
              top: 8,
              right: 8,
              color: isFavorite ? 'red' : 'white',
              backgroundColor: 'rgba(0,0,0,0.5)',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.7)'
              },
              width: 30,
              height: 30
            }}
          >
            {isFavorite ? <Favorite /> : <FavoriteBorder />}
          </IconButton>
        </Tooltip>
        {property.verificationStatus && (
          <Box 
            sx={{ 
              position: 'absolute', 
              bottom: 10, 
              right: 10, 
              bgcolor: 'rgba(255,255,255,0.8)',
              borderRadius: '50%',
              p: 0.5
            }}
          >
            {getVerificationIcon()}
          </Box>
        )}
      </Box>
      <Box sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column',
        p: 2
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              fontWeight: 'bold',
              flexGrow: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {property.title}
          </Typography>
          <Chip
            label={getPurposeLabel(property.purpose)}
            color={property.purpose === 'rent' ? 'success' : 'warning'}
            size="small"
            sx={{ ml: 1 }}
          />
        </Box>
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 1,
            mt: 1
          }}
        >
          <LocationOn color="primary" fontSize="small" sx={{ mr: 0.5 }} />
          {property.location}
        </Typography>
        
        <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold', my: 1 }}>
          {formatPrice(property.price)}
          {property.purpose === 'rent' && <Typography component="span" variant="caption" color="text.secondary">/tháng</Typography>}
        </Typography>
        
        <Grid container spacing={2} sx={{ mt: 'auto' }}>
          {property.bedrooms > 0 && (
            <Grid item xs={6} sm={3}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <KingBed color="action" sx={{ mr: 0.5 }} />
                <Typography variant="body2">{property.bedrooms} phòng ngủ</Typography>
              </Box>
            </Grid>
          )}
          
          {property.bathrooms > 0 && (
            <Grid item xs={6} sm={3}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Bathtub color="action" sx={{ mr: 0.5 }} />
                <Typography variant="body2">{property.bathrooms} phòng tắm</Typography>
              </Box>
            </Grid>
          )}
          
          <Grid item xs={6} sm={3}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <SquareFoot color="action" sx={{ mr: 0.5 }} />
              <Typography variant="body2">{property.area} m²</Typography>
            </Box>
          </Grid>
          
          {property.direction && (
            <Grid item xs={6} sm={3}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Navigation color="action" sx={{ mr: 0.5 }} />
                <Typography variant="body2">{getDirectionLabel(property.direction)}</Typography>
              </Box>
            </Grid>
          )}
        </Grid>
        
        <Button 
          variant="contained" 
          color="primary" 
          size="small" 
          sx={{ 
            alignSelf: 'flex-end',
            mt: 2
          }}
        >
          Xem chi tiết
        </Button>
      </Box>
    </Paper>
  );
};

export default PropertyCard;