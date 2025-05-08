import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { authService } from '../services/api';

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get token from URL query params or from location state if redirected
  const queryParams = new URLSearchParams(location.search);
  const redirectState = location.state as { preserveQuery?: boolean } | null;
  const token = queryParams.get('token') || 
    (redirectState?.preserveQuery ? new URLSearchParams(window.location.search).get('token') : null);
  
  // State
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    password: '',
    confirmPassword: ''
  });
  
  // Check if token exists
  useEffect(() => {
    if (!token) {
      setError('Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn');
    } else {
      setError(null);
    }
  }, [token]);
  
  // Validate form
  const validateForm = (): boolean => {
    const errors = {
      password: '',
      confirmPassword: ''
    };
    let isValid = true;
    
    // Validate password
    if (!password) {
      errors.password = 'Vui lòng nhập mật khẩu mới';
      isValid = false;
    } else if (password.length < 6) {
      errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
      isValid = false;
    }
    
    // Validate confirm password
    if (!confirmPassword) {
      errors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
      isValid = false;
    } else if (confirmPassword !== password) {
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
      isValid = false;
    }
    
    setValidationErrors(errors);
    return isValid;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm() || !token) {
      return;
    }
    
    // Reset error and set loading
    setError(null);
    setLoading(true);
    
    try {
      const response = await authService.resetPassword(token, password);
      console.log('Reset password response:', response);
      setSuccess(true);
      
      // Redirect to login after successful password reset
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      console.error('Reset password error:', err);
      setError(err.message || 'Có lỗi xảy ra. Vui lòng thử lại hoặc yêu cầu liên kết mới.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: 'password' | 'confirmPassword') => {
    const value = e.target.value;
    
    if (field === 'password') {
      setPassword(value);
    } else {
      setConfirmPassword(value);
    }
    
    // Clear validation error
    setValidationErrors({
      ...validationErrors,
      [field]: ''
    });
  };
  
  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: { xs: 3, md: 5 }, borderRadius: 2 }}>
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
              Đặt lại mật khẩu
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Nhập mật khẩu mới cho tài khoản của bạn
            </Typography>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Mật khẩu đã được đặt lại thành công. Bạn sẽ được chuyển đến trang đăng nhập...
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              margin="normal"
              label="Mật khẩu mới"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => handleChange(e, 'password')}
              error={!!validationErrors.password}
              helperText={validationErrors.password}
              disabled={loading || success || !token}
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
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => handleChange(e, 'confirmPassword')}
              error={!!validationErrors.confirmPassword}
              helperText={validationErrors.confirmPassword}
              disabled={loading || success || !token}
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
            
            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              type="submit"
              disabled={loading || success || !token}
              sx={{ py: 1.5, fontWeight: 'bold', mt: 3 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Đặt lại mật khẩu'}
            </Button>
            
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button
                component={Link}
                to="/login"
                startIcon={<ArrowBackIcon />}
                sx={{ textTransform: 'none' }}
              >
                Quay lại trang đăng nhập
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ResetPasswordPage; 