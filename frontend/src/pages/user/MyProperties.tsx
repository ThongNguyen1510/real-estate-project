import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Chip,
  CircularProgress,
  Pagination,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Tooltip,
  Skeleton,
  useTheme,
  useMediaQuery,
  Tab,
  Tabs
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  ErrorOutline as ErrorOutlineIcon,
  Home as HomeIcon,
  Add as AddIcon,
  Share as ShareIcon,
  Flag as FlagIcon
} from '@mui/icons-material';
import { userService } from '../../services/api';
import propertyService from '../../services/api/propertyService';
import { getLocationNames } from '../../services/api/locationService';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate, formatPrice } from '../../utils/format';

// Type definition for property
interface Property {
  id: number;
  title: string;
  description: string;
  price: number;
  area: number;
  property_type: string;
  property_type_display: string;
  bedrooms: number;
  bathrooms: number;
  status: string;
  status_display: string;
  created_at: string;
  expiration_date?: string;
  address: string;
  city: string;
  city_name?: string;
  district: string;
  district_name?: string;
  ward?: string;
  ward_name?: string;
  images: string[];
  image_url?: string;
}

// Tab interface for statuses
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`property-tabpanel-${index}`}
      aria-labelledby={`property-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const MyProperties = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Tab state
  const [tabValue, setTabValue] = useState<number>(0);
  
  // State for properties
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [limit] = useState<number>(10);
  
  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [propertyToDelete, setPropertyToDelete] = useState<number | null>(null);
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Filter properties based on tab
  useEffect(() => {
    if (properties.length > 0) {
      if (tabValue === 0) {
        // All listings
        setFilteredProperties(properties);
      } else if (tabValue === 1) {
        // Active listings (available)
        setFilteredProperties(properties.filter(p => p.status === 'available'));
      } else if (tabValue === 2) {
        // Pending listings
        setFilteredProperties(properties.filter(p => p.status === 'pending'));
      } else if (tabValue === 3) {
        // Expired/maintenance listings
        setFilteredProperties(properties.filter(p => ['expired', 'maintenance'].includes(p.status)));
      }
    }
  }, [tabValue, properties]);
  
  // Enrich properties with location names
  const enrichPropertiesWithLocationNames = async (propertiesList: Property[]) => {
    if (!propertiesList || propertiesList.length === 0) return propertiesList;
    
    // Process all properties to add location names if missing
    return await Promise.all(propertiesList.map(async (property) => {
      // Skip processing if we already have location names
      if (property.city_name && property.district_name) {
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
  
  // Fetch user properties
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/user/my-properties' } });
      return;
    }
    
    fetchProperties();
  }, [isAuthenticated, page, limit]);
  
  const fetchProperties = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await userService.getUserProperties({ page, limit });
      
      if (response.success) {
        // Enrich properties with location names
        const propertiesData = response.data.properties || [];
        const enrichedProperties = await enrichPropertiesWithLocationNames(propertiesData);
        
        setProperties(enrichedProperties);
        setFilteredProperties(enrichedProperties);
        setTotalPages(response.data.pagination.totalPages);
      } else {
        setError(response.message || 'Không thể tải danh sách bất động sản');
      }
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle page change
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };
  
  // Open delete dialog
  const handleDeleteClick = (propertyId: number) => {
    setPropertyToDelete(propertyId);
    setDeleteDialogOpen(true);
  };
  
  // Close delete dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setPropertyToDelete(null);
  };
  
  // Confirm delete
  const handleConfirmDelete = async () => {
    if (propertyToDelete === null) return;
    
    try {
      const response = await propertyService.deleteProperty(propertyToDelete.toString());
      
      if (response.success) {
        // Refresh properties list
        fetchProperties();
        // Close dialog
        handleCloseDeleteDialog();
      } else {
        setError(response.message || 'Không thể xóa bất động sản');
      }
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi khi xóa bất động sản');
    }
  };
  
  // Get status color
  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      'available': 'success',
      'pending': 'warning',
      'sold': 'error',
      'rented': 'error',
      'expired': 'default',
      'maintenance': 'info'
    };
    
    return statusColors[status] || 'default';
  };
  
  // Property skeleton loading
  const PropertySkeleton = () => (
    <TableRow>
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Skeleton variant="rectangular" width={60} height={60} sx={{ mr: 2 }} />
          <Box>
            <Skeleton variant="text" width={150} />
            <Skeleton variant="text" width={100} />
          </Box>
        </Box>
      </TableCell>
      <TableCell>
        <Skeleton variant="text" width={150} />
        <Skeleton variant="text" width={120} />
      </TableCell>
      <TableCell align="center">
        <Skeleton variant="text" width={80} />
      </TableCell>
      <TableCell align="center">
        <Skeleton variant="rounded" width={70} height={24} />
      </TableCell>
      <TableCell align="center">
        <Skeleton variant="text" width={80} />
      </TableCell>
      <TableCell align="center">
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Skeleton variant="circular" width={30} height={30} sx={{ mx: 0.5 }} />
          <Skeleton variant="circular" width={30} height={30} sx={{ mx: 0.5 }} />
          <Skeleton variant="circular" width={30} height={30} sx={{ mx: 0.5 }} />
        </Box>
      </TableCell>
    </TableRow>
  );
  
  // Format location display
  const formatLocation = (property: Property) => {
    const city = property.city_name || property.city || '';
    const district = property.district_name || property.district || '';
    const address = property.address || '';
    
    if (address && district && city) {
      return `${address}, ${district}, ${city}`;
    } else if (address && district) {
      return `${address}, ${district}`;
    } else if (address && city) {
      return `${address}, ${city}`;
    } else if (district && city) {
      return `${district}, ${city}`;
    } else if (address) {
      return address;
    } else if (district) {
      return district;
    } else if (city) {
      return city;
    }
    
    return 'Không có địa chỉ';
  };
  
  // Add a renewal function
  const handleRenewListing = async (propertyId: number) => {
    try {
      setLoading(true);
      const response = await propertyService.renewProperty(propertyId.toString());
      
      if (response.success) {
        fetchProperties();
        setError(null);
      } else {
        setError(response.message || 'Không thể gia hạn tin đăng');
      }
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi khi gia hạn tin đăng');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: isMobile ? 2 : 0 }}>
          Quản lý tin đăng
        </Typography>
        
        <Button
          component={Link}
          to="/dang-tin"
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          size={isMobile ? "medium" : "large"}
        >
          Đăng tin mới
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant={isMobile ? "scrollable" : "fullWidth"}
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Tất cả" />
          <Tab label="Đang hiển thị" />
          <Tab label="Đang chờ duyệt" />
          <Tab label="Hết hạn" />
        </Tabs>
      </Paper>
      
      <TabPanel value={tabValue} index={0}>
        {renderPropertyList()}
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        {renderPropertyList()}
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        {renderPropertyList()}
      </TabPanel>
      
      <TabPanel value={tabValue} index={3}>
        {renderPropertyList()}
      </TabPanel>
      
      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>
          Xác nhận xóa tin đăng
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa tin đăng này? Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>
            Hủy
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" autoFocus>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
  
  // Helper function to render property list
  function renderPropertyList() {
    // If loading and no properties yet
    if (loading && properties.length === 0) {
      return (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tin đăng</TableCell>
                <TableCell>Địa chỉ</TableCell>
                <TableCell align="center">Giá</TableCell>
                <TableCell align="center">Trạng thái</TableCell>
                <TableCell align="center">Ngày đăng</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[...Array(5)].map((_, index) => (
                <PropertySkeleton key={index} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    }
    
    // If no properties for the current tab
    if (filteredProperties.length === 0) {
      return (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <ErrorOutlineIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {tabValue === 0 ? 'Bạn chưa có tin đăng nào' : 'Không có tin đăng nào trong mục này'}
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {tabValue === 0 ? 'Hãy đăng tin ngay để hiển thị bất động sản của bạn' : 'Hãy đăng tin mới hoặc xem các mục khác'}
          </Typography>
          <Button
            component={Link}
            to="/dang-tin"
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            sx={{ mt: 2 }}
          >
            Đăng tin ngay
          </Button>
        </Paper>
      );
    }
    
    // Show the property list
    return (
      <>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tin đăng</TableCell>
                <TableCell>Địa chỉ</TableCell>
                <TableCell align="center">Giá</TableCell>
                <TableCell align="center">Trạng thái</TableCell>
                {/* Add expiration date column when viewing the Expired tab */}
                {tabValue === 3 && (
                  <TableCell align="center">Ngày hết hạn</TableCell>
                )}
                <TableCell align="center">Ngày đăng</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProperties.map((property) => (
                <TableRow key={property.id} sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                  },
                  // Add light red background for expired listings
                  ...(property.status === 'expired' && {
                    backgroundColor: 'rgba(244, 67, 54, 0.05)'
                  })
                }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        component="img"
                        src={property.images && property.images.length > 0 
                          ? property.images[0] 
                          : property.image_url || '/img/placeholder.jpg'}
                        alt={property.title}
                        sx={{ 
                          width: 60, 
                          height: 60, 
                          objectFit: 'cover', 
                          borderRadius: 1, 
                          mr: 2,
                          border: '1px solid',
                          borderColor: 'divider'
                        }}
                        onError={(e) => {
                          // Fallback to default image if property image fails to load
                          e.currentTarget.src = '/img/placeholder.jpg';
                        }}
                      />
                      <Box>
                        <Typography variant="body1" noWrap sx={{ maxWidth: 200, fontWeight: 'medium' }}>
                          {property.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {property.property_type_display} • {property.area} m²
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {formatLocation(property)}
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body1" color="primary" fontWeight="bold">
                      {formatPrice(property.price)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={property.status_display} 
                      size="small" 
                      color={getStatusColor(property.status) as any}
                    />
                  </TableCell>
                  {/* Add expiration date column when viewing the Expired tab */}
                  {tabValue === 3 && (
                    <TableCell align="center">
                      {property.expiration_date ? formatDate(property.expiration_date) : 'Không xác định'}
                    </TableCell>
                  )}
                  <TableCell align="center">
                    {formatDate(property.created_at)}
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Tooltip title="Xem tin đăng">
                        <IconButton 
                          size="small" 
                          component={Link} 
                          to={`/bat-dong-san/${property.id}`}
                          sx={{ mx: 0.5 }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Chỉnh sửa tin đăng">
                        <IconButton 
                          size="small" 
                          component={Link} 
                          to={`/dang-tin?edit=${property.id}`}
                          sx={{ mx: 0.5 }}
                          color="primary"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      {/* Add renew button for expired listings */}
                      {property.status === 'expired' && (
                        <Tooltip title="Gia hạn tin đăng">
                          <IconButton 
                            size="small" 
                            color="success"
                            sx={{ mx: 0.5 }}
                            onClick={() => handleRenewListing(property.id)}
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      <Tooltip title="Xóa tin đăng">
                        <IconButton 
                          size="small" 
                          color="error"
                          sx={{ mx: 0.5 }}
                          onClick={() => handleDeleteClick(property.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination 
              count={totalPages} 
              page={page} 
              onChange={handlePageChange} 
              color="primary" 
              size={isMobile ? "small" : "medium"}
            />
          </Box>
        )}
      </>
    );
  }
};

export default MyProperties; 