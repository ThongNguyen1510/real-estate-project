import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  IconButton,
  Typography,
  Chip,
  Stack,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Home as HomeIcon,
  Close as CloseIcon
} from '@mui/icons-material';

// Constants
const CITIES = [
  { id: '79', name: 'Hồ Chí Minh' },
  { id: '1', name: 'Hà Nội' },
  { id: '48', name: 'Đà Nẵng' },
  { id: '92', name: 'Cần Thơ' },
  { id: '31', name: 'Hải Phòng' },
  { id: '56', name: 'Khánh Hòa' },
  { id: '75', name: 'Bình Dương' },
  { id: '77', name: 'Đồng Nai' },
  { id: '74', name: 'Bình Phước' },
  { id: '70', name: 'Tây Ninh' },
  { id: '72', name: 'Long An' },
  { id: '86', name: 'Vĩnh Long' },
  { id: '87', name: 'Kiên Giang' },
  { id: '83', name: 'Bến Tre' },
  { id: '84', name: 'Trà Vinh' },
  { id: '82', name: 'Tiền Giang' },
  { id: '80', name: 'Bà Rịa - Vũng Tàu' },
  { id: '52', name: 'Bình Định' },
  { id: '54', name: 'Phú Yên' },
  { id: '58', name: 'Ninh Thuận' },
  { id: '60', name: 'Bình Thuận' },
  { id: '62', name: 'Kon Tum' },
  { id: '64', name: 'Gia Lai' }
];

const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Căn hộ chung cư' },
  { value: 'house', label: 'Nhà riêng' },
  { value: 'villa', label: 'Biệt thự' },
  { value: 'land', label: 'Đất nền' },
  { value: 'office', label: 'Văn phòng' },
  { value: 'shop', label: 'Mặt bằng kinh doanh' }
];

// District data (simplified for the main cities)
const DISTRICTS = {
  '79': [ // Hồ Chí Minh
    'Quận 1', 'Quận 2', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 6', 'Quận 7', 'Quận 8', 'Quận 9',
    'Quận 10', 'Quận 11', 'Quận 12', 'Quận Bình Thạnh', 'Quận Tân Bình', 'Quận Gò Vấp', 'Quận Phú Nhuận',
    'Quận Tân Phú', 'Quận Bình Tân', 'Quận Thủ Đức', 'Huyện Nhà Bè', 'Huyện Bình Chánh', 
    'Huyện Củ Chi', 'Huyện Hóc Môn', 'Huyện Cần Giờ'
  ],
  '1': [ // Hà Nội
    'Quận Ba Đình', 'Quận Hoàn Kiếm', 'Quận Hai Bà Trưng', 'Quận Đống Đa', 'Quận Tây Hồ',
    'Quận Cầu Giấy', 'Quận Thanh Xuân', 'Quận Hoàng Mai', 'Quận Long Biên', 'Quận Nam Từ Liêm',
    'Quận Bắc Từ Liêm', 'Quận Hà Đông', 'Huyện Sóc Sơn', 'Huyện Đông Anh', 'Huyện Gia Lâm',
    'Huyện Thanh Trì', 'Huyện Thường Tín', 'Huyện Phú Xuyên', 'Thị xã Sơn Tây'
  ],
  '48': [ // Đà Nẵng
    'Quận Hải Châu', 'Quận Thanh Khê', 'Quận Sơn Trà', 'Quận Ngũ Hành Sơn', 'Quận Liên Chiểu',
    'Quận Cẩm Lệ', 'Huyện Hòa Vang', 'Huyện Hoàng Sa'
  ],
  '92': [ // Cần Thơ
    'Quận Ninh Kiều', 'Quận Ô Môn', 'Quận Bình Thủy', 'Quận Cái Răng', 'Quận Thốt Nốt',
    'Huyện Vĩnh Thạnh', 'Huyện Cờ Đỏ', 'Huyện Phong Điền', 'Huyện Thới Lai'
  ],
  '31': [ // Hải Phòng
    'Quận Hồng Bàng', 'Quận Ngô Quyền', 'Quận Lê Chân', 'Quận Hải An', 'Quận Kiến An',
    'Quận Đồ Sơn', 'Quận Dương Kinh', 'Huyện Thủy Nguyên', 'Huyện An Dương', 'Huyện An Lão'
  ],
  '75': [ // Bình Dương
    'Thành phố Thủ Dầu Một', 'Thị xã Bến Cát', 'Thị xã Tân Uyên', 'Thị xã Dĩ An', 
    'Thị xã Thuận An', 'Huyện Bàu Bàng', 'Huyện Dầu Tiếng', 'Huyện Bắc Tân Uyên', 'Huyện Phú Giáo'
  ],
  '77': [ // Đồng Nai
    'Thành phố Biên Hòa', 'Thành phố Long Khánh', 'Huyện Vĩnh Cửu', 'Huyện Tân Phú', 
    'Huyện Định Quán', 'Huyện Trảng Bom', 'Huyện Thống Nhất', 'Huyện Cẩm Mỹ',
    'Huyện Long Thành', 'Huyện Xuân Lộc', 'Huyện Nhơn Trạch'
  ]
};

interface SearchBoxProps {
  variant?: 'simple' | 'advanced';
  onClose?: () => void;
  className?: string;
  initialValues?: {
    keyword?: string;
    city?: string;
    city_name?: string;
    district?: string;
    property_type?: string;
    listing_type?: string;
  };
}

