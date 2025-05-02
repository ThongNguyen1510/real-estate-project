import React from 'react';
import { Box, TextField, Button, Grid, InputAdornment, MenuItem } from '@mui/material';
import { Search, LocationOn, AttachMoney, Home } from '@mui/icons-material';

const SearchBar = () => {
  const propertyTypes = [
    { value: 'all', label: 'Tất cả loại' },
    { value: 'house', label: 'Nhà ở' },
    { value: 'apartment', label: 'Căn hộ' },
    { value: 'villa', label: 'Biệt thự' },
    { value: 'land', label: 'Đất' },
  ];

  return (
    <Box sx={{ 
      p: 4, 
      borderRadius: 2, 
      bgcolor: 'background.paper', 
      boxShadow: 3,
      mt: 4
    }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            placeholder="Tìm theo địa điểm, dự án..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOn color="primary" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <TextField
            select
            fullWidth
            defaultValue="all"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Home color="primary" />
                </InputAdornment>
              ),
            }}
          >
            {propertyTypes.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            placeholder="Khoảng giá"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AttachMoney color="primary" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            startIcon={<Search />}
            sx={{ height: '56px' }}
          >
            Tìm kiếm
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SearchBar;