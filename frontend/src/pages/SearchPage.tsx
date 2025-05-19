import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Box,
  Paper,
  Button,
  Pagination,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  Stack
} from '@mui/material';
import {
  Close as CloseIcon,
  TravelExplore as TravelExploreIcon
} from '@mui/icons-material';
import { searchProperties } from '../services/api/propertyService';
import PropertyCard from '../components/property/PropertyCard';
import SearchHeader from '../components/search/SearchHeader';
import SearchSidebar from '../components/search/SearchSidebar';

// Danh sách các tỉnh/thành phố với mã số
const CITIES = [
  { id: '79', name: 'Hồ Chí Minh' },
  { id: '1', name: 'Hà Nội' }, // Sử dụng mã đúng '1' thay vì '01'
  { id: '48', name: 'Đà Nẵng' },
  { id: '92', name: 'Cần Thơ' },
  { id: '31', name: 'Hải Phòng' },
  { id: '56', name: 'Khánh Hòa' },
  { id: '75', name: 'Bình Dương' },
  { id: '77', name: 'Đồng Nai' }
];

// Danh sách loại bất động sản
const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Căn hộ chung cư' },
  { value: 'house', label: 'Nhà riêng' },
  { value: 'villa', label: 'Biệt thự' },
  { value: 'land', label: 'Đất nền' },
  { value: 'office', label: 'Văn phòng' },
  { value: 'shop', label: 'Mặt bằng kinh doanh' }
];

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

