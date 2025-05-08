import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Box,
  Paper,
  InputBase,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Button,
  Pagination,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Home as HomeIcon,
  Hotel as HotelIcon,
  Bathtub as BathtubIcon,
  DirectionsCar as CarIcon,
  ArrowForward as ArrowForwardIcon,
  Tune as TuneIcon,
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { searchProperties } from '../services/api/propertyService';
import PropertyCard from '../components/property/PropertyCard';
import SearchHeader from '../components/search/SearchHeader';
import LocationSelector from '../components/search/LocationSelector';

// Format tiền VND
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(value);
};

// Format diện tích
const formatArea = (value: number) => {
  return `${value} m²`;
};

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

// Loại bất động sản
const propertyTypes = [
  { value: 'apartment', label: 'Căn hộ chung cư' },
  { value: 'house', label: 'Nhà riêng' },
  { value: 'villa', label: 'Biệt thự' },
  { value: 'land', label: 'Đất nền' },
  { value: 'office', label: 'Văn phòng' },
  { value: 'shop', label: 'Mặt bằng kinh doanh' }
];

interface SearchParams {
  keyword?: string;
  city?: string;
  city_name?: string;
  district?: string;
  ward?: string;
  price_min?: number;
  price_max?: number;
  area_min?: number;
  area_max?: number;
  bedrooms?: number | string;
  bathrooms?: number | string;
  property_type?: string;
  amenities?: string;
  listing_type?: string;
  status?: string;
  sort_by?: string;
  sort_direction?: string;
  page?: number;
  limit?: number;
}

const SearchPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  
  // Trạng thái cho kết quả tìm kiếm
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Trạng thái cho phân trang
  const [page, setPage] = useState<number>(parseInt(queryParams.get('page') || '1'));
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const limit = 12; // Số bất động sản trên mỗi trang
  
  // Trạng thái các bộ lọc
  const [searchParams, setSearchParams] = useState<SearchParams>({
    keyword: queryParams.get('keyword') || '',
    city: queryParams.get('city') || '',
    city_name: queryParams.get('city_name') || '',
    district: queryParams.get('district') || '',
    ward: queryParams.get('ward') || '',
    price_min: queryParams.get('price_min') ? Number(queryParams.get('price_min')) : undefined,
    price_max: queryParams.get('price_max') ? Number(queryParams.get('price_max')) : undefined,
    area_min: queryParams.get('area_min') ? Number(queryParams.get('area_min')) : undefined,
    area_max: queryParams.get('area_max') ? Number(queryParams.get('area_max')) : undefined,
    bedrooms: queryParams.get('bedrooms') || '',
    bathrooms: queryParams.get('bathrooms') || '',
    property_type: queryParams.get('property_type') || '',
    amenities: queryParams.get('amenities') || '',
    listing_type: queryParams.get('listing_type') || 'sale',
    status: queryParams.get('status') || 'available',
    sort_by: queryParams.get('sort_by') || 'created_at',
    sort_direction: queryParams.get('sort_direction') || 'DESC',
    page: page,
    limit: limit
  });
  
  // Trạng thái cho giá trị slider
  const [priceRange, setPriceRange] = useState<number[]>([
    searchParams.price_min || 0,
    searchParams.price_max || 20000000000 // 20 tỷ
  ]);
  
  const [areaRange, setAreaRange] = useState<number[]>([
    searchParams.area_min || 0,
    searchParams.area_max || 500
  ]);
  
  // Trạng thái cho hiển thị bộ lọc trên mobile
  const [showFilters, setShowFilters] = useState<boolean>(false);
  
  // Danh sách quận/huyện phụ thuộc vào thành phố
  const [districts, setDistricts] = useState<string[]>([]);
  
  // Cập nhật quận/huyện dựa trên thành phố được chọn
  useEffect(() => {
    if (searchParams.city === 'Hồ Chí Minh') {
      setDistricts(hcmDistricts);
    } else if (searchParams.city === 'Hà Nội') {
      setDistricts(hanoiDistricts);
    } else {
      setDistricts([]);
    }
  }, [searchParams.city]);
  
  // Thực hiện tìm kiếm
  const performSearch = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Starting search with params:', searchParams);
      
      // Chuẩn bị tham số tìm kiếm
      const params: SearchParams = {
        ...searchParams,
        page: page,
        limit: limit
      };
      
      // Đảm bảo các tham số đúng định dạng
      if (params.city) {
        console.log('City filter:', params.city);
      }
      
      if (params.district) {
        console.log('District filter:', params.district);
      }
      
      if (params.property_type) {
        console.log('Property type filter:', params.property_type);
      }
      
      // Xóa các tham số undefined hoặc rỗng
      Object.keys(params).forEach(key => {
        const paramKey = key as keyof SearchParams;
        if (params[paramKey] === undefined || params[paramKey] === '') {
          delete params[paramKey];
        }
      });
      
      // Đảm bảo status là 'available' nếu không được chỉ định
      if (!params.status) {
        params.status = 'available';
      }
      
      console.log('Final search params for API call:', params);
      const response = await searchProperties(params);
      
      if (response.success) {
        console.log('Search successful, found:', response.data.properties.length, 'properties');
        setProperties(response.data.properties);
        setTotalPages(response.data.pagination.totalPages);
        setTotalCount(response.data.pagination.total);
      } else {
        console.error('Search API error:', response.message);
        setError(response.message || 'Có lỗi xảy ra khi tìm kiếm bất động sản');
        setProperties([]);
      }
    } catch (err: any) {
      console.error('Error during search:', err);
      setError('Có lỗi xảy ra khi tìm kiếm bất động sản');
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Cập nhật URL và thực hiện tìm kiếm khi params thay đổi
  useEffect(() => {
    // Cập nhật URL
    const newSearchParams = new URLSearchParams();
    
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && key !== 'limit') {
        newSearchParams.set(key, String(value));
      }
    });
    
    navigate({
      pathname: '/tim-kiem',
      search: newSearchParams.toString()
    }, { replace: true });
  }, [searchParams]);
  
  // Thực hiện tìm kiếm khi URL thay đổi hoặc khi component được mount
  useEffect(() => {
    console.log('URL or component changed, performing search');
    performSearch();
  }, [location.search]);
  
  // Thêm useEffect để đồng bộ searchParams từ URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const paramsFromUrl: Partial<SearchParams> = {};
    
    // Lấy tất cả các tham số từ URL
    queryParams.forEach((value, key) => {
      switch (key) {
        case 'page':
          paramsFromUrl.page = parseInt(value);
          setPage(parseInt(value));
          break;
        case 'price_min':
        case 'price_max':
          paramsFromUrl[key] = Number(value);
          break;
        case 'area_min':
        case 'area_max':
          paramsFromUrl[key] = Number(value);
          break;
        case 'keyword':
        case 'city':
        case 'city_name':
        case 'district':
        case 'ward':
        case 'property_type':
        case 'amenities':
        case 'status':
        case 'listing_type':
        case 'sort_by':
        case 'sort_direction':
          paramsFromUrl[key] = value;
          break;
        case 'bedrooms':
        case 'bathrooms':
          paramsFromUrl[key] = value ? Number(value) : undefined;
          break;
      }
    });
    
    // Make sure listing_type is set to 'sale' if not specified
    if (!paramsFromUrl.listing_type) {
      paramsFromUrl.listing_type = 'sale';
    }
    
    // Cập nhật price range và area range từ URL
    if (paramsFromUrl.price_min !== undefined || paramsFromUrl.price_max !== undefined) {
      setPriceRange([
        paramsFromUrl.price_min || 0,
        paramsFromUrl.price_max || 20000000000
      ]);
    }
    
    if (paramsFromUrl.area_min !== undefined || paramsFromUrl.area_max !== undefined) {
      setAreaRange([
        paramsFromUrl.area_min || 0,
        paramsFromUrl.area_max || 500
      ]);
    }
    
    // Chỉ cập nhật searchParams nếu có thay đổi để tránh vòng lặp vô hạn
    if (Object.keys(paramsFromUrl).length > 0) {
      setSearchParams(prev => ({
        ...prev,
        ...paramsFromUrl
      }));
    }
  }, [location.search]);
  
  // Xử lý thay đổi trang
  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    setSearchParams(prev => ({ ...prev, page: value }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Xử lý thay đổi bộ lọc (không tự động tìm kiếm)
  const handleFilterChange = (name: string, value: any) => {
    console.log(`Filter changed: ${name} = ${value}`);
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };
  
  // Xử lý thay đổi khoảng giá
  const handlePriceRangeChange = (_: Event, newValue: number | number[]) => {
    setPriceRange(newValue as number[]);
  };
  
  // Xử lý thay đổi khoảng diện tích
  const handleAreaRangeChange = (_: Event, newValue: number | number[]) => {
    setAreaRange(newValue as number[]);
  };
  
  // Xử lý khi kết thúc thay đổi khoảng giá
  const handlePriceRangeChangeCommitted = () => {
    setSearchParams(prev => ({
      ...prev,
      price_min: priceRange[0],
      price_max: priceRange[1]
    }));
  };
  
  // Xử lý khi kết thúc thay đổi khoảng diện tích
  const handleAreaRangeChangeCommitted = () => {
    setSearchParams(prev => ({
      ...prev,
      area_min: areaRange[0],
      area_max: areaRange[1]
    }));
  };
  
  // Xử lý tìm kiếm khi nhấn Enter
  const handleSearchInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  };
  
  // Xử lý tìm kiếm khi nhấn nút tìm kiếm
  const handleSearchButtonClick = () => {
    performSearch();
  };
  
  // Reset tất cả bộ lọc
  const resetFilters = () => {
    setSearchParams({
      keyword: '',
      city: '',
      city_name: '',
      district: '',
      ward: '',
      price_min: undefined,
      price_max: undefined,
      area_min: undefined,
      area_max: undefined,
      bedrooms: '',
      bathrooms: '',
      property_type: '',
      amenities: '',
      listing_type: searchParams.listing_type || 'sale',
      status: 'available',
      sort_by: 'created_at',
      sort_direction: 'DESC',
      page: 1,
      limit: limit
    });
    
    // Reset slider values
    setPriceRange([0, 20000000000]);
    setAreaRange([0, 500]);
    
    // Cập nhật URL
    navigate('/tim-kiem', { replace: true });
    
    // Thực hiện tìm kiếm với các bộ lọc đã được reset
    setPage(1);
  };
  
  // Xử lý áp dụng bộ lọc (khi nhấn nút)
  const applyFilters = () => {
    console.log('Applying filters...');
    // Ensure URL parameters reflect the current search params
    const newSearchParams = new URLSearchParams();
    
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && key !== 'limit') {
        newSearchParams.set(key, String(value));
      }
    });
    
    // Reset to page 1 when applying new filters
    newSearchParams.set('page', '1');
    setPage(1);
    
    // Update URL and let the location change trigger the search
    navigate({
      pathname: '/tim-kiem',
      search: newSearchParams.toString()
    });
  };
  
  return (
    <Box>
      <SearchHeader />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Kết quả tìm kiếm
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {loading ? 'Đang tìm kiếm bất động sản phù hợp...' : `Tìm thấy ${totalCount} bất động sản phù hợp`}
          </Typography>
        </Box>
        
        <Grid container spacing={3}>
          {/* Filters section - Desktop */}
          <Grid
            item
            xs={12}
            md={3}
            sx={{
              display: { xs: showFilters ? 'block' : 'none', md: 'block' },
              position: { xs: 'fixed', md: 'relative' },
              top: { xs: 0, md: 'auto' },
              left: { xs: 0, md: 'auto' },
              width: { xs: '100%', md: 'auto' },
              height: { xs: '100vh', md: 'auto' },
              zIndex: { xs: 1200, md: 1 },
              bgcolor: 'background.paper',
              p: { xs: 2, md: 0 },
              overflowY: { xs: 'auto', md: 'visible' }
            }}
          >
            <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Bộ lọc tìm kiếm</Typography>
              <IconButton onClick={() => setShowFilters(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
            
            <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>Loại bất động sản</Typography>
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Loại bất động sản</InputLabel>
                <Select
                  value={searchParams.property_type}
                  label="Loại bất động sản"
                  onChange={(e) => handleFilterChange('property_type', e.target.value)}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  {propertyTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Typography variant="h6" gutterBottom>Vị trí</Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Tỉnh/Thành phố
                </Typography>
                <LocationSelector 
                  selectedLocation={searchParams.city_name}
                  onLocationSelected={(id, name) => {
                    handleFilterChange('city', id);
                    handleFilterChange('city_name', name);
                    handleFilterChange('district', '');
                  }}
                  placeholder="Chọn tỉnh thành"
                  sx={{ width: '100%' }}
                />
              </Box>
              
              <FormControl fullWidth size="small" sx={{ mb: 2 }} disabled={!searchParams.city}>
                <InputLabel>Quận/Huyện</InputLabel>
                <Select
                  value={searchParams.district}
                  label="Quận/Huyện"
                  onChange={(e) => handleFilterChange('district', e.target.value)}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  {districts.map((district) => (
                    <MenuItem key={district} value={district}>{district}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Typography variant="h6" gutterBottom>Khoảng giá</Typography>
              <Box sx={{ px: 1 }}>
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
                  <Typography variant="body2">{formatCurrency(priceRange[0])}</Typography>
                  <Typography variant="body2">{formatCurrency(priceRange[1])}</Typography>
                </Box>
              </Box>
              
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Diện tích</Typography>
              <Box sx={{ px: 1 }}>
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
                  <Typography variant="body2">{formatArea(areaRange[0])}</Typography>
                  <Typography variant="body2">{formatArea(areaRange[1])}</Typography>
                </Box>
              </Box>
              
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Số phòng</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Phòng ngủ</InputLabel>
                    <Select
                      value={searchParams.bedrooms}
                      label="Phòng ngủ"
                      onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                    >
                      <MenuItem value="">Tất cả</MenuItem>
                      {[1, 2, 3, 4, 5].map((num) => (
                        <MenuItem key={num} value={num}>{num}+</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Phòng tắm</InputLabel>
                    <Select
                      value={searchParams.bathrooms}
                      label="Phòng tắm"
                      onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
                    >
                      <MenuItem value="">Tất cả</MenuItem>
                      {[1, 2, 3, 4].map((num) => (
                        <MenuItem key={num} value={num}>{num}+</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Sắp xếp</Typography>
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Sắp xếp theo</InputLabel>
                <Select
                  value={searchParams.sort_by}
                  label="Sắp xếp theo"
                  onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                >
                  <MenuItem value="created_at">Mới nhất</MenuItem>
                  <MenuItem value="price">Giá</MenuItem>
                  <MenuItem value="area">Diện tích</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth size="small">
                <InputLabel>Thứ tự</InputLabel>
                <Select
                  value={searchParams.sort_direction}
                  label="Thứ tự"
                  onChange={(e) => handleFilterChange('sort_direction', e.target.value)}
                >
                  <MenuItem value="ASC">Tăng dần</MenuItem>
                  <MenuItem value="DESC">Giảm dần</MenuItem>
                </Select>
              </FormControl>
              
              <Box sx={{ mt: 3, mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={applyFilters}
                  fullWidth
                >
                  Áp dụng bộ lọc
                </Button>
              </Box>
              
              <Box sx={{ mt: 2, mb: 1 }}>
                <Button 
                  variant="outlined" 
                  color="inherit" 
                  onClick={resetFilters} 
                  size="small"
                  fullWidth
                >
                  Xóa bộ lọc
                </Button>
              </Box>
            </Paper>
          </Grid>
          
          {/* Results section */}
          <Grid item xs={12} md={9}>
            {/* Results count and sorting */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                {loading ? 'Đang tìm kiếm...' : `Tìm thấy ${totalCount} bất động sản`}
              </Typography>
              
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Sắp xếp theo</InputLabel>
                  <Select
                    value={searchParams.sort_by}
                    label="Sắp xếp theo"
                    onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                  >
                    <MenuItem value="created_at">Mới nhất</MenuItem>
                    <MenuItem value="price">Giá</MenuItem>
                    <MenuItem value="area">Diện tích</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl size="small" sx={{ minWidth: 120, ml: 1 }}>
                  <InputLabel>Thứ tự</InputLabel>
                  <Select
                    value={searchParams.sort_direction}
                    label="Thứ tự"
                    onChange={(e) => handleFilterChange('sort_direction', e.target.value)}
                  >
                    <MenuItem value="ASC">Tăng dần</MenuItem>
                    <MenuItem value="DESC">Giảm dần</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              
              <Button 
                variant="outlined" 
                startIcon={<TuneIcon />} 
                onClick={() => setShowFilters(true)}
                sx={{ display: { xs: 'block', md: 'none' } }}
              >
                Bộ lọc
              </Button>
            </Box>
            
            {/* Active filters */}
            {(searchParams.property_type || searchParams.city || searchParams.district || 
              searchParams.bedrooms || searchParams.bathrooms || 
              searchParams.price_min || searchParams.price_max || 
              searchParams.area_min || searchParams.area_max) && (
              <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {searchParams.property_type && (
                  <Chip 
                    label={propertyTypes.find(t => t.value === searchParams.property_type)?.label || searchParams.property_type} 
                    onDelete={() => handleFilterChange('property_type', '')}
                    color="primary"
                    variant="outlined"
                  />
                )}
                
                {searchParams.city && (
                  <Chip 
                    label={searchParams.city_name || searchParams.city}
                    onDelete={() => {
                      handleFilterChange('city', '');
                      handleFilterChange('city_name', '');
                      handleFilterChange('district', '');
                    }}
                    color="primary"
                    variant="outlined"
                  />
                )}
                
                {searchParams.district && (
                  <Chip 
                    label={searchParams.district} 
                    onDelete={() => handleFilterChange('district', '')}
                  />
                )}
                
                {searchParams.bedrooms && (
                  <Chip 
                    label={`${searchParams.bedrooms}+ phòng ngủ`} 
                    onDelete={() => handleFilterChange('bedrooms', '')}
                  />
                )}
                
                {searchParams.bathrooms && (
                  <Chip 
                    label={`${searchParams.bathrooms}+ phòng tắm`} 
                    onDelete={() => handleFilterChange('bathrooms', '')}
                  />
                )}
                
                {(searchParams.price_min || searchParams.price_max) && (
                  <Chip 
                    label={`Giá: ${formatCurrency(searchParams.price_min || 0)} - ${formatCurrency(searchParams.price_max || 20000000000)}`} 
                    onDelete={() => {
                      handleFilterChange('price_min', undefined);
                      handleFilterChange('price_max', undefined);
                      setPriceRange([0, 20000000000]);
                    }}
                  />
                )}
                
                {(searchParams.area_min || searchParams.area_max) && (
                  <Chip 
                    label={`Diện tích: ${formatArea(searchParams.area_min || 0)} - ${formatArea(searchParams.area_max || 500)}`} 
                    onDelete={() => {
                      handleFilterChange('area_min', undefined);
                      handleFilterChange('area_max', undefined);
                      setAreaRange([0, 500]);
                    }}
                  />
                )}
                
                <Button
                  variant="outlined"
                  size="small"
                  onClick={resetFilters}
                  startIcon={<CloseIcon />}
                >
                  Xóa tất cả
                </Button>
              </Box>
            )}
            
            {/* Loading state */}
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
                <CircularProgress />
              </Box>
            )}
            
            {/* Error state */}
            {error && !loading && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            {/* Empty state */}
            {!loading && !error && properties.length === 0 && (
              <Paper sx={{ p: 4, textAlign: 'center', mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Không tìm thấy bất động sản nào
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  Không có bất động sản nào phù hợp với tiêu chí tìm kiếm của bạn.
                </Typography>
                <Button variant="contained" onClick={resetFilters} sx={{ mt: 2 }}>
                  Xóa bộ lọc
                </Button>
              </Paper>
            )}
            
            {/* Results grid */}
            {!loading && !error && properties.length > 0 && (
              <>
                <Grid container spacing={3}>
                  {properties.map((property) => (
                    <Grid item xs={12} sm={6} md={4} key={property.id}>
                      <PropertyCard property={property} />
                    </Grid>
                  ))}
                </Grid>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={handlePageChange}
                      color="primary"
                      size="large"
                    />
                  </Box>
                )}
              </>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default SearchPage; 