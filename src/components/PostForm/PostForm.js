import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Grid, MenuItem, Paper } from '@mui/material';
import { AddPhotoAlternate, Home, Apartment, Villa, Landscape } from '@mui/icons-material';

const PostForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    type: 'apartment',
    bedrooms: '',
    bathrooms: '',
    area: '',
    location: '',
    images: []
  });

  const propertyTypes = [
    { value: 'apartment', label: 'Căn hộ', icon: <Apartment /> },
    { value: 'house', label: 'Nhà ở', icon: <Home /> },
    { value: 'villa', label: 'Biệt thự', icon: <Villa /> },
    { value: 'land', label: 'Đất', icon: <Landscape /> }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = (e) => {
    // Xử lý upload ảnh ở đây
    const files = Array.from(e.target.files);
    setFormData({ ...formData, images: [...formData.images, ...files] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        Đăng bài mới
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Tiêu đề"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Mô tả"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={4}
              required
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Giá (VNĐ)"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Loại bất động sản"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              {propertyTypes.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {option.icon}
                    <span style={{ marginLeft: 8 }}>{option.label}</span>
                  </Box>
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          
          <Grid item xs={6} sm={4}>
            <TextField
              fullWidth
              label="Số phòng ngủ"
              name="bedrooms"
              type="number"
              value={formData.bedrooms}
              onChange={handleChange}
            />
          </Grid>
          
          <Grid item xs={6} sm={4}>
            <TextField
              fullWidth
              label="Số phòng tắm"
              name="bathrooms"
              type="number"
              value={formData.bathrooms}
              onChange={handleChange}
            />
          </Grid>
          
          <Grid item xs={6} sm={4}>
            <TextField
              fullWidth
              label="Diện tích (m²)"
              name="area"
              type="number"
              value={formData.area}
              onChange={handleChange}
              required
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Địa chỉ"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </Grid>
          
          <Grid item xs={12}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<AddPhotoAlternate />}
              fullWidth
              sx={{ py: 2 }}
            >
              Tải lên hình ảnh
              <input
                type="file"
                hidden
                multiple
                accept="image/*"
                onChange={handleImageUpload}
              />
            </Button>
            
            {formData.images.length > 0 && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Đã chọn {formData.images.length} ảnh
              </Typography>
            )}
          </Grid>
          
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              sx={{ py: 1.5 }}
            >
              Đăng bài
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default PostForm;