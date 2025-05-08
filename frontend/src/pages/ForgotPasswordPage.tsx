import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  InputAdornment,
  Alert,
  CircularProgress
} from '@mui/material';
import { Email as EmailIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { authService } from '../services/api';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  
  // State
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validationError, setValidationError] = useState('');
  
  // Validate email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setValidationError('Vui lòng nhập email của bạn');
      return false;
    } else if (!emailRegex.test(email)) {
      setValidationError('Email không hợp lệ');
      return false;
    }
    setValidationError('');
    return true;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email
    if (!validateEmail(email)) {
      return;
    }
    
    // Reset error
    setError(null);
    setSuccess(false);
    setLoading(true);
    
    try {
      const response = await authService.forgotPassword(email);
      console.log('Forgot password response:', response);
      setSuccess(true);
    } catch (err: any) {
      console.error('Forgot password error:', err);
      setError(err.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.');
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
              Quên mật khẩu
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Nhập email của bạn để nhận liên kết đặt lại mật khẩu
            </Typography>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Chúng tôi đã gửi email hướng dẫn đặt lại mật khẩu cho bạn. Vui lòng kiểm tra hộp thư.
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              margin="normal"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setValidationError('');
              }}
              error={!!validationError}
              helperText={validationError || 'Nhập email được liên kết với tài khoản của bạn'}
              disabled={loading || success}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
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
              disabled={loading || success}
              sx={{ py: 1.5, fontWeight: 'bold', mt: 3 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Gửi yêu cầu đặt lại mật khẩu'}
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

export default ForgotPasswordPage; 