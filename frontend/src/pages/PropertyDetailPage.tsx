import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Box,
  Paper,
  Button,
  Chip,
  Divider,
  IconButton,
  CircularProgress,
  Alert,
  Card,
  CardMedia,
  Dialog,
  DialogContent,
  useMediaQuery,
  useTheme,
  Avatar,
  Snackbar,
  Tooltip
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Home as HomeIcon,
  Hotel as HotelIcon,
  Bathtub as BathtubIcon,
  DirectionsCar as CarIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Close as CloseIcon,
  Share as ShareIcon,
  ContentCopy as ContentCopyIcon,
  Map as MapIcon,
  Report as ReportIcon
} from '@mui/icons-material';
import { getProperty } from '../services/api/propertyService';
import userService from '../services/api/userService';
import { locationService } from '../services/api';
import { getLocationNames } from '../services/api/locationService';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../contexts/FavoritesContext';
import OpenStreetMap from '../components/map/OpenStreetMap';
import { geocodeAddress } from '../services/api/geocodingService';
import ReportPropertyDialog from '../components/property/ReportPropertyDialog';
import { getProperties } from '../services/api/propertyService';
import PropertyCard from '../components/property/PropertyCard';
import MapPicker from '../components/map/MapPicker';

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

// Format date
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return 'Không có thông tin';
  
  try {
    const date = new Date(dateString);
    
    // Kiểm tra date có hợp lệ không
    if (isNaN(date.getTime())) {
      return 'Ngày không hợp lệ';
    }
    
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error, dateString);
    return 'Ngày không hợp lệ';
  }
};

// Function to format phone number with asterisks
const formatPhoneWithAsterisk = (phone: string | undefined): string => {
  if (!phone) return "Chưa có số điện thoại";
  
  // Format phone number: XXXX XXX *** • Hiện số
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length < 8) return phone;
  
  const part1 = cleaned.substring(0, 4);
  const part2 = cleaned.substring(4, 7);
  
  return `${part1} ${part2} *** • Hiện số`;
};

// Define a basic property type
interface PropertyData {
  id?: number | string;
  title?: string;
  description?: string;
  price?: number;
  area?: number;
  property_type?: string;
  listing_type?: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  city?: string;
  city_name?: string;
  district?: string;
  district_name?: string;
  ward?: string;
  ward_name?: string;
  address?: string;
  owner_id?: number;
  [key: string]: any; // Allow for other properties
}

// Add this function before the PropertyDetailPage component
const formatAddress = (property: PropertyData, locationNames: any) => {
  // Start with the street address
  const addressParts = [property.address?.trim()];

  // Add ward if available (prefer locationNames over property data)
  let wardName = locationNames.ward_name || property.ward_name || property.ward;
  if (wardName) {
    // Remove duplicate "Phường" prefix if it exists
    wardName = wardName.replace(/^Phường\s+Phường\s+/, 'Phường ');
    if (!property.address?.toLowerCase().includes(wardName.toLowerCase())) {
      addressParts.push(wardName.trim());
    }
  }

  // Add district if available (prefer locationNames over property data)
  const districtName = locationNames.district_name || property.district_name || property.district;
  if (districtName && !property.address?.toLowerCase().includes(districtName.toLowerCase())) {
    addressParts.push(districtName.trim());
  }

  // Add city if available (prefer locationNames over property data)
  const cityName = locationNames.city_name || property.city_name || property.city;
  if (cityName && !property.address?.toLowerCase().includes(cityName.toLowerCase())) {
    addressParts.push(cityName.trim());
  }

  // Join all parts with commas
  return addressParts.filter(Boolean).join(', ');
};

