import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Button,
  Skeleton,
  useTheme
} from '@mui/material';
import { Link } from 'react-router-dom';
import { ArrowForward as ArrowForwardIcon } from '@mui/icons-material';

// Sample news data (same as NewsPage)
const mockNews = [
  {
    id: 1,
    title: 'Thị trường bất động sản phía Nam sôi động trở lại trong quý 3/2023',
    summary: 'Sau thời gian trầm lắng, thị trường bất động sản phía Nam bắt đầu có dấu hiệu khởi sắc với lượng giao dịch tăng 15% so với quý trước.',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cmVhbCUyMGVzdGF0ZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60',
    date: '15/09/2023',
    category: 'Thị trường',
    author: 'Nguyễn Văn A'
  },
  {
    id: 2,
    title: 'Đà Nẵng phê duyệt quy hoạch mới với nhiều khu đô thị sinh thái',
    summary: 'UBND thành phố Đà Nẵng vừa phê duyệt quy hoạch phân khu 1/2000 cho một số khu vực, mở ra cơ hội phát triển các dự án bất động sản sinh thái.',
    image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cmVhbCUyMGVzdGF0ZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60',
    date: '28/08/2023',
    category: 'Quy hoạch',
    author: 'Trần Bình'
  },
  {
    id: 3,
    title: 'Các yếu tố nên cân nhắc trước khi mua căn hộ chung cư',
    summary: 'Chuyên gia bất động sản chia sẻ những lưu ý quan trọng giúp người mua tránh những rủi ro khi đầu tư vào căn hộ chung cư.',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cmVhbCUyMGVzdGF0ZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60',
    date: '10/09/2023',
    category: 'Tư vấn',
    author: 'Lê Thị Hương'
  }
];

const HomeNews: React.FC = () => {
  const theme = useTheme();
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    // Simulate API request
    setLoading(true);
    setTimeout(() => {
      setNews(mockNews);
      setLoading(false);
    }, 1000);
  }, []);
  
  return (
    <Box sx={{ py: 8, bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography 
            variant="h4" 
            component="h2" 
            sx={{ 
              fontWeight: 'bold',
              mb: 1,
              position: 'relative',
              display: 'inline-block',
              '&:after': {
                content: '""',
                display: 'block',
                width: 80,
                height: 3,
                backgroundColor: theme.palette.secondary.main,
                position: 'absolute',
                bottom: -12,
                left: '50%',
                transform: 'translateX(-50%)'
              }
            }}
          >
            Tin tức bất động sản
          </Typography>
          
          <Typography 
            variant="subtitle1" 
            color="text.secondary"
            sx={{ 
              mt: 3, 
              mb: 4,
              maxWidth: 700,
              mx: 'auto'
            }}
          >
            Cập nhật tin tức mới nhất về thị trường bất động sản và các xu hướng đầu tư
          </Typography>
        </Box>
        
        {/* News Grid */}
        <Grid container spacing={3}>
          {loading ? (
            // Skeleton loading
            Array.from(new Array(3)).map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Skeleton variant="rectangular" height={200} />
                  <CardContent>
                    <Skeleton variant="text" height={30} />
                    <Skeleton variant="text" height={20} />
                    <Skeleton variant="text" height={100} />
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            // Actual news items
            news.map((newsItem) => (
              <Grid item xs={12} sm={6} md={4} key={newsItem.id}>
                <Card sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 6
                  }
                }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={newsItem.image}
                    alt={newsItem.title}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Chip 
                        label={newsItem.category} 
                        size="small" 
                        sx={{ fontSize: '0.7rem' }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {newsItem.date}
                      </Typography>
                    </Box>
                    <Typography variant="h6" component="h3" gutterBottom sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      height: '3rem'
                    }}>
                      {newsItem.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ 
                      mb: 2, 
                      flexGrow: 1,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {newsItem.summary}
                    </Typography>
                    <Button 
                      size="small" 
                      component={Link} 
                      to={`/tin-tuc/${newsItem.id}`}
                      sx={{ mt: 'auto' }}
                    >
                      Đọc tiếp
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
        
        {/* View All Button */}
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button 
            variant="outlined" 
            color="primary" 
            component={Link} 
            to="/tin-tuc"
            endIcon={<ArrowForwardIcon />}
            sx={{ px: 3, py: 1 }}
          >
            Xem tất cả tin tức
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default HomeNews; 