import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Button, 
  Paper,
  TextField,
  MenuItem,
  InputAdornment,
  Autocomplete,
  useTheme
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Home as HomeIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { locationService } from '../../services/api';

interface City {
  id: number;
  name: string;
}

interface District {
  id: number;
  name: string;
  city_id: number;
}

const propertyTypes = [
  { value: 'all', label: 'Tất cả loại' },
  { value: 'apartment', label: 'Căn hộ' },
  { value: 'house', label: 'Nhà ở' },
  { value: 'villa', label: 'Biệt thự' },
  { value: 'land', label: 'Đất nền' },
  { value: 'office', label: 'Văn phòng' },
];

const transactionTypes = [
  { value: 'all', label: 'Mua & Thuê' },
  { value: 'sale', label: 'Mua bán' },
  { value: 'rent', label: 'Cho thuê' },
];

const priceRanges = [
  { value: 'all', label: 'Mọi giá' },
  { value: '0-500', label: 'Dưới 500 triệu' },
  { value: '500-1000', label: 'Từ 500 triệu - 1 tỷ' },
  { value: '1000-3000', label: 'Từ 1 tỷ - 3 tỷ' },
  { value: '3000-7000', label: 'Từ 3 tỷ - 7 tỷ' },
  { value: '7000-15000', label: 'Từ 7 tỷ - 15 tỷ' },
  { value: '15000', label: 'Trên 15 tỷ' },
];

const areaRanges = [
  { value: 'all', label: 'Diện tích' },
  { value: '0-30', label: 'Dưới 30 m²' },
  { value: '30-50', label: 'Từ 30 - 50 m²' },
  { value: '50-80', label: 'Từ 50 - 80 m²' },
  { value: '80-100', label: 'Từ 80 - 100 m²' },
  { value: '100-150', label: 'Từ 100 - 150 m²' },
  { value: '150-200', label: 'Từ 150 - 200 m²' },
  { value: '200', label: 'Trên 200 m²' },
];

