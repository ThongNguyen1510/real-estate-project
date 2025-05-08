import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid,
  Button,
  Tab,
  Tabs,
  Skeleton,
  useTheme 
} from '@mui/material';
import { NavigateBefore, NavigateNext } from '@mui/icons-material';
import PropertyCard from '../property/PropertyCard';
import { propertyService } from '../../services/api';
import { getLocationNames } from '../../services/api/locationService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`property-tabpanel-${index}`}
      aria-labelledby={`property-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const FeaturedProperties: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<number[]>([]);
  
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
        const locationResponse = await getLocationNames(
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
  
  // Get real property data from API
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        // Fetch properties from our backend API
        const response = await propertyService.getProperties({
          limit: 12,
          page: 1
        });
        
        if (response.success && response.data && response.data.properties) {
          console.log('Fetched properties:', response.data.properties);
          // Enrich properties with location names
          const enrichedProperties = await enrichPropertiesWithLocationNames(response.data.properties);
          setProperties(enrichedProperties);
        } else {
          console.error('Failed to fetch properties:', response);
          
          // Nếu lỗi xác thực, hiển thị dữ liệu mẫu
          if (response.status === 401 || response.status === 403) {
            console.log('FeaturedProperties: Showing mock data due to auth error');
            // Tạo dữ liệu mẫu
            const mockProperties = Array.from({ length: 8 }, (_, index) => ({
              id: index + 1,
              title: index % 2 === 0 ? `Căn hộ cao cấp ${index + 1} phòng ngủ` : `Nhà phố ${index + 1} tầng mặt tiền`,
              price: index % 2 === 0 ? 500000000 + (index * 30000000) : 2000000000 + (index * 500000000),
              area: 50 + (index * 10),
              bedrooms: 1 + (index % 3),
              bathrooms: 1 + (index % 2),
              city: 'Hồ Chí Minh',
              city_name: 'Hồ Chí Minh',
              district: index % 2 === 0 ? 'Quận 1' : 'Quận 2',
              district_name: index % 2 === 0 ? 'Quận 1' : 'Quận 2',
              address: '123 Đường ABC',
              status: 'available',
              property_type: index % 3 === 0 ? 'apartment' : (index % 3 === 1 ? 'house' : 'villa'),
              image_url: `https://source.unsplash.com/featured/300x200?property,${index}`,
              primary_image_url: `https://source.unsplash.com/featured/300x200?property,${index}`
            }));
            setProperties(mockProperties);
            return;
          }
          
          // Set empty array if the API call fails
          setProperties([]);
        }
      } catch (error: any) {
        console.error('Error fetching properties:', error);
        
        // Nếu lỗi là do xác thực, hiển thị dữ liệu mẫu
        if (error && typeof error === 'object' && error.response && (error.response.status === 401 || error.response.status === 403)) {
          console.log('FeaturedProperties: Showing mock data due to auth error');
          // Tạo dữ liệu mẫu
          const mockProperties = Array.from({ length: 8 }, (_, index) => ({
            id: index + 1,
            title: index % 2 === 0 ? `Căn hộ cao cấp ${index + 1} phòng ngủ` : `Nhà phố ${index + 1} tầng mặt tiền`,
            price: index % 2 === 0 ? 500000000 + (index * 30000000) : 2000000000 + (index * 500000000),
            area: 50 + (index * 10),
            bedrooms: 1 + (index % 3),
            bathrooms: 1 + (index % 2),
            city: 'Hồ Chí Minh',
            city_name: 'Hồ Chí Minh',
            district: index % 2 === 0 ? 'Quận 1' : 'Quận 2',
            district_name: index % 2 === 0 ? 'Quận 1' : 'Quận 2',
            address: '123 Đường ABC',
            status: 'available',
            property_type: index % 3 === 0 ? 'apartment' : (index % 3 === 1 ? 'house' : 'villa'),
            image_url: `https://source.unsplash.com/featured/300x200?property,${index}`,
            primary_image_url: `https://source.unsplash.com/featured/300x200?property,${index}`
          }));
          setProperties(mockProperties);
          return;
        }
        
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };
    
    // Load user favorites (for future implementation)
    const loadFavorites = () => {
      // In a real app, you would fetch user favorites from API
      const mockFavorites: number[] = []; // Empty for now
      setFavorites(mockFavorites);
    };
    
    fetchProperties();
    loadFavorites();
  }, []);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  const handleToggleFavorite = (propertyId: number) => {
    if (favorites.includes(propertyId)) {
      setFavorites(favorites.filter(id => id !== propertyId));
    } else {
      setFavorites([...favorites, propertyId]);
    }
  };
  
  // Filter properties based on active tab
  const filteredProperties = properties.filter(property => {
    if (activeTab === 0) return true; // All properties
    if (activeTab === 1) return property.price >= 1000000000; // For sale (1 tỷ trở lên)
    if (activeTab === 2) return property.price < 1000000000; // For rent (dưới 1 tỷ)
    return true;
  });
  
  return (
    <Box sx={{ py: 8, bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography 
            variant="h4" 
            component="h2" 
            sx={{ 
              fontWeight: 'bold',
              mb: 1,
              position: 'relative',
              display: 'inline-block',
              '&:after': {
                content: '""',
                display: 'block',
                width: 80,
                height: 3,
                backgroundColor: theme.palette.secondary.main,
                position: 'absolute',
                bottom: -12,
                left: '50%',
                transform: 'translateX(-50%)'
              }
            }}
          >
            Bất động sản nổi bật
          </Typography>
          
          <Typography 
            variant="subtitle1" 
            color="text.secondary"
            sx={{ 
              mt: 3, 
              mb: 4,
              maxWidth: 700,
              mx: 'auto'
            }}
          >
            Khám phá các bất động sản đặc biệt được chọn lọc với vị trí đắc địa, thiết kế hiện đại và tiện ích đầy đủ
          </Typography>
          
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              centered
              textColor="primary"
              indicatorColor="primary"
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 'medium',
                  mx: 2
                }
              }}
            >
              <Tab label="Tất cả" />
              <Tab label="Nhà bán" />
              <Tab label="Nhà cho thuê" />
            </Tabs>
          </Box>
        </Box>
        
        <TabPanel value={activeTab} index={activeTab}>
          {loading ? (
            <Grid container spacing={3}>
              {[1, 2, 3, 4].map((item) => (
                <Grid item xs={12} sm={6} md={3} key={item}>
                  <Skeleton variant="rectangular" height={200} sx={{ mb: 1, borderRadius: 1 }} />
                  <Skeleton variant="text" height={40} sx={{ mb: 0.5 }} />
                  <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
                  <Skeleton variant="text" height={30} sx={{ mb: 1 }} />
                  <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Grid container spacing={3}>
              {filteredProperties.slice(0, 8).map((property) => (
                <Grid item xs={12} sm={6} md={3} key={property.id}>
                  <PropertyCard 
                    property={{
                      ...property,
                      isFavorite: favorites.includes(property.id)
                    }} 
                    onFavoriteToggle={handleToggleFavorite}
                  />
                </Grid>
              ))}
            </Grid>
          )}
          
          <Box sx={{ textAlign: 'center', mt: 5 }}>
            <Button 
              variant="outlined" 
              color="primary" 
              size="large"
              href={activeTab === 0 ? '/tim-kiem' : activeTab === 1 ? '/mua-ban' : '/cho-thue'}
              sx={{ 
                px: 4, 
                py: 1.2,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2
                }
              }}
            >
              Xem tất cả bất động sản
            </Button>
          </Box>
        </TabPanel>
      </Container>
    </Box>
  );
};

export default FeaturedProperties; 