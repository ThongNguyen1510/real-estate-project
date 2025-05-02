import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  Stepper,
  Step,
  StepLabel,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  Grid,
  IconButton,
  Card,
  CardMedia,
  CardContent,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  VerifiedUser,
  Upload,
  Delete,
  AddPhotoAlternate,
  CheckCircle,
  Info
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { verifyUser } from '../../store/authSlice';
import { addNotification } from '../../store/notificationsSlice';

const VerifyUser = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  
  const [activeStep, setActiveStep] = useState(0);
  const [documents, setDocuments] = useState([]);
  const [verifyType, setVerifyType] = useState('identity');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const steps = ['Chọn loại xác thực', 'Tải lên giấy tờ', 'Xác nhận thông tin'];
  
  const handleNext = () => {
    if (activeStep === 0 && !verifyType) {
      setError('Vui lòng chọn loại xác thực');
      return;
    }
    
    if (activeStep === 1 && documents.length === 0) {
      setError('Vui lòng tải lên ít nhất một giấy tờ để xác thực');
      return;
    }
    
    setError('');
    setActiveStep((prevStep) => prevStep + 1);
  };
  
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  const handleVerifyTypeChange = (e) => {
    setVerifyType(e.target.value);
  };
  
  const handleNotesChange = (e) => {
    setNotes(e.target.value);
  };
  
  const handleFileUpload = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      
      // Check file size (max 5MB)
      const oversizedFiles = newFiles.filter(file => file.size > 5 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        setError('Một hoặc nhiều tệp vượt quá kích thước tối đa (5MB)');
        return;
      }
      
      // Create preview URLs
      const newDocuments = newFiles.map(file => ({
        file,
        preview: URL.createObjectURL(file),
        name: file.name
      }));
      
      setDocuments([...documents, ...newDocuments]);
      setError('');
    }
  };
  
  const handleDeleteDocument = (index) => {
    const newDocuments = [...documents];
    // Revoke object URL to avoid memory leaks
    URL.revokeObjectURL(newDocuments[index].preview);
    newDocuments.splice(index, 1);
    setDocuments(newDocuments);
  };
  
  const handleSubmit = () => {
    setLoading(true);
    
    // Simulate API upload and verification process
    setTimeout(() => {
      // In a real app, you would upload documents to a server
      // and handle the verification process
      
      // Update user in Redux store with pending verification
      dispatch(verifyUser({
        isVerified: false, // Set to pending status initially
        verificationDocuments: documents.map(doc => doc.preview) // In real app, would be uploaded URLs
      }));
      
      // Notify user
      dispatch(addNotification({
        title: 'Yêu cầu xác thực đã được gửi',
        message: 'Hồ sơ xác thực của bạn đã được gửi. Vui lòng chờ phê duyệt.',
        type: 'success'
      }));
      
      setLoading(false);
      setSuccess(true);
    }, 2000);
  };
  
  const getVerificationTypeLabel = (type) => {
    switch (type) {
      case 'identity':
        return 'Giấy tờ tùy thân';
      case 'professional':
        return 'Chứng chỉ nghề nghiệp';
      case 'business':
        return 'Giấy phép kinh doanh';
      default:
        return '';
    }
  };
  
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 3 }}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Chọn loại xác thực tài khoản</FormLabel>
              <RadioGroup
                name="verifyType"
                value={verifyType}
                onChange={handleVerifyTypeChange}
              >
                <FormControlLabel 
                  value="identity" 
                  control={<Radio />} 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        Xác thực danh tính
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        - CMND/CCCD, Hộ chiếu, Bằng lái xe
                      </Typography>
                    </Box>
                  } 
                />
                
                <FormControlLabel 
                  value="professional" 
                  control={<Radio />} 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        Xác thực chuyên môn
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        - Chứng chỉ môi giới, Thẻ thành viên hiệp hội BĐS
                      </Typography>
                    </Box>
                  } 
                />
                
                <FormControlLabel 
                  value="business" 
                  control={<Radio />} 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        Xác thực doanh nghiệp
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        - Giấy phép kinh doanh, Giấy phép đầu tư
                      </Typography>
                    </Box>
                  } 
                />
              </RadioGroup>
            </FormControl>
            
            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="body2">
                Xác thực tài khoản giúp tăng độ tin cậy với người dùng và được ưu tiên hiển thị trong kết quả tìm kiếm.
              </Typography>
            </Alert>
          </Box>
        );
        
      case 1:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>
              Tải lên giấy tờ xác thực {getVerificationTypeLabel(verifyType)}
            </Typography>
            
            <Box sx={{ mt: 2, mb: 3 }}>
              <Grid container spacing={2}>
                {documents.map((doc, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={doc.preview}
                        alt={`Document ${index + 1}`}
                        sx={{ objectFit: 'cover' }}
                      />
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          bgcolor: 'rgba(0,0,0,0.5)',
                          color: 'white',
                          '&:hover': {
                            bgcolor: 'rgba(255,0,0,0.7)',
                          }
                        }}
                        onClick={() => handleDeleteDocument(index)}
                      >
                        <Delete />
                      </IconButton>
                      <CardContent sx={{ py: 1 }}>
                        <Typography variant="caption" noWrap>
                          {doc.name}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
                
                <Grid item xs={12} sm={6} md={4}>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<AddPhotoAlternate />}
                    sx={{ 
                      height: 200, 
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      border: '1px dashed',
                      borderColor: 'divider'
                    }}
                  >
                    Tải lên giấy tờ
                    <input
                      type="file"
                      accept="image/*, application/pdf"
                      hidden
                      multiple
                      onChange={handleFileUpload}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                      Hỗ trợ: JPG, PNG, PDF (tối đa 5MB)
                    </Typography>
                  </Button>
                </Grid>
              </Grid>
            </Box>
            
            <TextField
              fullWidth
              label="Ghi chú bổ sung (tùy chọn)"
              multiline
              rows={3}
              value={notes}
              onChange={handleNotesChange}
              placeholder="Thêm thông tin bổ sung về giấy tờ đã tải lên..."
            />
            
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Quan trọng:</strong> Vui lòng che đi các thông tin nhạy cảm không cần thiết như số CMND, địa chỉ cá nhân, v.v.
                Đảm bảo các thông tin cần xác thực như họ tên trùng khớp với thông tin tài khoản của bạn.
              </Typography>
            </Alert>
          </Box>
        );
        
      case 2:
        return (
          <Box sx={{ mt: 3 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                Vui lòng kiểm tra lại thông tin xác thực trước khi gửi yêu cầu. Sau khi gửi, bạn sẽ không thể chỉnh sửa thông tin cho đến khi yêu cầu được xử lý.
              </Typography>
            </Alert>
            
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              <Typography variant="subtitle2">Thông tin người dùng</Typography>
              <Box sx={{ mt: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Họ tên:
                    </Typography>
                    <Typography variant="body1">
                      {user.fullName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Email:
                    </Typography>
                    <Typography variant="body1">
                      {user.email}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Số điện thoại:
                    </Typography>
                    <Typography variant="body1">
                      {user.phone || 'Chưa cập nhật'}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
            
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              <Typography variant="subtitle2">Chi tiết xác thực</Typography>
              <Box sx={{ mt: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Loại xác thực:
                    </Typography>
                    <Typography variant="body1">
                      {getVerificationTypeLabel(verifyType)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Số giấy tờ đã tải lên:
                    </Typography>
                    <Typography variant="body1">
                      {documents.length} tệp
                    </Typography>
                  </Grid>
                  {notes && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Ghi chú bổ sung:
                      </Typography>
                      <Typography variant="body1">
                        {notes}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </Paper>
          </Box>
        );
        
      default:
        return null;
    }
  };
  
  // If user is already verified
  if (user.isVerified) {
    return (
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CheckCircle color="success" sx={{ mr: 1 }} />
          <Typography variant="h6" color="success.main">
            Tài khoản đã được xác thực
          </Typography>
        </Box>
        <Typography variant="body1" paragraph>
          Tài khoản của bạn đã được xác thực. Bạn sẽ được ưu tiên hiển thị trong kết quả tìm kiếm 
          và tin đăng của bạn sẽ được đánh dấu là "Đã xác thực".
        </Typography>
        <Chip 
          icon={<VerifiedUser />} 
          label="Đã xác thực" 
          color="success" 
          sx={{ fontWeight: 'medium' }} 
        />
      </Paper>
    );
  }
  
  // If verification is pending
  if (user.verificationDocuments && user.verificationDocuments.length > 0) {
    return (
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Info color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" color="primary">
            Yêu cầu xác thực đang được xử lý
          </Typography>
        </Box>
        <Typography variant="body1" paragraph>
          Chúng tôi đã nhận được yêu cầu xác thực tài khoản của bạn và đang xem xét. 
          Quá trình này thường mất 1-3 ngày làm việc. Bạn sẽ nhận được thông báo khi yêu cầu được xử lý.
        </Typography>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {user.verificationDocuments.map((doc, index) => (
            <Grid item xs={6} md={4} key={index}>
              <Card>
                <CardMedia
                  component="img"
                  height="120"
                  image={doc}
                  alt={`Document ${index + 1}`}
                />
              </Card>
            </Grid>
          ))}
        </Grid>
        <Chip 
          icon={<Info />} 
          label="Đang xử lý" 
          color="primary" 
          sx={{ fontWeight: 'medium' }} 
        />
      </Paper>
    );
  }
  
  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <VerifiedUser color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6">
          Xác thực tài khoản
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success ? (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <CheckCircle color="success" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Yêu cầu xác thực đã được gửi thành công!
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Chúng tôi sẽ xem xét hồ sơ của bạn và phản hồi trong vòng 1-3 ngày làm việc.
            Bạn sẽ nhận được thông báo ngay khi quá trình xác thực hoàn tất.
          </Typography>
          <Chip 
            icon={<Info />} 
            label="Đang xử lý" 
            color="primary" 
            sx={{ fontWeight: 'medium' }} 
          />
        </Box>
      ) : (
        <>
          {/* Stepper */}
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {/* Step content */}
          {renderStepContent(activeStep)}
          
          {/* Action buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
            >
              Quay lại
            </Button>
            
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={24} /> : <Upload />}
              >
                {loading ? 'Đang xử lý...' : 'Gửi yêu cầu xác thực'}
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
              >
                Tiếp theo
              </Button>
            )}
          </Box>
        </>
      )}
    </Paper>
  );
};

export default VerifyUser; 