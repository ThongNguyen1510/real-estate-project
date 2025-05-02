import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tabs,
  Tab,
  Divider,
  Alert,
  CircularProgress,
  Card,
  CardMedia,
  CardContent
} from '@mui/material';
import {
  VerifiedUser,
  Close,
  Check,
  Visibility,
  ImageSearch,
  Search,
  FilterList,
  MoreVert,
  GppMaybe
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { addNotification } from '../../store/notificationsSlice';

const AdminVerificationPanel = () => {
  const dispatch = useDispatch();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchPendingVerifications = async () => {
      try {
        // Giả lập API call
        setTimeout(() => {
          const mockData = [
            {
              id: 1,
              title: 'Biệt thự ven hồ cao cấp',
              location: 'Quận 7, TP.HCM',
              price: '12.5 tỷ VNĐ',
              ownerName: 'Nguyễn Văn A',
              ownerPhone: '0901234567',
              submittedDate: '2023-07-15',
              verificationStatus: 'pending',
              verificationDocuments: [
                'https://source.unsplash.com/random/800x600/?document',
                'https://source.unsplash.com/random/800x600/?certificate'
              ],
              propertyImages: [
                'https://source.unsplash.com/random/800x600/?luxury-villa',
                'https://source.unsplash.com/random/800x600/?living-room'
              ]
            },
            {
              id: 2,
              title: 'Căn hộ cao cấp River City',
              location: 'Quận 2, TP.HCM',
              price: '3.2 tỷ VNĐ',
              ownerName: 'Trần Thị B',
              ownerPhone: '0908765432',
              submittedDate: '2023-07-18',
              verificationStatus: 'pending',
              verificationDocuments: [
                'https://source.unsplash.com/random/800x600/?contract',
                'https://source.unsplash.com/random/800x600/?property-title'
              ],
              propertyImages: [
                'https://source.unsplash.com/random/800x600/?apartment',
                'https://source.unsplash.com/random/800x600/?kitchen'
              ]
            },
            {
              id: 3,
              title: 'Nhà phố liền kề khu đô thị Vinhomes',
              location: 'Quận 9, TP.HCM',
              price: '8.5 tỷ VNĐ',
              ownerName: 'Lê Văn C',
              ownerPhone: '0912345678',
              submittedDate: '2023-07-20',
              verificationStatus: 'approved',
              verificationDocuments: [
                'https://source.unsplash.com/random/800x600/?legal-document',
                'https://source.unsplash.com/random/800x600/?deed'
              ],
              propertyImages: [
                'https://source.unsplash.com/random/800x600/?townhouse',
                'https://source.unsplash.com/random/800x600/?modern-house'
              ]
            },
            {
              id: 4,
              title: 'Đất nền khu dân cư Phú Mỹ',
              location: 'Quận Bình Tân, TP.HCM',
              price: '4.2 tỷ VNĐ',
              ownerName: 'Phạm Thị D',
              ownerPhone: '0923456789',
              submittedDate: '2023-07-22',
              verificationStatus: 'rejected',
              reasonRejected: 'Giấy tờ không hợp lệ, cần cung cấp sổ đỏ chính thức',
              verificationDocuments: [
                'https://source.unsplash.com/random/800x600/?land-certificate'
              ],
              propertyImages: [
                'https://source.unsplash.com/random/800x600/?land',
                'https://source.unsplash.com/random/800x600/?property-land'
              ]
            }
          ];
          setProperties(mockData);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching properties:', error);
        setLoading(false);
      }
    };

    fetchPendingVerifications();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const filteredProperties = () => {
    switch (tabValue) {
      case 0: // Pending
        return properties.filter(property => property.verificationStatus === 'pending');
      case 1: // Approved
        return properties.filter(property => property.verificationStatus === 'approved');
      case 2: // Rejected
        return properties.filter(property => property.verificationStatus === 'rejected');
      default:
        return properties;
    }
  };

  const handleOpenVerificationDialog = (property) => {
    setSelectedProperty(property);
    setVerificationDialogOpen(true);
    setNotes('');
  };

  const handleCloseVerificationDialog = () => {
    setVerificationDialogOpen(false);
    setSelectedProperty(null);
  };

  const handleApproveVerification = () => {
    // In real app, make API call to approve verification
    const updatedProperties = properties.map(property => 
      property.id === selectedProperty.id 
        ? { ...property, verificationStatus: 'approved' } 
        : property
    );
    
    setProperties(updatedProperties);
    
    // Add notification
    dispatch(addNotification({
      title: 'Xác thực thành công',
      message: `Tin đăng "${selectedProperty.title}" đã được xác thực thành công.`,
      type: 'admin'
    }));
    
    handleCloseVerificationDialog();
  };

  const handleRejectVerification = () => {
    if (!notes.trim()) {
      alert('Vui lòng nhập lý do từ chối xác thực.');
      return;
    }
    
    // In real app, make API call to reject verification
    const updatedProperties = properties.map(property => 
      property.id === selectedProperty.id 
        ? { ...property, verificationStatus: 'rejected', reasonRejected: notes } 
        : property
    );
    
    setProperties(updatedProperties);
    
    // Add notification
    dispatch(addNotification({
      title: 'Từ chối xác thực',
      message: `Tin đăng "${selectedProperty.title}" đã bị từ chối xác thực.`,
      type: 'admin'
    }));
    
    handleCloseVerificationDialog();
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'pending':
        return <Chip label="Đang chờ xác thực" color="warning" icon={<GppMaybe />} />;
      case 'approved':
        return <Chip label="Đã xác thực" color="success" icon={<VerifiedUser />} />;
      case 'rejected':
        return <Chip label="Từ chối xác thực" color="error" icon={<Close />} />;
      default:
        return <Chip label="Không xác định" color="default" />;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Đang tải danh sách tin đăng...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        Quản lý xác thực tin đăng
      </Typography>
      
      <Paper elevation={2} sx={{ mb: 4, borderRadius: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab 
            label={`Đang chờ xác thực (${properties.filter(p => p.verificationStatus === 'pending').length})`} 
            icon={<GppMaybe />} 
            iconPosition="start"
          />
          <Tab 
            label={`Đã xác thực (${properties.filter(p => p.verificationStatus === 'approved').length})`} 
            icon={<VerifiedUser />} 
            iconPosition="start"
          />
          <Tab 
            label={`Từ chối xác thực (${properties.filter(p => p.verificationStatus === 'rejected').length})`} 
            icon={<Close />} 
            iconPosition="start"
          />
        </Tabs>
      </Paper>
      
      {filteredProperties().length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography variant="h6" color="text.secondary">
            {tabValue === 0 
              ? 'Không có tin đăng nào đang chờ xác thực' 
              : tabValue === 1 
                ? 'Không có tin đăng nào đã được xác thực' 
                : 'Không có tin đăng nào bị từ chối xác thực'
            }
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Table>
            <TableHead sx={{ bgcolor: 'primary.main' }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tin đăng</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Thông tin liên hệ</TableCell>
                <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Ngày yêu cầu</TableCell>
                <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Trạng thái</TableCell>
                <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProperties().map((property) => (
                <TableRow key={property.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        component="img"
                        src={property.propertyImages[0]}
                        alt={property.title}
                        sx={{ 
                          width: 60, 
                          height: 60, 
                          borderRadius: 1,
                          objectFit: 'cover',
                          mr: 2
                        }}
                      />
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          {property.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {property.location}
                        </Typography>
                        <Typography variant="body2" color="primary.main" fontWeight="bold">
                          {property.price}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      <strong>Tên:</strong> {property.ownerName}
                    </Typography>
                    <Typography variant="body2">
                      <strong>SĐT:</strong> {property.ownerPhone}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {property.submittedDate}
                  </TableCell>
                  <TableCell align="center">
                    {getStatusChip(property.verificationStatus)}
                    {property.verificationStatus === 'rejected' && (
                      <Typography variant="caption" display="block" color="error" sx={{ mt: 1 }}>
                        {property.reasonRejected}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => handleOpenVerificationDialog(property)}
                      sx={{ mr: 1 }}
                    >
                      Xem chi tiết
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Verification Dialog */}
      <Dialog
        open={verificationDialogOpen}
        onClose={handleCloseVerificationDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedProperty && (
          <>
            <DialogTitle sx={{ 
              bgcolor: 'primary.main', 
              color: 'white',
              display: 'flex',
              alignItems: 'center'
            }}>
              <VerifiedUser sx={{ mr: 1 }} /> Xem xét yêu cầu xác thực
              <IconButton
                sx={{ ml: 'auto', color: 'white' }}
                onClick={handleCloseVerificationDialog}
              >
                <Close />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {selectedProperty.title}
                    </Typography>
                    {getStatusChip(selectedProperty.verificationStatus)}
                  </Box>
                  <Typography variant="body1">
                    <strong>Địa chỉ:</strong> {selectedProperty.location}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Giá:</strong> {selectedProperty.price}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                    <ImageSearch sx={{ mr: 1 }} /> Giấy tờ xác thực
                  </Typography>
                  
                  <Grid container spacing={2}>
                    {selectedProperty.verificationDocuments.map((doc, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <Card>
                          <CardMedia
                            component="img"
                            height="200"
                            image={doc}
                            alt={`Giấy tờ ${index + 1}`}
                            sx={{ objectFit: 'cover' }}
                          />
                          <CardContent sx={{ p: 1 }}>
                            <Typography variant="caption">
                              Giấy tờ {index + 1}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                    <Visibility sx={{ mr: 1 }} /> Hình ảnh bất động sản
                  </Typography>
                  
                  <Grid container spacing={2}>
                    {selectedProperty.propertyImages.map((img, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <Card>
                          <CardMedia
                            component="img"
                            height="200"
                            image={img}
                            alt={`Hình ảnh ${index + 1}`}
                            sx={{ objectFit: 'cover' }}
                          />
                          <CardContent sx={{ p: 1 }}>
                            <Typography variant="caption">
                              Hình ảnh {index + 1}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Thông tin người đăng
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1">
                        <strong>Tên liên hệ:</strong> {selectedProperty.ownerName}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1">
                        <strong>Số điện thoại:</strong> {selectedProperty.ownerPhone}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1">
                        <strong>Ngày yêu cầu:</strong> {selectedProperty.submittedDate}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
                
                {selectedProperty.verificationStatus === 'pending' && (
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                      Quyết định xác thực
                    </Typography>
                    
                    <TextField
                      fullWidth
                      label="Ghi chú / Lý do từ chối"
                      multiline
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Nhập ghi chú hoặc lý do từ chối xác thực (bắt buộc nếu từ chối)"
                      sx={{ mb: 2 }}
                    />
                    
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Vui lòng xem xét cẩn thận các giấy tờ được cung cấp trước khi đưa ra quyết định. Nếu từ chối xác thực, hãy cung cấp lý do cụ thể.
                    </Alert>
                  </Grid>
                )}
                
                {selectedProperty.verificationStatus === 'rejected' && (
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Alert severity="error">
                      <Typography variant="subtitle2">Lý do từ chối:</Typography>
                      <Typography variant="body2">{selectedProperty.reasonRejected}</Typography>
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            
            {selectedProperty.verificationStatus === 'pending' && (
              <DialogActions sx={{ p: 3 }}>
                <Button 
                  variant="outlined" 
                  color="inherit"
                  onClick={handleCloseVerificationDialog}
                  startIcon={<Close />}
                >
                  Hủy
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleRejectVerification}
                  startIcon={<Close />}
                  sx={{ mx: 1 }}
                >
                  Từ chối xác thực
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleApproveVerification}
                  startIcon={<Check />}
                >
                  Xác thực
                </Button>
              </DialogActions>
            )}
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default AdminVerificationPanel; 