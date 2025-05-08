import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Paper,
  InputBase,
  IconButton,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Button,
  Divider
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

interface SearchBoxProps {
  variant?: 'simple' | 'expanded';
  onClose?: () => void;
  className?: string;
}

const SearchBox: React.FC<SearchBoxProps> = ({ variant = 'simple', onClose, className }) => {
  const navigate = useNavigate();
  
  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState('');
  const [propertyType, setPropertyType] = useState('');
  
  // Danh sách thành phố
  const cities = ['Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Nha Trang', 'Cần Thơ', 'Hải Phòng'];
  
  // Loại bất động sản
  const propertyTypes = [
    { value: '', label: 'Loại nhà đất' },
    { value: 'apartment', label: 'Căn hộ chung cư' },
    { value: 'house', label: 'Nhà riêng' },
    { value: 'villa', label: 'Biệt thự' },
    { value: 'land', label: 'Đất nền' },
    { value: 'office', label: 'Văn phòng' },
    { value: 'shop', label: 'Mặt bằng kinh doanh' }
  ];
  
  const handleSearch = () => {
    // Tạo tham số tìm kiếm
    const params = new URLSearchParams();
    
    if (keyword) params.append('keyword', keyword);
    if (city) params.append('city', city);
    if (propertyType) params.append('property_type', propertyType);
    
    // Chuyển hướng đến trang tìm kiếm
    navigate({
      pathname: '/tim-kiem',
      search: params.toString()
    });
    
    // Đóng popup nếu có
    if (onClose) onClose();
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  // Phiên bản đơn giản (chỉ có ô tìm kiếm)
  if (variant === 'simple') {
    return (
      <Paper
        component="form"
        sx={{
          p: '2px 4px',
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          borderRadius: 2,
          boxShadow: 1
        }}
        className={className}
        elevation={1}
      >
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder="Tìm kiếm bất động sản..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
        <IconButton 
          color="primary" 
          sx={{ p: '10px' }} 
          aria-label="search"
          onClick={handleSearch}
        >
          <SearchIcon />
        </IconButton>
      </Paper>
    );
  }
  
  // Phiên bản mở rộng (có các bộ lọc cơ bản)
  return (
    <Paper
      sx={{
        p: 2,
        width: '100%',
        borderRadius: 2,
        boxShadow: 2
      }}
      className={className}
      elevation={2}
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper
            sx={{
              p: '2px 4px',
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              mb: 2
            }}
            elevation={0}
            variant="outlined"
          >
            <InputBase
              sx={{ ml: 1, flex: 1 }}
              placeholder="Nhập từ khóa, địa chỉ, tên dự án..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <IconButton 
              color="primary" 
              sx={{ p: '10px' }} 
              aria-label="search"
              onClick={handleSearch}
            >
              <SearchIcon />
            </IconButton>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth size="small">
            <InputLabel>Thành phố</InputLabel>
            <Select
              value={city}
              label="Thành phố"
              onChange={(e) => setCity(e.target.value as string)}
            >
              <MenuItem value="">Tất cả thành phố</MenuItem>
              {cities.map((city) => (
                <MenuItem key={city} value={city}>{city}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth size="small">
            <InputLabel>Loại bất động sản</InputLabel>
            <Select
              value={propertyType}
              label="Loại bất động sản"
              onChange={(e) => setPropertyType(e.target.value as string)}
            >
              <MenuItem value="">Tất cả loại</MenuItem>
              {propertyTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleSearch}
            sx={{ height: '100%' }}
          >
            Tìm kiếm
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default SearchBox; 