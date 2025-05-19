import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Modal, 
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Grid,
  TextField,
  InputAdornment
} from '@mui/material';
import { 
  LocationOn as LocationIcon,
  Close as CloseIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Search as SearchIcon
} from '@mui/icons-material';

// Cities data
const CITIES = [
  { id: '79', name: 'Hồ Chí Minh' },
  { id: '1', name: 'Hà Nội' },
  { id: '48', name: 'Đà Nẵng' },
  { id: '92', name: 'Cần Thơ' },
  { id: '31', name: 'Hải Phòng' },
  { id: '56', name: 'Khánh Hòa' },
  { id: '75', name: 'Bình Dương' },
  { id: '77', name: 'Đồng Nai' },
  { id: '74', name: 'Bình Phước' },
  { id: '70', name: 'Tây Ninh' },
  { id: '72', name: 'Long An' },
  { id: '86', name: 'Vĩnh Long' },
  { id: '87', name: 'Kiên Giang' },
  { id: '83', name: 'Bến Tre' },
  { id: '84', name: 'Trà Vinh' },
  { id: '82', name: 'Tiền Giang' },
  { id: '80', name: 'Bà Rịa - Vũng Tàu' },
  { id: '52', name: 'Bình Định' },
  { id: '54', name: 'Phú Yên' },
  { id: '58', name: 'Ninh Thuận' },
  { id: '60', name: 'Bình Thuận' },
  { id: '62', name: 'Kon Tum' },
  { id: '64', name: 'Gia Lai' }
];

// Districts data by city
const DISTRICTS = {
  '79': [ // Hồ Chí Minh
    'Quận 1', 'Quận 2', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 6', 'Quận 7', 'Quận 8', 'Quận 9',
    'Quận 10', 'Quận 11', 'Quận 12', 'Quận Bình Thạnh', 'Quận Tân Bình', 'Quận Gò Vấp', 'Quận Phú Nhuận',
    'Quận Tân Phú', 'Quận Bình Tân', 'Quận Thủ Đức', 'Huyện Nhà Bè', 'Huyện Bình Chánh', 
    'Huyện Củ Chi', 'Huyện Hóc Môn', 'Huyện Cần Giờ'
  ],
  '1': [ // Hà Nội
    'Quận Ba Đình', 'Quận Hoàn Kiếm', 'Quận Hai Bà Trưng', 'Quận Đống Đa', 'Quận Tây Hồ',
    'Quận Cầu Giấy', 'Quận Thanh Xuân', 'Quận Hoàng Mai', 'Quận Long Biên', 'Quận Nam Từ Liêm',
    'Quận Bắc Từ Liêm', 'Quận Hà Đông', 'Huyện Sóc Sơn', 'Huyện Đông Anh', 'Huyện Gia Lâm',
    'Huyện Thanh Trì', 'Huyện Thường Tín', 'Huyện Phú Xuyên', 'Thị xã Sơn Tây'
  ],
  '48': [ // Đà Nẵng
    'Quận Hải Châu', 'Quận Thanh Khê', 'Quận Sơn Trà', 'Quận Ngũ Hành Sơn', 'Quận Liên Chiểu',
    'Quận Cẩm Lệ', 'Huyện Hòa Vang', 'Huyện Hoàng Sa'
  ],
  '92': [ // Cần Thơ
    'Quận Ninh Kiều', 'Quận Ô Môn', 'Quận Bình Thủy', 'Quận Cái Răng', 'Quận Thốt Nốt',
    'Huyện Vĩnh Thạnh', 'Huyện Cờ Đỏ', 'Huyện Phong Điền', 'Huyện Thới Lai'
  ],
  '31': [ // Hải Phòng
    'Quận Hồng Bàng', 'Quận Ngô Quyền', 'Quận Lê Chân', 'Quận Hải An', 'Quận Kiến An',
    'Quận Đồ Sơn', 'Quận Dương Kinh', 'Huyện Thủy Nguyên', 'Huyện An Dương', 'Huyện An Lão'
  ],
  '75': [ // Bình Dương
    'Thành phố Thủ Dầu Một', 'Thị xã Bến Cát', 'Thị xã Tân Uyên', 'Thị xã Dĩ An', 
    'Thị xã Thuận An', 'Huyện Bàu Bàng', 'Huyện Dầu Tiếng', 'Huyện Bắc Tân Uyên', 'Huyện Phú Giáo'
  ],
  '77': [ // Đồng Nai
    'Thành phố Biên Hòa', 'Thành phố Long Khánh', 'Huyện Vĩnh Cửu', 'Huyện Tân Phú', 
    'Huyện Định Quán', 'Huyện Trảng Bom', 'Huyện Thống Nhất', 'Huyện Cẩm Mỹ',
    'Huyện Long Thành', 'Huyện Xuân Lộc', 'Huyện Nhơn Trạch'
  ]
};

