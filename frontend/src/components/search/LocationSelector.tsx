import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Modal, 
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Grid,
  TextField,
  InputAdornment,
  CircularProgress,
  Card,
  CardMedia,
  CardContent,
  Tabs,
  Tab,
  useTheme
} from '@mui/material';
import { 
  LocationOn as LocationIcon,
  Close as CloseIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { fetchAllProvinces, formatLocationCode, Province, District } from '../../utils/locationUtils';
import { getImageUrl } from '../../utils/imageUtils';

// Define an interface for location data for consistency
interface CityData {
  id: string;
  name: string;
  division_type?: string;
  districts?: DistrictData[];
  image?: string;
}

interface DistrictData {
  id: string;
  name: string;
  division_type?: string;
}

interface LocationSelectorProps {
  selectedCityId?: string;
  selectedCityName?: string;
  selectedDistrict?: string;
  onLocationSelected?: (cityId: string, cityName: string, district?: string) => void;
  placeholder?: string;
  sx?: any;
}

// Top popular provinces with images
const FEATURED_PROVINCES = [
  { id: '1', name: 'Hà Nội', image: getImageUrl('img/cities/ha-noi.jpg') },
  { id: '79', name: 'Hồ Chí Minh', image: getImageUrl('img/cities/ho-chi-minh.jpg') },
  { id: '48', name: 'Đà Nẵng', image: getImageUrl('img/cities/da-nang.jpg') },
  { id: '75', name: 'Bình Dương', image: getImageUrl('img/cities/binh-duong.jpg') },
  { id: '77', name: 'Đồng Nai', image: getImageUrl('img/cities/dong-nai.jpg') }
];

// Fallback image if a province doesn't have one
const DEFAULT_PROVINCE_IMAGE = getImageUrl('img/cities/default-city.jpg');

const LocationSelector: React.FC<LocationSelectorProps> = ({ 
  selectedCityId = '',
  selectedCityName = '',
  selectedDistrict = '',
  onLocationSelected,
  placeholder = 'Chọn tỉnh thành',
  sx = {}
}) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'city' | 'district'>('city');
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [districtSearchQuery, setDistrictSearchQuery] = useState('');
  const [cities, setCities] = useState<CityData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0); // 0: Featured, 1: All provinces

  // Load all provinces data
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        setLoading(true);
        setError(null);
        const provincesData = await fetchAllProvinces();
        
        // Convert to the format our component expects
        const formattedCities = provincesData.map((province: Province) => {
          // Find if this province is in featured list to get the image
          const featuredProvince = FEATURED_PROVINCES.find(
            fp => fp.id === formatLocationCode(province.code)
          );

          return {
            id: formatLocationCode(province.code),
            name: province.name,
            division_type: province.division_type,
            image: featuredProvince?.image || DEFAULT_PROVINCE_IMAGE,
            districts: province.districts?.map((district: District) => ({
              id: formatLocationCode(district.code),
              name: district.name,
              division_type: district.division_type
            }))
          };
        });
        
        setCities(formattedCities);
      } catch (err) {
        console.error('Failed to load provinces data:', err);
        setError('Không thể tải danh sách tỉnh thành. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    loadProvinces();
  }, []);

  // Initialize selected city from props
  useEffect(() => {
    if (selectedCityId && cities.length > 0) {
      const city = cities.find(city => city.id === selectedCityId);
      if (city) {
        setSelectedCity(city);
      }
    } else if (selectedCityName && cities.length > 0) {
      const city = cities.find(city => city.name.toLowerCase() === selectedCityName.toLowerCase());
      if (city) {
        setSelectedCity(city);
      }
    }
  }, [selectedCityId, selectedCityName, cities]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setActiveTab('city');
    setSearchQuery('');
    setDistrictSearchQuery('');
    setTabValue(0); // Reset to featured tab
  };

  const handleCitySelect = (city: CityData) => {
    setSelectedCity(city);
    
    // If city has districts, show district selection
    if (city.districts && city.districts.length > 0) {
      setActiveTab('district');
    } else {
      // If no districts, complete selection
      if (onLocationSelected) {
        onLocationSelected(city.id, city.name);
      }
      handleClose();
    }
  };

  const handleDistrictSelect = (district: DistrictData) => {
    if (selectedCity && onLocationSelected) {
      onLocationSelected(selectedCity.id, selectedCity.name, district.name);
    }
    handleClose();
  };

  const handleBackToCity = () => {
    setActiveTab('city');
    setDistrictSearchQuery('');
  };

  const handleCompleteWithoutDistrict = () => {
    if (selectedCity && onLocationSelected) {
      onLocationSelected(selectedCity.id, selectedCity.name);
    }
    handleClose();
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Get featured cities with their full data from our cities array
  const featuredCities = useMemo(() => {
    if (cities.length === 0) return FEATURED_PROVINCES;
    
    return FEATURED_PROVINCES.map(featured => {
      const fullData = cities.find(city => city.id === featured.id);
      return fullData || featured;
    });
  }, [cities]);

  // Filter cities based on search query
  const filteredCities = useMemo(() => {
    return cities.filter(city => 
      city.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [cities, searchQuery]);

  // Group provinces alphabetically
  const groupedProvinces = useMemo(() => {
    if (cities.length === 0) return {};

    return filteredCities.reduce((acc: {[key: string]: CityData[]}, city) => {
      // Use first character as key
      const firstChar = city.name.charAt(0).toUpperCase();
      if (!acc[firstChar]) {
        acc[firstChar] = [];
      }
      acc[firstChar].push(city);
      return acc;
    }, {});
  }, [filteredCities]);

  // Alphabetical groups sorted
  const sortedGroups = useMemo(() => {
    return Object.keys(groupedProvinces).sort();
  }, [groupedProvinces]);

  // Get districts for selected city
  const cityDistricts = selectedCity?.districts || [];
  
  // Filter districts based on search query
  const filteredDistricts = cityDistricts.filter(district => 
    district.name.toLowerCase().includes(districtSearchQuery.toLowerCase())
  );

  // Display name in the selector
  const displayName = (() => {
    if (selectedCityName && selectedDistrict) {
      return `${selectedDistrict}, ${selectedCityName}`;
    } else if (selectedCityName) {
      return selectedCityName;
    } else if (selectedCity?.name) {
      return selectedCity.name;
    }
    return placeholder;
  })();

  return (
    <>
      <Box 
        onClick={handleOpen}
        sx={{
          display: 'flex',
          position: 'relative',
          alignItems: 'center',
          padding: '8px 12px',
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          cursor: 'pointer',
          backgroundColor: 'white',
          transition: 'all 0.2s ease',
          height: '100%',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'rgba(0,0,0,0.01)',
          },
          ...sx
        }}
      >
        <LocationIcon sx={{ color: 'primary.main', mr: 1, fontSize: '1.2rem' }} />
        <Typography 
          sx={{ 
            flexGrow: 1, 
            fontSize: '0.95rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            color: (selectedCityName || selectedCity) ? 'text.primary' : 'text.secondary',
          }}
        >
          {displayName}
        </Typography>
        <KeyboardArrowDownIcon sx={{ ml: 0.5, fontSize: '1.2rem', color: 'text.secondary' }} />
      </Box>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="location-selector-modal"
        aria-describedby="select-a-location-for-search"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2
        }}
      >
        <Paper
          sx={{
            position: 'relative',
            width: '100%',
            maxWidth: 800,
            maxHeight: '90vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 2
          }}
        >
          {/* Close button */}
          <IconButton 
            aria-label="close" 
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              zIndex: 10
            }}
          >
            <CloseIcon />
          </IconButton>

          {activeTab === 'city' ? (
            /* City selection */
            <>
              <Box sx={{ p: 3, pb: 2 }}>
                <Typography variant="h6" component="h2" fontWeight="bold">
                  Chọn tỉnh/thành phố
                </Typography>

                <TextField 
                  fullWidth
                  placeholder="Tìm tỉnh/thành phố"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mt: 2 }}
                />
              </Box>

              <Divider />

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4, height: '60vh' }}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Box sx={{ p: 3, textAlign: 'center', height: '60vh' }}>
                  <Typography color="error">{error}</Typography>
                  <Button 
                    variant="contained" 
                    onClick={() => window.location.reload()} 
                    sx={{ mt: 2 }}
                  >
                    Tải lại
                  </Button>
                </Box>
              ) : searchQuery ? (
                // Show search results
                <Box sx={{ overflow: 'auto', maxHeight: '70vh', p: 3 }}>
                  {filteredCities.length > 0 ? (
                    <Grid container spacing={2}>
                      {filteredCities.map((city) => (
                        <Grid item xs={6} sm={4} md={3} key={city.id}>
                          <Button 
                            fullWidth
                            onClick={() => handleCitySelect(city)}
                            sx={{ 
                              textAlign: 'left', 
                              justifyContent: 'flex-start',
                              textTransform: 'none',
                              py: 1
                            }}
                          >
                            <Typography color="textPrimary">
                              {city.name}
                            </Typography>
                          </Button>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Typography align="center">
                      Không tìm thấy tỉnh/thành phố nào
                    </Typography>
                  )}
                </Box>
              ) : (
                <Box sx={{ overflow: 'auto', maxHeight: '70vh' }}>
                  <Tabs 
                    value={tabValue} 
                    onChange={handleTabChange}
                    variant="fullWidth"
                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                  >
                    <Tab label="Tỉnh thành nổi bật" />
                    <Tab label="Tất cả tỉnh thành" />
                  </Tabs>

                  {tabValue === 0 ? (
                    // Featured provinces
                    <Box sx={{ p: 3 }}>
                      <Typography 
                        variant="h6" 
                        component="h3" 
                        fontWeight="bold" 
                        sx={{ mb: 2, fontSize: '1rem' }}
                      >
                        Top tỉnh thành nổi bật
                      </Typography>
                      <Grid container spacing={2}>
                        {featuredCities.map((city) => (
                          <Grid item xs={6} sm={4} key={city.id}>
                            <Card 
                              sx={{ 
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                '&:hover': {
                                  transform: 'translateY(-4px)',
                                  boxShadow: 4
                                },
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column'
                              }}
                              onClick={() => handleCitySelect(city)}
                            >
                              <CardMedia
                                component="img"
                                height="120"
                                image={city.image}
                                alt={city.name}
                                sx={{
                                  position: 'relative',
                                  '&::after': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.6))',
                                  }
                                }}
                              />
                              <CardContent 
                                sx={{ 
                                  p: 1.5, 
                                  textAlign: 'center',
                                  height: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                <Typography variant="body1" component="div" fontWeight="500">
                                  {city.name}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  ) : (
                    // All provinces grouped alphabetically
                    <Box sx={{ p: 3 }}>
                      <Typography 
                        variant="h6" 
                        component="h3" 
                        fontWeight="bold" 
                        sx={{ mb: 3, fontSize: '1rem' }}
                      >
                        Danh sách tỉnh thành
                      </Typography>

                      {sortedGroups.map((letter) => (
                        <Box key={letter} sx={{ mb: 3 }}>
                          <Typography 
                            variant="subtitle1" 
                            sx={{ 
                              mb: 1,
                              fontWeight: 'bold',
                              color: theme.palette.primary.main
                            }}
                          >
                            {letter}
                          </Typography>
                          <Grid container spacing={1}>
                            {groupedProvinces[letter].map((city) => (
                              <Grid item xs={6} sm={4} md={3} key={city.id}>
                                <Button 
                                  fullWidth
                                  onClick={() => handleCitySelect(city)}
                                  sx={{ 
                                    textAlign: 'left', 
                                    justifyContent: 'flex-start',
                                    textTransform: 'none',
                                    py: 1
                                  }}
                                >
                                  <Typography color="textPrimary">
                                    {city.name}
                                  </Typography>
                                </Button>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              )}
            </>
          ) : (
            /* District selection */
            <>
              <Box sx={{ p: 3, pb: 2 }}>
                <Button 
                  onClick={handleBackToCity}
                  sx={{ mb: 2, pl: 0 }}
                  color="primary"
                >
                  ← Quay lại
                </Button>
                <Typography variant="h6" component="h2" fontWeight="bold">
                  {selectedCity?.name}: Chọn quận/huyện
                </Typography>

                <TextField 
                  fullWidth
                  placeholder="Tìm quận/huyện"
                  value={districtSearchQuery}
                  onChange={(e) => setDistrictSearchQuery(e.target.value)}
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mt: 2 }}
                />
              </Box>

              <Divider />
              
              <Box sx={{ overflow: 'auto', maxHeight: '70vh', p: 3 }}>
                {filteredDistricts.length > 0 ? (
                  <>
                    <Box 
                      sx={{ 
                        p: 2, 
                        mb: 3, 
                        borderRadius: 1, 
                        bgcolor: theme.palette.primary.main,
                        color: 'white',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: theme.palette.primary.dark,
                        }
                      }}
                      onClick={handleCompleteWithoutDistrict}
                    >
                      <Typography fontWeight="bold">
                        Tất cả {selectedCity?.name}
                      </Typography>
                    </Box>
                    
                    <Grid container spacing={2}>
                      {filteredDistricts.map((district) => (
                        <Grid item xs={6} sm={4} key={district.id}>
                          <Button 
                            fullWidth
                            variant="outlined"
                            onClick={() => handleDistrictSelect(district)}
                            sx={{ 
                              textAlign: 'left', 
                              justifyContent: 'flex-start',
                              textTransform: 'none',
                              py: 1.5,
                              borderColor: '#e0e0e0',
                              '&:hover': {
                                borderColor: theme.palette.primary.main,
                                bgcolor: 'rgba(0,0,0,0.01)'
                              }
                            }}
                          >
                            <Typography color="textPrimary">
                              {district.name}
                            </Typography>
                          </Button>
                        </Grid>
                      ))}
                    </Grid>
                  </>
                ) : (
                  <Typography align="center">
                    Không tìm thấy quận/huyện nào
                  </Typography>
                )}
              </Box>
            </>
          )}
        </Paper>
      </Modal>
    </>
  );
};

export default LocationSelector; 