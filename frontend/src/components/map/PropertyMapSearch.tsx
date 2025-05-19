import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, Button, IconButton, Tooltip, CircularProgress, Slider, FormControlLabel, Switch } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  MyLocation as MyLocationIcon,
  Home as HomeIcon,
  FilterAlt as FilterIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '../../utils/formatters';

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Different marker colors based on property type
const propertyIcons = {
  house: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  apartment: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  land: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  commercial: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  villa: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  default: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })
};

// Component to update map center when position changes
const ChangeMapView = ({ position }: { position: { lat: number; lng: number } }) => {
  const map = useMap();
  
  useEffect(() => {
    if (position && position.lat && position.lng) {
      map.setView([position.lat, position.lng], map.getZoom());
    }
  }, [map, position]);
  
  return null;
};

// Component to control map zoom and actions
const MapControls = ({ onZoomIn, onZoomOut, onMyLocation }: { 
  onZoomIn: () => void; 
  onZoomOut: () => void; 
  onMyLocation: () => void;
}) => {
  return (
    <Box 
      sx={{ 
        position: 'absolute', 
        top: 10, 
        right: 10, 
        zIndex: 1000,
        backgroundColor: 'white', 
        borderRadius: 1,
        boxShadow: 2,
        p: 1
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Tooltip title="Phóng to">
          <IconButton size="small" onClick={onZoomIn}>
            <ZoomInIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Thu nhỏ">
          <IconButton size="small" onClick={onZoomOut}>
            <ZoomOutIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Vị trí của tôi">
          <IconButton size="small" onClick={onMyLocation}>
            <MyLocationIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

interface PropertyMapSearchProps {
  properties: any[];
  loading?: boolean;
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
}

const PropertyMapSearch: React.FC<PropertyMapSearchProps> = ({
  properties = [],
  loading = false,
  initialCenter = { lat: 10.7769, lng: 106.7009 }, // HCM City default
  initialZoom = 12
}) => {
  const navigate = useNavigate();
  const mapRef = useRef<L.Map | null>(null);
  const [center, setCenter] = useState(initialCenter);
  const [showDistanceFilter, setShowDistanceFilter] = useState(false);
  const [filterDistance, setFilterDistance] = useState<number>(2000); // 2km default
  const [currentLocation, setCurrentLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [useLocationFilter, setUseLocationFilter] = useState(false);
  const [filteredProperties, setFilteredProperties] = useState<any[]>(properties);

  // Set map reference when map is created
  const handleMapCreated = () => {
    if (mapRef.current) {
      mapRef.current = mapRef.current;
    }
  };

  // Zoom controls
  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.setZoom(mapRef.current.getZoom() + 1);
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.setZoom(mapRef.current.getZoom() - 1);
    }
  };

  // Get current location
  const handleMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPosition = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCenter(newPosition);
          setCurrentLocation(newPosition);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Không thể lấy vị trí hiện tại. Vui lòng kiểm tra cài đặt quyền truy cập vị trí.');
        }
      );
    } else {
      alert('Trình duyệt của bạn không hỗ trợ định vị.');
    }
  };

  // Navigate to property detail page
  const handlePropertyClick = (propertyId: number) => {
    navigate(`/properties/${propertyId}`);
  };

  // Get icon based on property type
  const getPropertyIcon = (propertyType: string) => {
    const type = propertyType.toLowerCase();
    return propertyIcons[type as keyof typeof propertyIcons] || propertyIcons.default;
  };

  // Calculate distance between two points in meters
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371000; // Radius of the earth in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in meters
    return distance;
  };

  // Filter properties by distance when filter settings change
  useEffect(() => {
    if (useLocationFilter && currentLocation) {
      const filtered = properties.filter(property => {
        if (!property.latitude || !property.longitude) return false;
        
        const distance = calculateDistance(
          currentLocation.lat,
          currentLocation.lng,
          property.latitude,
          property.longitude
        );
        
        return distance <= filterDistance;
      });
      setFilteredProperties(filtered);
    } else {
      setFilteredProperties(properties);
    }
  }, [properties, useLocationFilter, currentLocation, filterDistance]);

  return (
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

      <Box sx={{ position: 'absolute', top: 10, left: 10, zIndex: 1000 }}>
        <Button
          variant="contained"
          startIcon={<FilterIcon />}
          onClick={() => setShowDistanceFilter(!showDistanceFilter)}
          size="small"
        >
          Lọc theo khoảng cách
        </Button>
      </Box>

      {showDistanceFilter && (
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 60, 
            left: 10, 
            zIndex: 1000,
            backgroundColor: 'white', 
            borderRadius: 1,
            boxShadow: 2,
            p: 2,
            width: 300
          }}
        >
          <Typography variant="subtitle2" gutterBottom>
            Lọc bất động sản theo khoảng cách
          </Typography>
          
          <FormControlLabel
            control={
              <Switch
                checked={useLocationFilter}
                onChange={(e) => {
                  setUseLocationFilter(e.target.checked);
                  if (e.target.checked && !currentLocation) {
                    handleMyLocation();
                  }
                }}
              />
            }
            label="Kích hoạt bộ lọc khoảng cách"
          />
          
          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography id="distance-slider" gutterBottom>
              Khoảng cách: {(filterDistance / 1000).toFixed(1)} km
            </Typography>
            <Slider
              value={filterDistance}
              onChange={(_, value) => setFilterDistance(value as number)}
              min={500}
              max={10000}
              step={500}
              aria-labelledby="distance-slider"
              disabled={!useLocationFilter}
              sx={{ mt: 1 }}
            />
          </Box>

          <Box sx={{ mt: 2 }}>
            <Button 
              variant="contained" 
              size="small" 
              startIcon={<MyLocationIcon />}
              onClick={handleMyLocation}
              disabled={!useLocationFilter}
            >
              Dùng vị trí hiện tại
            </Button>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            {useLocationFilter && currentLocation 
              ? `Hiển thị ${filteredProperties.length} bất động sản trong phạm vi ${(filterDistance / 1000).toFixed(1)} km.`
              : 'Lọc bất động sản xung quanh vị trí của bạn.'}
          </Typography>
        </Box>
      )}

      <Box sx={{ flexGrow: 1, minHeight: 500 }}>
        <MapContainer
          center={[center.lat, center.lng]} 
          zoom={initialZoom}
          style={{ height: '100%', width: '100%' }}
          whenReady={handleMapCreated}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Current location marker and circle */}
          {currentLocation && useLocationFilter && (
            <>
              <Marker 
                position={[currentLocation.lat, currentLocation.lng]} 
                icon={new L.Icon({
                  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
                  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/marker-shadow.png',
                  iconSize: [25, 41],
                  iconAnchor: [12, 41],
                  popupAnchor: [1, -34],
                  shadowSize: [41, 41]
                })}
              >
                <Popup>
                  <Typography variant="body2" fontWeight="bold">Vị trí hiện tại</Typography>
                </Popup>
              </Marker>
              
              <Circle 
                center={[currentLocation.lat, currentLocation.lng]}
                radius={filterDistance}
                pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }}
              />
            </>
          )}
          
          {/* Property markers */}
          {filteredProperties.map((property) => (
            property.latitude && property.longitude ? (
              <Marker 
                key={property.id}
                position={[property.latitude, property.longitude]} 
                icon={getPropertyIcon(property.property_type)}
              >
                <Popup>
                  <Box sx={{ width: 220 }}>
                    <Box 
                      component="img"
                      src={property.primary_image_url || property.image_url}
                      alt={property.title}
                      sx={{ 
                        width: '100%', 
                        height: 120, 
                        objectFit: 'cover',
                        borderRadius: 1,
                        mb: 1
                      }}
                    />
                    <Typography variant="subtitle2" fontWeight="bold">
                      {property.title}
                    </Typography>
                    <Typography variant="body2" color="primary" fontWeight="bold">
                      {formatPrice(property.price, property.listing_type === 'rent')}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                        <HomeIcon fontSize="small" sx={{ mr: 0.5, fontSize: '1rem' }} />
                        {property.property_type_display || property.property_type}
                      </Box>
                    </Typography>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      fullWidth 
                      sx={{ mt: 1 }}
                      onClick={() => handlePropertyClick(property.id)}
                    >
                      Xem chi tiết
                    </Button>
                  </Box>
                </Popup>
              </Marker>
            ) : null
          ))}
          
          <ChangeMapView position={center} />
          
          <MapControls 
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onMyLocation={handleMyLocation}
          />
        </MapContainer>
      </Box>

      <Box sx={{ p: 2, borderTop: '1px solid #eee' }}>
        <Typography variant="body2" color="text.secondary">
          {!loading ? (
            <>
              Đang hiển thị {filteredProperties.length} / {properties.length} bất động sản trên bản đồ.
              {!filteredProperties.length && " Vui lòng điều chỉnh bộ lọc hoặc di chuyển bản đồ để xem thêm bất động sản."}
            </>
          ) : "Đang tải bất động sản..."}
        </Typography>
      </Box>
    </Paper>
  );
};

export default PropertyMapSearch; 