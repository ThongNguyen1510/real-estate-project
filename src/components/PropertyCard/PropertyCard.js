import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addFavorite, removeFavorite } from '../../store/favoritesSlice';
import { Card, CardMedia, CardContent, CardActions, Typography, Button, Chip, Box, IconButton, Tooltip } from '@mui/material';
import { Favorite, Share, LocationOn, KingBed, Bathtub, SquareFoot } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const PropertyCard = ({ property }) => {
  const dispatch = useDispatch();
  const favorites = useSelector(state => state.favorites.items);
  const isFavorite = favorites.some(item => item.id === property.id);

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

  return (
    <Card 
      component={Link}
      to={`/property/${property.id}`}
      sx={{ 
        maxWidth: 345,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        textDecoration: 'none',
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: 6
        }
      }}
    >
      <Box sx={{ position: 'relative', flex: 1 }}>
        <CardMedia
          component="img"
          height="200"
          image={property.image}
          alt={property.title}
          sx={{ objectFit: 'cover', height: '100%' }}
        />
        <Chip
          label={property.type}
          color="primary"
          size="small"
          sx={{ position: 'absolute', top: 16, left: 16 }}
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
            <Favorite />
          </IconButton>
        </Tooltip>
      </Box>
      <CardContent>
        <Typography gutterBottom variant="h6" component="div">
          {property.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <LocationOn color="primary" fontSize="small" sx={{ mr: 0.5 }} />
          {property.location}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <KingBed color="action" sx={{ mr: 0.5 }} />
            <Typography variant="body2">{property.bedrooms}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Bathtub color="action" sx={{ mr: 0.5 }} />
            <Typography variant="body2">{property.bathrooms}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SquareFoot color="action" sx={{ mr: 0.5 }} />
            <Typography variant="body2">{property.area} m²</Typography>
          </Box>
        </Box>
      </CardContent>
      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <Typography variant="h6" color="primary">
          {property.price}
        </Typography>
        <Button size="small" variant="outlined">
          Xem chi tiết
        </Button>
      </CardActions>
    </Card>
  );
};

export default PropertyCard;