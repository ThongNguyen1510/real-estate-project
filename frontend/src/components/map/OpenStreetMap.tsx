import React from 'react';
import { Box, Typography, Paper, Link } from '@mui/material';
import { LocationOn as LocationIcon, OpenInNew as OpenInNewIcon } from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix cho vấn đề icon Leaflet
// Xử lý lỗi icon mặc định trong React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface OpenStreetMapProps {
  latitude: number;
  longitude: number;
  address?: string;
  zoom?: number;
  height?: string | number;
  showInfo?: boolean;
}

const OpenStreetMap: React.FC<OpenStreetMapProps> = ({
  latitude,
  longitude,
  address,
  zoom = 15,
  height = '350px',
  showInfo = false,
}) => {
  // Nếu không có tọa độ, hiển thị placeholder
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

  // Format tọa độ để hiển thị
  const formatCoordinates = (lat: number, lng: number) => {
    // Format thành độ, phút, giây
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

  // URL OpenStreetMap để xem trên trình duyệt
  const openStreetMapUrl = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=${zoom}`;

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
      
      {/* Hiển thị tọa độ */}
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

      {/* Container cho bản đồ */}
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
        {/* Leaflet Map */}
        <MapContainer 
          center={[latitude, longitude]} 
          zoom={zoom} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[latitude, longitude]}>
            {address && (
              <Popup>
                {address}
              </Popup>
            )}
          </Marker>
        </MapContainer>
      </Box>
      
      {/* Chú thích bản đồ với link */}
      <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          © OpenStreetMap Contributors
        </Typography>
        
        <Link
          href={openStreetMapUrl}
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
            Xem trên OpenStreetMap
          </Typography>
          <OpenInNewIcon fontSize="small" sx={{ ml: 0.5 }} />
        </Link>
      </Box>
    </Paper>
  );
};

export default OpenStreetMap; 