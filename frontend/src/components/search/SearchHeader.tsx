import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Grid,
  Typography,
  FormControl,
  MenuItem,
  Select,
  InputLabel,
  Divider,
  Popover,
  styled,
  Fade,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  TravelExplore as TravelExploreIcon,
  Home as HomeIcon,
  Key as KeyIcon
} from '@mui/icons-material';
import styles from './SearchHeader.module.css';
import LocationSelector from './LocationSelector';

// Component với hiệu ứng màu nền và màu chữ khác nhau khi được chọn
const StyledTab = styled(Tab)(({ theme }) => ({
  fontWeight: 'bold',
  fontSize: '0.95rem',
  color: '#424242',
  backgroundColor: '#f5f5f5',
  borderRadius: '5px 5px 0 0',
  minWidth: '130px',
  minHeight: '42px',
  border: '1px solid #e0e0e0',
  borderBottom: 'none',
  transition: 'all 0.3s ease',
  marginRight: '6px',
  '&:hover': {
    backgroundColor: '#eeeeee',
    transform: 'translateY(-2px)',
  },
  '&.Mui-selected': {
    color: 'white',
    backgroundColor: '#1976d2',
    transform: 'translateY(-4px)',
    boxShadow: '0 4px 8px rgba(25, 118, 210, 0.25)',
    border: 'none',
  },
}));

// Danh sách thành phố
const cities = ['Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Nha Trang', 'Cần Thơ', 'Hải Phòng'];

// Danh sách quận/huyện của Hồ Chí Minh
const hcmDistricts = [
  'Quận 1', 'Quận 2', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 6', 'Quận 7', 'Quận 8', 'Quận 9',
  'Quận 10', 'Quận 11', 'Quận 12', 'Quận Gò Vấp', 'Quận Tân Bình', 'Quận Tân Phú',
  'Quận Bình Thạnh', 'Quận Phú Nhuận', 'Quận Thủ Đức', 'Huyện Bình Chánh', 'Huyện Nhà Bè'
];

// Danh sách quận/huyện của Hà Nội
const hanoiDistricts = [
  'Quận Ba Đình', 'Quận Hoàn Kiếm', 'Quận Hai Bà Trưng', 'Quận Đống Đa', 'Quận Tây Hồ',
  'Quận Cầu Giấy', 'Quận Thanh Xuân', 'Quận Hoàng Mai', 'Quận Long Biên', 'Quận Nam Từ Liêm',
  'Quận Bắc Từ Liêm', 'Quận Hà Đông'
];

// Danh sách loại bất động sản
const propertyTypes = [
  { value: '', label: 'Loại nhà đất' },
  { value: 'apartment', label: 'Căn hộ chung cư' },
  { value: 'house', label: 'Nhà riêng' },
  { value: 'villa', label: 'Biệt thự' },
  { value: 'land', label: 'Đất nền' },
  { value: 'office', label: 'Văn phòng' },
  { value: 'shop', label: 'Mặt bằng kinh doanh' }
];

// Danh sách khoảng giá
const priceRanges = [
  { value: '', label: 'Mức giá' },
  { value: '0-500000000', label: 'Dưới 500 triệu' },
  { value: '500000000-1000000000', label: 'Từ 500 triệu - 1 tỷ' },
  { value: '1000000000-3000000000', label: 'Từ 1 tỷ - 3 tỷ' },
  { value: '3000000000-7000000000', label: 'Từ 3 tỷ - 7 tỷ' },
  { value: '7000000000-10000000000', label: 'Từ 7 tỷ - 10 tỷ' },
  { value: '10000000000-20000000000', label: 'Từ 10 tỷ - 20 tỷ' },
  { value: '20000000000-9999999999999', label: 'Trên 20 tỷ' }
];

// Danh sách khoảng giá cho thuê
const rentPriceRanges = [
  { value: '', label: 'Mức giá' },
  { value: '0-3000000', label: 'Dưới 3 triệu' },
  { value: '3000000-5000000', label: 'Từ 3 - 5 triệu' },
  { value: '5000000-10000000', label: 'Từ 5 - 10 triệu' },
  { value: '10000000-20000000', label: 'Từ 10 - 20 triệu' },
  { value: '20000000-50000000', label: 'Từ 20 - 50 triệu' },
  { value: '50000000-9999999999', label: 'Trên 50 triệu' }
];

