import React, { useState } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Link, 
  Alert,
  CircularProgress
} from '@mui/material';
import { Lock, Email } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../../store/authSlice';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(loginStart());
      
      // Giả lập API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - Thay bằng API thực tế
      if (email === 'user@example.com' && password === 'password123') {
        dispatch(loginSuccess({
          id: '1',
          name: 'Nguyễn Văn A',
          email: 'user@example.com',
          avatar: 'https://i.pravatar.cc/150?img=3'
        }));
        navigate('/');
      } else {
        throw new Error('Email hoặc mật khẩu không đúng');
      }
    } catch (err) {
      dispatch(loginFailure(err.message));
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Box sx={{ 
        p: 4, 
        boxShadow: 3, 
        borderRadius: 2,
        bgcolor: 'background.paper'
      }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          Đăng nhập
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            margin="normal"
            required
            InputProps={{
              startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />
            }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          
          <TextField
            fullWidth
            label="Mật khẩu"
            type="password"
            margin="normal"
            required
            InputProps={{
              startAdornment: <Lock sx={{ mr: 1, color: 'action.active' }} />
            }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            disabled={loading}
            sx={{ mt: 3, py: 1.5 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Đăng nhập'}
          </Button>
        </form>
        
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2">
            Chưa có tài khoản?{' '}
            <Link href="/register" underline="hover" sx={{ cursor: 'pointer' }}>
              Đăng ký ngay
            </Link>
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            <Link href="/forgot-password" underline="hover" sx={{ cursor: 'pointer' }}>
              Quên mật khẩu?
            </Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;