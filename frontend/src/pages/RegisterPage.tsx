import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Divider,
  InputAdornment,
  IconButton,
  Alert,
  Grid,
  FormControlLabel,
  Checkbox,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Facebook as FacebookIcon,
  Google as GoogleIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

interface ValidationErrors {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  acceptTerms: string;
}

const steps = ['Thông tin cá nhân', 'Thông tin tài khoản'];

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();
  
  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
  // Stepper state
  const [activeStep, setActiveStep] = useState(0);
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  
  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form validation state
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: ''
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    
    // Clear validation error when user types
    setValidationErrors({
      ...validationErrors,
      [name]: ''
    });
    
    // Update form data
    setFormData({
      ...formData,
      [name]: name === 'acceptTerms' ? checked : value
    });
  };
  
  const validateStep = (step: number): boolean => {
    let isValid = true;
    const errors: Partial<ValidationErrors> = {};
    
    if (step === 0) {
      // Validate personal information
      if (!formData.fullName) {
        errors.fullName = 'Họ tên không được để trống';
        isValid = false;
      }
      
      if (!formData.email) {
        errors.email = 'Email không được để trống';
        isValid = false;
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = 'Email không hợp lệ';
        isValid = false;
      }
      
      if (!formData.phone) {
        errors.phone = 'Số điện thoại không được để trống';
        isValid = false;
      } else if (!/^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(formData.phone)) {
        errors.phone = 'Số điện thoại không hợp lệ';
        isValid = false;
      }
    } else if (step === 1) {
      // Validate account information
      if (!formData.password) {
        errors.password = 'Mật khẩu không được để trống';
        isValid = false;
      } else if (formData.password.length < 6) {
        errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        isValid = false;
      }
      
      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
        isValid = false;
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        isValid = false;
      }
      
      if (!formData.acceptTerms) {
        errors.acceptTerms = 'Bạn phải đồng ý với điều khoản dịch vụ';
        isValid = false;
      }
    }
    
    setValidationErrors({
      ...validationErrors,
      ...errors
    });
    
    return isValid;
  };
  
  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };
  
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate final step
    if (!validateStep(activeStep)) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Prepare user data
      const userData = {
        username: formData.email,
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      };
      
      // Call register from auth context
      await register(userData);
      
      // Chuyển hướng đến trang đăng nhập sau khi đăng ký thành công
      navigate('/login');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };
  
  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <>
            <TextField
              fullWidth
              margin="normal"
              label="Họ và tên"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              error={!!validationErrors.fullName}
              helperText={validationErrors.fullName}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              fullWidth
              margin="normal"
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!validationErrors.email}
              helperText={validationErrors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              fullWidth
              margin="normal"
              label="Số điện thoại"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              error={!!validationErrors.phone}
              helperText={validationErrors.phone}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </>
        );
      case 1:
        return (
          <>
            <TextField
              fullWidth
              margin="normal"
              label="Mật khẩu"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              error={!!validationErrors.password}
              helperText={validationErrors.password}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              fullWidth
              margin="normal"
              label="Xác nhận mật khẩu"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!validationErrors.confirmPassword}
              helperText={validationErrors.confirmPassword}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2">
                  Tôi đồng ý với{' '}
                  <Link 
                    to="/dieu-khoan" 
                    style={{ 
                      textDecoration: 'none', 
                      color: '#1B4F72',
                      fontWeight: 'bold'
                    }}
                  >
                    Điều khoản dịch vụ
                  </Link>{' '}
                  và{' '}
                  <Link 
                    to="/chinh-sach" 
                    style={{ 
                      textDecoration: 'none', 
                      color: '#1B4F72',
                      fontWeight: 'bold'
                    }}
                  >
                    Chính sách bảo mật
                  </Link>
                </Typography>
              }
              sx={{ mt: 2 }}
            />
            
            {validationErrors.acceptTerms && (
              <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                {validationErrors.acceptTerms}
              </Typography>
            )}
          </>
        );
      default:
        return null;
    }
  };
  
  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: { xs: 3, md: 5 }, borderRadius: 2 }}>
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
              Đăng ký tài khoản
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tạo tài khoản để bắt đầu sử dụng dịch vụ
            </Typography>
          </Box>
          
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit}>
            {renderStepContent(activeStep)}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                variant="outlined"
                sx={{ px: 3 }}
              >
                Quay lại
              </Button>
              
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={loading}
                  sx={{ px: 3, fontWeight: 'bold' }}
                >
                  {loading ? 'Đang xử lý...' : 'Đăng ký'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                  sx={{ px: 3, fontWeight: 'bold' }}
                >
                  Tiếp theo
                </Button>
              )}
            </Box>
          </Box>
          
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2">
              Đã có tài khoản?{' '}
              <Link 
                to="/login" 
                style={{ 
                  textDecoration: 'none', 
                  color: '#1B4F72',
                  fontWeight: 'bold'
                }}
              >
                Đăng nhập
              </Link>
            </Typography>
          </Box>
          
          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Hoặc đăng ký với
            </Typography>
          </Divider>
          
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FacebookIcon />}
                sx={{ py: 1 }}
              >
                Facebook
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<GoogleIcon />}
                sx={{ py: 1 }}
              >
                Google
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
};

export default RegisterPage; 