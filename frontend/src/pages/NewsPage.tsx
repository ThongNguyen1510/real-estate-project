import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Box, 
  Divider, 
  Chip,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Pagination,
  Skeleton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Search as SearchIcon, FilterList as FilterIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';

// Sample news data
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
  },
  {
    id: 4,
    title: 'Xu hướng thiết kế nội thất bất động sản cao cấp năm 2023',
    summary: 'Các dự án bất động sản cao cấp đang cập nhật những xu hướng thiết kế nội thất mới nhất, ưu tiên không gian sống xanh và công nghệ thông minh.',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cmVhbCUyMGVzdGF0ZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60',
    date: '05/09/2023',
    category: 'Thiết kế',
    author: 'Phạm Minh Tuấn'
  },
  {
    id: 5,
    title: 'Những thay đổi mới trong luật đất đai sẽ ảnh hưởng đến thị trường BĐS',
    summary: 'Dự thảo Luật Đất đai (sửa đổi) với nhiều điểm mới dự kiến sẽ tác động mạnh mẽ đến thị trường bất động sản khi được thông qua.',
    image: 'https://images.unsplash.com/photo-1592595896616-c37162298647?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cmVhbCUyMGVzdGF0ZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60',
    date: '20/08/2023',
    category: 'Pháp lý',
    author: 'Nguyễn Thành Trung'
  },
  {
    id: 6,
    title: 'Top 5 khu vực có tiềm năng tăng giá bất động sản trong năm 2024',
    summary: 'Các chuyên gia dự báo 5 khu vực tại Việt Nam có khả năng tăng giá bất động sản mạnh trong năm tới nhờ các yếu tố hạ tầng và quy hoạch.',
    image: 'https://images.unsplash.com/photo-1448630360428-65456885c650?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cmVhbCUyMGVzdGF0ZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60',
    date: '01/09/2023',
    category: 'Phân tích',
    author: 'Hoàng Anh Dũng'
  }
];

// Categories for filtering
const categories = [
  'Tất cả',
  'Thị trường',
  'Quy hoạch',
  'Tư vấn',
  'Thiết kế',
  'Pháp lý',
  'Phân tích'
];

const NewsPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [page, setPage] = useState<number>(1);
  
  // Total number of pages (for pagination)
  const totalPages = 3; // Mock value
  
  useEffect(() => {
    // Simulate API request
    setLoading(true);
    setTimeout(() => {
      setNews(mockNews);
      setLoading(false);
    }, 1000);
  }, [page]);
  
  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };
  
  // Handle category selection
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setPage(1); // Reset to first page when changing category
  };
  
  // Handle pagination change
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Filter news based on search query and category
  const filteredNews = news.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = selectedCategory === 'Tất cả' || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Tin tức bất động sản
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Cập nhật tin tức mới nhất về thị trường bất động sản và các xu hướng đầu tư
        </Typography>
      </Box>
      
      {/* Search and Filter */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Tìm kiếm tin tức..."
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {categories.map((category) => (
                <Chip
                  key={category}
                  label={category}
                  clickable
                  color={selectedCategory === category ? 'primary' : 'default'}
                  onClick={() => handleCategoryChange(category)}
                  sx={{ mb: 1 }}
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </Box>
      
      {/* Featured News (First item) */}
      {!loading && filteredNews.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Card sx={{ display: { xs: 'block', md: 'flex' }, height: { md: 400 } }}>
            <CardMedia
              component="img"
              sx={{ 
                width: { xs: '100%', md: '60%' },
                height: { xs: 240, md: '100%' },
                objectFit: 'cover'
              }}
              image={filteredNews[0].image}
              alt={filteredNews[0].title}
            />
            <CardContent sx={{ 
              width: { xs: '100%', md: '40%' }, 
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Chip 
                    label={filteredNews[0].category} 
                    color="primary" 
                    size="small" 
                  />
                  <Typography variant="caption" color="text.secondary">
                    {filteredNews[0].date}
                  </Typography>
                </Box>
                <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
                  {filteredNews[0].title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {filteredNews[0].summary}
                </Typography>
              </Box>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Tác giả: {filteredNews[0].author}
                </Typography>
                <Button 
                  variant="outlined" 
                  component={Link} 
                  to={`/tin-tuc/${filteredNews[0].id}`}
                >
                  Đọc tiếp
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}
      
      {/* News Grid */}
      <Grid container spacing={3}>
        {loading ? (
          // Skeleton loading
          Array.from(new Array(6)).map((_, index) => (
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
        ) : filteredNews.length > 0 ? (
          // Actual news items (skip the first one as it's already displayed)
          filteredNews.slice(1).map((newsItem) => (
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
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
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
                  <Typography variant="h6" component="h2" gutterBottom>
                    {newsItem.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                    {newsItem.summary}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                    <Typography variant="caption" color="text.secondary">
                      {newsItem.author}
                    </Typography>
                    <Button 
                      size="small" 
                      component={Link} 
                      to={`/tin-tuc/${newsItem.id}`}
                    >
                      Đọc tiếp
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          // No results
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <Typography variant="h6" color="text.secondary">
                Không tìm thấy tin tức nào phù hợp với tìm kiếm của bạn.
              </Typography>
              <Button 
                variant="outlined" 
                sx={{ mt: 2 }} 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('Tất cả');
                }}
              >
                Xóa bộ lọc
              </Button>
            </Box>
          </Grid>
        )}
      </Grid>
      
      {/* Pagination */}
      {!loading && filteredNews.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={handlePageChange} 
            color="primary" 
            size={isMobile ? 'small' : 'medium'} 
          />
        </Box>
      )}
    </Container>
  );
};

export default NewsPage; 