const SearchBox: React.FC<SearchBoxProps> = ({ 
  variant = 'simple', 
  onClose, 
  className,
  initialValues = {}
}) => {
  const navigate = useNavigate();
  
  // Search state
  const [keyword, setKeyword] = useState(initialValues.keyword || '');
  const [city, setCity] = useState(initialValues.city || '');
  const [cityName, setCityName] = useState(initialValues.city_name || '');
  const [district, setDistrict] = useState(initialValues.district || '');
  const [propertyType, setPropertyType] = useState(initialValues.property_type || '');
  const [listingType, setListingType] = useState(initialValues.listing_type || 'sale');
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
  
  // Update districts when city changes
  useEffect(() => {
    if (city && DISTRICTS[city as keyof typeof DISTRICTS]) {
      setAvailableDistricts(DISTRICTS[city as keyof typeof DISTRICTS]);
    } else {
      setAvailableDistricts([]);
    }
    
    // Reset district if city changes
    if (district && !availableDistricts.includes(district)) {
      setDistrict('');
    }
    
    // Update city name
    const selectedCity = CITIES.find(c => c.id === city);
    if (selectedCity) {
      setCityName(selectedCity.name);
    } else {
      setCityName('');
    }
  }, [city]);
  
  // Handle search form submission
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const searchParams = new URLSearchParams();
    
    // Add parameters to URL only if they have values
    if (keyword) searchParams.set('keyword', keyword);
    if (city) searchParams.set('city', city);
    if (cityName) searchParams.set('city_name', cityName);
    if (district) searchParams.set('district', district);
    if (propertyType) searchParams.set('property_type', propertyType);
    if (listingType) searchParams.set('listing_type', listingType);
    
    // Navigate to search page with parameters
    navigate(`/tim-kiem?${searchParams.toString()}`);
    
    // Close modal if applicable
    if (onClose) onClose();
  };
  
  // Handle city selection
  const handleCityChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const cityId = event.target.value as string;
    setCity(cityId);
    
    // Reset district when city changes
    setDistrict('');
  };
  
  // Reset all filters
  const handleReset = () => {
    setKeyword('');
    setCity('');
    setCityName('');
    setDistrict('');
    setPropertyType('');
    setListingType('sale');
  };
  
  if (variant === 'simple') {
    return (
      <Paper 
        component="form"
        onSubmit={handleSearch}
        elevation={3}
        className={className}
        sx={{ 
          p: 2, 
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          maxWidth: '800px',
          width: '100%',
          margin: '0 auto'
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={5}>
            <TextField
              fullWidth
              placeholder="Nhập từ khóa tìm kiếm..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Thành phố</InputLabel>
              <Select
                value={city}
                label="Thành phố"
                onChange={(e) => setCity(e.target.value as string)}
                startAdornment={<LocationIcon sx={{ color: 'text.secondary', mr: 1 }} />}
              >
                <MenuItem value="">Tất cả thành phố</MenuItem>
                {CITIES.map((city) => (
                  <MenuItem key={city.id} value={city.id}>{city.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleSearch}
              startIcon={<SearchIcon />}
              sx={{ height: '40px' }}
            >
              Tìm kiếm
            </Button>
          </Grid>
        </Grid>
      </Paper>
    );
  }
  
  // Advanced search form
  return (
    <Paper 
      component="form"
      onSubmit={handleSearch}
      elevation={3}
      className={className}
      sx={{ 
        p: 3, 
        borderRadius: 2,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        maxWidth: '800px',
        width: '100%',
        margin: '0 auto'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h2">Tìm kiếm bất động sản</Typography>
        {onClose && (
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        )}
      </Box>
      
      <Grid container spacing={2}>
        {/* Keyword search */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            placeholder="Nhập từ khóa tìm kiếm (địa chỉ, tên dự án...)"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
            }}
          />
        </Grid>
        
        {/* Listing type selection */}
        <Grid item xs={12}>
          <Stack direction="row" spacing={1}>
            <Button 
              variant={listingType === 'sale' ? 'contained' : 'outlined'}
              onClick={() => setListingType('sale')}
              sx={{ flexGrow: 1 }}
            >
              Mua bán
            </Button>
            <Button 
              variant={listingType === 'rent' ? 'contained' : 'outlined'}
              onClick={() => setListingType('rent')}
              sx={{ flexGrow: 1 }}
            >
              Cho thuê
            </Button>
          </Stack>
        </Grid>
        
        <Grid item xs={12}>
          <Divider />
        </Grid>
        
        {/* Location selection */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth size="small">
            <InputLabel>Thành phố</InputLabel>
            <Select
              value={city}
              label="Thành phố"
              onChange={(e) => setCity(e.target.value as string)}
            >
              <MenuItem value="">Tất cả thành phố</MenuItem>
              {CITIES.map((city) => (
                <MenuItem key={city.id} value={city.id}>{city.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth size="small" disabled={!city || availableDistricts.length === 0}>
            <InputLabel>Quận/Huyện</InputLabel>
            <Select
              value={district}
              label="Quận/Huyện"
              onChange={(e) => setDistrict(e.target.value as string)}
            >
              <MenuItem value="">Tất cả quận/huyện</MenuItem>
              {availableDistricts.map((district) => (
                <MenuItem key={district} value={district}>{district}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        {/* Property type selection */}
        <Grid item xs={12}>
          <FormControl fullWidth size="small">
            <InputLabel>Loại bất động sản</InputLabel>
            <Select
              value={propertyType}
              label="Loại bất động sản"
              onChange={(e) => setPropertyType(e.target.value as string)}
            >
              <MenuItem value="">Tất cả loại</MenuItem>
              {PROPERTY_TYPES.map((type) => (
                <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        {/* Action buttons */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Button 
              variant="contained" 
              type="submit" 
              fullWidth 
              startIcon={<SearchIcon />}
            >
              Tìm kiếm
            </Button>
            <Button 
              variant="outlined" 
              onClick={handleReset} 
              fullWidth
            >
              Xóa bộ lọc
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default SearchBox; 