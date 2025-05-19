import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Button,
  Grid,
  Divider,
  IconButton,
  Stack,
  Chip
} from '@mui/material';
import {
  Home as HomeIcon,
  LocationOn as LocationIcon,
  AttachMoney as AttachMoneyIcon,
  AspectRatio as AspectRatioIcon,
  Hotel as HotelIcon,
  Bathtub as BathtubIcon,
  Close as CloseIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import LocationSelector from './LocationSelector';

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
    'Quận 10', 'Quận 11', 'Quận 12', 'Quận Bình Thạnh', 'Quận Tân Bình', 'Quận Gò Vấp', 'Quận Phú Nhuận'
  ],
  '1': [ // Hà Nội
    'Quận Ba Đình', 'Quận Hoàn Kiếm', 'Quận Hai Bà Trưng', 'Quận Đống Đa', 'Quận Tây Hồ',
    'Quận Cầu Giấy', 'Quận Thanh Xuân', 'Quận Hoàng Mai'
  ],
  '48': [ // Đà Nẵng
    'Quận Hải Châu', 'Quận Thanh Khê', 'Quận Sơn Trà', 'Quận Ngũ Hành Sơn', 'Quận Liên Chiểu'
  ]
};

// Format currency (VND)
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(value);
};

// Format area
const formatArea = (value: number) => {
  return `${value} m²`;
};

interface SearchSidebarProps {
  values: {
    city?: string;
    city_name?: string;
    district?: string;
    property_type?: string;
    price_min?: number;
    price_max?: number;
    area_min?: number;
    area_max?: number;
    bedrooms?: string | number;
    bathrooms?: string | number;
    listing_type?: string;
    sort_by?: string;
    sort_direction?: string;
  };
  onChange: (values: any) => void;
  onApply: () => void;
  onReset: () => void;
  showMobile?: boolean;
  onCloseMobile?: () => void;
}