interface LocationSelectorProps {
  selectedCityId?: string;
  selectedCityName?: string;
  selectedDistrict?: string;
  onLocationSelected?: (cityId: string, cityName: string, district?: string) => void;
  placeholder?: string;
  sx?: any;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({ 
  selectedCityId = '',
  selectedCityName = '',
  selectedDistrict = '',
  onLocationSelected,
  placeholder = 'Chọn tỉnh thành',
  sx = {}
}) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'city' | 'district'>('city');
  const [selectedCity, setSelectedCity] = useState<{id: string, name: string} | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [districtSearchQuery, setDistrictSearchQuery] = useState('');

  // Initialize selected city from props
  useEffect(() => {
    if (selectedCityId) {
      const city = CITIES.find(city => city.id === selectedCityId);
      if (city) {
        setSelectedCity(city);
      }
    } else if (selectedCityName) {
      const city = CITIES.find(city => city.name.toLowerCase() === selectedCityName.toLowerCase());
      if (city) {
        setSelectedCity(city);
      }
    }
  }, [selectedCityId, selectedCityName]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setActiveTab('city');
    setSearchQuery('');
    setDistrictSearchQuery('');
  };

  const handleCitySelect = (city: {id: string, name: string}) => {
    setSelectedCity(city);
    
    // If city has districts, show district selection
    if (DISTRICTS[city.id as keyof typeof DISTRICTS]?.length > 0) {
      setActiveTab('district');
    } else {
      // If no districts, complete selection
    if (onLocationSelected) {
        onLocationSelected(city.id, city.name);
      }
      handleClose();
    }
  };

  const handleDistrictSelect = (district: string) => {
    if (selectedCity && onLocationSelected) {
      onLocationSelected(selectedCity.id, selectedCity.name, district);
    }
    handleClose();
  };

  const handleBackToCity = () => {
    setActiveTab('city');
    setDistrictSearchQuery('');
  };

  const handleCompleteWithoutDistrict = () => {
    if (selectedCity && onLocationSelected) {
      onLocationSelected(selectedCity.id, selectedCity.name);
    }
    handleClose();
  };

