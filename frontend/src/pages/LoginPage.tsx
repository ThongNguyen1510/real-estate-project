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
  Checkbox,
  FormControlLabel,
  Grid
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Facebook as FacebookIcon,
  Google as GoogleIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  
  // Redirect if already logged in
  useEffect(() => {
    console.log('Auth state changed:', isAuthenticated);
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form validation state
  const [validationErrors, setValidationErrors] = useState({
    email: '',
    password: ''
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
      [name]: name === 'rememberMe' ? checked : value
    });
  };
  
  const validateForm = (): boolean => {
    let isValid = true;
    const errors = {
      email: '',
      password: ''
    };
    
    // Validate username/email
    if (!formData.email) {
      errors.email = 'Username hoặc Email không được để trống';
      isValid = false;
    }
    
    // Validate password
    if (!formData.password) {
      errors.password = 'Mật khẩu không được để trống';
      isValid = false;
    } else if (formData.password.length < 6) {
      errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
      isValid = false;
    }
    
    setValidationErrors(errors);
    return isValid;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset error
    setError(null);
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('Đang đăng nhập với email:', formData.email);
      // Call login from auth context
      const response = await login(formData.email, formData.password);
      console.log('Đăng nhập thành công:', response);
      
      // Chuyển hướng ngay sau khi đăng nhập thành công
      navigate('/');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: { xs: 3, md: 5 }, borderRadius: 2 }}>
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
              Đăng nhập
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Chào mừng trở lại! Vui lòng đăng nhập để tiếp tục.
            </Typography>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              margin="normal"
              label="Username hoặc Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={!!validationErrors.email}
              helperText={validationErrors.email || 'Nhập username hoặc email để đăng nhập'}
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
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, mb: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    color="primary"
                  />
                }
                label="Ghi nhớ đăng nhập"
              />
              
              <Link 
                to="/quen-mat-khau" 
                style={{ 
                  textDecoration: 'none', 
                  color: '#1B4F72',
                  fontWeight: 500,
                  fontSize: '0.875rem'
                }}
              >
                Quên mật khẩu?
              </Link>
            </Box>
            
            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              type="submit"
              disabled={loading}
              sx={{ py: 1.5, fontWeight: 'bold' }}
            >
              {loading ? 'Đang xử lý...' : 'Đăng nhập'}
            </Button>
            
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2">
                Chưa có tài khoản?{' '}
                <Link 
                  to="/register" 
                  style={{ 
                    textDecoration: 'none', 
                    color: '#1B4F72',
                    fontWeight: 'bold'
                  }}
                >
                  Đăng ký
                </Link>
              </Typography>
            </Box>
            
            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Hoặc đăng nhập với
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
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage; 