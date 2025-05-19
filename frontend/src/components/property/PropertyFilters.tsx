import React, { useState } from 'react';
import {
  Box,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Typography,
  Paper,
  Divider
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import MapViewButton from '../common/MapViewButton';

interface PropertyFiltersProps {
  onApplyFilters: (filters: any) => void;
}

const PropertyFilters: React.FC<PropertyFiltersProps> = ({ onApplyFilters }) => {
  const [filters, setFilters] = useState({
    listing_type: '',
    property_type: '',
    city: '',
    district: '',
    price_min: '',
    price_max: '',
    area_min: '',
    area_max: '',
    bedrooms: '',
    bathrooms: ''
  });

  const handleChange = (field: string) => (event: any) => {
    setFilters({
      ...filters,
      [field]: event.target.value
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onApplyFilters(filters);
  };

  const handleReset = () => {
    setFilters({
      listing_type: '',
      property_type: '',
      city: '',
      district: '',
      price_min: '',
      price_max: '',
      area_min: '',
      area_max: '',
      bedrooms: '',
      bathrooms: ''
    });
    onApplyFilters({});
  };

  return (
    <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Loại tin đăng</InputLabel>
            <Select
              value={filters.listing_type}
              onChange={handleChange('listing_type')}
              label="Loại tin đăng"
            >
              <MenuItem value="sale">Mua bán</MenuItem>
              <MenuItem value="rent">Cho thuê</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Loại bất động sản</InputLabel>
            <Select
              value={filters.property_type}
              onChange={handleChange('property_type')}
              label="Loại bất động sản"
            >
              <MenuItem value="apartment">Căn hộ chung cư</MenuItem>
              <MenuItem value="house">Nhà riêng</MenuItem>
              <MenuItem value="villa">Biệt thự</MenuItem>
              <MenuItem value="land">Đất nền</MenuItem>
              <MenuItem value="commercial">Mặt bằng kinh doanh</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Giá từ"
            type="number"
            value={filters.price_min}
            onChange={handleChange('price_min')}
            InputProps={{
              endAdornment: <Typography>VNĐ</Typography>
            }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Giá đến"
            type="number"
            value={filters.price_max}
            onChange={handleChange('price_max')}
            InputProps={{
              endAdornment: <Typography>VNĐ</Typography>
            }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Diện tích từ"
            type="number"
            value={filters.area_min}
            onChange={handleChange('area_min')}
            InputProps={{
              endAdornment: <Typography>m²</Typography>
            }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Diện tích đến"
            type="number"
            value={filters.area_max}
            onChange={handleChange('area_max')}
            InputProps={{
              endAdornment: <Typography>m²</Typography>
            }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Số phòng ngủ</InputLabel>
            <Select
              value={filters.bedrooms}
              onChange={handleChange('bedrooms')}
              label="Số phòng ngủ"
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="1">1 phòng</MenuItem>
              <MenuItem value="2">2 phòng</MenuItem>
              <MenuItem value="3">3 phòng</MenuItem>
              <MenuItem value="4">4 phòng</MenuItem>
              <MenuItem value="5">5+ phòng</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Số phòng tắm</InputLabel>
            <Select
              value={filters.bathrooms}
              onChange={handleChange('bathrooms')}
              label="Số phòng tắm"
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="1">1 phòng</MenuItem>
              <MenuItem value="2">2 phòng</MenuItem>
              <MenuItem value="3">3 phòng</MenuItem>
              <MenuItem value="4">4+ phòng</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={handleReset}
            >
              Đặt lại
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SearchIcon />}
            >
              Tìm kiếm
            </Button>
            <MapViewButton />
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default PropertyFilters; 