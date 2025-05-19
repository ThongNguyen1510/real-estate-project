import React, { useState, useEffect, useMemo } from 'react';
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
  Alert,
  Stack
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
  Clear as ClearIcon
} from '@mui/icons-material';
import { propertyService, locationService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { getLocationNames } from '../services/api/locationService';
import PropertyCard from '../components/property/PropertyCard';
import SearchHeader from '../components/search/SearchHeader';
import LocationSelector from '../components/search/LocationSelector';

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

// Function to get property type label
const getPropertyTypeLabel = (type: string): string => {
  switch (type) {
    case 'apartment':
      return 'Căn hộ chung cư';
    case 'house':
      return 'Nhà riêng';
    case 'villa':
      return 'Biệt thự';
    case 'land':
      return 'Đất nền';
    case 'office':
      return 'Văn phòng';
    case 'shop':
      return 'Mặt bằng kinh doanh';
    default:
      return type;
  }
};

// Function to get price range label
const getPriceRangeLabel = (min: number, max: number, isRent: boolean): string => {
  if (min > 0 && max < 50000000000) {
    return `Giá: ${formatCurrency(min)} - ${formatCurrency(max)}`;
  } else if (min > 0) {
    return `Giá từ: ${formatCurrency(min)}`;
  } else if (max < 50000000000) {
    return `Giá đến: ${formatCurrency(max)}`;
  }
  return '';
};

// Function to get area range label
const getAreaRangeLabel = (min: number, max: number): string => {
  if (min > 0 && max < 500) {
    return `Diện tích: ${min}m² - ${max}m²`;
  } else if (min > 0) {
    return `Diện tích từ: ${min}m²`;
  } else if (max < 500) {
    return `Diện tích đến: ${max}m²`;
  }
  return '';
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
    city_name: '',
    district: '',
    district_name: '',
    price_min: 0,
    price_max: 50000000000, // 50 tỷ
    area_min: 0,
    area_max: 500,
    bedrooms: '',
    bathrooms: ''
  });
  
  // State cho tỉnh/thành phố và quận/huyện
  const [cities, setCities] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [loadingCities, setLoadingCities] = useState<boolean>(false);
  const [loadingDistricts, setLoadingDistricts] = useState<boolean>(false);
  
  // Cập nhật trạng thái dựa trên URL query parameters
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const pageParam = queryParams.get('page');
    
    // Cập nhật searchQuery nếu có
    const keywordParam = queryParams.get('keyword');
    if (keywordParam) {
      setSearchQuery(keywordParam);
    }
    
    // Cập nhật page nếu có
    if (pageParam) {
      setPage(parseInt(pageParam));
    } else {
      setPage(1); // Reset về trang 1 nếu không có tham số page
    }
    
    // Cập nhật các bộ lọc từ URL
    const newFilters = { ...filters };
    
    // Kiểm tra và cập nhật từng tham số lọc
    if (queryParams.get('property_type')) {
      newFilters.property_type = queryParams.get('property_type') || '';
    }
    
    if (queryParams.get('city')) {
      newFilters.city = queryParams.get('city') || '';
      
      // Thiết lập city_name dựa trên mã city
      const cityId = queryParams.get('city');
      if (cityId === '1') {
        newFilters.city_name = 'Hà Nội';
      } else if (cityId === '79') {
        newFilters.city_name = 'Hồ Chí Minh';
      } else {
        // Không lấy city_name từ URL nữa
        // newFilters.city_name = queryParams.get('city_name') || '';
      }
    }
    
    if (queryParams.get('district')) {
      newFilters.district = queryParams.get('district') || '';
      // Không lấy district_name từ URL nữa
      // if (queryParams.get('district_name')) {
      //   newFilters.district_name = queryParams.get('district_name') || '';
      // }
    }
    
    if (queryParams.get('price_min')) {
      newFilters.price_min = parseInt(queryParams.get('price_min') || '0');
    }
    
    if (queryParams.get('price_max')) {
      newFilters.price_max = parseInt(queryParams.get('price_max') || '50000000000');
    }
    
    if (queryParams.get('area_min')) {
      newFilters.area_min = parseInt(queryParams.get('area_min') || '0');
    }
    
    if (queryParams.get('area_max')) {
      newFilters.area_max = parseInt(queryParams.get('area_max') || '500');
    }
    
    if (queryParams.get('bedrooms')) {
      newFilters.bedrooms = queryParams.get('bedrooms') || '';
    }
    
    if (queryParams.get('bathrooms')) {
      newFilters.bathrooms = queryParams.get('bathrooms') || '';
    }
    
    // Cập nhật state filters
    setFilters(newFilters);
    
    // Tự động tìm kiếm khi URL thay đổi
    fetchProperties();
  }, [location.search, location.pathname]);
  
  // State for filter visibility on mobile
  const [showFilters, setShowFilters] = useState<boolean>(false);
  
  // Load danh sách tỉnh/thành phố khi component mount
  useEffect(() => {
    const fetchCities = async () => {
      setLoadingCities(true);
      try {
        const response = await locationService.getCities();
        if (response.success && response.data) {
          setCities(response.data);
        } else {
          console.error('Không thể lấy danh sách tỉnh/thành phố:', response.message);
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách tỉnh/thành phố:', error);
      } finally {
        setLoadingCities(false);
      }
    };
    
    fetchCities();
  }, []);
  
  // Load danh sách quận/huyện khi tỉnh/thành phố thay đổi
  useEffect(() => {
    const fetchDistricts = async () => {
      if (!filters.city) {
        setDistricts([]);
        return;
      }
      
      setLoadingDistricts(true);
      try {
        const response = await locationService.getDistricts(filters.city);
        if (response.success && response.data) {
          setDistricts(response.data);
        } else {
          console.error('Không thể lấy danh sách quận/huyện:', response.message);
          setDistricts([]);
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách quận/huyện:', error);
        setDistricts([]);
      } finally {
        setLoadingDistricts(false);
      }
    };
    
    fetchDistricts();
  }, [filters.city]);
  
  // Enrich properties with location names
  const enrichPropertiesWithLocationNames = async (propertiesList: any[]) => {
    if (!propertiesList || propertiesList.length === 0) return propertiesList;
    
    // Process all properties to add location names if missing
    return await Promise.all(propertiesList.map(async (property) => {
      // Skip processing if we already have location names
      if (property.city_name && property.district_name && property.ward_name) {
        return property;
      }
      
      try {
        // Fetch location names if they're missing
        const locationResponse = await getLocationNames(
          property.city || null,
          property.district || null,
          property.ward || null
        );
        
        if (locationResponse.success && locationResponse.data) {
          const { city_name, district_name, ward_name } = locationResponse.data;
          
          // Return property with additional location names
          return {
            ...property,
            city_name: city_name || property.city || '',
            district_name: district_name || property.district || '',
            ward_name: ward_name || property.ward || ''
          };
        }
      } catch (error) {
        console.error('Error enriching property with location names:', error);
      }
      
      // Return original property if location enrichment fails
      return property;
    }));
  };

  // Fetch properties
  const fetchProperties = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Cập nhật các ngưỡng giá dựa trên loại giao dịch
      let priceMin = filters.price_min;
      let priceMax = filters.price_max;
      
      // Điều chỉnh ngưỡng giá mặc định cho phù hợp với transactionType
      if (transactionType === 'rent' && priceMin === 0) {
        // Cho thuê: thường từ 5 triệu đến 50 triệu/tháng
        priceMin = 0;
        priceMax = Math.min(priceMax, 100000000); // Tối đa 100 triệu/tháng
      } else if (transactionType === 'sale' && priceMin === 0) {
        // Mua bán: thường từ 500 triệu trở lên
        priceMin = 100000000; // Tối thiểu 100 triệu
      }
      
      // Prepare query params
      const params = {
        page,
        limit: 12,
        listing_type: transactionType,
        keyword: searchQuery || undefined,
        property_type: filters.property_type || undefined,
        city: filters.city || undefined,
        district: filters.district || undefined,
        price_min: priceMin > 0 ? priceMin : undefined,
        price_max: priceMax < 50000000000 ? priceMax : undefined,
        area_min: filters.area_min > 0 ? filters.area_min : undefined,
        area_max: filters.area_max < 500 ? filters.area_max : undefined,
        bedrooms: filters.bedrooms || undefined,
        bathrooms: filters.bathrooms || undefined,
        // Thêm giá trị status mặc định là available
        status: 'available'
      };
      
      // Chuẩn hóa các tham số trước khi gửi
      if (params.property_type) {
        console.log(`PropertyListingPage: Đang chuẩn hóa property_type từ "${params.property_type}"`);
        params.property_type = params.property_type.toString().trim().toLowerCase();
        console.log(`PropertyListingPage: Sau khi chuẩn hóa: "${params.property_type}"`);
      }
      
      console.log('PropertyListingPage: Gọi API với params:', params);
      console.log('PropertyListingPage: Transaction type:', transactionType);
      
      // THÊM LOG CHI TIẾT HƠN
      console.log('PropertyListingPage: API Request Details', {
        transactionType,
        pathName: location.pathname,
        cityFilter: {
          id: filters.city,
          name: filters.city_name
        },
        queryParams: params
      });
      
      const response = await propertyService.getProperties(params);
      
      console.log('PropertyListingPage: API response:', response);
      
      if (response.success) {
        // Enrich properties with location names before setting state
        const enrichedProperties = await enrichPropertiesWithLocationNames(response.data.properties);
        setProperties(enrichedProperties);
        setTotalPages(response.data.pagination.totalPages);
        setCount(response.data.pagination.total);
      } else {
        // Nếu API trả về lỗi, hiển thị dữ liệu mẫu để demo
        if (response.status === 401 || response.status === 403) {
          console.log('PropertyListingPage: User không được xác thực, hiển thị dữ liệu mẫu');
          
          // Tạo dữ liệu mẫu dựa trên transactionType và bộ lọc hiện tại
          const mockProperties = Array.from({ length: 6 }, (_, index) => {
            // Xác định giá phù hợp với loại giao dịch
            let price;
            if (transactionType === 'rent') {
              // Cho thuê: 5-30 triệu/tháng
              price = 5000000 + (index * 5000000);
            } else {
              // Mua bán: 1-5 tỷ
              price = 1000000000 + (index * 800000000);
            }
            
            // Get city name from filters or fallback to Ho Chi Minh
            const cityName = filters.city_name || 'Hồ Chí Minh';
            const cityId = filters.city || '79';
            
            // Chọn loại bất động sản dựa trên bộ lọc hoặc ngẫu nhiên nếu không có bộ lọc
            let propertyType;
            if (filters.property_type) {
              propertyType = filters.property_type;
            } else {
              const types = ['apartment', 'house', 'land', 'villa'];
              propertyType = types[index % types.length];
            }
            
            // Tạo tiêu đề phù hợp với loại bất động sản đã chọn
            let propertyTitle;
            if (propertyType === 'land') {
              propertyTitle = transactionType === 'rent' 
                ? `Đất nền cho thuê ${index + 1} tại ${cityName}` 
                : `Đất nền bán ${index + 1} tại ${cityName}`;
            } else if (propertyType === 'house') {
              propertyTitle = transactionType === 'rent' 
                ? `Nhà phố cho thuê ${index + 1} tại ${cityName}` 
                : `Nhà phố bán ${index + 1} tại ${cityName}`;
            } else if (propertyType === 'villa') {
              propertyTitle = transactionType === 'rent' 
                ? `Biệt thự cho thuê ${index + 1} tại ${cityName}` 
                : `Biệt thự bán ${index + 1} tại ${cityName}`;
            } else {
              propertyTitle = transactionType === 'rent' 
                ? `Căn hộ cho thuê ${index + 1} tại ${cityName}` 
                : `Căn hộ bán ${index + 1} tại ${cityName}`;
            }
            
            // Xử lý phòng ngủ, phòng tắm dựa trên bộ lọc
            const bedrooms = filters.bedrooms ? Math.max(parseInt(filters.bedrooms), 1 + (index % 3)) : 1 + (index % 3);
            const bathrooms = filters.bathrooms ? Math.max(parseInt(filters.bathrooms), 1 + (index % 2)) : 1 + (index % 2);
            
            // Xử lý diện tích dựa trên bộ lọc
            const area = filters.area_min ? Math.max(filters.area_min, 50 + (index * 10)) : 50 + (index * 10);
            
            return {
              id: index + 1,
              title: propertyTitle,
              price,
              area,
              bedrooms,
              bathrooms,
              city: cityId,
              city_name: cityName,
              district: filters.district_name || (index % 2 === 0 ? `Quận ${index + 1}` : `Quận ${index + 2}`),
              district_name: filters.district_name || (index % 2 === 0 ? `Quận ${index + 1}` : `Quận ${index + 2}`),
              address: `123 Đường ABC, ${cityName}`,
              status: 'available',
              property_type: propertyType,
              listing_type: transactionType,
              image_url: `https://source.unsplash.com/featured/300x200?${propertyType},${index}`,
              primary_image_url: `https://source.unsplash.com/featured/300x200?${propertyType},${index}`
            };
          });
          
          // Lọc dữ liệu mẫu theo các bộ lọc đã chọn
          const filteredMockProperties = mockProperties.filter(property => {
            // Nếu không có bộ lọc nào, trả về true (hiển thị tất cả)
            // Nếu có bộ lọc, kiểm tra từng điều kiện
            
            // Kiểm tra thành phố
            if (filters.city && property.city !== filters.city) {
              return false;
            }
            
            // Kiểm tra quận/huyện
            if (filters.district && property.district !== filters.district) {
              return false;
            }
            
            // Kiểm tra loại bất động sản
            if (filters.property_type && property.property_type !== filters.property_type) {
              return false;
            }
            
            // Kiểm tra giá
            if (filters.price_min > 0 && property.price < filters.price_min) {
              return false;
            }
            if (filters.price_max < 50000000000 && property.price > filters.price_max) {
              return false;
            }
            
            // Kiểm tra diện tích
            if (filters.area_min > 0 && property.area < filters.area_min) {
              return false;
            }
            if (filters.area_max < 500 && property.area > filters.area_max) {
              return false;
            }
            
            // Kiểm tra số phòng ngủ và phòng tắm
            if (filters.bedrooms && property.bedrooms < parseInt(filters.bedrooms)) {
              return false;
            }
            if (filters.bathrooms && property.bathrooms < parseInt(filters.bathrooms)) {
              return false;
            }
            
            // Nếu vượt qua tất cả điều kiện lọc, trả về true (hiển thị)
            return true;
          });
          
          setProperties(filteredMockProperties.length > 0 ? filteredMockProperties : mockProperties);
          setTotalPages(1);
          setCount(filteredMockProperties.length > 0 ? filteredMockProperties.length : mockProperties.length);
          setUsingMockData(true);
          return;
        }
        
        // For other errors, just show empty results instead of an error message
        console.log('PropertyListingPage: API error, showing empty results');
        setProperties([]);
        setTotalPages(0);
        setCount(0);
      }
    } catch (err: any) {
      console.error('Error fetching properties:', err);
      
      // Nếu lỗi là do xác thực (401/403), hiển thị dữ liệu mẫu
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        console.log('PropertyListingPage: Lỗi xác thực, hiển thị dữ liệu mẫu');
        
        // Same mock data generation as above
        // Just show empty results for any other errors
        console.log('PropertyListingPage: Exception occurred, showing empty results');
        setProperties([]);
        setTotalPages(0);
        setCount(0);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch properties on mount and when dependencies change
  useEffect(() => {
    console.log('PropertyListingPage: useEffect triggered with page:', page, 'transactionType:', transactionType);
    fetchProperties();
  }, [page, transactionType, location.pathname]);
  
  // Hàm xử lý khi nhấn nút tìm kiếm
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };
  
  // Hàm xử lý khi thay đổi bộ lọc
  const handleFilterChange = (name: string, value: any) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  // Hàm áp dụng bộ lọc và cập nhật URL
  const applyFilters = () => {
    // Tạo đối tượng URLSearchParams từ các bộ lọc hiện tại
    const params = new URLSearchParams();
    
    // Thêm các tham số tìm kiếm
    if (searchQuery) params.set('keyword', searchQuery);
    
    // Thêm các bộ lọc
    if (filters.property_type) params.set('property_type', filters.property_type);
    if (filters.city) params.set('city', filters.city);
    if (filters.district) params.set('district', filters.district);
    
    // Không thêm district_name vào URL
    // if (filters.district_name) params.set('district_name', filters.district_name);
    
    // Chỉ thêm các tham số giá và diện tích nếu khác giá trị mặc định
    if (filters.price_min > 0) params.set('price_min', filters.price_min.toString());
    if (filters.price_max < 50000000000) params.set('price_max', filters.price_max.toString());
    if (filters.area_min > 0) params.set('area_min', filters.area_min.toString());
    if (filters.area_max < 500) params.set('area_max', filters.area_max.toString());
    
    if (filters.bedrooms) params.set('bedrooms', filters.bedrooms.toString());
    if (filters.bathrooms) params.set('bathrooms', filters.bathrooms.toString());
  
    // Đặt trang về 1 khi áp dụng bộ lọc mới
    params.set('page', '1');
    setPage(1);
    
    // Cập nhật URL với các tham số mới mà không thay đổi đường dẫn hiện tại
    navigate({
      pathname: location.pathname, // Giữ nguyên đường dẫn (mua-ban hoặc cho-thue)
      search: params.toString()
    });
  };
  
  // Hàm reset bộ lọc
  const resetFilters = () => {
    // Reset search query
    setSearchQuery('');
    
    // Reset các bộ lọc về giá trị mặc định
    setFilters({
      property_type: '',
      city: '',
      city_name: '',
      district: '',
      district_name: '',
      price_min: 0,
      price_max: 50000000000,
      area_min: 0,
      area_max: 500,
      bedrooms: '',
      bathrooms: ''
    });
    
    // Reset page về 1
    setPage(1);
    
    // Cập nhật URL về đường dẫn cơ bản mà không có tham số
    navigate(location.pathname);
  };
  
  // Hàm xử lý khi chuyển trang
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    
    // Cập nhật URL với trang mới nhưng giữ nguyên các bộ lọc hiện tại
    const params = new URLSearchParams(location.search);
    params.set('page', value.toString());
    
    navigate({
      pathname: location.pathname,
      search: params.toString()
    });
    
    window.scrollTo(0, 0);
  };
  
  // Hàm xử lý khi chọn tỉnh/thành phố
  const handleCityChange = (cityId: string, cityName: string) => {
    console.log(`PropertyListingPage: Setting city to ${cityId} (${cityName})`);
    setFilters(prev => ({
      ...prev,
      city: cityId,
      // Vẫn giữ city_name cho UI hiển thị, nhưng không gửi lên API
      city_name: cityName,
      district: '', // Reset district when city changes
      district_name: '' // Reset district_name too
    }));
  };
  
  // Hàm xử lý khi chọn quận/huyện
  const handleDistrictChange = (districtId: string, districtName: string) => {
    setFilters(prev => ({
      ...prev,
      district: districtId,
      district_name: districtName
    }));
  };

  // Hàm xử lý khi muốn xóa một bộ lọc
  const handleRemoveFilter = (filterName: string) => {
    if (filterName === 'city') {
      setFilters(prev => ({
        ...prev,
        city: '',
        city_name: '',
        district: '',
        district_name: ''
      }));
    } else if (filterName === 'district') {
      setFilters(prev => ({
        ...prev,
        district: '',
        district_name: ''
      }));
    } else if (filterName === 'price') {
      setFilters(prev => ({
        ...prev,
        price_min: 0,
        price_max: 50000000000
      }));
    } else if (filterName === 'area') {
      setFilters(prev => ({
        ...prev,
        area_min: 0,
        area_max: 500
      }));
    } else if (filterName === 'bedrooms') {
      setFilters(prev => ({
        ...prev,
        bedrooms: ''
      }));
    } else if (filterName === 'bathrooms') {
      setFilters(prev => ({
        ...prev,
        bathrooms: ''
      }));
    } else if (filterName === 'property_type') {
      setFilters(prev => ({
        ...prev,
        property_type: ''
      }));
    } else if (filterName === 'keyword') {
      setSearchQuery('');
    }
    
    // Automatically apply the filters after removing one
    setTimeout(() => {
      applyFilters();
    }, 0);
  };

  // Create array of active filters for display
  const activeFilters = useMemo(() => {
    const tags = [];
    
    // Add city filter tag
    if (filters.city) {
      // Map city code to name
      let cityName = "";
      if (filters.city === "1") {
        cityName = "Hà Nội";
      } else if (filters.city === "79") {
        cityName = "Hồ Chí Minh";
      } else {
        // If we have city_name in filters, use it (từ lịch sử)
        cityName = filters.city_name || `Mã tỉnh: ${filters.city}`;
      }
      
      tags.push({
        id: 'city',
        label: cityName,
        value: filters.city
      });
    }
    
    // Add district filter tag
    if (filters.district_name) {
      tags.push({
        id: 'district',
        label: `${filters.district_name}`,
        value: filters.district_name
      });
    }
    
    // Add property type filter tag
    if (filters.property_type) {
      tags.push({
        id: 'property_type',
        label: getPropertyTypeLabel(filters.property_type),
        value: filters.property_type
      });
    }
    
    // Add price range filter tag
    if (filters.price_min > 0 || filters.price_max < 50000000000) {
      tags.push({
        id: 'price',
        label: getPriceRangeLabel(filters.price_min, filters.price_max, transactionType === 'rent'),
        value: `${filters.price_min}-${filters.price_max}`
      });
    }
    
    // Add area range filter tag
    if (filters.area_min > 0 || filters.area_max < 500) {
      tags.push({
        id: 'area',
        label: getAreaRangeLabel(filters.area_min, filters.area_max),
        value: `${filters.area_min}-${filters.area_max}`
      });
    }
    
    // Add bedrooms filter tag
    if (filters.bedrooms) {
      tags.push({
        id: 'bedrooms',
        label: `Phòng ngủ: ${filters.bedrooms}+`,
        value: filters.bedrooms
      });
    }
    
    // Add bathrooms filter tag
    if (filters.bathrooms) {
      tags.push({
        id: 'bathrooms',
        label: `Phòng tắm: ${filters.bathrooms}+`,
        value: filters.bathrooms
      });
    }
    
    // Add keyword filter tag
    if (searchQuery) {
      tags.push({
        id: 'keyword',
        label: `Từ khóa: ${searchQuery}`,
        value: searchQuery
      });
    }
    
    return tags;
  }, [filters, searchQuery, transactionType]);
  
  return (
    <Box>
      <SearchHeader transactionType={transactionType} />
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            {transactionType === 'rent' ? 'Nhà đất cho thuê' : 'Nhà đất bán'}
          </Typography>
        </Box>
        
        {/* Active Filter Tags */}
        {activeFilters.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {activeFilters.map((filter) => (
                <Chip
                  key={filter.id}
                  label={filter.label}
                  onDelete={() => handleRemoveFilter(filter.id)}
                  color="primary"
                  variant="outlined"
                  deleteIcon={<ClearIcon />}
                  sx={{ mb: 1 }}
                />
              ))}
              {activeFilters.length > 1 && (
                <Chip
                  label="Xóa tất cả"
                  onClick={resetFilters}
                  color="error"
                  variant="outlined"
                  sx={{ mb: 1 }}
                />
              )}
            </Stack>
          </Box>
        )}
        
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
          sx={{ 
            p: '2px 4px', 
            mb: 3, 
            display: 'flex', 
            alignItems: 'center',
            borderRadius: '20px',
            maxWidth: '600px',
            margin: '0 auto 24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }
          }}
        >
          <SearchIcon sx={{ color: 'text.secondary', ml: 1.5 }} />
          <InputBase
            sx={{ 
              ml: 1, 
              flex: 1,
              fontSize: '0.95rem',
              py: 0.75
            }}
            placeholder="Tìm kiếm theo địa chỉ, tên dự án..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <IconButton 
            type="submit" 
            sx={{ 
              p: '8px', 
              mr: 0.5,
              color: 'primary.main',
              backgroundColor: 'rgba(25, 118, 210, 0.08)',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.15)',
              }
            }} 
            aria-label="search"
          >
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
              
              {/* City - Replaced with LocationSelector */}
              <Box sx={{ mb: 2 }}>
                <LocationSelector 
                  selectedCityId={filters.city}
                  selectedCityName={filters.city_name || ''}
                  selectedDistrict={filters.district_name || ''}
                  placeholder="Tỉnh/Thành phố"
                  onLocationSelected={(cityId, cityName, district) => {
                    handleCityChange(cityId, cityName);
                    if (district) {
                      const districtId = districts.find(d => d.name === district)?.id || '';
                      handleDistrictChange(districtId, district);
                    }
                  }}
                />
              </Box>
              
              {/* District */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Quận/Huyện</InputLabel>
                <Select
                  value={filters.district}
                  label="Quận/Huyện"
                  onChange={(e) => {
                    const districtId = e.target.value as string;
                    const selectedDistrict = districts.find(district => district.id === districtId);
                    handleDistrictChange(
                      districtId,
                      selectedDistrict ? selectedDistrict.name : ''
                    );
                  }}
                  disabled={!filters.city || loadingDistricts}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  {loadingDistricts ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} /> Đang tải...
                    </MenuItem>
                  ) : (
                    districts.map((district) => (
                      <MenuItem key={district.id} value={district.id}>
                        {district.name}
                      </MenuItem>
                    ))
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
                {/* Mobile filters */}
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
                
                {/* City - Mobile - Replaced with LocationSelector */}
                <Box sx={{ mb: 2 }}>
                  <LocationSelector 
                    selectedCityId={filters.city}
                    selectedCityName={filters.city_name || ''}
                    selectedDistrict={filters.district_name || ''}
                    placeholder="Tỉnh/Thành phố"
                    onLocationSelected={(cityId, cityName, district) => {
                      handleCityChange(cityId, cityName);
                      if (district) {
                        const districtId = districts.find(d => d.name === district)?.id || '';
                        handleDistrictChange(districtId, district);
                      }
                    }}
                  />
                </Box>
                
                {/* District - Mobile */}
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Quận/Huyện</InputLabel>
                  <Select
                    value={filters.district}
                    label="Quận/Huyện"
                    onChange={(e) => {
                      const districtId = e.target.value as string;
                      const selectedDistrict = districts.find(district => district.id === districtId);
                      handleDistrictChange(
                        districtId,
                        selectedDistrict ? selectedDistrict.name : ''
                      );
                    }}
                    disabled={!filters.city || loadingDistricts}
                  >
                    <MenuItem value="">Tất cả</MenuItem>
                    {loadingDistricts ? (
                      <MenuItem disabled>
                        <CircularProgress size={20} /> Đang tải...
                      </MenuItem>
                    ) : (
                      districts.map((district) => (
                        <MenuItem key={district.id} value={district.id}>
                          {district.name}
                        </MenuItem>
                      ))
                    )}
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
            
            {/* Error message - removed */}
            
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
                  Vui lòng thử lại với các tiêu chí tìm kiếm khác hoặc mở rộng phạm vi tìm kiếm của bạn
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
    </Box>
  );
};

export default PropertyListingPage; 