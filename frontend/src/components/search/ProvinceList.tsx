import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Paper, 
  Link,
  useTheme,
  Divider
} from '@mui/material';
import { locationService } from '../../services/api';

interface Province {
  id: string;
  name: string;
}

interface ProvinceListProps {
  onProvinceSelected?: (id: string, name: string) => void;
}

// Top popular provinces with their image paths
const POPULAR_PROVINCES = [
  { id: '79', name: 'Hồ Chí Minh', image: '/img/cities/ho-chi-minh.jpg' },
  { id: '01', name: 'Hà Nội', image: '/img/cities/ha-noi.jpg' },
  { id: '48', name: 'Đà Nẵng', image: '/img/cities/da-nang.jpg' },
  { id: '56', name: 'Bình Dương', image: '/img/cities/binh-duong.jpg' },
  { id: '31', name: 'Đồng Nai', image: '/img/cities/dong-nai.jpg' },
  { id: '92', name: 'Khánh Hòa', image: '/img/cities/khanh-hoa.jpg' },
];

const ProvinceList: React.FC<ProvinceListProps> = ({ onProvinceSelected }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        setLoading(true);
        const response = await locationService.getCities();
        
        if (response.success && Array.isArray(response.data)) {
          // Sort provinces alphabetically
          const sortedProvinces = [...response.data].sort((a, b) => 
            a.name.localeCompare(b.name, 'vi')
          );
          setProvinces(sortedProvinces);
        } else {
          console.error('Failed to fetch provinces:', response);
          // Fallback to mock data if API fails
          setProvinces([
            { id: '01', name: 'Hà Nội' },
            { id: '79', name: 'Hồ Chí Minh' },
            { id: '48', name: 'Đà Nẵng' },
            { id: '92', name: 'Cần Thơ' },
            { id: '31', name: 'Hải Phòng' },
            // Add more fallback provinces as needed
          ]);
        }
      } catch (error) {
        console.error('Error fetching provinces:', error);
        // Fallback to mock data if API fails
        setProvinces([
          { id: '01', name: 'Hà Nội' },
          { id: '79', name: 'Hồ Chí Minh' },
          { id: '48', name: 'Đà Nẵng' },
          { id: '92', name: 'Cần Thơ' },
          { id: '31', name: 'Hải Phòng' },
          // Add more fallback provinces as needed
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchProvinces();
  }, []);

  const handleProvinceClick = (provinceId: string, provinceName: string) => {
    if (onProvinceSelected) {
      onProvinceSelected(provinceId, provinceName);
    } else {
      navigate(`/tim-kiem?city=${provinceId}&city_name=${encodeURIComponent(provinceName)}`);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Popular Provinces Section */}
        <Box sx={{ mb: 5 }}>
          <Typography 
            variant="h5" 
            component="h2" 
            gutterBottom 
            fontWeight="bold"
            sx={{ mb: 3 }}
          >
            Tỉnh thành nổi bật
          </Typography>
          
          <Grid container spacing={3}>
            {POPULAR_PROVINCES.map((province) => (
              <Grid item xs={6} sm={4} md={2} key={province.id}>
                <Paper 
                  elevation={2}
                  sx={{
                    borderRadius: 2,
                    overflow: 'hidden',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 6
                    }
                  }}
                  onClick={() => handleProvinceClick(province.id, province.name)}
                >
                  <Box 
                    sx={{ 
                      height: 120, 
                      backgroundImage: `url(${province.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0,0,0,0.3)',
                      }
                    }}
                  >
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        bottom: 0, 
                        left: 0, 
                        width: '100%',
                        p: 1,
                        zIndex: 1
                      }}
                    >
                      <Typography 
                        variant="subtitle1" 
                        component="h3"
                        sx={{ 
                          color: 'white', 
                          textAlign: 'center', 
                          fontWeight: 'bold',
                          textShadow: '1px 1px 3px rgba(0,0,0,0.7)'
                        }}
                      >
                        {province.name}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* All Provinces Section */}
        <Box>
          <Typography 
            variant="h5" 
            component="h2" 
            gutterBottom 
            fontWeight="bold"
            sx={{ mb: 3 }}
          >
            Tất cả tỉnh thành
          </Typography>

          {loading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography>Đang tải danh sách tỉnh thành...</Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {provinces.map((province) => (
                <Grid item xs={6} sm={4} md={3} key={province.id}>
                  <Link
                    component="button"
                    variant="body1"
                    underline="hover"
                    color="inherit"
                    onClick={() => handleProvinceClick(province.id, province.name)}
                    sx={{ 
                      display: 'block', 
                      textAlign: 'left',
                      py: 0.5,
                      color: theme.palette.text.primary,
                      '&:hover': {
                        color: theme.palette.primary.main
                      }
                    }}
                  >
                    {province.name}
                  </Link>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default ProvinceList; 