const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { isAuthenticated } = useAuth();
  const { favorites, toggleFavorite, isFavorite: checkIsFavorite } = useFavorites();
  
  // State for property data
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for image gallery
  const [images, setImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [openGallery, setOpenGallery] = useState<boolean>(false);
  
  // State for favorites
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [favLoading, setFavLoading] = useState<boolean>(false);
  
  // State for owner data
  const [ownerData, setOwnerData] = useState<any>(null);
  
  // Add state for location data
  const [locationNames, setLocationNames] = useState<{
    city_name: string;
    district_name: string;
    ward_name: string;
  }>({
    city_name: '',
    district_name: '',
    ward_name: ''
  });
  
  // Add state for copy notification
  const [copySuccess, setCopySuccess] = useState(false);
  
  // Thêm state cho việc hiển thị số điện thoại đầy đủ
  const [showFullPhone, setShowFullPhone] = useState<boolean>(false);
  
  // Add new state for coordinates
  const [coordinates, setCoordinates] = useState<{
    latitude: number | null;
    longitude: number | null;
    isLoading: boolean;
  }>({
    latitude: null,
    longitude: null,
    isLoading: false
  });
  
  // Add state for report dialog
  const [reportDialogOpen, setReportDialogOpen] = useState<boolean>(false);
  
  // Add state for similar properties
  const [similarProperties, setSimilarProperties] = useState<any[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState<boolean>(false);
  
  // Add new state for map display
  const [showMap, setShowMap] = useState<boolean>(false);
  
  // Effect to scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Function to fetch similar properties
  const fetchSimilarProperties = async (propertyData: PropertyData) => {
    if (!propertyData.city || !propertyData.district) return;
    
    setLoadingSimilar(true);
    try {
      console.log('Fetching similar properties with city:', propertyData.city, '(', propertyData.city_name, ') and district:', propertyData.district, '(', propertyData.district_name, ')');
      
      // Fetch properties with minimal filtering and get more results to ensure we have enough after filtering
      const params = {
        limit: 20, // Fetch more to have enough after filtering
        exclude_id: propertyData.id // Don't include the current property
      };
      
      const response = await getProperties(params);
      
      if (response.success && response.data && Array.isArray(response.data.properties)) {
        // Manually filter to ensure exact match on city and district
        const filteredProperties = response.data.properties.filter(
          (prop: any) => 
            prop.id !== propertyData.id && // Exclude current property
            prop.city === propertyData.city && // Exact match on city
            prop.district === propertyData.district // Exact match on district
        );
        
        console.log('All properties fetched:', response.data.properties.length);
        console.log('Similar properties after filtering:', filteredProperties.length);
        
        // Limit to 6 properties at most
        setSimilarProperties(filteredProperties.slice(0, 6));
      } else {
        console.log('No properties found or error in response:', response);
        setSimilarProperties([]);
      }
    } catch (error) {
      console.error('Error fetching similar properties:', error);
      setSimilarProperties([]);
    } finally {
      setLoadingSimilar(false);
    }
  };
  
  // Fetch property data
  useEffect(() => {
    const fetchPropertyData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (!id) throw new Error('Không tìm thấy mã bất động sản');
        
        const response = await getProperty(id);
        
        if (response.success) {
          // Kiểm tra xem tin đã hết hạn chưa
          if (response.data.property.expires_at && new Date(response.data.property.expires_at) < new Date()) {
            setError('Tin đăng này đã hết hạn và không còn khả dụng.');
            setLoading(false);
            return;
          }
          
          console.log('API response:', response.data);
          
          // Đảm bảo property.owner là object
          const propertyData: PropertyData = {
            ...response.data.property,
            owner: response.data.property.owner || 
                  response.data.owner || 
                  (response.data.property.owner_id ? { id: response.data.property.owner_id } : {}),
            // Ensure all location fields exist to avoid TypeScript errors
            city: response.data.property.city || undefined,
            district: response.data.property.district || undefined,
            ward: response.data.property.ward || undefined,
            city_name: response.data.property.city_name || undefined,
            district_name: response.data.property.district_name || undefined,
            ward_name: response.data.property.ward_name || undefined
          };
          
          setProperty(propertyData);
          
          // First check for coordinates in location object
          if (propertyData.location && 
              propertyData.location.latitude && 
              propertyData.location.longitude) {
            console.log('Found coordinates in location object:', propertyData.location);
            setCoordinates({
              latitude: propertyData.location.latitude,
              longitude: propertyData.location.longitude,
              isLoading: false
            });
          } 
          // If no coordinates in location object, try to get them from the flat properties
          else if (propertyData.latitude && propertyData.longitude) {
            console.log('Found coordinates in flat properties:', {
              lat: propertyData.latitude,
              lng: propertyData.longitude
            });
            setCoordinates({
              latitude: parseFloat(propertyData.latitude),
              longitude: parseFloat(propertyData.longitude),
              isLoading: false
            });
          }
          // Otherwise, try to geocode the address
          else {
            // Get coordinates from address
            getCoordinatesFromAddress(propertyData);
          }
          
          // Tải thông tin chủ sở hữu nếu có owner_id
          if (propertyData.owner_id) {
            fetchOwnerData(propertyData.owner_id);
          }
          
          // Fetch location names if not already provided
          await fetchLocationNames(propertyData);
          
          // Set images - xử lý cẩn thận các URL từ API
          let imageUrls: string[] = [];
          
          // Add images from the API response
          if (response.data.images && Array.isArray(response.data.images) && response.data.images.length > 0) {
            console.log('Found images in response:', response.data.images);
            
            // Kiểm tra từng URL ảnh
            imageUrls = response.data.images.filter((url: string) => {
              // Loại bỏ các URL rỗng hoặc không hợp lệ
              return url && typeof url === 'string' && url.trim() !== '';
            });
            
            console.log('Filtered valid image URLs:', imageUrls);
          } 
          // If no images, add a placeholder
          else {
            console.log('No images found for property');
          }
          
          // Nếu không có ảnh hợp lệ, thêm placeholder
          if (imageUrls.length === 0) {
            imageUrls = ['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1000&auto=format&fit=crop'];
          }
          
          console.log('Final image URLs:', imageUrls);
          setImages(imageUrls);
          
          // Record view if authenticated
          if (isAuthenticated) {
            try {
              console.log('View recorded for property:', response.data.property.id);
              // Commented out as addRecentlyViewed is not implemented yet
              // await addRecentlyViewed(response.data.property.id);
            } catch (error) {
              console.error('Error recording view:', error);
            }
          }
          
          // Check if property is in favorites using context
          if (id) {
            setIsFavorite(checkIsFavorite(Number(id)));
          }
          
          // Fetch similar properties
          fetchSimilarProperties(propertyData);
        } else {
          setError(response.message || 'Không thể tải thông tin bất động sản');
        }
      } catch (err: any) {
        console.error('Error fetching property:', err);
        setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPropertyData();
  }, [id, isAuthenticated, checkIsFavorite]);
  
  // New function to get coordinates from address
  const getCoordinatesFromAddress = async (propertyData: PropertyData) => {
    if (!propertyData.address) return;
    
    setCoordinates(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Construct a complete address string
      const fullAddress = [
        propertyData.address,
        propertyData.ward_name || propertyData.ward,
        propertyData.district_name || propertyData.district,
        propertyData.city_name || propertyData.city
      ].filter(Boolean).join(', ');
      
      // Get coordinates using geocoding service
      const geocodeResult = await geocodeAddress(fullAddress);
      
      if (geocodeResult.success && geocodeResult.data) {
        console.log('Geocoding success:', geocodeResult.data);
        setCoordinates({
          latitude: geocodeResult.data.latitude,
          longitude: geocodeResult.data.longitude,
          isLoading: false
        });
      } else {
        console.error('Geocoding failed:', geocodeResult.message);
        setCoordinates({
          latitude: null,
          longitude: null,
          isLoading: false
        });
      }
    } catch (error) {
      console.error('Error getting coordinates:', error);
      setCoordinates({
        latitude: null,
        longitude: null,
        isLoading: false
      });
    }
  };

  // New function to fetch location names
  const fetchLocationNames = async (propertyData: PropertyData) => {
    try {
      // Check if we already have the location names
      if (propertyData.city_name && propertyData.district_name && propertyData.ward_name) {
        setLocationNames({
          city_name: propertyData.city_name,
          district_name: propertyData.district_name,
          ward_name: propertyData.ward_name
        });
        return;
      }

      // Try to fetch all names at once using the new API
      try {
        const locationNamesResponse = await getLocationNames(
          propertyData.city || null, 
          propertyData.district || null, 
          propertyData.ward || null
        );
        
        if (locationNamesResponse.success && locationNamesResponse.data) {
          const { city_name, district_name, ward_name } = locationNamesResponse.data;
          
          // Update location names state
          setLocationNames({
            city_name: city_name || (propertyData.city || ''),
            district_name: district_name || (propertyData.district || ''),
            ward_name: ward_name || (propertyData.ward || '')
          });
          
          // Update property data with location names
          setProperty((prev: PropertyData) => ({
            ...prev,
            city_name: city_name || prev.city || '',
            district_name: district_name || prev.district || '',
            ward_name: ward_name || prev.ward || ''
          }));
          
          return;
        }
      } catch (error) {
        console.error('Error fetching location names with bulk API:', error);
        // Continue with individual fetches as fallback
      }

      // Initialize with location IDs as fallback
      let cityName = propertyData.city || '';
      let districtName = propertyData.district || '';
      let wardName = propertyData.ward || '';

      // Fetch city name if needed
      if (propertyData.city && !propertyData.city_name) {
        try {
          const citiesResponse = await locationService.getCities();
          if (citiesResponse && citiesResponse.success && Array.isArray(citiesResponse.data)) {
            const cityObject = citiesResponse.data.find((city: any) => 
              city && city.id && propertyData.city && city.id.toString() === propertyData.city.toString()
            );
            if (cityObject && cityObject.name) {
              cityName = cityObject.name;
            }
          }
        } catch (error) {
          console.error('Error fetching city name:', error);
        }
      }

      // Fetch district name if needed
      if (propertyData.district && !propertyData.district_name) {
        try {
          // Only attempt to fetch districts if city is available
          if (propertyData.city) {
            const districtsResponse = await locationService.getDistricts(propertyData.city);
            if (districtsResponse && districtsResponse.success && Array.isArray(districtsResponse.data)) {
              const districtObject = districtsResponse.data.find((district: any) => 
                district && district.id && propertyData.district && 
                district.id.toString() === propertyData.district.toString()
              );
              if (districtObject && districtObject.name) {
                districtName = districtObject.name;
              }
            }
          }
        } catch (error) {
          console.error('Error fetching district name:', error);
        }
      }

      // Fetch ward name if needed
      if (propertyData.ward && !propertyData.ward_name) {
        try {
          // Only attempt to fetch wards if district is available
          if (propertyData.district) {
            const wardsResponse = await locationService.getWards(propertyData.district);
            if (wardsResponse && wardsResponse.success && Array.isArray(wardsResponse.data)) {
              const wardObject = wardsResponse.data.find((ward: any) => 
                ward && ward.id && propertyData.ward && 
                ward.id.toString() === propertyData.ward.toString()
              );
              if (wardObject && wardObject.name) {
                wardName = wardObject.name;
              }
            }
          }
        } catch (error) {
          console.error('Error fetching ward name:', error);
        }
      }

      // Update location names state
      setLocationNames({
        city_name: cityName,
        district_name: districtName,
        ward_name: wardName
      });

      // Update property data with location names
      setProperty((prev: PropertyData) => ({
        ...prev,
        city_name: cityName,
        district_name: districtName,
        ward_name: wardName
      }));
    } catch (error) {
      console.error('Error fetching location names:', error);
    }
  };

  // Hàm tải thông tin chủ sở hữu
  const fetchOwnerData = async (ownerId: number) => {
    try {
      console.log('Fetching owner data for ID:', ownerId);
      const response = await userService.getUserInfo(ownerId);
      console.log('Raw API response for owner data:', response);
      
      if (response && response.success) {
        console.log('Owner data successfully fetched:', response.data);
        // Kiểm tra response.data có đủ thông tin không
        if (!response.data.full_name && !response.data.phone && !response.data.avatar_url) {
          console.warn('Owner data is incomplete', response.data);
        }
        setOwnerData(response.data);
      } else {
        console.error('Owner data fetch failed:', response.message || 'Unknown error');
      }
    } catch (err) {
      console.error('Error fetching owner data:', err);
    }
  };
  
  // Handle favorite toggle
  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      // Display login message
      setCopySuccess(true);
      return;
    }
    
    if (!id) return;
    setFavLoading(true);
    
    try {
      // Use context's toggleFavorite function
      await toggleFavorite(Number(id));
      
      // Update local state
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setFavLoading(false);
    }
  };
  
  // Image gallery navigation
  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };
  
  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };
  
  // Handle image click to open gallery
  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setOpenGallery(true);
  };
  
  // Function to copy phone number to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      },
      () => {
        console.error('Failed to copy text');
      }
    );
  };
  
  // Hàm để hiển thị số điện thoại phù hợp
  const displayPhoneNumber = (phone: string | undefined): string => {
    if (!phone) return "Chưa có số điện thoại";
    
    if (showFullPhone) {
      // Hiển thị số điện thoại đầy đủ đã được format
      const cleaned = phone.replace(/\D/g, '');
      if (cleaned.length <= 4) return phone;
      
      // Format theo nhóm chữ số
      if (cleaned.length <= 7) {
        return `${cleaned.substring(0, 4)} ${cleaned.substring(4)}`;
      }
      
      return `${cleaned.substring(0, 4)} ${cleaned.substring(4, 7)} ${cleaned.substring(7)}`;
    } else {
      // Hiển thị số điện thoại với dấu sao
      return formatPhoneWithAsterisk(phone);
    }
  };
  
  // Add function to handle report button click
  const handleReportClick = () => {
    setReportDialogOpen(true);
  };
  
  // Add function to navigate to user profile
  const navigateToUserProfile = () => {
    if (property.owner_id) {
      window.location.href = `/nguoi-dung/${property.owner_id}`;
    }
  };
  
  // Add function to open Zalo chat with the given phone number
  const openZaloChat = (phone: string | undefined) => {
    if (!phone) {
      alert('Không có số điện thoại để chat Zalo');
      return;
    }
    
    // Clean the phone number (remove non-digits)
    const cleanedPhone = phone.replace(/\D/g, '');
    
    // Create Zalo chat URL - this follows Zalo's deeplink format
    // Format: https://zalo.me/phone_number
    const zaloUrl = `https://zalo.me/${cleanedPhone}`;
    
    // Open in a new tab
    window.open(zaloUrl, '_blank');
  };
  
  // If loading
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // If error (including expired property)
  if (error || !property) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          icon={error && error.includes('hết hạn') ? <ReportIcon /> : undefined}
        >
          {error || 'Không tìm thấy thông tin bất động sản'}
        </Alert>
        <Button component={Link} to="/mua-ban" variant="outlined" startIcon={<ArrowBackIcon />}>
          Quay lại danh sách
        </Button>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', color: 'text.secondary', fontSize: '0.875rem' }}>
        <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Trang chủ</Link>
        <Box sx={{ mx: 0.5 }}>/</Box>
        <Link to={`/${property.listing_type === 'sale' ? 'mua-ban' : 'cho-thue'}`} style={{ color: 'inherit', textDecoration: 'none' }}>
          {property.listing_type === 'sale' ? 'Mua bán' : 'Cho thuê'}
        </Link>
        <Box sx={{ mx: 0.5 }}>/</Box>
        <Box component="span" sx={{ color: 'text.primary' }}>
          {property.title}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Left column: Images and details */}
        <Grid item xs={12} md={8}>
          {/* Property title and basic info */}
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            {property.title}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, color: 'text.secondary' }}>
            <LocationIcon fontSize="small" />
            <Typography variant="body1" sx={{ ml: 0.5 }}>
              {formatAddress(property, locationNames)}
            </Typography>
          </Box>
          
          {/* Featured image - larger and more prominent */}
          <Box sx={{ position: 'relative', mb: 2, borderRadius: 2, overflow: 'hidden', boxShadow: 3 }}>
            {/* Debug info đã được loại bỏ */}
            <Box
              component="img"
              src={images[selectedImageIndex] || 'https://via.placeholder.com/1200x600?text=No+Image'}
              alt={property.title}
              sx={{
                width: '100%',
                height: 'auto',
                minHeight: 400,
                maxHeight: 600,
                objectFit: 'cover',
                cursor: 'pointer'
              }}
              onClick={() => handleImageClick(selectedImageIndex)}
              onError={(e) => {
                console.error('Image failed to load:', images[selectedImageIndex]);
                (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/1200x600?text=Image+Error';
              }}
            />
            
            {/* Image number indicator with slide indicator */}
            {images.length > 1 && (
              <Box sx={{ position: 'absolute', bottom: 16, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Chip
                  label={`${selectedImageIndex + 1} / ${images.length} hình ảnh`}
                  size="medium"
                  sx={{
                    bgcolor: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    mb: 1,
                    fontWeight: 'bold'
                  }}
                />
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {images.map((_, idx) => (
                    <Box 
                      key={idx} 
                      sx={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: '50%', 
                        bgcolor: idx === selectedImageIndex ? 'white' : 'rgba(255,255,255,0.5)',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleImageClick(idx)}
                    />
                  ))}
                </Box>
              </Box>
            )}
            
            {/* Left and right navigation arrows */}
            {images.length > 1 && (
              <>
                <IconButton
                  onClick={handlePrevImage}
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: 16,
                    transform: 'translateY(-50%)',
                    bgcolor: 'rgba(0, 0, 0, 0.5)',
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' }
                  }}
                >
                  <ArrowBackIcon />
                </IconButton>
                
                <IconButton
                  onClick={handleNextImage}
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    right: 16,
                    transform: 'translateY(-50%)',
                    bgcolor: 'rgba(0, 0, 0, 0.5)',
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' }
                  }}
                >
                  <ArrowForwardIcon />
                </IconButton>
              </>
            )}
          </Box>
          
          {/* Image thumbnails - smaller but more of them */}
          {images.length > 1 && (
            <Grid container spacing={1} sx={{ mb: 3 }}>
              {images.slice(0, 6).map((image, index) => (
                <Grid item xs={2} key={index}>
                  <Box
                    component="img"
                    src={image || 'https://via.placeholder.com/120x70?text=No+Image'}
                    alt={`Thumbnail ${index + 1}`}
                    sx={{
                      width: '100%',
                      height: 70,
                      objectFit: 'cover',
                      borderRadius: 1,
                      cursor: 'pointer',
                      opacity: index === selectedImageIndex ? 0.7 : 1,
                      border: index === selectedImageIndex ? '2px solid' : 'none',
                      borderColor: 'primary.main'
                    }}
                    onClick={() => handleImageClick(index)}
                    onError={(e) => {
                      console.error('Thumbnail failed to load:', image);
                      (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/120x70?text=Error';
                    }}
                  />
                </Grid>
              ))}
              {images.length > 6 && (
                <Grid item xs={2}>
                  <Box
                    sx={{
                      width: '100%',
                      height: 70,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: 'rgba(0, 0, 0, 0.1)',
                      borderRadius: 1,
                      cursor: 'pointer'
                    }}
                    onClick={() => setOpenGallery(true)}
                  >
                    <Typography variant="body2">+{images.length - 6} hình</Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          )}
          
          {/* Property details */}
          <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" fontWeight="bold">
                Thông tin chi tiết
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip 
                label={property.status === 'available' ? 'Đang mở bán' : 
                      property.status === 'pending' ? 'Đang chờ duyệt' : 
                      property.status === 'sold' ? 'Đã bán' : 
                      property.status === 'rented' ? 'Đã cho thuê' : 'Không xác định'}
                color={property.status === 'available' ? 'success' : 
                      property.status === 'pending' ? 'warning' : 
                      property.status === 'sold' || property.status === 'rented' ? 'error' : 'default'}
                size="medium"
              />
                <Tooltip title="Báo cáo tin đăng">
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={handleReportClick}
                  >
                    <ReportIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <HomeIcon sx={{ fontSize: 28, color: 'primary.main', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary" align="center">Loại hình</Typography>
                  <Typography variant="body1" fontWeight="medium" align="center">
                    {property.property_type === 'apartment' && 'Căn hộ chung cư'}
                    {property.property_type === 'house' && 'Nhà riêng'}
                    {property.property_type === 'villa' && 'Biệt thự'}
                    {property.property_type === 'land' && 'Đất nền'}
                    {property.property_type === 'office' && 'Văn phòng'}
                    {property.property_type === 'shop' && 'Mặt bằng kinh doanh'}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <Box sx={{ fontSize: 28, color: 'primary.main', mb: 1, fontWeight: 'bold' }}>m²</Box>
                  <Typography variant="body2" color="text.secondary" align="center">Diện tích</Typography>
                  <Typography variant="body1" fontWeight="medium" align="center">{formatArea(property.area)}</Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <HotelIcon sx={{ fontSize: 28, color: 'primary.main', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary" align="center">Phòng ngủ</Typography>
                  <Typography variant="body1" fontWeight="medium" align="center">{property.bedrooms || 'Không có'}</Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <BathtubIcon sx={{ fontSize: 28, color: 'primary.main', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary" align="center">Phòng tắm</Typography>
                  <Typography variant="body1" fontWeight="medium" align="center">{property.bathrooms || 'Không có'}</Typography>
                </Box>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" fontWeight="medium" gutterBottom>
              Mô tả
            </Typography>
            
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mb: 3 }}>
              {property.description}
            </Typography>
            
            {/* Amenities */}
            {property.amenities && property.amenities.split(',').length > 0 && (
              <>
                <Divider sx={{ my: 3 }} />
                
                <Typography variant="h6" fontWeight="medium" gutterBottom>
                  Tiện ích
                </Typography>
                
                <Grid container spacing={1} sx={{ mt: 1 }}>
                  {property.amenities.split(',').map((amenity: string, index: number) => (
                    <Grid item key={index}>
                      <Chip 
                        label={amenity.trim()}
                        variant="outlined"
                        sx={{ 
                          borderColor: 'primary.main',
                          '& .MuiChip-label': { px: 1.5 }
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </>
            )}
            
            {/* Legal information if available */}
            {property.legal_status && (
              <>
                <Divider sx={{ my: 3 }} />
                
                <Typography variant="h6" fontWeight="medium" gutterBottom>
                  Thông tin pháp lý
                </Typography>
                
                <Typography variant="body1">
                  {property.legal_status}
                </Typography>
              </>
            )}
            
            {/* Additional information */}
            <Divider sx={{ my: 3 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">Mã tin đăng</Typography>
                <Typography variant="body1" fontWeight="medium">BDS-{property.id}</Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Ngày đăng</Typography>
                <Typography variant="body1" fontWeight="medium">{formatDate(property.created_at)}</Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Ngày hết hạn</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography 
                        variant="body1" 
                        fontWeight="medium" 
                        color={
                          !property.expires_at ? 'text.secondary' :
                          new Date(property.expires_at) < new Date() ? 'error.main' : 
                          (new Date(property.expires_at).getTime() - new Date().getTime()) < (3 * 24 * 60 * 60 * 1000) ? 'warning.main' : 
                          'inherit'
                        }
                      >
                        {formatDate(property.expires_at)}
                      </Typography>
                      
                      {property.expires_at && new Date(property.expires_at) < new Date() && (
                        <Chip 
                          label="Đã hết hạn" 
                          size="small" 
                          color="error" 
                          sx={{ ml: 1, height: 20, fontSize: '0.7rem' }} 
                        />
                      )}
                      
                      {property.expires_at && 
                      new Date(property.expires_at) > new Date() && 
                      (new Date(property.expires_at).getTime() - new Date().getTime()) < (3 * 24 * 60 * 60 * 1000) && (
                        <Chip 
                          label="Sắp hết hạn" 
                          size="small" 
                          color="warning" 
                          sx={{ ml: 1, height: 20, fontSize: '0.7rem' }} 
                        />
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
              
              {property.updated_at && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Cập nhật</Typography>
                  <Typography variant="body1" fontWeight="medium">{formatDate(property.updated_at)}</Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
          
          {/* Property Map Location - add this section */}
          <Paper sx={{ p: 3, mt: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <MapIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" component="h2" fontWeight="bold">
                Vị trí bất động sản
              </Typography>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            {property.latitude && property.longitude ? (
              <>
                <Box 
                  sx={{ 
                    height: showMap ? 400 : 200,
                    transition: 'height 0.3s ease',
                    overflow: 'hidden',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <MapPicker
                    position={{
                      lat: Number(property.latitude), 
                      lng: Number(property.longitude)
                    }}
                    onPositionChange={() => {}} // No-op since it's read-only
                    readOnly={true}
                  />
                </Box>
                
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                  <Button 
                    variant="outlined" 
                    onClick={() => setShowMap(!showMap)}
                    startIcon={<MapIcon />}
                  >
                    {showMap ? 'Thu nhỏ bản đồ' : 'Xem bản đồ lớn hơn'}
                  </Button>
                </Box>
              </>
            ) : (
              <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                Không có thông tin vị trí cho bất động sản này
              </Typography>
            )}
            
            <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
              <LocationIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
              Địa chỉ: {formatAddress(property, locationNames)}
            </Typography>
          </Paper>
          
          {/* Similar properties section */}
          <Paper elevation={1} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Bất động sản tương tự {property.district_name && property.city_name && `tại ${property.district_name}, ${property.city_name}`}
            </Typography>
            
            {loadingSimilar ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : similarProperties.length > 0 ? (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {similarProperties.map((property) => (
                  <Grid item xs={12} sm={6} key={property.id}>
                    <PropertyCard property={property} />
                  </Grid>
                ))}
              </Grid>
            ) : (
            <Typography variant="body2" color="text.secondary">
                Không tìm thấy bất động sản tương tự tại {property.district_name || 'quận/huyện'} {property.city_name ? `, ${property.city_name}` : ''}.
            </Typography>
            )}
          </Paper>
        </Grid>
        
        {/* Right column: Price, contact, and sidebar info */}
        <Grid item xs={12} md={4}>
          {/* Price card */}
          <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography variant="h4" color="primary" fontWeight="bold" gutterBottom>
              {formatCurrency(property.price)}
              {property.listing_type === 'rent' && '/tháng'}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <HomeIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body1">
                {formatArea(property.area)} · {property.bedrooms || 0} PN · {property.bathrooms || 0} PT
              </Typography>
            </Box>
          </Paper>
          
          {/* Contact info - styled more like example image */}
          <Paper elevation={3} sx={{ p: 0, mb: 3, borderRadius: 2, overflow: 'hidden' }}>
            {/* Contact info with avatar and name */}
            <Box sx={{ p: 3 }}>
              {/* User info với avatar lấy từ dữ liệu thật */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                <Box 
                  component={Link} 
                  to={`/nguoi-dung/${property.owner_id}`} 
                  sx={{ 
                    textDecoration: 'none', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <Avatar 
                    src={(ownerData?.avatar_url || property.owner?.avatar_url)}
                    alt={(ownerData?.full_name || property.owner?.full_name || property.owner?.name || "Người dùng")}
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      bgcolor: '#1976d2',
                      border: '2px solid #f0f0f0',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      mb: 1,
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
                      }
                    }}
                  >
                    {(ownerData?.full_name || property.owner?.full_name || property.owner?.name) ? 
                      (ownerData?.full_name || property.owner?.full_name || property.owner?.name).charAt(0).toUpperCase() : "U"}
                  </Avatar>
                  
                  {/* Add user's full name */}
                  <Typography 
                    variant="h6" 
                    align="center" 
                    gutterBottom
                    sx={{
                      color: 'text.primary',
                      '&:hover': {
                        color: 'primary.main'
                      }
                    }}
                  >
                    {ownerData?.full_name || property.owner?.full_name || property.owner?.name || "Người dùng"}
                  </Typography>
                </Box>
              </Box>

              {/* Chat Zalo button */}
              <Button
                fullWidth
                variant="outlined"
                sx={{ 
                  py: 1.8,
                  borderRadius: 2,
                  fontWeight: 'medium',
                  textTransform: 'none',
                  mb: 2,
                  color: '#0068ff',
                  borderColor: '#0068ff',
                  '&:hover': {
                    borderColor: '#0051cc',
                    bgcolor: 'rgba(0,104,255,0.04)'
                  }
                }}
                startIcon={
                  <Box
                    component="img"
                    src="/img/icons/zalo-icon.png"
                    alt="Zalo"
                    sx={{ width: 24, height: 24 }}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://stc-zaloprofile.zdn.vn/pc/v1/images/zalo_logo.svg';
                    }}
                  />
                }
                onClick={() => openZaloChat(ownerData?.phone || property.owner?.phone || property.contact_info)}
              >
                Chat qua Zalo
              </Button>

              {/* Phone number */}
              <Button
                fullWidth
                variant="contained"
                color="primary"
                startIcon={<PhoneIcon />}
                sx={{ 
                  py: 1.8, 
                  fontSize: '1.125rem', 
                  fontWeight: 'bold',
                  borderRadius: 2,
                  bgcolor: '#154875',
                  '&:hover': {
                    bgcolor: '#0d325c'
                  }
                }}
                onClick={() => {
                  if (showFullPhone) {
                    // Nếu đã hiển thị đầy đủ, copy số điện thoại
                    copyToClipboard(ownerData?.phone || property.owner?.phone || property.contact_info);
                  } else {
                    // Nếu chưa hiển thị đầy đủ, hiện số đầy đủ
                    setShowFullPhone(true);
                  }
                }}
              >
                {displayPhoneNumber(ownerData?.phone || property.owner?.phone || property.contact_info)}
              </Button>
            </Box>
            
            {/* Add report button at the bottom */}
            <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
              <Button
                startIcon={<ReportIcon />}
                color="error"
                size="small"
                onClick={handleReportClick}
              >
                Báo cáo tin đăng này
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Copied notification */}
      <Snackbar
        open={copySuccess}
        autoHideDuration={2000}
        message="Đã sao chép số điện thoại"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
      
      {/* Image gallery dialog */}
      <Dialog
        open={openGallery}
        onClose={() => setOpenGallery(false)}
        maxWidth="lg"
        fullScreen={isMobile}
      >
        <Box sx={{ position: 'relative' }}>
          <IconButton
            onClick={() => setOpenGallery(false)}
            sx={{ position: 'absolute', top: 8, right: 8, color: 'white', zIndex: 1 }}
          >
            <CloseIcon />
          </IconButton>
          
          <DialogContent sx={{ p: 0, position: 'relative' }}>
            <Box
              component="img"
              src={images[selectedImageIndex] || 'https://via.placeholder.com/800x500?text=No+Image'}
              alt={`Image ${selectedImageIndex + 1}`}
              sx={{
                width: '100%',
                height: 'auto',
                maxHeight: '80vh',
                objectFit: 'contain'
              }}
              onError={(e) => {
                console.error('Lightbox image failed to load:', images[selectedImageIndex]);
                (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/800x500?text=Image+Error';
              }}
            />
            
            {/* Navigation arrows */}
            {images.length > 1 && (
              <>
                <IconButton
                  onClick={handlePrevImage}
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: 16,
                    transform: 'translateY(-50%)',
                    bgcolor: 'rgba(0, 0, 0, 0.5)',
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' }
                  }}
                >
                  <ArrowBackIcon />
                </IconButton>
                
                <IconButton
                  onClick={handleNextImage}
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    right: 16,
                    transform: 'translateY(-50%)',
                    bgcolor: 'rgba(0, 0, 0, 0.5)',
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' }
                  }}
                >
                  <ArrowForwardIcon />
                </IconButton>
                
                {/* Image counter */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 16,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    bgcolor: 'rgba(0, 0, 0, 0.5)',
                    color: 'white',
                    px: 2,
                    py: 0.5,
                    borderRadius: 1
                  }}
                >
                  {selectedImageIndex + 1} / {images.length}
                </Box>
              </>
            )}
          </DialogContent>
        </Box>
      </Dialog>
      
      {/* Report property dialog */}
      <ReportPropertyDialog
        open={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        propertyId={Number(id)}
        propertyTitle={property.title}
      />
    </Container>
  );
};

export default PropertyDetailPage; 