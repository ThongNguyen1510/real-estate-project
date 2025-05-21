import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Container,
  Paper,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  IconButton,
  Popover,
  Fade,
  Stack,
  Chip,
  Slider,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Home as HomeIcon,
  ArrowDropDown as ArrowDropDownIcon,
  AttachMoney as AttachMoneyIcon,
  AspectRatio as AspectRatioIcon,
  Hotel as HotelIcon,
  Bathtub as BathtubIcon,
  FilterAlt as FilterAltIcon,
} from '@mui/icons-material';
import SearchBox from './SearchBox';
import LocationSelector from './LocationSelector';
import MapViewButton from '../common/MapViewButton';

// Constants
const CITIES = [
  { id: '79', name: 'Hồ Chí Minh' },
  { id: '1', name: 'Hà Nội' },
  { id: '48', name: 'Đà Nẵng' },
  { id: '92', name: 'Cần Thơ' },
  { id: '31', name: 'Hải Phòng' },
  { id: '56', name: 'Khánh Hòa' },
  { id: '75', name: 'Bình Dương' },
  { id: '77', name: 'Đồng Nai' }
];

const PROPERTY_TYPES = [
  { value: '', label: 'Tất cả loại' },
  { value: 'apartment', label: 'Căn hộ chung cư' },
  { value: 'house', label: 'Nhà riêng' },
  { value: 'villa', label: 'Biệt thự' },
  { value: 'land', label: 'Đất nền' },
  { value: 'office', label: 'Văn phòng' },
  { value: 'shop', label: 'Mặt bằng kinh doanh' }
];

// Format currency (VND)
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

// Format area
const formatArea = (value: number) => {
  return `${value} m²`;
};

interface SearchHeaderProps {
  variant?: 'simple' | 'detailed';
  initialValues?: {
  keyword?: string;
  city?: string;
  city_name?: string;
  district?: string;
  property_type?: string;
    listing_type?: string;
    price_min?: number;
    price_max?: number;
    area_min?: number;
    area_max?: number;
    bedrooms?: string | number;
    bathrooms?: string | number;
  };
  onSearch?: (params: any) => void;
  transactionType?: 'rent' | 'sale';
}