const SearchSidebar: React.FC<SearchSidebarProps> = ({
  values,
  onChange,
  onApply,
  onReset,
  showMobile = false,
  onCloseMobile
}) => {
  // State for slider values
  const [priceRange, setPriceRange] = useState<number[]>([
    values.price_min || 0,
    values.price_max || 20000000000
  ]);
  
  const [areaRange, setAreaRange] = useState<number[]>([
    values.area_min || 0,
    values.area_max || 500
  ]);
  
  // State for available districts based on selected city
  const [districts, setDistricts] = useState<string[]>([]);
  
  // Update districts when city changes
  useEffect(() => {
    if (values.city && DISTRICTS[values.city as keyof typeof DISTRICTS]) {
      setDistricts(DISTRICTS[values.city as keyof typeof DISTRICTS]);
    } else {
      setDistricts([]);
    }
  }, [values.city]);
  
  // Handle location selection
  const handleLocationSelected = (cityId: string, cityName: string, district?: string) => {
    onChange({
      city: cityId,
      city_name: cityName,
      district: district || ''
    });
  };
  
  // Handle price range change
  const handlePriceRangeChange = (_: Event, newValue: number | number[]) => {
    setPriceRange(newValue as number[]);
  };
  
  // Apply price range to main values
  const handlePriceRangeChangeCommitted = () => {
    onChange({
      price_min: priceRange[0],
      price_max: priceRange[1]
    });
  };
  
  // Handle area range change
  const handleAreaRangeChange = (_: Event, newValue: number | number[]) => {
    setAreaRange(newValue as number[]);
  };
  
  // Apply area range to main values
  const handleAreaRangeChangeCommitted = () => {
    onChange({
      area_min: areaRange[0],
      area_max: areaRange[1]
    });
  };
  
  // Handle individual value change
  const handleChange = (name: string, value: any) => {
    onChange({ [name]: value });
  };
  
  // Reset both sliders and apply reset
  const handleReset = () => {
    setPriceRange([0, 20000000000]);
    setAreaRange([0, 500]);
    onReset();
  };
  
  return (
    <Box 
      sx={{
        position: { xs: showMobile ? 'fixed' : 'static', md: 'static' },
        top: 0,
        left: 0,
        width: { xs: showMobile ? '100%' : 'auto', md: 'auto' },
        height: { xs: showMobile ? '100vh' : 'auto', md: 'auto' },
        zIndex: { xs: showMobile ? 1200 : 1, md: 1 },
        backgroundColor: 'background.paper',
        padding: { xs: showMobile ? 2 : 0, md: 0 },
        overflowY: { xs: showMobile ? 'auto' : 'visible', md: 'visible' },
        display: { xs: showMobile ? 'block' : 'none', md: 'block' }
      }}
    >
      {/* Mobile header */}
      {showMobile && onCloseMobile && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 2,
          borderBottom: '1px solid #eee',
          pb: 1
        }}>
          <Typography variant="h6">Bộ lọc tìm kiếm</Typography>
          <IconButton onClick={onCloseMobile}>
            <CloseIcon />
          </IconButton>
        </Box>
      )}
      
      <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ 
          display: 'flex', 
          alignItems: 'center',
          color: 'primary.main',
          mb: 2
        }}>
          <FilterListIcon sx={{ mr: 1 }} />
          Bộ lọc tìm kiếm
        </Typography>
        
        <Divider sx={{ mb: 2 }} />
        
        {/* Property type */}
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500, display: 'flex', alignItems: 'center' }}>
          <HomeIcon fontSize="small" sx={{ mr: 1 }} />
          Loại bất động sản
        </Typography>
        <FormControl fullWidth size="small" sx={{ mb: 3 }}>
          <InputLabel>Loại bất động sản</InputLabel>
          <Select
            value={values.property_type || ''}
            label="Loại bất động sản"
            onChange={(e) => handleChange('property_type', e.target.value)}
          >
            <MenuItem value="">Tất cả</MenuItem>
            {PROPERTY_TYPES.map(type => (
              <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        
        {/* Location */}
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500, display: 'flex', alignItems: 'center' }}>
          <LocationIcon fontSize="small" sx={{ mr: 1 }} />
          Vị trí
        </Typography>
        
        <Box sx={{ mb: 1 }}>
          <LocationSelector
            selectedCityId={values.city}
            selectedCityName={values.city_name}
            selectedDistrict={values.district}
            onLocationSelected={handleLocationSelected}
            placeholder="Chọn vị trí"
            sx={{ mb: 2 }}
          />
        </Box>
        
        {/* Price range */}
        <Typography variant="subtitle1" gutterBottom sx={{ 
          fontWeight: 500, 
          display: 'flex', 
          alignItems: 'center',
          mt: 3 
        }}>
          <AttachMoneyIcon fontSize="small" sx={{ mr: 1 }} />
          Khoảng giá
        </Typography>
        <Box sx={{ px: 1, mb: 3 }}>
          <Slider
            value={priceRange}
            onChange={handlePriceRangeChange}
            onChangeCommitted={handlePriceRangeChangeCommitted}
            min={0}
            max={20000000000}
            step={100000000}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => formatCurrency(value)}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="body2" color="text.secondary">{formatCurrency(priceRange[0])}</Typography>
            <Typography variant="body2" color="text.secondary">{formatCurrency(priceRange[1])}</Typography>
          </Box>
        </Box>
        
        {/* Area range */}
        <Typography variant="subtitle1" gutterBottom sx={{ 
          fontWeight: 500, 
          display: 'flex', 
          alignItems: 'center' 
        }}>
          <AspectRatioIcon fontSize="small" sx={{ mr: 1 }} />
          Diện tích
        </Typography>
        <Box sx={{ px: 1, mb: 3 }}>
          <Slider
            value={areaRange}
            onChange={handleAreaRangeChange}
            onChangeCommitted={handleAreaRangeChangeCommitted}
            min={0}
            max={500}
            step={10}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => formatArea(value)}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="body2" color="text.secondary">{formatArea(areaRange[0])}</Typography>
            <Typography variant="body2" color="text.secondary">{formatArea(areaRange[1])}</Typography>
          </Box>
        </Box>
        
        {/* Bedrooms */}
        <Typography variant="subtitle1" gutterBottom sx={{ 
          fontWeight: 500, 
          display: 'flex', 
          alignItems: 'center' 
        }}>
          <HotelIcon fontSize="small" sx={{ mr: 1 }} />
          Số phòng ngủ
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
          <Chip 
            label="Tất cả" 
            variant={!values.bedrooms ? "filled" : "outlined"}
            color={!values.bedrooms ? "primary" : "default"}
            onClick={() => handleChange('bedrooms', '')}
          />
          {[1, 2, 3, 4, 5].map(count => (
            <Chip 
              key={count}
              label={`${count}+`} 
              variant={Number(values.bedrooms) === count ? "filled" : "outlined"}
              color={Number(values.bedrooms) === count ? "primary" : "default"}
              onClick={() => handleChange('bedrooms', count)}
            />
          ))}
        </Stack>
        
        {/* Bathrooms */}
        <Typography variant="subtitle1" gutterBottom sx={{ 
          fontWeight: 500, 
          display: 'flex', 
          alignItems: 'center' 
        }}>
          <BathtubIcon fontSize="small" sx={{ mr: 1 }} />
          Số phòng tắm
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
          <Chip 
            label="Tất cả" 
            variant={!values.bathrooms ? "filled" : "outlined"}
            color={!values.bathrooms ? "primary" : "default"}
            onClick={() => handleChange('bathrooms', '')}
          />
          {[1, 2, 3, 4].map(count => (
            <Chip 
              key={count}
              label={`${count}+`} 
              variant={Number(values.bathrooms) === count ? "filled" : "outlined"}
              color={Number(values.bathrooms) === count ? "primary" : "default"}
              onClick={() => handleChange('bathrooms', count)}
            />
          ))}
        </Stack>
        
        {/* Sort options */}
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
          Sắp xếp
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel>Sắp xếp theo</InputLabel>
              <Select
                value={values.sort_by || 'created_at'}
                label="Sắp xếp theo"
                onChange={(e) => handleChange('sort_by', e.target.value)}
              >
                <MenuItem value="created_at">Mới nhất</MenuItem>
                <MenuItem value="price">Giá</MenuItem>
                <MenuItem value="area">Diện tích</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel>Thứ tự</InputLabel>
              <Select
                value={values.sort_direction || 'DESC'}
                label="Thứ tự"
                onChange={(e) => handleChange('sort_direction', e.target.value)}
              >
                <MenuItem value="ASC">Tăng dần</MenuItem>
                <MenuItem value="DESC">Giảm dần</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        
        {/* Action buttons */}
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={onApply}
              fullWidth
            >
              Áp dụng bộ lọc
            </Button>
          </Grid>
          
          <Grid item xs={12}>
            <Button 
              variant="outlined" 
              color="inherit" 
              onClick={handleReset} 
              fullWidth
            >
              Xóa bộ lọc
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default SearchSidebar; 