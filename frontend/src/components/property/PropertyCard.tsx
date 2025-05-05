import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Box, 
  IconButton,
  Chip,
  Tooltip,
  Grid
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Bed as BedIcon,
  Bathtub as BathtubIcon,
  SquareFoot as SquareFootIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { formatPrice } from '../../utils/format';

interface PropertyCardProps {
  property: {
    id: number;
    title: string;
    address?: string;
    city?: string;
    district?: string;
    price: number;
    area: number;
    bedrooms?: number;
    bathrooms?: number;
    images?: any[];
    image_url?: string;
    primary_image_url?: string;
    status?: string;
    property_type: string;
    isFavorite?: boolean;
  };
  onFavoriteToggle?: (id: number) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onFavoriteToggle }) => {
  const {
    id,
    title,
    address = '',
    city = '',
    district = '',
    price,
    area,
    bedrooms = 0,
    bathrooms = 0,
    images = [],
    image_url,
    primary_image_url,
    status,
    property_type,
    isFavorite = false
  } = property;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onFavoriteToggle) {
      onFavoriteToggle(id);
    }
  };

  const propertyTypeLabel = () => {
    switch (property_type) {
      case 'apartment':
        return 'Căn hộ';
      case 'house':
        return 'Nhà';
      case 'villa':
        return 'Biệt thự';
      case 'land':
        return 'Đất';
      case 'office':
        return 'Văn phòng';
      case 'commercial':
        return 'Mặt bằng KD';
      default:
        return property_type;
    }
  };

  // Determine transaction type from status
  const isForSale = status === 'for_sale';
  const isForRent = status === 'for_rent';
  const transactionType = isForSale ? 'sale' : (isForRent ? 'rent' : 'sale');
  const transactionTypeLabel = isForSale ? 'Bán' : (isForRent ? 'Cho thuê' : 'Bán');
  
  // Determine the image to display (using priority)
  const imageUrl = primary_image_url || image_url || 
    (images && images.length > 0 ? images[0] : '/img/property/default.jpg');

  return (
    <Card 
      component={Link} 
      to={`/bat-dong-san/${id}`}
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        textDecoration: 'none',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
        }
      }}
    >
      {/* Image section */}
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="200"
          image={imageUrl}
          alt={title}
          sx={{ objectFit: 'cover' }}
        />
        
        {/* Transaction type badge */}
        <Chip
          label={transactionTypeLabel}
          color={transactionType === 'sale' ? 'primary' : 'secondary'}
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            fontWeight: 'bold',
          }}
        />
        
        {/* Property type badge */}
        <Chip
          label={propertyTypeLabel()}
          color="default"
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            bgcolor: 'rgba(255,255,255,0.8)',
            fontWeight: 'medium',
          }}
        />
        
        {/* Favorite button */}
        <IconButton
          onClick={handleFavoriteClick}
          sx={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            bgcolor: 'rgba(255,255,255,0.8)',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.9)',
            }
          }}
          size="small"
        >
          {isFavorite ? (
            <FavoriteIcon color="error" fontSize="small" />
          ) : (
            <FavoriteBorderIcon color="action" fontSize="small" />
          )}
        </IconButton>
      </Box>
      
      {/* Content section */}
      <CardContent sx={{ flexGrow: 1, pt: 2, pb: '16px !important' }}>
        <Typography 
          variant="h6" 
          component="h2" 
          sx={{ 
            fontSize: '1.1rem',
            fontWeight: 'bold',
            mb: 1,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            height: '2.75rem'
          }}
        >
          {title}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <LocationIcon 
            sx={{ 
              fontSize: '1rem', 
              color: 'text.secondary',
              mr: 0.5
            }} 
          />
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              fontSize: '0.875rem'
            }}
          >
            {district}, {city}
          </Typography>
        </Box>
        
        <Typography 
          variant="h6" 
          color="primary" 
          sx={{ 
            fontWeight: 'bold',
            mb: 1.5,
            fontSize: '1.25rem'
          }}
        >
          {formatPrice(price)}
          {transactionType === 'rent' && '/tháng'}
        </Typography>
        
        {/* Property attributes */}
        <Grid container spacing={2} sx={{ pt: 1, borderTop: '1px solid #eee' }}>
          <Grid item xs={4}>
            <Tooltip title="Diện tích">
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SquareFootIcon sx={{ fontSize: 18, mr: 0.5, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {area} m²
                </Typography>
              </Box>
            </Tooltip>
          </Grid>
          
          <Grid item xs={4}>
            <Tooltip title="Phòng ngủ">
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BedIcon sx={{ fontSize: 18, mr: 0.5, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {bedrooms}
                </Typography>
              </Box>
            </Tooltip>
          </Grid>
          
          <Grid item xs={4}>
            <Tooltip title="Phòng tắm">
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BathtubIcon sx={{ fontSize: 18, mr: 0.5, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {bathrooms}
                </Typography>
              </Box>
            </Tooltip>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default PropertyCard; 