const SearchHeader: React.FC<SearchHeaderProps> = ({ 
  variant = 'simple',
  initialValues,
  onSearch,
  transactionType
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract listing_type from URL when component mounts
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const listingType = params.get('listing_type');
    
    if (listingType === 'rent' || listingType === 'sale') {
      setSearchValues(prev => ({
        ...prev,
        listing_type: listingType
      }));
    }
  }, [location.search]);
  
  // Get initial values from URL if not provided in props
  const getInitialValueFromUrl = (param: string, defaultValue: any = '') => {
    if (initialValues && initialValues[param as keyof typeof initialValues] !== undefined) {
      return initialValues[param as keyof typeof initialValues];
    }
    
    const urlParams = new URLSearchParams(location.search);
    return urlParams.get(param) || defaultValue;
  };
  
  // State for search parameters
  const [searchValues, setSearchValues] = useState({
    keyword: getInitialValueFromUrl('keyword', ''),
    city: getInitialValueFromUrl('city', ''),
    city_name: getInitialValueFromUrl('city_name', ''),
    district: getInitialValueFromUrl('district', ''),
    property_type: getInitialValueFromUrl('property_type', ''),
    listing_type: getInitialValueFromUrl('listing_type', transactionType || 'sale'),
    price_min: Number(getInitialValueFromUrl('price_min', 0)),
    price_max: Number(getInitialValueFromUrl('price_max', 20000000000)),
    area_min: Number(getInitialValueFromUrl('area_min', 0)),
    area_max: Number(getInitialValueFromUrl('area_max', 500)),
    bedrooms: getInitialValueFromUrl('bedrooms', ''),
    bathrooms: getInitialValueFromUrl('bathrooms', ''),
  });
  
  // State for the price filter popover
  const [priceAnchorEl, setPriceAnchorEl] = useState<HTMLElement | null>(null);
  const [priceRange, setPriceRange] = useState<number[]>([
    Number(searchValues.price_min) || 0, 
    Number(searchValues.price_max) || 20000000000
  ]);
  
  // State for the area filter popover
  const [areaAnchorEl, setAreaAnchorEl] = useState<HTMLElement | null>(null);
  const [areaRange, setAreaRange] = useState<number[]>([
    Number(searchValues.area_min) || 0, 
    Number(searchValues.area_max) || 500
  ]);
  
  // State for the bedroom filter popover
  const [bedroomAnchorEl, setBedroomAnchorEl] = useState<HTMLElement | null>(null);
  
  // State for the advanced search modal
  const [advancedSearchOpen, setAdvancedSearchOpen] = useState(false);
  
  // Toggle listing type and navigate
  const toggleListingType = (type: string) => {
    handleSearchValueChange('listing_type', type);
    
    // Navigate to the search page with the appropriate listing type
    const params = new URLSearchParams(location.search);
    params.set('listing_type', type);
    navigate(`/tim-kiem?${params.toString()}`);
  };
  
  // Handle search parameter changes
  const handleSearchValueChange = (name: string, value: any) => {
    setSearchValues(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle location selection
  const handleLocationSelected = (cityId: string, cityName: string, district?: string) => {
    setSearchValues(prev => ({
      ...prev,
      city: cityId,
      city_name: cityName,
      district: district || ''
    }));
  };
  
  // Handle price range change
  const handlePriceRangeChange = (_: Event, newValue: number | number[]) => {
    setPriceRange(newValue as number[]);
  };
  
  // Apply price filter
  const applyPriceFilter = () => {
    setSearchValues(prev => ({
      ...prev,
      price_min: priceRange[0],
      price_max: priceRange[1]
    }));
    setPriceAnchorEl(null);
  };
  
  // Handle area range change
  const handleAreaRangeChange = (_: Event, newValue: number | number[]) => {
    setAreaRange(newValue as number[]);
  };
  
  // Apply area filter
  const applyAreaFilter = () => {
    setSearchValues(prev => ({
      ...prev,
      area_min: areaRange[0],
      area_max: areaRange[1]
    }));
    setAreaAnchorEl(null);
  };
  
  // Set bedroom count
  const setBedrooms = (count: number | string) => {
    handleSearchValueChange('bedrooms', count);
    setBedroomAnchorEl(null);
  };
  
  // Perform search
  const performSearch = () => {
    // Create URL parameters
    const params = new URLSearchParams();
    
    // Add non-empty parameters to URL
    Object.entries(searchValues).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, String(value));
      }
    });
    
    // Navigate to search results page
    navigate(`/tim-kiem?${params.toString()}`);
    
    // Call external handler if provided
    if (onSearch) {
      onSearch(searchValues);
    }
    
    // Close any open popovers
    setPriceAnchorEl(null);
    setAreaAnchorEl(null);
    setBedroomAnchorEl(null);
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSearchValues({
      keyword: '',
      city: '',
      city_name: '',
      district: '',
      property_type: '',
      listing_type: transactionType || 'sale',
      price_min: 0,
      price_max: 20000000000,
      area_min: 0,
      area_max: 500,
      bedrooms: '',
      bathrooms: ''
    });
    
    setPriceRange([0, 20000000000]);
    setAreaRange([0, 500]);
    
    // Reset URL if on search page
    if (location.pathname === '/tim-kiem') {
      navigate('/tim-kiem');
    }
  };
  
  return (
    <>
      <Box
          sx={{
          background: variant === 'simple' ? 'none' : 'none',
          backgroundSize: 'cover',
          backgroundColor: variant === 'simple' ? 'transparent' : '#f5f5f5',
          backgroundBlendMode: 'darken',
          padding: variant === 'simple' ? '0' : '20px 0 0',
          boxShadow: variant === 'detailed' ? '0 1px 5px rgba(0,0,0,0.1)' : 'none',
          position: 'relative'
        }}
      >
        <Container maxWidth="lg">
          {variant === 'simple' && (
            <Box sx={{ mb: 0, display: 'none' }}>
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  color: 'white',
                  fontWeight: 700,
                  textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                  mb: 2
                }}
              >
                Tìm kiếm bất động sản
              </Typography>
              <Typography
                variant="h6"
                component="h2"
                sx={{
                  color: 'white',
                  maxWidth: '700px',
                  margin: '0 auto',
                  textShadow: '0 1px 2px rgba(0,0,0,0.7)'
                }}
              >
                Tìm kiếm căn hộ, nhà riêng, đất nền và các loại bất động sản khác
              </Typography>
            </Box>
          )}
          
          {/* Main search box */}
          <Box sx={{ maxWidth: '850px', margin: '0 auto' }}>
            <Paper
              elevation={variant === 'simple' ? 2 : 0}
              sx={{
                p: variant === 'simple' ? 3 : 2,
                borderRadius: 3,
                backgroundColor: 'white',
                border: variant === 'detailed' ? '1px solid #e0e0e0' : 'none',
                boxShadow: variant === 'simple' ? '0 8px 24px rgba(0,0,0,0.08)' : '0 4px 20px rgba(0,0,0,0.15)'
              }}
            >
              {/* Toggle for listing type */}
              <Box sx={{ display: 'flex', mb: 2 }}>
                <Button
                  variant={(searchValues.listing_type === 'sale' || transactionType === 'sale') ? 'contained' : 'outlined'}
                  sx={{ 
                    flex: 1, 
                    borderRadius: '20px',
                    backgroundColor: (searchValues.listing_type === 'sale' || transactionType === 'sale') ? 'primary.main' : 'transparent'
                  }}
                  onClick={() => toggleListingType('sale')}
                >
                  Mua bán
                </Button>
                <Button
                  variant={(searchValues.listing_type === 'rent' || transactionType === 'rent') ? 'contained' : 'outlined'}
                  sx={{ 
                    flex: 1, 
                    borderRadius: '20px', 
                    ml: 1,
                    backgroundColor: (searchValues.listing_type === 'rent' || transactionType === 'rent') ? 'primary.main' : 'transparent'
                  }}
                  onClick={() => toggleListingType('rent')}
                >
                  Cho thuê
                </Button>
              </Box>
              
              <Grid container spacing={2}>
                {/* Keyword search */}
                <Grid item xs={12} sm={12} md={variant === 'detailed' ? 4 : 6}>
                <TextField
                  fullWidth
                    placeholder="Nhập từ khóa tìm kiếm..."
                    size="small"
                  value={searchValues.keyword}
                  onChange={(e) => handleSearchValueChange('keyword', e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && performSearch()}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                          <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
                {/* Location selector */}
                <Grid item xs={12} sm={6} md={variant === 'detailed' ? 3 : 3}>
                  <LocationSelector
                    selectedCityId={searchValues.city}
                    selectedCityName={searchValues.city_name}
                    selectedDistrict={searchValues.district}
                    onLocationSelected={handleLocationSelected}
                    placeholder="Chọn vị trí"
                    sx={{ height: '40px' }}
                  />
            </Grid>
                
                {/* Property type */}
                <Grid item xs={12} sm={6} md={variant === 'detailed' ? 3 : 3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Loại bất động sản</InputLabel>
                  <Select
                    value={searchValues.property_type}
                      label="Loại bất động sản"
                    onChange={(e) => handleSearchValueChange('property_type', e.target.value)}
                      startAdornment={
                        <InputAdornment position="start">
                          <HomeIcon />
                        </InputAdornment>
                      }
                    >
                      {PROPERTY_TYPES.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
                {/* Search button */}
                <Grid item xs={12} sm={12} md={variant === 'detailed' ? 2 : 12}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="medium"
                    startIcon={<SearchIcon />}
                    onClick={performSearch}
                    sx={{ height: variant === 'detailed' ? '40px' : 'auto' }}
                  >
                    Tìm kiếm
                  </Button>
                </Grid>
              </Grid>
              
              {/* Filter options for detailed variant */}
              {variant === 'detailed' && (
                <Fade in={true} timeout={1000}>
                  <Paper className="filterOptions" elevation={0} sx={{ 
                    borderRadius: '16px',
                    mt: 2,
                    p: 1,
                    backgroundColor: '#f9f9f9'
                  }}>
                    <Grid container spacing={1} sx={{ alignItems: 'center' }}>
                      {/* Price Range Button */}
                      <Grid item>
                        <Button
                          size="small"
                  variant="outlined"
                          color="inherit"
                          onClick={(e) => setPriceAnchorEl(e.currentTarget)}
                          endIcon={<ArrowDropDownIcon />}
                          startIcon={<AttachMoneyIcon />}
                          sx={{ 
                            borderRadius: '16px',
                            textTransform: 'none',
                            fontSize: '0.85rem',
                            color: searchValues.price_min > 0 || searchValues.price_max < 20000000000 ? 'primary.main' : 'text.secondary'
                          }}
                        >
                          {searchValues.price_min > 0 || searchValues.price_max < 20000000000 
                            ? `${formatCurrency(searchValues.price_min)} - ${formatCurrency(searchValues.price_max)}`
                            : 'Khoảng giá'
                          }
                        </Button>
                        <Popover
                          open={Boolean(priceAnchorEl)}
                          anchorEl={priceAnchorEl}
                          onClose={() => setPriceAnchorEl(null)}
                          anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                          }}
                          transformOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                          }}
                        >
                          <Box sx={{ p: 2, width: 300 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Khoảng giá
                            </Typography>
                            <Box sx={{ px: 1, pt: 2, pb: 1 }}>
                              <Slider
                                value={priceRange}
                                onChange={handlePriceRangeChange}
                                min={0}
                                max={20000000000}
                                step={500000000}
                                valueLabelDisplay="auto"
                                valueLabelFormat={(value) => formatCurrency(value)}
                              />
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="caption">{formatCurrency(priceRange[0])}</Typography>
                                <Typography variant="caption">{formatCurrency(priceRange[1])}</Typography>
                              </Box>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                              <Button onClick={() => setPriceAnchorEl(null)} size="small">
                                Hủy
                              </Button>
                              <Button onClick={applyPriceFilter} size="small" variant="contained" sx={{ ml: 1 }}>
                                Áp dụng
                              </Button>
                            </Box>
                          </Box>
                        </Popover>
                      </Grid>
                      
                      {/* Area Range Button */}
                      <Grid item>
                        <Button
                  size="small"
                          variant="outlined"
                          color="inherit"
                          onClick={(e) => setAreaAnchorEl(e.currentTarget)}
                          endIcon={<ArrowDropDownIcon />}
                          startIcon={<AspectRatioIcon />}
                  sx={{
                            borderRadius: '16px',
                            textTransform: 'none',
                            fontSize: '0.85rem',
                            color: searchValues.area_min > 0 || searchValues.area_max < 500 ? 'primary.main' : 'text.secondary'
                          }}
                        >
                          {searchValues.area_min > 0 || searchValues.area_max < 500
                            ? `${formatArea(searchValues.area_min)} - ${formatArea(searchValues.area_max)}`                            : 'Diện tích'
                          }
                        </Button>
                        <Popover
                          open={Boolean(areaAnchorEl)}
                          anchorEl={areaAnchorEl}
                          onClose={() => setAreaAnchorEl(null)}
                          anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                          }}
                          transformOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                          }}
                        >
                          <Box sx={{ p: 2, width: 300 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Diện tích
                            </Typography>
                            <Box sx={{ px: 1, pt: 2, pb: 1 }}>
                              <Slider
                                value={areaRange}
                                onChange={handleAreaRangeChange}
                                min={0}
                                max={500}
                                step={10}
                                valueLabelDisplay="auto"
                                valueLabelFormat={(value) => formatArea(value)}
                              />
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="caption">{formatArea(areaRange[0])}</Typography>
                                <Typography variant="caption">{formatArea(areaRange[1])}</Typography>
                              </Box>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                              <Button onClick={() => setAreaAnchorEl(null)} size="small">
                                Hủy
                              </Button>
                              <Button onClick={applyAreaFilter} size="small" variant="contained" sx={{ ml: 1 }}>
                                Áp dụng
                              </Button>
                            </Box>
                          </Box>
                        </Popover>
              </Grid>
              
                      {/* Bedrooms Button */}
                      <Grid item>
                        <Button
                          size="small"
                  variant="outlined"
                          color="inherit"
                          onClick={(e) => setBedroomAnchorEl(e.currentTarget)}
                          endIcon={<ArrowDropDownIcon />}
                          startIcon={<HotelIcon />}
                  sx={{
                            borderRadius: '16px',
                            textTransform: 'none',
                            fontSize: '0.85rem',
                            color: searchValues.bedrooms ? 'primary.main' : 'text.secondary'
                          }}
                        >
                          {searchValues.bedrooms ? `${searchValues.bedrooms}+ phòng ngủ` : 'Phòng ngủ'}
                        </Button>
                        <Popover
                          open={Boolean(bedroomAnchorEl)}
                          anchorEl={bedroomAnchorEl}
                          onClose={() => setBedroomAnchorEl(null)}
                          anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                          }}
                          transformOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                          }}
                        >
                          <Box sx={{ p: 2, width: 200 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Số phòng ngủ
                            </Typography>
                            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 1 }}>
                              <Chip 
                                label="Tất cả" 
                                variant={!searchValues.bedrooms ? "filled" : "outlined"}
                                color={!searchValues.bedrooms ? "primary" : "default"}
                                onClick={() => setBedrooms('')}
                              />
                              <Chip 
                                label="1" 
                                variant={Number(searchValues.bedrooms) === 1 ? "filled" : "outlined"}
                                color={Number(searchValues.bedrooms) === 1 ? "primary" : "default"}
                                onClick={() => setBedrooms(1)}
                              />
                              <Chip 
                                label="2" 
                                variant={Number(searchValues.bedrooms) === 2 ? "filled" : "outlined"}
                                color={Number(searchValues.bedrooms) === 2 ? "primary" : "default"}
                                onClick={() => setBedrooms(2)}
                              />
                              <Chip 
                                label="3" 
                                variant={Number(searchValues.bedrooms) === 3 ? "filled" : "outlined"}
                                color={Number(searchValues.bedrooms) === 3 ? "primary" : "default"}
                                onClick={() => setBedrooms(3)}
                              />
                              <Chip 
                                label="4" 
                                variant={Number(searchValues.bedrooms) === 4 ? "filled" : "outlined"}
                                color={Number(searchValues.bedrooms) === 4 ? "primary" : "default"}
                                onClick={() => setBedrooms(4)}
                              />
                              <Chip 
                                label="5+" 
                                variant={Number(searchValues.bedrooms) === 5 ? "filled" : "outlined"}
                                color={Number(searchValues.bedrooms) === 5 ? "primary" : "default"}
                                onClick={() => setBedrooms(5)}
                              />
                            </Stack>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                              <Button onClick={() => setBedroomAnchorEl(null)} size="small">
                                Đóng
                              </Button>
                            </Box>
                          </Box>
                        </Popover>
                      </Grid>
                      
                      {/* Reset filters button */}
                      <Grid item sx={{ ml: 'auto' }}>
                        <Button
                          size="small"
                          variant="text"
                          color="inherit"
                          onClick={resetFilters}
                          sx={{ textTransform: 'none', fontSize: '0.85rem' }}
                        >
                          Xóa bộ lọc
                        </Button>
              </Grid>
            </Grid>
          </Paper>
        </Fade>
              )}
            </Paper>
          </Box>
          
          {/* Map view button outside the white box */}
          <Box sx={{ 
            position: 'absolute', 
            top: variant === 'detailed' ? '98px' : '128px', 
            right: variant === 'detailed' ? '180px' : '240px',
            zIndex: 10 
          }}>
            <MapViewButton />
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default SearchHeader; 
