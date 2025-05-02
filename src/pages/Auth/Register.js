import React, { useState } from 'react';
import { Container, Box, Typography, TextField, Button, Link, Alert } from '@mui/material';
import { Person, Email, Lock, Phone, Home } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Xử lý đăng ký ở đây
    console.log('Register submitted:', formData);
    // Chuyển hướng sau khi đăng ký thành công
    navigate('/login');
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
          Đăng ký tài khoản
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Họ và tên"
            name="name"
            margin="normal"
            required
            InputProps={{
              startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />
            }}
            value={formData.name}
            onChange={handleChange}
          />
          
          <TextField
            fullWidth
            label="Email"
            type="email"
            name="email"
            margin="normal"
            required
            InputProps={{
              startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />
            }}
            value={formData.email}
            onChange={handleChange}
          />
          
          <TextField
            fullWidth
            label="Mật khẩu"
            type="password"
            name="password"
            margin="normal"
            required
            InputProps={{
              startAdornment: <Lock sx={{ mr: 1, color: 'action.active' }} />
            }}
            value={formData.password}
            onChange={handleChange}
          />
          
          <TextField
            fullWidth
            label="Số điện thoại"
            name="phone"
            margin="normal"
            InputProps={{
              startAdornment: <Phone sx={{ mr: 1, color: 'action.active' }} />
            }}
            value={formData.phone}
            onChange={handleChange}
          />
          
          <TextField
            fullWidth
            label="Địa chỉ"
            name="address"
            margin="normal"
            InputProps={{
              startAdornment: <Home sx={{ mr: 1, color: 'action.active' }} />
            }}
            value={formData.address}
            onChange={handleChange}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            sx={{ mt: 3, py: 1.5 }}
          >
            Đăng ký
          </Button>
        </form>
        
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2">
            Đã có tài khoản?{' '}
            <Link href="/login" underline="hover" sx={{ cursor: 'pointer' }}>
              Đăng nhập ngay
            </Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default Register;