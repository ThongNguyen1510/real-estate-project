import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Grid, 
  InputAdornment, 
  MenuItem, 
  Typography, 
  Slider, 
  Divider, 
  Chip, 
  IconButton, 
  Collapse, 
  Paper, 
  FormControl, 
  FormControlLabel, 
  RadioGroup, 
  Radio,
  Autocomplete,
  ToggleButton,
  ToggleButtonGroup,
  Switch,
  InputLabel,
  Select,
  Tooltip,
  Card
} from '@mui/material';
import { 
  Search, 
  LocationOn, 
  AttachMoney, 
  Home, 
  BedOutlined, 
  BathtubOutlined, 
  SquareFoot, 
  FilterList, 
  ArrowDropDown, 
  ArrowDropUp, 
  Navigation, 
  Clear, 
  Business,
  Sort,
  ViewList,
  ViewModule,
  VerifiedUser,
  Person
} from '@mui/icons-material';

const SearchBar = ({ onSearch }) => {
  const [expanded, setExpanded] = useState(false);
  const [searchParams, setSearchParams] = useState({
    location: '',
    propertyType: 'all',
    priceMin: '',
    priceMax: '',
    bedrooms: '',
    bathrooms: '',
    areaMin: '',
    areaMax: '',
    direction: '',
    purpose: 'all',
    sortBy: 'newest',
    verifiedListingsOnly: false,
    verifiedUsersOnly: false
  });

  const propertyTypes = [
    { value: 'all', label: 'Tất cả loại', icon: <Home /> },
    { value: 'apartment', label: 'Căn hộ', icon: <Business /> },
    { value: 'house', label: 'Nhà ở', icon: <Home /> },
    { value: 'villa', label: 'Biệt thự', icon: <Home /> },
    { value: 'land', label: 'Đất', icon: <SquareFoot /> },
  ];

  const directionOptions = [
    { value: '', label: 'Tất cả hướng' },
    { value: 'east', label: 'Đông' },
    { value: 'west', label: 'Tây' },
    { value: 'south', label: 'Nam' },
    { value: 'north', label: 'Bắc' },
    { value: 'northeast', label: 'Đông Bắc' },
    { value: 'northwest', label: 'Tây Bắc' },
    { value: 'southeast', label: 'Đông Nam' },
    { value: 'southwest', label: 'Tây Nam' },
  ];

  const sortOptions = [
    { value: 'newest', label: 'Mới nhất' },
    { value: 'price_asc', label: 'Giá tăng dần' },
    { value: 'price_desc', label: 'Giá giảm dần' },
    { value: 'area_asc', label: 'Diện tích tăng dần' },
    { value: 'area_desc', label: 'Diện tích giảm dần' }
  ];

  const locations = [
    'Hồ Chí Minh',
    'Hà Nội',
    'Đà Nẵng',
    'Hải Phòng',
    'Cần Thơ',
    'Bình Dương',
    'Đồng Nai',
    'Bà Rịa - Vũng Tàu',
    'Quận 1, TP.HCM',
    'Quận 2, TP.HCM',
    'Quận 3, TP.HCM'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams({ ...searchParams, [name]: value });
  };

  const handleLocationChange = (event, newValue) => {
    setSearchParams({ ...searchParams, location: newValue || '' });
  };

  const handleToggleExpand = () => {
    setExpanded(!expanded);
  };

  const handlePurposeChange = (event, newPurpose) => {
    if (newPurpose !== null) {
      setSearchParams({ ...searchParams, purpose: newPurpose });
    }
  };

  const handleClearFilters = () => {
    setSearchParams({
      location: '',
      propertyType: 'all',
      priceMin: '',
      priceMax: '',
      bedrooms: '',
      bathrooms: '',
      areaMin: '',
      areaMax: '',
      direction: '',
      purpose: 'all',
      sortBy: 'newest',
      verifiedListingsOnly: false,
      verifiedUsersOnly: false
    });
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setSearchParams({ ...searchParams, [name]: checked });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchParams);
    }
  };

  return (
    <Card
      component="form"
      onSubmit={handleSubmit}
      elevation={3}
      sx={{ 
        borderRadius: 2,
        overflow: 'visible',
        mb: 4,
        position: 'relative',
        transform: 'translateY(-30px)',
        bgcolor: 'background.paper',
        px: 2
      }}
    >
      {/* Main Search Bar */}
      <Box sx={{ p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <Autocomplete
              fullWidth
              freeSolo
              options={locations}
              value={searchParams.location}
              onChange={handleLocationChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Tìm kiếm khu vực, địa điểm..."
                  name="location"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <InputAdornment position="start">
                          <LocationOn color="primary" />
                        </InputAdornment>
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              name="propertyType"
              value={searchParams.propertyType}
              onChange={handleInputChange}
              label="Loại bất động sản"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Home color="primary" />
                  </InputAdornment>
                ),
              }}
              SelectProps={{
                MenuProps: {
                  PaperProps: {
                    sx: { maxHeight: 300 }
                  }
                }
              }}
            >
              {propertyTypes.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {option.icon}
                    <Box sx={{ ml: 1 }}>{option.label}</Box>
                  </Box>
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={3}>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  placeholder="Giá từ"
                  type="number"
                  name="priceMin"
                  value={searchParams.priceMin}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoney color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  placeholder="Đến"
                  type="number"
                  name="priceMax"
                  value={searchParams.priceMax}
                  onChange={handleInputChange}
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                type="submit"
                startIcon={<Search />}
                sx={{ 
                  height: '56px',
                  flex: 1,
                  fontWeight: 'bold',
                  boxShadow: 2,
                  borderRadius: 2
                }}
              >
                Tìm kiếm
              </Button>
              
              <Tooltip title={expanded ? "Thu gọn bộ lọc" : "Mở rộng bộ lọc"}>
                <Button
                  variant="outlined"
                  color="primary"
                  size="large"
                  onClick={handleToggleExpand}
                  sx={{ height: '56px', minWidth: '56px', width: '56px', p: 0 }}
                >
                  {expanded ? <ArrowDropUp /> : <FilterList />}
                </Button>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Purpose toggle */}
      <Box sx={{ 
        mb: 2,
        px: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <ToggleButtonGroup
          value={searchParams.purpose}
          exclusive
          onChange={handlePurposeChange}
          aria-label="Nhu cầu"
          size="small"
          sx={{ 
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          <ToggleButton value="all" aria-label="Tất cả">
            Tất cả
          </ToggleButton>
          <ToggleButton value="buy" aria-label="Mua">
            Mua bán
          </ToggleButton>
          <ToggleButton value="rent" aria-label="Thuê">
            Cho thuê
          </ToggleButton>
        </ToggleButtonGroup>

        <FormControl sx={{ minWidth: 150 }}>
          <Select
            size="small"
            value={searchParams.sortBy}
            name="sortBy"
            onChange={handleInputChange}
            displayEmpty
            startAdornment={
              <InputAdornment position="start">
                <Sort fontSize="small" />
              </InputAdornment>
            }
          >
            {sortOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Advanced Search Options */}
      <Collapse in={expanded}>
        <Box sx={{ py: 2, px: 2 }}>
          <Divider sx={{ mb: 3 }}>
            <Chip label="Bộ lọc nâng cao" color="primary" />
          </Divider>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                Thông tin cơ bản
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    select
                    label="Phòng ngủ"
                    name="bedrooms"
                    value={searchParams.bedrooms}
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BedOutlined fontSize="small" color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  >
                    <MenuItem value="">Tất cả</MenuItem>
                    <MenuItem value="1">1+</MenuItem>
                    <MenuItem value="2">2+</MenuItem>
                    <MenuItem value="3">3+</MenuItem>
                    <MenuItem value="4">4+</MenuItem>
                    <MenuItem value="5">5+</MenuItem>
                  </TextField>
                </Grid>
                
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    select
                    label="Phòng tắm"
                    name="bathrooms"
                    value={searchParams.bathrooms}
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BathtubOutlined fontSize="small" color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  >
                    <MenuItem value="">Tất cả</MenuItem>
                    <MenuItem value="1">1+</MenuItem>
                    <MenuItem value="2">2+</MenuItem>
                    <MenuItem value="3">3+</MenuItem>
                    <MenuItem value="4">4+</MenuItem>
                  </TextField>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    select
                    fullWidth
                    label="Hướng nhà"
                    name="direction"
                    value={searchParams.direction}
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Navigation fontSize="small" color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  >
                    {directionOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                Diện tích
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    placeholder="Từ (m²)"
                    type="number"
                    name="areaMin"
                    value={searchParams.areaMin}
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SquareFoot fontSize="small" color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    placeholder="Đến (m²)"
                    type="number"
                    name="areaMax"
                    value={searchParams.areaMax}
                    onChange={handleInputChange}
                  />
                </Grid>
              </Grid>
            </Grid>
            
            <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                Tiện ích
              </Typography>
              
              <FormControl component="fieldset">
                <RadioGroup row>
                  <FormControlLabel value="elevator" control={<Radio size="small" />} label="Thang máy" />
                  <FormControlLabel value="pool" control={<Radio size="small" />} label="Hồ bơi" />
                  <FormControlLabel value="parking" control={<Radio size="small" />} label="Đỗ xe" />
                </RadioGroup>
              </FormControl>
              
              <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<Clear />}
                  onClick={handleClearFilters}
                  sx={{ mt: 1 }}
                >
                  Xóa bộ lọc
                </Button>
              </Box>
            </Grid>

            {/* Verification Filters */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Đảm bảo chất lượng
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={searchParams.verifiedListingsOnly}
                        onChange={handleCheckboxChange}
                        name="verifiedListingsOnly"
                        color="primary"
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <VerifiedUser color="primary" sx={{ mr: 1, fontSize: 20 }} />
                        <Typography variant="body2">Chỉ hiện tin đã xác thực</Typography>
                      </Box>
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={searchParams.verifiedUsersOnly}
                        onChange={handleCheckboxChange}
                        name="verifiedUsersOnly"
                        color="primary"
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Person color="primary" sx={{ mr: 1, fontSize: 20 }} />
                        <Typography variant="body2">Chỉ hiện người dùng đã xác thực</Typography>
                      </Box>
                    }
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Collapse>
    </Card>
  );
};

export default SearchBar;