const HeroSection: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [filteredDistricts, setFilteredDistricts] = useState<District[]>([]);
  
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    transaction_type: 'all',
    property_type: 'all',
    city_id: 0,
    district_id: 0,
    price_range: 'all',
    area_range: 'all',
  });
  
  // Fetch cities on component mount
  useEffect(() => {
    const fetchCities = async () => {
      try {
        // This would typically use your API service
        // For demo, we'll use mock data
        const mockCities = [
          { id: 1, name: 'Hà Nội' },
          { id: 2, name: 'TP. Hồ Chí Minh' },
          { id: 3, name: 'Đà Nẵng' },
          { id: 4, name: 'Hải Phòng' },
          { id: 5, name: 'Cần Thơ' },
          { id: 6, name: 'Nha Trang' },
        ];
        setCities(mockCities);
      } catch (error) {
        console.error('Error fetching cities:', error);
      }
    };
    
    const fetchDistricts = async () => {
      try {
        // This would typically use your API service
        // For demo, we'll use mock data
        const mockDistricts = [
          { id: 1, name: 'Ba Đình', city_id: 1 },
          { id: 2, name: 'Hoàn Kiếm', city_id: 1 },
          { id: 3, name: 'Hai Bà Trưng', city_id: 1 },
          { id: 4, name: 'Đống Đa', city_id: 1 },
          { id: 5, name: 'Quận 1', city_id: 2 },
          { id: 6, name: 'Quận 2', city_id: 2 },
          { id: 7, name: 'Quận 3', city_id: 2 },
          { id: 8, name: 'Quận 7', city_id: 2 },
          { id: 9, name: 'Hải Châu', city_id: 3 },
          { id: 10, name: 'Liên Chiểu', city_id: 3 },
        ];
        setDistricts(mockDistricts);
      } catch (error) {
        console.error('Error fetching districts:', error);
      }
    };
    
    fetchCities();
    fetchDistricts();
  }, []);
  
  // Filter districts when city changes
  useEffect(() => {
    if (searchParams.city_id) {
      const filtered = districts.filter(district => district.city_id === searchParams.city_id);
      setFilteredDistricts(filtered);
    } else {
      setFilteredDistricts([]);
    }
  }, [searchParams.city_id, districts]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
    
    // Reset district when city changes
    if (name === 'city_id') {
      setSearchParams(prev => ({ ...prev, district_id: 0 }));
    }
  };
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Build query string
    const queryParams = new URLSearchParams();
    
    if (searchParams.keyword) {
      queryParams.append('keyword', searchParams.keyword);
    }
    
    if (searchParams.transaction_type !== 'all') {
      queryParams.append('transaction_type', searchParams.transaction_type);
    }
    
    if (searchParams.property_type !== 'all') {
      queryParams.append('property_type', searchParams.property_type);
    }
    
    if (searchParams.city_id) {
      queryParams.append('city_id', searchParams.city_id.toString());
    }
    
    if (searchParams.district_id) {
      queryParams.append('district_id', searchParams.district_id.toString());
    }
    
    if (searchParams.price_range !== 'all') {
      queryParams.append('price_range', searchParams.price_range);
    }
    
    if (searchParams.area_range !== 'all') {
      queryParams.append('area_range', searchParams.area_range);
    }
    
    // Navigate to search results page
    navigate(`/tim-kiem?${queryParams.toString()}`);
  };
  
  return (
    <Box
      sx={{
        position: 'relative',
        height: { xs: 'auto', md: '600px' },
        overflow: 'hidden',
        bgcolor: 'primary.main',
        color: 'white',
      }}
    >
      {/* Background Image with Overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'linear-gradient(135deg, #1B4F72 0%, #2E86C1 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
        }}
      />
      
      {/* Content */}
      <Container 
        maxWidth="lg" 
        sx={{ 
          position: 'relative', 
          zIndex: 1,
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          py: { xs: 5, md: 0 }
        }}
      >
        <Grid container spacing={4}>
          {/* Text Content */}
          <Grid item xs={12} md={6}>
            <Typography
              variant="h2"
              component="h1"
              sx={{
                fontWeight: 'bold',
                mb: 2,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              }}
            >
              Tìm ngôi nhà mơ ước của bạn
            </Typography>
            
            <Typography
              variant="h6"
              component="p"
              sx={{
                mb: 4,
                opacity: 0.9,
                maxWidth: '90%',
              }}
            >
              Khám phá hàng ngàn bất động sản chất lượng với mức giá phù hợp tại các vị trí đắc địa trên toàn quốc.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                sx={{ px: 3, py: 1.5, fontWeight: 'bold' }}
                href="/mua-ban"
              >
                Mua bất động sản
              </Button>
              
              <Button
                variant="outlined"
                size="large"
                sx={{ 
                  px: 3, 
                  py: 1.5, 
                  fontWeight: 'bold',
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
                href="/cho-thue"
              >
                Thuê bất động sản
              </Button>
            </Box>
          </Grid>
          
          {/* Search Form */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={3}
              component="form"
              onSubmit={handleSearchSubmit}
              sx={{
                p: 3,
                borderRadius: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
              }}
            >
              <Typography
                variant="h5"
                component="h2"
                sx={{
                  mb: 3,
                  color: 'text.primary',
                  fontWeight: 'bold',
                  textAlign: 'center',
                }}
              >
                Tìm kiếm bất động sản
              </Typography>
              
              {/* Search Keyword */}
              <TextField
                fullWidth
                placeholder="Nhập từ khóa tìm kiếm..."
                name="keyword"
                value={searchParams.keyword}
                onChange={handleInputChange}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              
              {/* Transaction Type */}
              <TextField
                select
                fullWidth
                name="transaction_type"
                value={searchParams.transaction_type}
                onChange={handleInputChange}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <HomeIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              >
                {transactionTypes.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  {/* Property Type */}
                  <TextField
                    select
                    fullWidth
                    name="property_type"
                    value={searchParams.property_type}
                    onChange={handleInputChange}
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <HomeIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  >
                    {propertyTypes.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  {/* City */}
                  <TextField
                    select
                    fullWidth
                    name="city_id"
                    value={searchParams.city_id}
                    onChange={handleInputChange}
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  >
                    <MenuItem value={0}>Tất cả tỉnh thành</MenuItem>
                    {cities.map((city) => (
                      <MenuItem key={city.id} value={city.id}>
                        {city.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  {/* District - Only show if city is selected */}
                  <TextField
                    select
                    fullWidth
                    name="district_id"
                    value={searchParams.district_id}
                    onChange={handleInputChange}
                    disabled={!searchParams.city_id}
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  >
                    <MenuItem value={0}>Tất cả quận huyện</MenuItem>
                    {filteredDistricts.map((district) => (
                      <MenuItem key={district.id} value={district.id}>
                        {district.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  {/* Price Range */}
                  <TextField
                    select
                    fullWidth
                    name="price_range"
                    value={searchParams.price_range}
                    onChange={handleInputChange}
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <MoneyIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  >
                    {priceRanges.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
              
              {/* Area Range */}
              <TextField
                select
                fullWidth
                name="area_range"
                value={searchParams.area_range}
                onChange={handleInputChange}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <HomeIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              >
                {areaRanges.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              
              {/* Submit Button */}
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                sx={{ py: 1.5, fontWeight: 'bold' }}
              >
                <SearchIcon sx={{ mr: 1 }} /> Tìm kiếm
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default HeroSection; 