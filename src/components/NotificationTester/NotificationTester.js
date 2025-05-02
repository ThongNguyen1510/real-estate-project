import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Card, 
  CardContent, 
  TextField, 
  FormControl, 
  Select, 
  MenuItem, 
  InputLabel,
  Divider,
  Stack,
  Snackbar,
  Alert
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { addNotification } from '../../store/notificationsSlice';

const NotificationTester = () => {
  const dispatch = useDispatch();
  const [notification, setNotification] = useState({
    title: '',
    message: '',
    type: 'system'
  });
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNotification(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (notification.title && notification.message) {
      dispatch(addNotification(notification));
      setOpenSnackbar(true);
      setNotification({
        title: '',
        message: '',
        type: 'system'
      });
    }
  };

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', mt: 4, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
          Tạo thông báo mới
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Tiêu đề thông báo"
              name="title"
              value={notification.title}
              onChange={handleChange}
              required
            />
            
            <TextField
              fullWidth
              label="Nội dung thông báo"
              name="message"
              value={notification.message}
              onChange={handleChange}
              multiline
              rows={3}
              required
            />
            
            <FormControl fullWidth>
              <InputLabel id="notification-type-label">Loại thông báo</InputLabel>
              <Select
                labelId="notification-type-label"
                name="type"
                value={notification.type}
                onChange={handleChange}
                label="Loại thông báo"
              >
                <MenuItem value="system">Hệ thống</MenuItem>
                <MenuItem value="property">Bất động sản</MenuItem>
                <MenuItem value="promotion">Khuyến mãi</MenuItem>
              </Select>
            </FormControl>
            
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              size="large"
            >
              Tạo thông báo
            </Button>
          </Stack>
        </Box>
      </CardContent>

      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={3000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          Đã tạo thông báo mới thành công!
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default NotificationTester; 