import React from 'react';
import { Box, Typography, Paper, Link, Divider } from '@mui/material';
import { LocationOn as LocationIcon, OpenInNew as OpenInNewIcon } from '@mui/icons-material';

// Replace with your actual Google Maps API key
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'AIzaSyD_9f3txx1pdeZ0-sJRJ9S-dHGbGw6S-QM'; // Use a placeholder key for development

interface MapLocationProps {
  latitude: number;
  longitude: number;
  address?: string;
  zoom?: number;
  height?: string | number;
  showInfo?: boolean;
}

const MapLocation: React.FC<MapLocationProps> = ({
  latitude,
  longitude,
  address,
  zoom = 15,
  height = '350px',
  showInfo = false,
}) => {
  // If coordinates are not provided, show placeholder
  if (!latitude || !longitude) {
    return (
      <Paper
        elevation={1}
        sx={{
          p: 3,
          mt: 3,
          borderRadius: 1,
        }}
      >
        <Typography variant="h6" fontWeight="medium" gutterBottom>
          Vị trí
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
          <Typography variant="body2" color="text.secondary">
            Vị trí không có sẵn
          </Typography>
        </Box>
      </Paper>
    );
  }

  // Format coordinates to be displayed
  const formatCoordinates = (lat: number, lng: number) => {
    // Format to degrees, minutes, seconds
    const getCoordinate = (coordinate: number, isLatitude: boolean) => {
      const absolute = Math.abs(coordinate);
      const degrees = Math.floor(absolute);
      const minutesWithFraction = (absolute - degrees) * 60;
      const minutes = Math.floor(minutesWithFraction);
      const seconds = ((minutesWithFraction - minutes) * 60).toFixed(1);
      
      const direction = isLatitude 
        ? coordinate >= 0 ? 'N' : 'S'
        : coordinate >= 0 ? 'E' : 'W';
      
      return `${degrees}°${minutes}'${seconds}"${direction}`;
    };
    
    return `${getCoordinate(lat, true)} ${getCoordinate(lng, false)}`;
  };

  // Construct the Google Maps Static API URL
  const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=${zoom}&size=800x400&scale=2&markers=color:red%7C${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`;

  // Fallback map URL
  const fallbackMapUrl = `https://via.placeholder.com/800x400/eee/999?text=Location+Map+(${latitude},${longitude})`;

  // Construct Google Maps directions URL
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

  return (
    <Paper
      elevation={1}
      sx={{
        p: 3,
        mt: 3,
        borderRadius: 1,
      }}
    >
      <Typography variant="h6" fontWeight="medium" gutterBottom>
        Vị trí
      </Typography>
      
      {/* Coordinates display */}
      <Box sx={{ 
        mb: 2, 
        p: 1.5, 
        borderRadius: 1, 
        border: '1px solid #e0e0e0',
        bgcolor: '#f9f9f9',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <Typography variant="body2" fontWeight="medium" color="text.secondary" align="center">
          {formatCoordinates(latitude, longitude)}
        </Typography>
      </Box>

      {/* Map Container with Border */}
      <Box
        sx={{
          width: '100%',
          height: height,
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 1,
          border: '1px solid #e0e0e0',
          '&:hover': {
            boxShadow: '0 3px 8px rgba(0,0,0,0.1)'
          }
        }}
      >
        {/* Static Map */}
        <Box
          component="img"
          src={staticMapUrl}
          alt={address || "Vị trí trên bản đồ"}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          onError={(e) => {
            console.error('Failed to load map image, using fallback');
            e.currentTarget.src = fallbackMapUrl;
          }}
        />
        
        {/* Google Logo Overlay for authentic look */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 5,
            right: 5,
            width: 60,
            height: 20,
            backgroundImage: 'url(https://maps.gstatic.com/mapfiles/api-3/images/google_white2.png)',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
          }}
        />
      </Box>
      
      {/* Map Caption with Link */}
      <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          © Google Maps 2023
        </Typography>
        
        <Link
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ 
            display: 'inline-flex',
            alignItems: 'center',
            textDecoration: 'none',
            color: 'primary.main',
            fontWeight: 'medium',
            '&:hover': { textDecoration: 'underline' }
          }}
        >
          <Typography variant="body2" component="span">
            Xem trên Google Maps
          </Typography>
          <OpenInNewIcon fontSize="small" sx={{ ml: 0.5 }} />
        </Link>
      </Box>
    </Paper>
  );
};

export default MapLocation; 