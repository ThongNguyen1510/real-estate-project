import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, CircularProgress, Paper } from '@mui/material';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LocationOn as LocationIcon, MyLocation as MyLocationIcon } from '@mui/icons-material';
import defaultCoordinatesConfig from '../../configFixes.json';

// Fix the default icon issue in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Location marker for better visibility
const locationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Fallback coordinates for HCM City center
const DEFAULT_POSITION = {
  lat: 10.7769, 
  lng: 106.7009
};

// Component to update map center when position changes
const ChangeMapView = ({ position }: { position: { lat: number; lng: number } }) => {
  const map = useMap();
  
  useEffect(() => {
    if (position && position.lat && position.lng) {
      map.setView([position.lat, position.lng], 15);
    }
  }, [map, position]);
  
  return null;
};

// Component to handle map clicks and set marker
const MapClickHandler = ({ 
  onPositionChange 
}: { 
  onPositionChange: (position: { lat: number; lng: number }) => void 
}) => {
  const map = useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      console.log('Map clicked at position:', { lat, lng });
      onPositionChange({ lat, lng });
    }
  });
  
  return null;
};

interface MapPickerProps {
  position: { lat: number; lng: number } | null;
  onPositionChange: (position: { lat: number; lng: number }) => void;
  onSave?: () => void;
  onCancel?: () => void;
  readOnly?: boolean;
}

const MapPicker: React.FC<MapPickerProps> = ({ 
  position, 
  onPositionChange, 
  onSave, 
  onCancel,
  readOnly = false
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapPosition, setMapPosition] = useState<{ lat: number; lng: number }>(
    position && position.lat && position.lng 
      ? position 
      : DEFAULT_POSITION
  );

  useEffect(() => {
    // Update internal position if the external position changes
    if (position && position.lat && position.lng) {
      setMapPosition(position);
    } else if (position === null) {
      // If position is explicitly set to null, reset to default
      setMapPosition(DEFAULT_POSITION);
    }
  }, [position]);

  const getCurrentLocation = () => {
    if (readOnly) return;
    
    setLoading(true);
    setError(null);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPosition = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setMapPosition(newPosition);
          onPositionChange(newPosition);
          setLoading(false);
        },
        (positionError) => {
          console.error('Geolocation error:', positionError);
          setError('Không thể lấy vị trí hiện tại. Vui lòng chọn thủ công trên bản đồ.');
          setLoading(false);
        }
      );
    } else {
      setError('Trình duyệt của bạn không hỗ trợ định vị. Vui lòng chọn thủ công trên bản đồ.');
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (onSave) {
      // Ensure coordinates are valid numbers before saving
      if (!mapPosition || typeof mapPosition.lat !== 'number' || typeof mapPosition.lng !== 'number') {
        setError('Vị trí không hợp lệ. Vui lòng chọn lại trên bản đồ.');
        return;
      }

      // Round to 6 decimal places for precision
      const validPosition = {
        lat: Number(mapPosition.lat.toFixed(6)),
        lng: Number(mapPosition.lng.toFixed(6))
      };
      
      // Update the position one final time before saving
      onPositionChange(validPosition);
      onSave();
    }
  };

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Paper 
        elevation={3} 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative' 
        }}
      >
        {loading && (
          <Box 
            sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              zIndex: 1000
            }}
          >
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Typography 
            color="error" 
            variant="body2" 
            sx={{ 
              p: 1, 
              backgroundColor: 'rgba(255, 235, 235, 0.9)',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 900
            }}
          >
            {error}
          </Typography>
        )}

        <Box sx={{ flexGrow: 1, minHeight: 300 }}>
      <MapContainer
            center={[mapPosition.lat, mapPosition.lng]} 
        zoom={15}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
            
            {mapPosition && (
              <Marker 
                position={[mapPosition.lat, mapPosition.lng]} 
                icon={locationIcon}
              />
            )}
            
            {!readOnly && <MapClickHandler onPositionChange={onPositionChange} />}
            <ChangeMapView position={mapPosition} />
      </MapContainer>
        </Box>

        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>Vị trí:</strong> {mapPosition.lat.toFixed(6)}, {mapPosition.lng.toFixed(6)}
        </Typography>
            <Typography variant="caption" color="text.secondary">
              {readOnly ? 'Chỉ xem vị trí' : 'Nhấp vào bản đồ để chọn vị trí'}
        </Typography>
      </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {!readOnly && (
              <Button 
                startIcon={<MyLocationIcon />}
                variant="outlined" 
                size="small" 
                onClick={getCurrentLocation}
                disabled={loading}
              >
                Vị trí hiện tại
              </Button>
            )}

            {onCancel && (
              <Button 
                variant="outlined" 
                size="small" 
                onClick={onCancel}
                disabled={loading}
              >
                Hủy
              </Button>
            )}

            {onSave && !readOnly && (
              <Button 
                startIcon={<LocationIcon />}
                variant="contained" 
                size="small" 
                onClick={handleSave}
                disabled={loading || !mapPosition}
                color="primary"
              >
                Lưu vị trí
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default MapPicker; 