  // Filter cities based on search query
  const filteredCities = CITIES.filter(city => 
    city.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get districts for selected city
  const cityDistricts = selectedCity && DISTRICTS[selectedCity.id as keyof typeof DISTRICTS] 
    ? DISTRICTS[selectedCity.id as keyof typeof DISTRICTS] 
    : [];
  
  // Filter districts based on search query
  const filteredDistricts = cityDistricts.filter(district => 
    district.toLowerCase().includes(districtSearchQuery.toLowerCase())
  );

  // Display name in the selector
  const displayName = (() => {
    if (selectedCityName && selectedDistrict) {
      return `${selectedDistrict}, ${selectedCityName}`;
    } else if (selectedCityName) {
      return selectedCityName;
    } else if (selectedCity?.name) {
      return selectedCity.name;
    }
    return placeholder;
  })();

  return (
    <>
      <Box 
        onClick={handleOpen}
        sx={{
          display: 'flex',
          position: 'relative',
          alignItems: 'center',
          padding: '8px 12px',
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          cursor: 'pointer',
          backgroundColor: 'white',
          transition: 'all 0.2s ease',
          height: '100%',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'rgba(0,0,0,0.01)',
          },
          ...sx
        }}
      >
        <LocationIcon sx={{ color: 'primary.main', mr: 1, fontSize: '1.2rem' }} />
        <Typography 
          sx={{ 
            flexGrow: 1, 
            fontSize: '0.95rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            color: (selectedCityName || selectedCity) ? 'text.primary' : 'text.secondary',
          }}
        >
          {displayName}
        </Typography>
        <KeyboardArrowDownIcon sx={{ ml: 0.5, fontSize: '1.2rem', color: 'text.secondary' }} />
      </Box>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="location-selector-modal"
        aria-describedby="select-a-location-for-search"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2
        }}
      >
        <Paper
          sx={{
            position: 'relative',
            width: '100%',
            maxWidth: 600,
            maxHeight: '90vh',
            overflow: 'hidden',
            p: 0,
            outline: 'none',
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Header */}
          <Box sx={{ 
            position: 'sticky', 
            top: 0, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            p: 2,
            backgroundColor: 'white',
            borderBottom: '1px solid #e0e0e0',
            zIndex: 10
          }}>
            <Typography variant="h6" component="h2">
              {activeTab === 'city' ? 'Chọn tỉnh/thành phố' : `Chọn quận/huyện tại ${selectedCity?.name}`}
            </Typography>
            <IconButton 
              onClick={handleClose}
              size="small"
              sx={{ ml: 2 }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Search box */}
          <Box sx={{ p: 2, backgroundColor: 'white' }}>
            <TextField
              fullWidth
              placeholder={activeTab === 'city' ? "Tìm kiếm tỉnh/thành phố..." : "Tìm kiếm quận/huyện..."}
              size="small"
              value={activeTab === 'city' ? searchQuery : districtSearchQuery}
              onChange={(e) => activeTab === 'city' ? setSearchQuery(e.target.value) : setDistrictSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Content */}
          <Box sx={{ 
            flexGrow: 1, 
            overflow: 'auto',
            maxHeight: '50vh',
            p: 0
          }}>
            {activeTab === 'city' ? (
              <List disablePadding>
                {filteredCities.map((city) => (
                  <React.Fragment key={city.id}>
                    <ListItem 
                      button 
                      onClick={() => handleCitySelect(city)}
                      selected={selectedCity?.id === city.id}
                    >
                      <ListItemText primary={city.name} />
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
                {filteredCities.length === 0 && (
                  <ListItem>
                    <ListItemText primary="Không tìm thấy kết quả phù hợp" />
                  </ListItem>
                )}
              </List>
            ) : (
              <List disablePadding>
                {filteredDistricts.map((district) => (
                  <React.Fragment key={district}>
                    <ListItem 
                      button 
                      onClick={() => handleDistrictSelect(district)}
                      selected={selectedDistrict === district}
                    >
                      <ListItemText primary={district} />
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
                {filteredDistricts.length === 0 && (
                  <ListItem>
                    <ListItemText primary="Không tìm thấy kết quả phù hợp" />
                  </ListItem>
                )}
              </List>
            )}
          </Box>
          
          {/* Footer */}
          <Box sx={{ 
            position: 'sticky', 
            bottom: 0,
            display: 'flex', 
            justifyContent: activeTab === 'district' ? 'space-between' : 'flex-end', 
            p: 2,
            backgroundColor: 'white',
            borderTop: '1px solid #e0e0e0',
          }}>
            {activeTab === 'district' && (
              <>
                <Button 
                  onClick={handleBackToCity} 
                  color="inherit"
                  startIcon={<KeyboardArrowDownIcon sx={{ transform: 'rotate(90deg)' }} />}
                >
                  Quay lại
                </Button>
                <Button 
                  onClick={handleCompleteWithoutDistrict} 
                  color="primary"
                  variant="contained"
                >
                  Chọn toàn {selectedCity?.name}
                </Button>
              </>
            )}
            {activeTab === 'city' && (
            <Button onClick={handleClose} color="inherit">
              Đóng
            </Button>
            )}
          </Box>
        </Paper>
      </Modal>
    </>
  );
};

export default LocationSelector; 