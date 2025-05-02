import React from 'react';
import { Container, Typography, Box, Grid, TextField, Button } from '@mui/material';
import { Phone, Email, LocationOn } from '@mui/icons-material';

const Contact = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
        Liên hệ với chúng tôi
      </Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Họ và tên"
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Email"
              margin="normal"
              required
              type="email"
            />
            <TextField
              fullWidth
              label="Số điện thoại"
              margin="normal"
            />
            <TextField
              fullWidth
              label="Nội dung"
              margin="normal"
              multiline
              rows={4}
              required
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
            >
              Gửi liên hệ
            </Button>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Thông tin liên hệ
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Phone color="primary" sx={{ mr: 2 }} />
              <Typography>(028) 1234 5678</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Email color="primary" sx={{ mr: 2 }} />
              <Typography>info@luxstate.com</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocationOn color="primary" sx={{ mr: 2 }} />
              <Typography>123 Đường ABC, Quận 1, TP.HCM</Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Contact;