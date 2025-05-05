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
  ContentCopy as ContentCopyIcon
} from '@mui/icons-material';
import { propertyService, favoritesService, userService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

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

const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { isAuthenticated } = useAuth();
  
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
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [favLoading, setFavLoading] = useState<boolean>(false);
  
  // Add state for copy notification
  const [copySuccess, setCopySuccess] = useState(false);
  
  // Fetch property data
  useEffect(() => {
    const fetchPropertyData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (!id) throw new Error('Không tìm thấy mã bất động sản');
        
        const response = await propertyService.getProperty(id);
        
        if (response.success) {
          console.log('API response:', response.data);
          setProperty(response.data.property);
          
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
              await userService.addRecentlyViewed(response.data.property.id);
            } catch (error) {
              console.error('Error recording view:', error);
            }
          }
          
          // Check if property is in favorites
          if (isAuthenticated) {
            try {
              const favoritesResponse = await favoritesService.getFavorites();
              if (favoritesResponse.success) {
                const favorite = favoritesResponse.data.find(
                  (fav: any) => fav.property_id === response.data.property.id
                );
                if (favorite) {
                  setIsFavorite(true);
                  setFavoriteId(favorite.id);
                }
              }
            } catch (error) {
              console.error('Error checking favorites:', error);
            }
          }
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
  }, [id, isAuthenticated]);
  
  // Handle favorite toggle
  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      // Redirect to login
      window.location.href = '/login';
      return;
    }
    
    setFavLoading(true);
    
    try {
      if (isFavorite && favoriteId) {
        // Remove from favorites
        const response = await favoritesService.removeFavorite(favoriteId);
        if (response.success) {
          setIsFavorite(false);
          setFavoriteId(null);
        }
      } else {
        // Add to favorites
        const response = await favoritesService.addFavorite(id || '');
        if (response.success) {
          setIsFavorite(true);
          setFavoriteId(response.data.id);
        }
      }
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
  
  // If loading
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // If error
  if (error || !property) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
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
              {property.address}, {property.district}, {property.city}
            </Typography>
          </Box>
          
          {/* Featured image - larger and more prominent */}
          <Box sx={{ position: 'relative', mb: 2, borderRadius: 2, overflow: 'hidden', boxShadow: 3 }}>
            {/* Debug info đã được loại bỏ */}
            <Box
              component="img"
              src={images[0] || 'https://via.placeholder.com/1200x600?text=No+Image'}
              alt={property.title}
              sx={{
                width: '100%',
                height: 'auto',
                minHeight: 400,
                maxHeight: 600,
                objectFit: 'cover',
                cursor: 'pointer'
              }}
              onClick={() => handleImageClick(0)}
              onError={(e) => {
                console.error('Image failed to load:', images[0]);
                e.currentTarget.src = 'https://via.placeholder.com/1200x600?text=Image+Error';
              }}
            />
            
            {/* Image number indicator with slide indicator */}
            {images.length > 1 && (
              <Box sx={{ position: 'absolute', bottom: 16, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Chip
                  label={`1 / ${images.length} hình ảnh`}
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
                      e.currentTarget.src = 'https://via.placeholder.com/120x70?text=Error';
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
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Mã tin đăng</Typography>
                <Typography variant="body1" fontWeight="medium">BDS-{property.id}</Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Ngày đăng</Typography>
                <Typography variant="body1" fontWeight="medium">{formatDate(property.created_at)}</Typography>
              </Grid>
              
              {property.updated_at && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Cập nhật</Typography>
                  <Typography variant="body1" fontWeight="medium">{formatDate(property.updated_at)}</Typography>
                </Grid>
              )}
            </Grid>
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
            {/* Header with professional title */}
            <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 1.5, px: 3 }}>
              <Typography variant="subtitle1" fontWeight="medium">
                Môi giới chuyên nghiệp
              </Typography>
            </Box>

            {/* Contact buttons section */}
            <Box sx={{ p: 3 }}>
              {/* Phone number with copy function */}
              {(property.contact_info || (property.owner && property.owner.phone)) && (
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  startIcon={<PhoneIcon />}
                  endIcon={<ContentCopyIcon fontSize="small" />}
                  sx={{ 
                    mb: 2, 
                    py: 1.8, 
                    fontSize: '1.125rem', 
                    fontWeight: 'bold',
                    borderRadius: 2
                  }}
                  onClick={() => copyToClipboard(property.contact_info || property.owner?.phone || "")}
                >
                  {property.contact_info || property.owner?.phone || "0978 585 140"} • Sao chép
                </Button>
              )}
              
              {/* Chat Zalo button - like in the example */}
              <Button
                fullWidth
                variant="outlined"
                sx={{ 
                  py: 1.8,
                  borderRadius: 2,
                  fontWeight: 'medium',
                  textTransform: 'none'
                }}
                color="primary"
                startIcon={
                  <Box
                    component="img"
                    src="/img/zalo-icon.png"
                    alt="Zalo"
                    sx={{ width: 24, height: 24 }}
                  />
                }
              >
                Chat qua Zalo
              </Button>
            </Box>
          </Paper>
          
          {/* Location info */}
          <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight="medium" gutterBottom>
              Vị trí
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', color: 'text.secondary', mb: 1 }}>
                <LocationIcon fontSize="small" sx={{ mt: 0.3, mr: 1, color: 'primary.main' }} />
                <Typography variant="body1">
                  {property.address}
                </Typography>
              </Box>
              
              <Typography variant="body2" sx={{ pl: 3.5 }}>
                {property.ward && `${property.ward}, `}{property.district && `${property.district}, `}{property.city}
              </Typography>
            </Box>
            
            {/* Map preview placeholder */}
            <Box
              sx={{
                mt: 2,
                height: 200,
                bgcolor: 'action.hover',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 1,
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              {property.latitude && property.longitude ? (
                <Box
                  component="img"
                  src={`https://maps.googleapis.com/maps/api/staticmap?center=${property.latitude},${property.longitude}&zoom=15&size=400x200&markers=color:red%7C${property.latitude},${property.longitude}&key=YOUR_API_KEY`}
                  alt="Location Map"
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Bản đồ chưa sẵn sàng
                </Typography>
              )}
            </Box>
          </Paper>
          
          {/* Similar properties placeholder */}
          <Paper elevation={1} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Bất động sản tương tự
            </Typography>
            
            <Typography variant="body2" color="text.secondary">
              Đang tải...
            </Typography>
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
                e.currentTarget.src = 'https://via.placeholder.com/800x500?text=Image+Error';
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
    </Container>
  );
};

export default PropertyDetailPage; 