// Danh sách khoảng diện tích
const areaRanges = [
  { value: '', label: 'Diện tích' },
  { value: '0-30', label: 'Dưới 30 m²' },
  { value: '30-50', label: 'Từ 30 - 50 m²' },
  { value: '50-80', label: 'Từ 50 - 80 m²' },
  { value: '80-100', label: 'Từ 80 - 100 m²' },
  { value: '100-150', label: 'Từ 100 - 150 m²' },
  { value: '150-200', label: 'Từ 150 - 200 m²' },
  { value: '200-500', label: 'Trên 200 m²' }
];

interface SearchParam {
  keyword?: string;
  city?: string;
  city_name?: string;
  district?: string;
  property_type?: string;
  price_min?: string;
  price_max?: string;
  area_min?: string;
  area_max?: string;
}

const SearchHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  // Xác định tab active dựa vào đường dẫn hiện tại hoặc tham số listing_type
  const isBuyTab = location.pathname.includes('/mua-ban') || 
                  (searchParams.get('listing_type') === 'sale' && !location.pathname.includes('/cho-thue'));
  const isRentTab = location.pathname.includes('/cho-thue') || 
                   searchParams.get('listing_type') === 'rent';
  
  // Set tab value based on the URL or listing_type parameter
  const [tabValue, setTabValue] = useState(isRentTab ? 1 : 0);

  // Update tabValue whenever the route changes
  useEffect(() => {
    const newIsBuyTab = location.pathname.includes('/mua-ban') || 
                       (searchParams.get('listing_type') === 'sale' && !location.pathname.includes('/cho-thue'));
    const newIsRentTab = location.pathname.includes('/cho-thue') || 
                        searchParams.get('listing_type') === 'rent';
    
    if (newIsRentTab) {
      setTabValue(1);
    } else if (newIsBuyTab) {
      setTabValue(0);
    }
  }, [location.pathname, searchParams]);
  
  // Trạng thái các bộ lọc
  const [selectedCity, setSelectedCity] = useState<string>(searchParams.get('city_name') || 'Hồ Chí Minh');
  const [districts, setDistricts] = useState<string[]>([]);
  
  // Thông tin tìm kiếm từ các bộ lọc
  const [searchValues, setSearchValues] = useState<SearchParam>({
    keyword: searchParams.get('keyword') || '',
    city: searchParams.get('city') || '79', // Default to TP.HCM code
    city_name: searchParams.get('city_name') || 'Hồ Chí Minh',
    district: searchParams.get('district') || '',
    property_type: searchParams.get('property_type') || '',
    price_min: searchParams.get('price_min') || '',
    price_max: searchParams.get('price_max') || '',
    area_min: searchParams.get('area_min') || '',
    area_max: searchParams.get('area_max') || ''
  });
  
  // Cập nhật danh sách quận huyện dựa vào thành phố
  useEffect(() => {
    // Dựa vào ID thành phố thay vì tên
    if (searchValues.city === '79') { // TP.HCM
      setDistricts(hcmDistricts);
    } else if (searchValues.city === '01') { // Hà Nội
      setDistricts(hanoiDistricts);
    } else {
      setDistricts([]);
    }
  }, [searchValues.city]);
  
  // Xử lý khi thay đổi tab (bán/thuê)
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    
    // Chuyển hẳn sang trang mới mà không giữ tham số tìm kiếm
    if (newValue === 0) {
      navigate('/mua-ban');
    } else {
      navigate('/cho-thue');
    }
  };
  
  // Xử lý khi thay đổi giá trị tìm kiếm
  const handleSearchValueChange = (name: string, value: string) => {
    setSearchValues({
      ...searchValues,
      [name]: value
    });
  };
  
  // Xử lý khi thay đổi khoảng giá
  const handlePriceRangeChange = (value: string) => {
    if (!value) {
      setSearchValues({
        ...searchValues,
        price_min: '',
        price_max: ''
      });
      return;
    }
    
    const [min, max] = value.split('-');
    setSearchValues({
      ...searchValues,
      price_min: min,
      price_max: max
    });
  };
  
  // Xử lý khi thay đổi khoảng diện tích
  const handleAreaRangeChange = (value: string) => {
    if (!value) {
      setSearchValues({
        ...searchValues,
        area_min: '',
        area_max: ''
      });
      return;
    }
    
    const [min, max] = value.split('-');
    setSearchValues({
      ...searchValues,
      area_min: min,
      area_max: max
    });
  };
  
  // Xử lý khi nhấn tìm kiếm
  const handleSearch = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault(); // Ngăn chặn hành vi mặc định của form
    }
    
    console.log('SearchHeader: handleSearch called with values:', searchValues);
    const params = new URLSearchParams();
    
    // Thêm listing_type dựa vào tab được chọn
    const listing_type = tabValue === 0 ? 'sale' : 'rent';
    params.append('listing_type', listing_type);
    console.log('Setting listing_type to:', listing_type);
    
    // Thêm các tham số vào URL với tên trường đúng chuẩn
    Object.entries(searchValues).forEach(([key, value]) => {
      if (value && value !== '') {
        params.append(key, value.toString());
        console.log(`Adding ${key} param:`, value);
      }
    });
    
    // Đảm bảo status luôn được thêm vào để chỉ hiển thị BĐS available
    if (!params.has('status')) {
      params.append('status', 'available');
    }
    
    // Điều hướng đến trang tìm kiếm dựa vào tab hiện tại
    const path = tabValue === 0 ? '/mua-ban' : '/cho-thue';
    
    console.log(`SearchHeader: Navigating to ${path}?${params.toString()}`);
    navigate({
      pathname: path,
      search: params.toString()
    });
  };
  
  return (
    <Box className={styles.searchContainer}>
      <Box className={styles.innerContainer}>
        {/* Tabs Mua Bán / Cho Thuê */}
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            minHeight: 42,
            mb: 2,
            '.MuiTabs-indicator': { display: 'none' }
          }}
        >
          <StyledTab
            label="Nhà đất bán"
            onClick={() => {
              setTabValue(0);
              // Chuyển thẳng đến trang mua bán mà không giữ tham số tìm kiếm
              navigate('/mua-ban');
            }}
            icon={<HomeIcon sx={{ fontSize: 16, mr: 1 }} />}
            iconPosition="start"
          />
          <StyledTab
            label="Nhà đất cho thuê"
            onClick={() => {
              setTabValue(1);
              // Chuyển thẳng đến trang cho thuê mà không giữ tham số tìm kiếm
              navigate('/cho-thue');
            }}
            icon={<KeyIcon sx={{ fontSize: 16, mr: 1 }} />}
            iconPosition="start"
          />
          <Box sx={{ flexGrow: 1 }} />
        </Tabs>
        
        {/* Search Box */}
        <Fade in={true} timeout={800}>
          <Paper className={styles.searchBox} elevation={0} sx={{ 
            borderRadius: '24px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
            height: '54px'
          }}>
            <Grid container sx={{ height: '100%' }}>
              {/* Location Selector */}
              <Grid item xs={12} sm={3} sx={{ height: '100%' }}>
                <LocationSelector 
                  selectedLocation={searchValues.city_name}
                  onLocationSelected={(id, name) => {
                    setSelectedCity(name);
                    setSearchValues({
                      ...searchValues,
                      city: id,
                      city_name: name,
                      district: '' // Reset district when city changes
                    });
                  }}
                  sx={{ 
                    borderTopLeftRadius: '24px',
                    borderBottomLeftRadius: '24px',
                    height: '100%',
                    padding: '0 15px',
                  }}
                />
              </Grid>
              
              {/* Search Input */}
              <Grid item xs={12} sm={6} sx={{ height: '100%' }}>
                <TextField
                  fullWidth
                  placeholder="Nhập từ khóa tìm kiếm (địa điểm, dự án, mã tin...)"
                  value={searchValues.keyword}
                  onChange={(e) => handleSearchValueChange('keyword', e.target.value)}
                  InputProps={{
                    className: styles.searchInput,
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" sx={{ fontSize: '1.2rem' }} />
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { border: 'none' },
                      height: '100%',
                      fontSize: '0.95rem'
                    },
                    height: '100%'
                  }}
                />
              </Grid>
              
              {/* Search Button */}
              <Grid item xs={12} sm={3} sx={{ height: '100%' }}>
                <Button
                  fullWidth
                  variant="contained"
                  color="error"
                  onClick={(e) => {
                    e.preventDefault();
                    console.log('Search button clicked with values:', searchValues);
                    handleSearch(e);
                  }}
                  className={styles.searchButton}
                  startIcon={<TravelExploreIcon />}
                  sx={{ 
                    height: '100%',
                    borderTopRightRadius: '24px',
                    borderBottomRightRadius: '24px',
                    borderTopLeftRadius: '0',
                    borderBottomLeftRadius: '0',
                    fontSize: '0.95rem'
                  }}
                >
                  Tìm kiếm
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Fade>
        
        {/* Filter Options */}
        <Fade in={true} timeout={1000}>
          <Paper className={styles.filterOptions} elevation={0} sx={{ 
            borderRadius: '16px',
            height: '42px'
          }}>
            <Grid container spacing={0} sx={{ height: '100%' }}>
              {/* Property Type */}
              <Grid item xs={12} sm={4} md={3} sx={{ height: '100%' }}>
                <FormControl
                  fullWidth
                  variant="outlined"
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { border: 'none' },
                      height: '100%'
                    },
                    height: '100%'
                  }}
                >
                  <Select
                    value={searchValues.property_type}
                    onChange={(e) => handleSearchValueChange('property_type', e.target.value)}
                    displayEmpty
                    className={styles.selectFilter}
                    IconComponent={KeyboardArrowDownIcon}
                    sx={{ fontSize: '0.9rem', height: '100%' }}
                  >
                    {propertyTypes.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              {/* Price Range */}
              <Grid item xs={12} sm={4} md={3} sx={{ height: '100%' }}>
                <FormControl
                  fullWidth
                  variant="outlined"
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { border: 'none' },
                      height: '100%'
                    },
                    height: '100%'
                  }}
                >
                  <Select
                    value={`${searchValues.price_min || ''}-${searchValues.price_max || ''}`}
                    onChange={(e) => handlePriceRangeChange(e.target.value)}
                    displayEmpty
                    className={styles.selectFilter}
                    IconComponent={KeyboardArrowDownIcon}
                    sx={{ fontSize: '0.9rem', height: '100%' }}
                    renderValue={(selected) => {
                      if (selected === '-') {
                        return <Typography color="text.secondary" sx={{ fontSize: '0.9rem' }}>Mức giá</Typography>;
                      }
                      return (tabValue === 0 ? priceRanges : rentPriceRanges).find(
                        (option) => option.value === selected
                      )?.label || 'Mức giá';
                    }}
                  >
                    {(tabValue === 0 ? priceRanges : rentPriceRanges).map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              {/* Area Range */}
              <Grid item xs={12} sm={4} md={3} sx={{ height: '100%' }}>
                <FormControl
                  fullWidth
                  variant="outlined"
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { border: 'none' },
                      height: '100%'
                    },
                    height: '100%'
                  }}
                >
                  <Select
                    value={`${searchValues.area_min || ''}-${searchValues.area_max || ''}`}
                    onChange={(e) => handleAreaRangeChange(e.target.value)}
                    displayEmpty
                    className={styles.selectFilter}
                    IconComponent={KeyboardArrowDownIcon}
                    sx={{ fontSize: '0.9rem', height: '100%' }}
                    renderValue={(selected) => {
                      if (selected === '-') {
                        return <Typography color="text.secondary" sx={{ fontSize: '0.9rem' }}>Diện tích</Typography>;
                      }
                      return areaRanges.find(
                        (option) => option.value === selected
                      )?.label || 'Diện tích';
                    }}
                  >
                    {areaRanges.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              {/* District */}
              <Grid item xs={12} sm={12} md={3} sx={{ height: '100%' }}>
                <FormControl
                  fullWidth
                  variant="outlined"
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { border: 'none' },
                      height: '100%'
                    },
                    height: '100%'
                  }}
                >
                  <Select
                    value={searchValues.district}
                    onChange={(e) => handleSearchValueChange('district', e.target.value)}
                    displayEmpty
                    disabled={!districts.length}
                    className={styles.selectFilter}
                    IconComponent={KeyboardArrowDownIcon}
                    sx={{ fontSize: '0.9rem', height: '100%' }}
                  >
                    <MenuItem value="">Quận/Huyện</MenuItem>
                    {districts.map((district) => (
                      <MenuItem key={district} value={district}>
                        {district}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        </Fade>
      </Box>
    </Box>
  );
};

export default SearchHeader; 