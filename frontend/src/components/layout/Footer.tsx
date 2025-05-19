import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Grid, 
  Typography, 
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  useTheme
} from '@mui/material';
import {
  Home as HomeIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Facebook as FacebookIcon,
  YouTube as YouTubeIcon,
  Instagram as InstagramIcon,
  Twitter as TwitterIcon
} from '@mui/icons-material';

const Footer: React.FC = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();
  
  return (
    <Box 
      component="footer" 
      sx={{ 
        bgcolor: 'primary.main',
        color: 'white',
        pt: 6,
        pb: 3,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>          {/* About section */}
          <Grid item xs={12} sm={6} md={3} id="gioi-thieu">
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                mb: 2,
                fontWeight: 'bold',
                position: 'relative',
                '&:after': {
                  content: '""',
                  display: 'block',
                  width: '40px',
                  height: '3px',
                  backgroundColor: theme.palette.secondary.main,
                  mt: 1
                }
              }}
            >
              Về BĐS Việt Nam
            </Typography>
            
            <Typography variant="body2" sx={{ mb: 2 }}>
              Chúng tôi cung cấp nền tảng đăng tin bất động sản uy tín, kết nối người mua và người bán, 
              giúp bạn tìm kiếm bất động sản phù hợp hoặc đăng tin quảng cáo hiệu quả.
            </Typography>
            
            <Box sx={{ mt: 2 }}>
              <IconButton 
                aria-label="facebook" 
                size="small"
                sx={{ 
                  mr: 1, 
                  bgcolor: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'secondary.main'
                  }
                }}
              >
                <FacebookIcon fontSize="small" />
              </IconButton>
              
              <IconButton 
                aria-label="twitter" 
                size="small"
                sx={{ 
                  mr: 1, 
                  bgcolor: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'secondary.main'
                  }
                }}
              >
                <TwitterIcon fontSize="small" />
              </IconButton>
              
              <IconButton 
                aria-label="youtube" 
                size="small"
                sx={{ 
                  mr: 1, 
                  bgcolor: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'secondary.main'
                  }
                }}
              >
                <YouTubeIcon fontSize="small" />
              </IconButton>
              
              <IconButton 
                aria-label="instagram" 
                size="small"
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'secondary.main'
                  }
                }}
              >
                <InstagramIcon fontSize="small" />
              </IconButton>
            </Box>
          </Grid>
          
          {/* Links section */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                mb: 2,
                fontWeight: 'bold',
                position: 'relative',
                '&:after': {
                  content: '""',
                  display: 'block',
                  width: '40px',
                  height: '3px',
                  backgroundColor: theme.palette.secondary.main,
                  mt: 1
                }
              }}
            >
              Liên kết nhanh
            </Typography>
            
            <List disablePadding>
              {[
                { text: 'Trang chủ', path: '/' },
                { text: 'Mua bán', path: '/mua-ban' },
                { text: 'Cho thuê', path: '/cho-thue' },
                { text: 'Tin tức', path: '/tin-tuc' },
                { text: 'Giới thiệu', path: '/gioi-thieu' },
                { text: 'Liên hệ', path: '/lien-he' },
              ].map((item) => (
                <ListItem 
                  key={item.path} 
                  component={Link} 
                  to={item.path}
                  disablePadding
                  sx={{
                    color: 'rgba(255,255,255,0.7)',
                    mb: 1,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      color: 'white',
                      pl: 1
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 30, color: 'inherit' }}>
                    <HomeIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
              ))}
            </List>
          </Grid>
            {/* Contact section */}
          <Grid item xs={12} sm={6} md={3} id="lien-he">
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                mb: 2,
                fontWeight: 'bold',
                position: 'relative',
                '&:after': {
                  content: '""',
                  display: 'block',
                  width: '40px',
                  height: '3px',
                  backgroundColor: theme.palette.secondary.main,
                  mt: 1
                }
              }}
            >
              Liên hệ
            </Typography>
            
            <List disablePadding>
              <ListItem disablePadding sx={{ mb: 2 }}>
                <ListItemIcon sx={{ minWidth: 30, color: 'rgba(255,255,255,0.9)' }}>
                  <LocationIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Địa chỉ" 
                  secondary="123 Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh"
                  primaryTypographyProps={{ fontSize: 14, fontWeight: 'medium' }}
                  secondaryTypographyProps={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}
                />
              </ListItem>
              
              <ListItem disablePadding sx={{ mb: 2 }}>
                <ListItemIcon sx={{ minWidth: 30, color: 'rgba(255,255,255,0.9)' }}>
                  <PhoneIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Điện thoại" 
                  secondary="(028) 1234 5678"
                  primaryTypographyProps={{ fontSize: 14, fontWeight: 'medium' }}
                  secondaryTypographyProps={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}
                />
              </ListItem>
              
              <ListItem disablePadding sx={{ mb: 2 }}>
                <ListItemIcon sx={{ minWidth: 30, color: 'rgba(255,255,255,0.9)' }}>
                  <EmailIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Email" 
                  secondary="info@bds.vn"
                  primaryTypographyProps={{ fontSize: 14, fontWeight: 'medium' }}
                  secondaryTypographyProps={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}
                />
              </ListItem>
            </List>
          </Grid>
          
          {/* Newsletter section */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                mb: 2,
                fontWeight: 'bold',
                position: 'relative',
                '&:after': {
                  content: '""',
                  display: 'block',
                  width: '40px',
                  height: '3px',
                  backgroundColor: theme.palette.secondary.main,
                  mt: 1
                }
              }}
            >
              Thời gian làm việc
            </Typography>
            
            <Typography variant="body2" paragraph>
              <strong>T2 - T6:</strong> 8:00 - 17:30
            </Typography>
            
            <Typography variant="body2" paragraph>
              <strong>T7:</strong> 8:00 - 12:00
            </Typography>
            
            <Typography variant="body2">
              <strong>CN:</strong> Nghỉ
            </Typography>
            
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                mt: 3,
                mb: 2,
                fontWeight: 'bold',
                position: 'relative',
                '&:after': {
                  content: '""',
                  display: 'block',
                  width: '40px',
                  height: '3px',
                  backgroundColor: theme.palette.secondary.main,
                  mt: 1
                }
              }}
            >
              Hotline hỗ trợ
            </Typography>
            
            <Typography 
              variant="h5" 
              sx={{ 
                color: theme.palette.secondary.main,
                fontWeight: 'bold'
              }}
            >
              1900 1234
            </Typography>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.1)' }} />
        
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            &copy; {currentYear} BĐSN Việt Nam. Tất cả các quyền được bảo lưu.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 