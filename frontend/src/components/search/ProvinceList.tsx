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
  Divider,
  CircularProgress
} from '@mui/material';
import { fetchAllProvinces, Province, formatLocationCode } from '../../utils/locationUtils';
import { getImageUrl } from '../../utils/imageUtils';

interface ProvinceData {
  id: string;
  name: string;
  image?: string;
  listings?: string;
  size?: number;
}

interface ProvinceListProps {
  onProvinceSelected?: (id: string, name: string) => void;
}

// Top popular provinces with their image paths and listing counts
const POPULAR_PROVINCES = [
  { id: '79', name: 'TP. Hồ Chí Minh', image: getImageUrl('img/cities/ho-chi-minh.jpg'), listings: '61.330 tin đăng', size: 6 },
  { id: '1', name: 'Hà Nội', image: getImageUrl('img/cities/ha-noi.jpg'), listings: '60.805 tin đăng', size: 3 },
  { id: '48', name: 'Đà Nẵng', image: getImageUrl('img/cities/da-nang.jpg'), listings: '9.989 tin đăng', size: 3 },
  { id: '75', name: 'Bình Dương', image: getImageUrl('img/cities/binh-duong.jpg'), listings: '7.624 tin đăng', size: 3 },
  { id: '77', name: 'Đồng Nai', image: getImageUrl('img/cities/dong-nai.jpg'), listings: '4.470 tin đăng', size: 3 },
];

const ProvinceList: React.FC<ProvinceListProps> = ({ onProvinceSelected }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [provinces, setProvinces] = useState<ProvinceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch provinces from the Vietnam Provinces API
        const provincesData = await fetchAllProvinces();
        
        if (provincesData && Array.isArray(provincesData)) {
          // Convert to our component's expected format
          const formattedProvinces = provincesData.map((province: Province) => ({
            id: formatLocationCode(province.code),
            name: province.name
          }));
          
          // Sort alphabetically
          const sortedProvinces = [...formattedProvinces].sort((a, b) => 
            a.name.localeCompare(b.name, 'vi')
          );
          
          setProvinces(sortedProvinces);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching provinces:', error);
        setError('Không thể tải danh sách tỉnh thành. Vui lòng thử lại sau.');
        // Use fallback data if API fails
        setProvinces([
          { id: '1', name: 'Hà Nội' },
          { id: '79', name: 'Hồ Chí Minh' },
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
          { id: '82', name: 'Tiền Giang' },
          { id: '80', name: 'Bà Rịa - Vũng Tàu' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchProvinces();
  }, []);

  const handleProvinceClick = (provinceId: string, provinceName: string) => {
    console.log(`ProvinceList: selected province ${provinceName} with id=${provinceId}`);
    
    if (onProvinceSelected) {
      onProvinceSelected(provinceId, provinceName);
    } else {
      // Use only city ID to avoid conflicts
      const searchParams = new URLSearchParams();
      searchParams.set('city', provinceId);
      
      console.log(`Redirecting to search with city=${provinceId}`);
      navigate(`/tim-kiem?${searchParams.toString()}`);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Popular Provinces Section - New Design */}
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
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
                <Paper 
                elevation={1}
                  sx={{
                  borderRadius: 1,
                    overflow: 'hidden',
                  height: 280,
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    cursor: 'pointer',
                  position: 'relative',
                    '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                    }
                  }}
                onClick={() => handleProvinceClick(POPULAR_PROVINCES[0].id, POPULAR_PROVINCES[0].name)}
              >
                {/* Image */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.2) 100%)',
                      zIndex: 1
                    }
                  }}
                >
                  <img 
                    src={POPULAR_PROVINCES[0].image} 
                    alt={POPULAR_PROVINCES[0].name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </Box>
                
                <Box 
                  sx={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    padding: 3,
                    zIndex: 2,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start'
                  }}
                >
                  <Typography 
                    variant="h4" 
                    component="h3"
                    sx={{ 
                      color: 'white', 
                      fontWeight: 'bold',
                      mb: 1,
                      textShadow: '1px 1px 3px rgba(0,0,0,0.7)'
                    }}
                  >
                    {POPULAR_PROVINCES[0].name}
                  </Typography>
                  
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'white',
                      textShadow: '1px 1px 2px rgba(0,0,0,0.7)'
                    }}
                  >
                    {POPULAR_PROVINCES[0].listings}
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Grid container spacing={2}>
                {POPULAR_PROVINCES.slice(1).map((province, index) => (
                  <Grid item xs={12} sm={6} key={province.id}>
                    <Paper 
                      elevation={1}
                      sx={{
                        borderRadius: 1,
                        overflow: 'hidden',
                        height: 132,
                        transition: 'transform 0.3s, box-shadow 0.3s',
                        cursor: 'pointer',
                      position: 'relative',
                        '&:hover': {
                          transform: 'scale(1.02)',
                          boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                        }
                      }}
                      onClick={() => handleProvinceClick(province.id, province.name)}
                    >
                      {/* Image */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.2) 100%)',
                            zIndex: 1
                          }
                        }}
                      >
                        <img 
                          src={province.image} 
                          alt={province.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      </Box>
                      
                      <Box 
                        sx={{ 
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          padding: 2,
                          zIndex: 2,
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'flex-start'
                        }}
                      >
                        <Typography 
                          variant="h6" 
                          component="h3"
                          sx={{ 
                            color: 'white', 
                            fontWeight: 'bold',
                            mb: 0.5,
                            textShadow: '1px 1px 3px rgba(0,0,0,0.7)'
                          }}
                        >
                          {province.name}
                        </Typography>
                        
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: 'white',
                            textShadow: '1px 1px 2px rgba(0,0,0,0.7)'
                          }}
                        >
                          {province.listings}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Box>
        
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
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error" sx={{ textAlign: 'center', py: 4 }}>
              {error}
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {provinces.map((province) => (
                <Grid item xs={6} sm={4} md={3} lg={2} key={province.id}>
                  <Link
                    component="button"
                    underline="hover"
                    onClick={() => handleProvinceClick(province.id, province.name)}
                    sx={{
                      color: 'text.primary',
                      textAlign: 'left',
                      display: 'block',
                      width: '100%',
                      py: 0.8,
                      px: 0.5,
                      '&:hover': {
                        color: 'primary.main'
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