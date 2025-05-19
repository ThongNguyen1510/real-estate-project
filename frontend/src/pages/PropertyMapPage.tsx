import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Paper, 
  Button,
  CircularProgress,
  Grid,
  Divider,
  Tooltip,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  Map as MapIcon, 
  List as ListIcon,
  FilterAlt as FilterIcon
} from '@mui/icons-material';
import { propertyService } from '../services/api';
import locationService from '../services/api/locationService';
import PropertyMapSearch from '../components/map/PropertyMapSearch';
import PropertyFilters from '../components/property/PropertyFilters';
import PropertyCard from '../components/property/PropertyCard';
import { useSearchParams, useNavigate } from 'react-router-dom';

const PropertyMapPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'map' | 'split'>(!isMobile ? 'split' : 'map');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [totalProperties, setTotalProperties] = useState<number>(0);
  const [favorites, setFavorites] = useState<number[]>([]);
  
  // Get search params for filtering
  const getSearchParams = () => {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  };
  
  // Fetch properties based on filters
  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params = getSearchParams();
      
      // Only include properties with coordinates
      params.has_coordinates = 'true';
      
      // Get properties from API
      const response = await propertyService.getProperties(params);
      
      if (response.success) {
        // Process properties to ensure they have location data
        const propertiesWithLocation = await enrichPropertiesWithLocationNames(response.data.properties);
        setProperties(propertiesWithLocation);
        setTotalProperties(response.data.pagination.total);
      } else {
        console.error('Error fetching properties:', response.message);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Enrich properties with location names
  const enrichPropertiesWithLocationNames = async (propertiesList: any[]) => {
    if (!propertiesList || propertiesList.length === 0) return propertiesList;
    
    // Process all properties to add location names if missing
    return await Promise.all(propertiesList.map(async (property) => {
      // Skip processing if we already have location names
      if (property.city_name && property.district_name && property.ward_name) {
        return property;
      }
      
      try {
        // Fetch location names if they're missing
        const locationResponse = await locationService.getLocationNames(
          property.city || null,
          property.district || null,
          property.ward || null
        );
        
        if (locationResponse.success && locationResponse.data) {
          const { city_name, district_name, ward_name } = locationResponse.data;
          
          // Return property with additional location names
          return {
            ...property,
            city_name: city_name || property.city || '',
            district_name: district_name || property.district || '',
            ward_name: ward_name || property.ward || ''
          };
        }
      } catch (error) {
        console.error('Error enriching property with location names:', error);
      }
      
      // Return original property if location enrichment fails
      return property;
    }));
  };
  
  // Load properties when search params change
  useEffect(() => {
    fetchProperties();
  }, [searchParams]);
  
  // Listen for window resize to switch views on mobile
  useEffect(() => {
    if (isMobile && viewMode === 'split') {
      setViewMode('map');
    }
  }, [isMobile]);
  
  // Handle search filter updates
  const handleFilterChange = (filters: Record<string, any>) => {
    // Convert filters to search params
    const newParams = new URLSearchParams();
    
    // Keep existing params that aren't related to filters
    searchParams.forEach((value, key) => {
      if (!Object.keys(filters).includes(key)) {
        newParams.set(key, value);
      }
    });
    
    // Add new filter values
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        newParams.set(key, String(value));
      }
    });
    
    setSearchParams(newParams);
  };
  
  // Handle toggling between map and split view
  const handleViewModeChange = (event: React.SyntheticEvent, newValue: 'map' | 'split') => {
    setViewMode(newValue);
  };
  
  // Handle favorite toggle
  const handleFavoriteToggle = (propertyId: number, isFavorite: boolean) => {
    // Update local favorites list
    if (isFavorite) {
      setFavorites(prev => [...prev, propertyId]);
    } else {
      setFavorites(prev => prev.filter(id => id !== propertyId));
    }
  };
  
  return (
    <Box sx={{ py: 3 }}>
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1" fontWeight="bold">
            Tìm kiếm bất động sản trên bản đồ
          </Typography>
          
          {!isMobile && (
            <Tabs 
              value={viewMode} 
              onChange={handleViewModeChange} 
              aria-label="view mode tabs"
            >
              <Tab 
                icon={<MapIcon />} 
                label="Bản đồ" 
                value="map" 
              />
              <Tab 
                icon={<React.Fragment><MapIcon fontSize="small" /><ListIcon fontSize="small" /></React.Fragment>} 
                label="Bản đồ + Danh sách" 
                value="split" 
              />
            </Tabs>
          )}
          
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Bộ lọc
          </Button>
        </Box>
        
        {/* Filters */}
        {showFilters && (
          <Paper sx={{ p: 2, mb: 3 }}>
            <PropertyFilters onApplyFilters={handleFilterChange} />
          </Paper>
        )}
        
        {/* Property count */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="body1">
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CircularProgress size={20} sx={{ mr: 1 }} /> Đang tải bất động sản...
              </Box>
            ) : (
              `Tìm thấy ${totalProperties} bất động sản`
            )}
          </Typography>
        </Paper>
        
        {/* Main content */}
        <Grid container spacing={3}>
          {/* Map view */}
          <Grid item xs={12} md={viewMode === 'split' ? 8 : 12}>
            <Box sx={{ height: isMobile ? 'calc(100vh - 200px)' : '70vh' }}>
              <PropertyMapSearch 
                properties={properties} 
                loading={loading} 
              />
            </Box>
          </Grid>
          
          {/* List view (in split mode) */}
          {viewMode === 'split' && (
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, height: '70vh', overflow: 'auto' }}>
                <Typography variant="h6" gutterBottom>
                  Danh sách bất động sản
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                    <CircularProgress />
                  </Box>
                ) : properties.length === 0 ? (
                  <Typography variant="body1" sx={{ textAlign: 'center', py: 5 }}>
                    Không tìm thấy bất động sản nào phù hợp với tiêu chí tìm kiếm
                  </Typography>
                ) : (
                  <Grid container spacing={2}>
                    {properties.map(property => (
                      <Grid item xs={12} key={property.id}>
                        <PropertyCard 
                          property={property}
                          onFavoriteToggle={handleFavoriteToggle}
                          isFavorite={favorites.includes(property.id)}
                        />
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Paper>
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  );
};

export default PropertyMapPage; 