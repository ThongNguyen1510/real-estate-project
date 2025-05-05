import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Divider,
  Chip,
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
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Home as HomeIcon,
  Hotel as HotelIcon,
  Bathtub as BathtubIcon,
  DirectionsCar as CarIcon,
  ArrowForward as ArrowForwardIcon,
  Tune as TuneIcon
} from '@mui/icons-material';
import { propertyService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import PropertyCard from '../components/property/PropertyCard';

// Format currency (VND)
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(value);
};

// Format area (m²)
const formatArea = (value: number) => {
  return `${value} m²`;
};

const PropertyListingPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // Get transaction type from URL path
  const transactionType = location.pathname.includes('/cho-thue') ? 'rent' : 'sale';
  
  console.log('PropertyListingPage: URL path:', location.pathname);
  console.log('PropertyListingPage: Detected transaction type:', transactionType);
  
  // State for properties
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState<boolean>(false);
  
  // State for pagination
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [count, setCount] = useState<number>(0);
  
  // State for search and filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filters, setFilters] = useState({
    property_type: '',
    city: '',
    district: '',
    price_min: 0,
    price_max: 50000000000, // 50 tỷ
    area_min: 0,
    area_max: 500,
    bedrooms: '',
    bathrooms: ''
  });
  
  // State for filter visibility on mobile
  const [showFilters, setShowFilters] = useState<boolean>(false);
  
  // Fetch properties
  const fetchProperties = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Prepare query params
      const params = {
        page,
        limit: 12,
        status: transactionType === 'rent' ? 'for_rent' : 'for_sale',
        search: searchQuery || undefined,
        property_type: filters.property_type || undefined,
        city: filters.city || undefined,
        district: filters.district || undefined,
        price_min: filters.price_min > 0 ? filters.price_min : undefined,
        price_max: filters.price_max < 50000000000 ? filters.price_max : undefined,
        area_min: filters.area_min > 0 ? filters.area_min : undefined,
        area_max: filters.area_max < 500 ? filters.area_max : undefined,
        bedrooms: filters.bedrooms || undefined,
        bathrooms: filters.bathrooms || undefined
      };
      
      console.log('PropertyListingPage: Gọi API với params:', params);
      console.log('PropertyListingPage: Transaction type:', transactionType);
      
      const response = await propertyService.getProperties(params);
      
      console.log('PropertyListingPage: API response:', response);
      
      if (response.success) {
        setProperties(response.data.properties);
        setTotalPages(response.data.pagination.totalPages);
        setCount(response.data.pagination.total);
      } else {
        // Nếu API trả về lỗi, hiển thị dữ liệu mẫu để demo
        if (response.status === 401 || response.status === 403) {
          console.log('PropertyListingPage: User không được xác thực, hiển thị dữ liệu mẫu');
          
          // Tạo dữ liệu mẫu dựa trên transactionType
          const mockProperties = Array.from({ length: 6 }, (_, index) => ({
            id: index + 1,
            title: transactionType === 'rent' 
              ? `Căn hộ cho thuê ${index + 1} tại Quận 1` 
              : `Căn hộ bán ${index + 1} tại Quận 2`,
            price: transactionType === 'rent' ? 15000000 + (index * 5000000) : 2000000000 + (index * 500000000),
            area: 50 + (index * 10),
            bedrooms: 1 + (index % 3),
            bathrooms: 1 + (index % 2),
            city: 'Hồ Chí Minh',
            district: index % 2 === 0 ? 'Quận 1' : 'Quận 2',
            address: '123 Đường ABC',
            status: transactionType === 'rent' ? 'for_rent' : 'for_sale',
            property_type: index % 3 === 0 ? 'apartment' : (index % 3 === 1 ? 'house' : 'villa'),
            image_url: `https://source.unsplash.com/featured/300x200?apartment,${index}`,
            primary_image_url: `https://source.unsplash.com/featured/300x200?apartment,${index}`
          }));
          
          setProperties(mockProperties);
          setTotalPages(1);
          setCount(mockProperties.length);
          setUsingMockData(true);
          return;
        }
        
        setError(response.message || 'Có lỗi xảy ra khi tải dữ liệu');
      }
    } catch (err: any) {
      console.error('Error fetching properties:', err);
      
      // Nếu lỗi là do xác thực (401/403), hiển thị dữ liệu mẫu
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        console.log('PropertyListingPage: Lỗi xác thực, hiển thị dữ liệu mẫu');
        
        // Tạo dữ liệu mẫu dựa trên transactionType
        const mockProperties = Array.from({ length: 6 }, (_, index) => ({
          id: index + 1,
          title: transactionType === 'rent' 
            ? `Căn hộ cho thuê ${index + 1} tại Quận 1` 
            : `Căn hộ bán ${index + 1} tại Quận 2`,
          price: transactionType === 'rent' ? 15000000 + (index * 5000000) : 2000000000 + (index * 500000000),
          area: 50 + (index * 10),
          bedrooms: 1 + (index % 3),
          bathrooms: 1 + (index % 2),
          city: 'Hồ Chí Minh',
          district: index % 2 === 0 ? 'Quận 1' : 'Quận 2',
          address: '123 Đường ABC',
          status: transactionType === 'rent' ? 'for_rent' : 'for_sale',
          property_type: index % 3 === 0 ? 'apartment' : (index % 3 === 1 ? 'house' : 'villa'),
          image_url: `https://source.unsplash.com/featured/300x200?apartment,${index}`,
          primary_image_url: `https://source.unsplash.com/featured/300x200?apartment,${index}`
        }));
        
        setProperties(mockProperties);
        setTotalPages(1);
        setCount(mockProperties.length);
        setUsingMockData(true);
        return;
      }
      
      setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch properties on mount and when dependencies change
  useEffect(() => {
    console.log('PropertyListingPage: useEffect triggered with page:', page, 'transactionType:', transactionType);
    fetchProperties();
  }, [page, transactionType, location.pathname]);
  
  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page
    fetchProperties();
  };
  
  // Handle filter changes
  const handleFilterChange = (name: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Apply filters
  const applyFilters = () => {
    setPage(1); // Reset to first page
    fetchProperties();
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      property_type: '',
      city: '',
      district: '',
      price_min: 0,
      price_max: 50000000000,
      area_min: 0,
      area_max: 500,
      bedrooms: '',
      bathrooms: ''
    });
    setSearchQuery('');
    setPage(1);
  };
  
  // Handle page change
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          {transactionType === 'rent' ? 'Nhà đất cho thuê' : 'Nhà đất bán'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Tìm kiếm bất động sản {transactionType === 'rent' ? 'cho thuê' : 'mua bán'} phù hợp với nhu cầu của bạn
        </Typography>
      </Box>
      
      {/* Thông báo dữ liệu mẫu */}
      {usingMockData && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Đang hiển thị dữ liệu mẫu. Vui lòng đăng nhập để xem danh sách bất động sản thực tế.
        </Alert>
      )}
      
      {/* Search Bar */}
      <Paper
        component="form"
        onSubmit={handleSearch}
        elevation={2}
        sx={{ p: '2px 4px', mb: 3, display: 'flex', alignItems: 'center' }}
      >
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder="Tìm kiếm theo địa chỉ, tên dự án..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <IconButton type="submit" sx={{ p: '10px' }} aria-label="search">
          <SearchIcon />
        </IconButton>
      </Paper>
      
      <Grid container spacing={3}>
        {/* Filters - Desktop */}
        <Grid item xs={12} md={3} sx={{ display: { xs: 'none', md: 'block' } }}>
          <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Bộ lọc tìm kiếm
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {/* Property Type */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Loại bất động sản</InputLabel>
              <Select
                value={filters.property_type}
                label="Loại bất động sản"
                onChange={(e) => handleFilterChange('property_type', e.target.value)}
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="apartment">Căn hộ chung cư</MenuItem>
                <MenuItem value="house">Nhà riêng</MenuItem>
                <MenuItem value="villa">Biệt thự</MenuItem>
                <MenuItem value="land">Đất nền</MenuItem>
                <MenuItem value="office">Văn phòng</MenuItem>
                <MenuItem value="shop">Mặt bằng kinh doanh</MenuItem>
              </Select>
            </FormControl>
            
            {/* City */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Thành phố</InputLabel>
              <Select
                value={filters.city}
                label="Thành phố"
                onChange={(e) => handleFilterChange('city', e.target.value)}
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="hcm">Hồ Chí Minh</MenuItem>
                <MenuItem value="hanoi">Hà Nội</MenuItem>
                <MenuItem value="danang">Đà Nẵng</MenuItem>
              </Select>
            </FormControl>
            
            {/* District */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Quận/Huyện</InputLabel>
              <Select
                value={filters.district}
                label="Quận/Huyện"
                onChange={(e) => handleFilterChange('district', e.target.value)}
                disabled={!filters.city}
              >
                <MenuItem value="">Tất cả</MenuItem>
                {filters.city === 'hcm' && (
                  <>
                    <MenuItem value="quan_1">Quận 1</MenuItem>
                    <MenuItem value="quan_2">Quận 2</MenuItem>
                    <MenuItem value="quan_3">Quận 3</MenuItem>
                    <MenuItem value="quan_4">Quận 4</MenuItem>
                    <MenuItem value="quan_5">Quận 5</MenuItem>
                  </>
                )}
                {filters.city === 'hanoi' && (
                  <>
                    <MenuItem value="ba_dinh">Ba Đình</MenuItem>
                    <MenuItem value="hoan_kiem">Hoàn Kiếm</MenuItem>
                    <MenuItem value="hai_ba_trung">Hai Bà Trưng</MenuItem>
                    <MenuItem value="dong_da">Đống Đa</MenuItem>
                  </>
                )}
              </Select>
            </FormControl>
            
            {/* Price Range */}
            <Typography gutterBottom>Khoảng giá</Typography>
            <Box sx={{ px: 1 }}>
              <Slider
                value={[filters.price_min, filters.price_max]}
                onChange={(_, newValue) => {
                  const [min, max] = newValue as number[];
                  handleFilterChange('price_min', min);
                  handleFilterChange('price_max', max);
                }}
                valueLabelDisplay="auto"
                min={0}
                max={50000000000}
                step={1000000}
                valueLabelFormat={(value) => formatCurrency(value)}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">{formatCurrency(filters.price_min)}</Typography>
                <Typography variant="body2">{formatCurrency(filters.price_max)}</Typography>
              </Box>
            </Box>
            
            {/* Area Range */}
            <Typography gutterBottom sx={{ mt: 2 }}>Diện tích</Typography>
            <Box sx={{ px: 1 }}>
              <Slider
                value={[filters.area_min, filters.area_max]}
                onChange={(_, newValue) => {
                  const [min, max] = newValue as number[];
                  handleFilterChange('area_min', min);
                  handleFilterChange('area_max', max);
                }}
                valueLabelDisplay="auto"
                min={0}
                max={500}
                step={5}
                valueLabelFormat={(value) => `${value} m²`}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">{filters.area_min} m²</Typography>
                <Typography variant="body2">{filters.area_max} m²</Typography>
              </Box>
            </Box>
            
            {/* Bedrooms */}
            <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
              <InputLabel>Số phòng ngủ</InputLabel>
              <Select
                value={filters.bedrooms}
                label="Số phòng ngủ"
                onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="1">1+</MenuItem>
                <MenuItem value="2">2+</MenuItem>
                <MenuItem value="3">3+</MenuItem>
                <MenuItem value="4">4+</MenuItem>
                <MenuItem value="5">5+</MenuItem>
              </Select>
            </FormControl>
            
            {/* Bathrooms */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Số phòng tắm</InputLabel>
              <Select
                value={filters.bathrooms}
                label="Số phòng tắm"
                onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="1">1+</MenuItem>
                <MenuItem value="2">2+</MenuItem>
                <MenuItem value="3">3+</MenuItem>
                <MenuItem value="4">4+</MenuItem>
              </Select>
            </FormControl>
            
            {/* Apply/Reset Buttons */}
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <Button 
                variant="contained" 
                fullWidth 
                onClick={applyFilters}
              >
                Áp dụng
              </Button>
              <Button 
                variant="outlined" 
                fullWidth 
                onClick={resetFilters}
              >
                Thiết lập lại
              </Button>
            </Box>
          </Paper>
          
          {/* Create Listing CTA */}
          {isAuthenticated && (
            <Paper 
              elevation={2} 
              sx={{ 
                p: 2, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                bgcolor: 'primary.light',
                color: 'primary.contrastText'
              }}
            >
              <Typography variant="h6" gutterBottom align="center">
                Bạn muốn đăng tin bất động sản?
              </Typography>
              <Button 
                variant="contained" 
                component={Link} 
                to="/dang-tin"
                endIcon={<ArrowForwardIcon />}
                sx={{ mt: 1 }}
              >
                Đăng tin ngay
              </Button>
            </Paper>
          )}
        </Grid>
        
        {/* Filters Toggle - Mobile */}
        <Grid item xs={12} sx={{ display: { xs: 'block', md: 'none' }, mb: 2 }}>
          <Button 
            fullWidth 
            variant="outlined" 
            startIcon={<TuneIcon />}
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Ẩn bộ lọc' : 'Hiển thị bộ lọc'}
          </Button>
          
          {showFilters && (
            <Paper elevation={2} sx={{ p: 2, mt: 2 }}>
              {/* Mobile filters - same as desktop but in a collapsible section */}
              <Typography variant="h6" gutterBottom>
                Bộ lọc tìm kiếm
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {/* Property Type */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Loại bất động sản</InputLabel>
                <Select
                  value={filters.property_type}
                  label="Loại bất động sản"
                  onChange={(e) => handleFilterChange('property_type', e.target.value)}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  <MenuItem value="apartment">Căn hộ chung cư</MenuItem>
                  <MenuItem value="house">Nhà riêng</MenuItem>
                  <MenuItem value="villa">Biệt thự</MenuItem>
                  <MenuItem value="land">Đất nền</MenuItem>
                  <MenuItem value="office">Văn phòng</MenuItem>
                  <MenuItem value="shop">Mặt bằng kinh doanh</MenuItem>
                </Select>
              </FormControl>
              
              {/* Apply/Reset Buttons */}
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Button 
                  variant="contained" 
                  fullWidth 
                  onClick={applyFilters}
                >
                  Áp dụng
                </Button>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  onClick={resetFilters}
                >
                  Thiết lập lại
                </Button>
              </Box>
            </Paper>
          )}
        </Grid>
        
        {/* Property Listings */}
        <Grid item xs={12} md={9}>
          {/* Results info */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="body1">
              {loading ? 'Đang tìm...' : `Tìm thấy ${count} bất động sản`}
            </Typography>
            
            {/* Create Listing CTA - Mobile */}
            {isAuthenticated && (
              <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                <Button 
                  variant="contained" 
                  component={Link} 
                  to="/dang-tin"
                  size="small"
                >
                  Đăng tin
                </Button>
              </Box>
            )}
          </Box>
          
          {/* Error message */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {/* Loading state */}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}
          
          {/* No results */}
          {!loading && properties.length === 0 && (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Không tìm thấy bất động sản nào
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Vui lòng thử lại với các tiêu chí tìm kiếm khác
              </Typography>
            </Paper>
          )}
          
          {/* Property Grid */}
          <Grid container spacing={2}>
            {!loading && (
              <>
                {console.log('PropertyListingPage: Rendering properties list, count:', properties.length)}
                {properties.map((property) => (
                  <Grid item xs={12} sm={6} md={4} key={property.id}>
                    <PropertyCard property={property} />
                  </Grid>
                ))}
              </>
            )}
          </Grid>
          
          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default PropertyListingPage; 