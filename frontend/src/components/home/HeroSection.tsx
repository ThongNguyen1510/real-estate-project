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
  AttachMoney as MoneyIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { locationService } from '../../services/api';
import SearchBox from '../search/SearchBox';
import { Link } from 'react-router-dom';

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
        height: { xs: '400px', md: '500px' },
        backgroundImage: 'url(/img/hero-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          px: { xs: 2, sm: 3 }
        }}
      >
        <Typography
          variant="h2"
          component="h1"
          sx={{
            fontWeight: 'bold',
            mb: 2,
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' }
          }}
        >
          Tìm Ngôi Nhà Mơ Ước Của Bạn
        </Typography>

        <Typography
          variant="h5"
          sx={{
            mb: 4,
            maxWidth: '800px',
            fontSize: { xs: '1rem', sm: '1.25rem' }
          }}
        >
          Khám phá hàng ngàn bất động sản chất lượng từ khắp Việt Nam
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 2
          }}
        >
          <Button
            variant="contained"
            color="primary"
            size="large"
            component={Link}
            to="/mua-ban"
            endIcon={<ArrowForwardIcon />}
            sx={{
              px: 3,
              py: 1.5,
              fontSize: '1rem',
              borderRadius: 2
            }}
          >
            Mua Bất Động Sản
          </Button>

          <Button
            variant="outlined"
            color="inherit"
            size="large"
            component={Link}
            to="/cho-thue"
            endIcon={<ArrowForwardIcon />}
            sx={{
              px: 3,
              py: 1.5,
              fontSize: '1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderColor: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderColor: 'white'
              },
              borderRadius: 2
            }}
          >
            Thuê Bất Động Sản
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default HeroSection; 