// Interface for search parameters
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
  
  // State for search results
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for pagination
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const limit = 12; // Number of properties per page
  
  // Initialize empty search parameters state
  const [searchParams, setSearchParams] = useState<SearchParams>({
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
    listing_type: 'sale',
    status: 'available',
    sort_by: 'created_at',
    sort_direction: 'DESC',
    page: 1,
    limit
  });
  
  // Parse URL when component mounts or URL changes
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const paramsFromUrl: Partial<SearchParams> = {};
    
    // Process parameters from URL
    if (queryParams.has('city')) {
      const cityId = queryParams.get('city') || '';
      // Normalize city ID format
      paramsFromUrl.city = cityId === '01' ? '1' : cityId;
      
      // Set city_name based on city id if not provided
      if (!queryParams.has('city_name')) {
        if (paramsFromUrl.city === '1') {
          paramsFromUrl.city_name = 'Hà Nội';
        } else if (paramsFromUrl.city === '79') {
          paramsFromUrl.city_name = 'Hồ Chí Minh';
        }
      }
    }
    
    // Get city_name from URL if present
    if (queryParams.has('city_name')) {
      paramsFromUrl.city_name = queryParams.get('city_name') || '';
    }
    
    // Get other search parameters
    if (queryParams.has('district')) {
      paramsFromUrl.district = queryParams.get('district') || '';
    }
    
    if (queryParams.has('ward')) {
      paramsFromUrl.ward = queryParams.get('ward') || '';
    }
    
    if (queryParams.has('keyword')) {
      paramsFromUrl.keyword = queryParams.get('keyword') || '';
    }
    
    if (queryParams.has('property_type')) {
      paramsFromUrl.property_type = queryParams.get('property_type') || '';
    }
    
    if (queryParams.has('listing_type')) {
      paramsFromUrl.listing_type = queryParams.get('listing_type') || 'sale';
    } else {
      paramsFromUrl.listing_type = 'sale';
    }
    
    if (queryParams.has('price_min')) {
      paramsFromUrl.price_min = Number(queryParams.get('price_min'));
    }
    
    if (queryParams.has('price_max')) {
      paramsFromUrl.price_max = Number(queryParams.get('price_max'));
    }
    
    if (queryParams.has('area_min')) {
      paramsFromUrl.area_min = Number(queryParams.get('area_min'));
    }
    
    if (queryParams.has('area_max')) {
      paramsFromUrl.area_max = Number(queryParams.get('area_max'));
    }
    
    if (queryParams.has('bedrooms')) {
      paramsFromUrl.bedrooms = Number(queryParams.get('bedrooms'));
    }
    
    if (queryParams.has('bathrooms')) {
      paramsFromUrl.bathrooms = Number(queryParams.get('bathrooms'));
    }
    
    if (queryParams.has('sort_by')) {
      paramsFromUrl.sort_by = queryParams.get('sort_by') || 'created_at';
    }
    
    if (queryParams.has('sort_direction')) {
      paramsFromUrl.sort_direction = queryParams.get('sort_direction') || 'DESC';
    }
    
    if (queryParams.has('page')) {
      const pageNum = Number(queryParams.get('page')) || 1;
      paramsFromUrl.page = pageNum;
      setPage(pageNum);
    }
    
    // Update search parameters state
    setSearchParams(prev => ({
      ...prev,
      ...paramsFromUrl
    }));
    
    // Perform search if parameters exist in URL
    if (Object.keys(paramsFromUrl).length > 0) {
      performSearch(paramsFromUrl);
    }
  }, [location.search]);
  
  // Perform search with given parameters
  const performSearch = async (params: Partial<SearchParams> = searchParams) => {
    setLoading(true);
    setError(null);
    
    try {
      // Create a copy of parameters for processing
      const apiParams: Record<string, any> = {};
      
      // Only include parameters with values
      if (params.city) {
        // Normalize city ID
        apiParams.city = params.city === '01' ? '1' : params.city;
        
        // Map city code to city_name if city_name is not provided
        if (params.city_name) {
          apiParams.city_name = params.city_name;
        } else {
          if (apiParams.city === '1') {
            apiParams.city_name = 'Hà Nội';
          } else if (apiParams.city === '79') {
            apiParams.city_name = 'Hồ Chí Minh';
          }
        }
      }
      
      // Include city_name even without city code if provided
      if (params.city_name && !params.city) {
        apiParams.city_name = params.city_name;
      }
      
      // Add other parameters
      if (params.district) apiParams.district = params.district;
      if (params.ward) apiParams.ward = params.ward;
      if (params.keyword) apiParams.keyword = params.keyword;
      if (params.property_type) apiParams.property_type = params.property_type;
      if (params.bedrooms) apiParams.bedrooms = params.bedrooms;
      if (params.bathrooms) apiParams.bathrooms = params.bathrooms;
      if (params.price_min) apiParams.price_min = params.price_min;
      if (params.price_max) apiParams.price_max = params.price_max;
      if (params.area_min) apiParams.area_min = params.area_min;
      if (params.area_max) apiParams.area_max = params.area_max;
      if (params.listing_type) apiParams.listing_type = params.listing_type;
      
      // Always include available status
      apiParams.status = 'available';
      
      // Add pagination information
      apiParams.page = params.page || page;
      apiParams.limit = limit;
      
      // Call API with processed parameters
      const response = await searchProperties(apiParams);
      
      if (response.success) {
        setProperties(response.data.properties || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalCount(response.data.pagination?.total || 0);
      } else {
        // Instead of showing an error message, simply set properties to empty array
        setProperties([]);
        setTotalPages(1);
        setTotalCount(0);
      }
    } catch (err: any) {
      // Instead of setting an error message, just set properties to empty array
      setProperties([]);
      setTotalPages(1);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle page change
  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    
    // Update URL and perform search
    const updatedParams = {
      ...searchParams,
      page: value
    };
    
    // Update URL
    const queryParams = new URLSearchParams(location.search);
    queryParams.set('page', value.toString());
    navigate(`/tim-kiem?${queryParams.toString()}`);
    
    // Perform search
    performSearch(updatedParams);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Reset all filters
  const resetFilters = () => {
    // Navigate to search page with no parameters
    navigate('/tim-kiem');
    
    // Reset search parameters state
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
      listing_type: 'sale',
      status: 'available',
      sort_by: 'created_at',
      sort_direction: 'DESC',
      page: 1,
      limit
    });
    
    // Perform search with default parameters
    performSearch({
      listing_type: 'sale',
      status: 'available',
      page: 1,
      limit
    });
  };
  
  return (
    <Box>
      {/* Search Header with detailed search controls */}
      <SearchHeader
        variant="detailed"
        initialValues={searchParams}
        onSearch={performSearch}
      />
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {/* Results header */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" component="h1">
                {loading ? 'Đang tìm kiếm...' : `Tìm thấy ${totalCount} bất động sản`}
                </Typography>
              
              {/* Reset filters button */}
              {(searchParams.keyword || searchParams.city || searchParams.district ||
                searchParams.property_type || searchParams.bedrooms ||
                searchParams.price_min || searchParams.price_max || 
                searchParams.area_min || searchParams.area_max) && (
                <Button 
                  variant="outlined" 
                  color="inherit" 
                  size="small"
                  startIcon={<CloseIcon />}
                  onClick={resetFilters}
                >
                  Xóa bộ lọc
                </Button>
              )}
            </Box>
            
            {/* Active filters display */}
            {(searchParams.city || searchParams.district || 
              searchParams.property_type || searchParams.bedrooms || 
              (searchParams.price_min && searchParams.price_min > 0) || 
              (searchParams.price_max && searchParams.price_max < 20000000000) || 
              (searchParams.area_min && searchParams.area_min > 0) || 
              (searchParams.area_max && searchParams.area_max < 500)) && (
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 3 }}>
                {searchParams.keyword && (
                  <Chip 
                    label={`Từ khóa: ${searchParams.keyword}`} 
                    onDelete={() => {
                      const params = new URLSearchParams(location.search);
                      params.delete('keyword');
                      navigate(`/tim-kiem?${params.toString()}`);
                    }}
                    color="primary"
                    variant="outlined"
                  />
                )}
                
                {searchParams.city_name && (
                  <Chip 
                    label={searchParams.city_name}
                    onDelete={() => {
                      const params = new URLSearchParams(location.search);
                      params.delete('city');
                      params.delete('city_name');
                      navigate(`/tim-kiem?${params.toString()}`);
                    }}
                    color="primary"
                    variant="outlined"
                  />
                )}
                
                {searchParams.district && (
                  <Chip 
                    label={searchParams.district} 
                    onDelete={() => {
                      const params = new URLSearchParams(location.search);
                      params.delete('district');
                      navigate(`/tim-kiem?${params.toString()}`);
                    }}
                    color="primary"
                    variant="outlined"
                  />
                )}
                
                {searchParams.property_type && (
                  <Chip 
                    label={searchParams.property_type === 'apartment' ? 'Căn hộ chung cư' : 
                           searchParams.property_type === 'house' ? 'Nhà riêng' :
                           searchParams.property_type === 'villa' ? 'Biệt thự' :
                           searchParams.property_type === 'land' ? 'Đất nền' :
                           searchParams.property_type === 'office' ? 'Văn phòng' :
                           searchParams.property_type === 'shop' ? 'Mặt bằng kinh doanh' :
                           searchParams.property_type} 
                    onDelete={() => {
                      const params = new URLSearchParams(location.search);
                      params.delete('property_type');
                      navigate(`/tim-kiem?${params.toString()}`);
                    }}
                    color="primary"
                    variant="outlined"
                  />
                )}
                
                {searchParams.bedrooms && (
                  <Chip 
                    label={`${searchParams.bedrooms}+ phòng ngủ`}
                    onDelete={() => {
                      const params = new URLSearchParams(location.search);
                      params.delete('bedrooms');
                      navigate(`/tim-kiem?${params.toString()}`);
                    }}
                    color="primary"
                    variant="outlined"
                  />
                )}
                
                {(searchParams.price_min !== undefined || searchParams.price_max !== undefined) && (
                  <Chip 
                    label={`Giá: ${formatCurrency(searchParams.price_min || 0)} - ${formatCurrency(searchParams.price_max || 20000000000)}`} 
                    onDelete={() => {
                      const params = new URLSearchParams(location.search);
                      params.delete('price_min');
                      params.delete('price_max');
                      navigate(`/tim-kiem?${params.toString()}`);
                    }}
                    color="primary"
                    variant="outlined"
                  />
                )}
                
                {(searchParams.area_min !== undefined || searchParams.area_max !== undefined) && (
                  <Chip 
                    label={`Diện tích: ${formatArea(searchParams.area_min || 0)} - ${formatArea(searchParams.area_max || 500)}`} 
                    onDelete={() => {
                      const params = new URLSearchParams(location.search);
                      params.delete('area_min');
                      params.delete('area_max');
                      navigate(`/tim-kiem?${params.toString()}`);
                    }}
                    color="primary"
                    variant="outlined"
                  />
                )}
              </Stack>
            )}
          </Grid>
          
          {/* Results display */}
          <Grid item xs={12}>
            {/* Loading state */}
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                <CircularProgress />
              </Box>
            )}
            
            {/* No results state - shows for both errors and empty results */}
            {!loading && properties.length === 0 && (
              <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                <TravelExploreIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Không tìm thấy bất động sản nào
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Vui lòng thử lại với các tiêu chí tìm kiếm khác hoặc mở rộng phạm vi tìm kiếm của bạn.
                </Typography>
                <Button variant="contained" onClick={resetFilters}>
                  Xóa bộ lọc
                </Button>
              </Paper>
            )}
            
            {/* Results grid */}
            {!loading && properties.length > 0 && (
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