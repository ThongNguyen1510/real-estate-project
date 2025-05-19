import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Tooltip,
  LinearProgress,
  Card,
  CardContent,
  Grid,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  DoDisturb as DoDisturbIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminService } from '../../services/adminApi';
import { Link } from 'react-router-dom';

// Định nghĩa kiểu dữ liệu Property
interface Property {
  id: number;
  title: string;
  price: number;
  area: number;
  property_type: string;
  listing_type: string;
  status: string;
  owner_name: string;
  owner_email: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  created_at: string;
}

// React component
const PropertiesPage: React.FC = () => {
  // State definitions
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [totalProperties, setTotalProperties] = useState(0);
  const [availableProperties, setAvailableProperties] = useState(0);
  const [pendingProperties, setPendingProperties] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [newStatus, setNewStatus] = useState('');
  
  // Fetch properties from API
  const fetchProperties = async () => {
    setLoading(true);
    setError(null);
    try {
      // Call the admin API service
      const response = await adminService.getProperties();
      
      if (response && response.success) {
        const propertyData = response.data.properties || [];
        setProperties(propertyData);
        setFilteredProperties(propertyData);
        
        // Calculate statistics
        setTotalProperties(propertyData.length);
        setAvailableProperties(propertyData.filter((property: Property) => property.status === 'available').length);
        setPendingProperties(propertyData.filter((property: Property) => property.status === 'pending').length);
      } else {
        // If API call was successful but contains an error message
        setError(response?.message || 'Không thể tải danh sách bất động sản');
        // Use mock data as fallback
        useMockData();
      }
    } catch (error) {
      console.error('Failed to fetch properties:', error);
      setError('Lỗi kết nối tới máy chủ. Sử dụng dữ liệu mẫu tạm thời.');
      // Fall back to mock data
      useMockData();
    } finally {
      setLoading(false);
    }
  };
  
  // Use mock data as fallback
  const useMockData = () => {
    const propertyTypes = ['apartment', 'house', 'villa', 'land', 'office'];
    const listingTypes = ['sale', 'rent'];
    const statuses = ['available', 'pending', 'sold', 'rented', 'maintenance'];
    
    // Extract the current city filter from URL if available
    const urlParams = new URLSearchParams(window.location.search);
    const cityParam = urlParams.get('city') || '';
    const cityNameParam = urlParams.get('city_name') || '';
    
    // Default cities with IDs
    const cities = [
      { id: '79', name: 'Hồ Chí Minh' },
      { id: '01', name: 'Hà Nội' },
      { id: '48', name: 'Đà Nẵng' },
      { id: '92', name: 'Cần Thơ' },
      { id: '75', name: 'Đồng Nai' }
    ];
    
    // Find the city from the URL or default to first city
    let selectedCity = cities.find(city => city.id === cityParam || city.name === cityNameParam);
    if (!selectedCity) {
      selectedCity = cities[0]; // Default to HCM
    }
    
    const districts = ['Quận 1', 'Quận 2', 'Quận 3', 'Hai Bà Trưng', 'Cầu Giấy', 'Hải Châu'];
    
    const mockProperties: Property[] = Array.from({ length: 50 }, (_, index) => {
      const propertyType = propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
      const listingType = listingTypes[Math.floor(Math.random() * listingTypes.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const district = districts[Math.floor(Math.random() * districts.length)];
      
      // Ensure we always have a valid city even if selectedCity is somehow undefined
      const cityId = selectedCity?.id || '79'; // Default to HCM ID
      const cityName = selectedCity?.name || 'Hồ Chí Minh'; // Default to HCM name
      
      return {
        id: index + 1,
        title: `${propertyType === 'apartment' ? 'Căn hộ' : propertyType === 'house' ? 'Nhà' : propertyType === 'villa' ? 'Biệt thự' : propertyType === 'land' ? 'Đất' : 'Văn phòng'} ${index + 1}`,
        price: Math.floor(Math.random() * 10000) * 1000000 + 1000000000,
        area: Math.floor(Math.random() * 150) + 50,
        property_type: propertyType,
        listing_type: listingType,
        status: status,
        owner_name: `Chủ nhà ${index + 1}`,
        owner_email: `owner${index + 1}@example.com`,
        address: `Số ${index + 1}, Đường ABC`,
        city: cityId,
        city_name: cityName,
        district: district,
        district_name: district,
        ward: 'Phường XYZ',
        created_at: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString()
      };
    });
    
    setProperties(mockProperties);
    setFilteredProperties(mockProperties);
    
    // Calculate statistics
    setTotalProperties(mockProperties.length);
    setAvailableProperties(mockProperties.filter((property: Property) => property.status === 'available').length);
    setPendingProperties(mockProperties.filter((property: Property) => property.status === 'pending').length);
  };
  
  // Initialize component
  useEffect(() => {
    fetchProperties();
  }, []);
  
  // Filter properties when search query or filters change
  useEffect(() => {
    const filtered = properties.filter((property: Property) => {
      const matchesSearch = 
        searchQuery === '' ||
        property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.owner_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.district.toLowerCase().includes(searchQuery.toLowerCase());
        
      const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
      const matchesType = typeFilter === 'all' || property.property_type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
    
    setFilteredProperties(filtered);
    setPage(0); // Reset to first page when filters change
  }, [searchQuery, statusFilter, typeFilter, properties]);
  
  // Handle page change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };
  
  // Handle status filter change
  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value);
  };
  
  // Handle type filter change
  const handleTypeFilterChange = (event: SelectChangeEvent) => {
    setTypeFilter(event.target.value);
  };
  
  // Handle opening status change dialog
  const handleOpenStatusDialog = (property: Property) => {
    setSelectedProperty(property);
    setNewStatus(property.status);
    setOpenStatusDialog(true);
  };
  
  // Handle closing status change dialog
  const handleCloseStatusDialog = () => {
    setOpenStatusDialog(false);
  };
  
  // Handle opening delete dialog
  const handleOpenDeleteDialog = (property: Property) => {
    setSelectedProperty(property);
    setOpenDeleteDialog(true);
  };
  
  // Handle closing delete dialog
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };
  
  // Update property status
  const handleUpdateStatus = async () => {
    if (!selectedProperty) return;
    
    setLoading(true);
    try {
      // Call the admin API service
      const response = await adminService.updatePropertyStatus(selectedProperty.id, newStatus);
      
      if (response && response.success) {
        const updatedProperties = properties.map((property: Property) => 
          property.id === selectedProperty.id ? { ...property, status: newStatus } : property
        );
        setProperties(updatedProperties);
        
        // Recalculate statistics
        setAvailableProperties(updatedProperties.filter((property: Property) => property.status === 'available').length);
        setPendingProperties(updatedProperties.filter((property: Property) => property.status === 'pending').length);
        
        handleCloseStatusDialog();
      } else {
        // If API call was successful but contains an error message
        setError(response?.message || 'Không thể cập nhật trạng thái bất động sản');
      }
    } catch (error) {
      console.error('Failed to update property status:', error);
      setError('Lỗi kết nối tới máy chủ. Vui lòng thử lại sau');
    } finally {
      setLoading(false);
    }
  };
  
  // Delete property
  const handleDeleteProperty = async () => {
    if (!selectedProperty) return;
    
    setLoading(true);
    try {
      // Call the admin API service
      const response = await adminService.deleteProperty(selectedProperty.id);
      
      if (response && response.success) {
        const updatedProperties = properties.filter(property => property.id !== selectedProperty.id);
        setProperties(updatedProperties);
        
        // Recalculate statistics
        setTotalProperties(updatedProperties.length);
        setAvailableProperties(updatedProperties.filter((property: Property) => property.status === 'available').length);
        setPendingProperties(updatedProperties.filter((property: Property) => property.status === 'pending').length);
        
        handleCloseDeleteDialog();
        
        // Hiển thị thông báo thành công
        setError(null);
        alert(`Đã xóa bất động sản ${selectedProperty.title} thành công`);
      } else {
        // If API call was successful but contains an error message
        setError(response?.message || 'Không thể xóa bất động sản. Vui lòng thử lại sau.');
        handleCloseDeleteDialog();
      }
    } catch (error: any) {
      console.error('Failed to delete property:', error);
      setError('Lỗi kết nối tới máy chủ. Vui lòng thử lại sau');
      handleCloseDeleteDialog();
    } finally {
      setLoading(false);
    }
  };
  
  // Get status chip color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'success';
      case 'pending':
        return 'warning';
      case 'maintenance':
        return 'secondary';
      case 'rented':
      case 'sold':
        return 'info';
      default:
        return 'default';
    }
  };
  
  // Get property type display name
  const getPropertyTypeDisplay = (type: string) => {
    switch (type) {
      case 'apartment':
        return 'Căn hộ';
      case 'house':
        return 'Nhà ở';
      case 'villa':
        return 'Biệt thự';
      case 'land':
        return 'Đất';
      case 'office':
        return 'Văn phòng';
      default:
        return type;
    }
  };
  
  // Get listing type display name
  const getListingTypeDisplay = (type: string) => {
    switch (type) {
      case 'sale':
        return 'Bán';
      case 'rent':
        return 'Cho thuê';
      default:
        return type;
    }
  };
  
  // Get status display name
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'available':
        return 'Đang hiển thị';
      case 'pending':
        return 'Chờ duyệt';
      case 'maintenance':
        return 'Bảo trì';
      case 'sold':
        return 'Đã bán';
      case 'rented':
        return 'Đã cho thuê';
      default:
        return status;
    }
  };
  
  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(price);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <AdminLayout title="Quản lý bất động sản">
      <Box sx={{ position: 'relative', mb: 4, pl: 0 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Quản lý bất động sản
        </Typography>
      </Box>
      
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3, ml: -1 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ boxShadow: 3, borderLeft: 5, borderColor: 'primary.main' }}>
            <CardContent>
              <Typography variant="h5" component="div">
                {totalProperties}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tổng số bất động sản
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ boxShadow: 3, borderLeft: 5, borderColor: 'success.main' }}>
            <CardContent>
              <Typography variant="h5" component="div">
                {availableProperties}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Đang hiển thị
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ boxShadow: 3, borderLeft: 5, borderColor: 'warning.main' }}>
            <CardContent>
              <Typography variant="h5" component="div">
                {pendingProperties}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Chờ duyệt
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Filters and Search */}
      <Paper sx={{ p: 1.5, mb: 2, boxShadow: 3 }}>
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              variant="outlined"
              size="small"
              fullWidth
              placeholder="Tìm kiếm bất động sản..."
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="status-filter-label">Trạng thái</InputLabel>
              <Select
                labelId="status-filter-label"
                id="status-filter"
                value={statusFilter}
                label="Trạng thái"
                onChange={handleStatusFilterChange}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="available">Đang hiển thị</MenuItem>
                <MenuItem value="pending">Chờ duyệt</MenuItem>
                <MenuItem value="maintenance">Bảo trì</MenuItem>
                <MenuItem value="sold">Đã bán</MenuItem>
                <MenuItem value="rented">Đã cho thuê</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="type-filter-label">Loại BĐS</InputLabel>
              <Select
                labelId="type-filter-label"
                id="type-filter"
                value={typeFilter}
                label="Loại BĐS"
                onChange={handleTypeFilterChange}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="apartment">Căn hộ</MenuItem>
                <MenuItem value="house">Nhà ở</MenuItem>
                <MenuItem value="villa">Biệt thự</MenuItem>
                <MenuItem value="land">Đất</MenuItem>
                <MenuItem value="office">Văn phòng</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2}>
            <Button 
              variant="outlined" 
              color="secondary" 
              startIcon={<RefreshIcon />}
              onClick={fetchProperties}
              fullWidth
              size="small"
            >
              Làm mới
            </Button>
          </Grid>
          <Grid item xs={6} md={2}>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              fullWidth
              href="/admin/properties/create"
              size="small"
            >
              Thêm mới
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Properties Table */}
      <Paper sx={{ boxShadow: 3 }}>
        {loading && <LinearProgress />}
        <TableContainer>
          <Table size="small" sx={{ minWidth: 700 }} aria-label="properties table">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">ID</TableCell>
                <TableCell>Tiêu đề</TableCell>
                <TableCell>Giá</TableCell>
                <TableCell>Loại</TableCell>
                <TableCell>Địa chỉ</TableCell>
                <TableCell>Chủ sở hữu</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Ngày tạo</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProperties
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((property: Property) => (
                  <TableRow key={property.id} hover>
                    <TableCell>{property.id}</TableCell>
                    <TableCell sx={{ maxWidth: '200px' }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {property.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {getPropertyTypeDisplay(property.property_type)} - {property.area}m² - {getListingTypeDisplay(property.listing_type)}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatPrice(property.price)}</TableCell>
                    <TableCell>
                      <Chip
                        label={getListingTypeDisplay(property.listing_type)}
                        color={property.listing_type === 'sale' ? 'error' : 'info'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ maxWidth: '150px' }}>
                      <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {property.address}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {property.district}, {property.city}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: '150px' }}>
                      <Typography variant="body2">
                        {property.owner_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                        {property.owner_email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusDisplay(property.status)}
                        color={getStatusColor(property.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatDate(property.created_at)}</TableCell>
                    <TableCell align="center">
                      <Box>
                        <Tooltip title="Xem chi tiết">
                          <IconButton 
                            color="primary" 
                            size="small"
                            component={Link}
                            to={`/properties/${property.id}`}
                            sx={{ p: 0.5 }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Đổi trạng thái">
                          <IconButton 
                            color="warning" 
                            size="small"
                            onClick={() => handleOpenStatusDialog(property)}
                            sx={{ p: 0.5 }}
                          >
                            {property.status === 'available' ? <DoDisturbIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Sửa thông tin">
                          <IconButton 
                            color="secondary" 
                            size="small"
                            component={Link}
                            to={`/admin/properties/edit/${property.id}`}
                            sx={{ p: 0.5 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Xóa bất động sản">
                          <IconButton 
                            color="error" 
                            size="small"
                            onClick={() => handleOpenDeleteDialog(property)}
                            sx={{ p: 0.5 }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              
              {filteredProperties.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Typography variant="body2" sx={{ py: 1 }}>
                      Không tìm thấy bất động sản nào
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredProperties.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số hàng:"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} của ${count}`
          }
          sx={{ py: 0 }}
        />
      </Paper>
      
      {/* Status Change Dialog */}
      <Dialog open={openStatusDialog} onClose={handleCloseStatusDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Thay đổi trạng thái</DialogTitle>
        <DialogContent>
          <DialogContentText variant="body2">
            Bạn đang thay đổi trạng thái của bất động sản <strong>{selectedProperty?.title}</strong>
          </DialogContentText>
          <FormControl fullWidth sx={{ mt: 2 }} size="small">
            <InputLabel id="new-status-label">Trạng thái mới</InputLabel>
            <Select
              labelId="new-status-label"
              id="new-status"
              value={newStatus}
              label="Trạng thái mới"
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <MenuItem value="available">Đang hiển thị</MenuItem>
              <MenuItem value="pending">Chờ duyệt</MenuItem>
              <MenuItem value="maintenance">Bảo trì</MenuItem>
              <MenuItem value="sold">Đã bán</MenuItem>
              <MenuItem value="rented">Đã cho thuê</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStatusDialog} size="small">Hủy</Button>
          <Button onClick={handleUpdateStatus} variant="contained" color="primary" size="small">
            Cập nhật
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Xác nhận xóa bất động sản</DialogTitle>
        <DialogContent>
          <DialogContentText variant="body2">
            Bạn có chắc chắn muốn xóa bất động sản <strong>{selectedProperty?.title}</strong>?
            Hành động này không thể được hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} size="small">Hủy</Button>
          <Button onClick={handleDeleteProperty} variant="contained" color="error" size="small">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
};

export default PropertiesPage; 