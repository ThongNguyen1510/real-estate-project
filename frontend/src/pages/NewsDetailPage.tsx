import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Chip,
  Divider,
  Button,
  Grid,
  Paper,
  Avatar,
  Card,
  CardContent,
  CardMedia,
  Skeleton,
  Breadcrumbs,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  NavigateNext as NavigateNextIcon,
  AccessTime as AccessTimeIcon,
  AccountCircle as AccountCircleIcon,
  Category as CategoryIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

// Sample news data (same as NewsPage)
const mockNews = [
  {
    id: 1,
    title: 'Thị trường bất động sản phía Nam sôi động trở lại trong quý 3/2023',
    summary: 'Sau thời gian trầm lắng, thị trường bất động sản phía Nam bắt đầu có dấu hiệu khởi sắc với lượng giao dịch tăng 15% so với quý trước.',
    content: `<p>Theo báo cáo mới nhất từ các công ty nghiên cứu thị trường bất động sản, thị trường phía Nam đặc biệt là TP.HCM và các tỉnh lân cận như Bình Dương, Đồng Nai, Long An đã ghi nhận những tín hiệu phục hồi tích cực trong quý 3/2023.</p>

<p>Cụ thể, lượng giao dịch căn hộ chung cư tại TP.HCM tăng 15% so với quý trước và tăng 23% so với cùng kỳ năm ngoái. Giá bán trung bình cũng tăng nhẹ khoảng 3-5% tùy phân khúc. Đáng chú ý, phân khúc căn hộ trung cấp có mức tăng giá ổn định nhất, khoảng 5-7% so với đầu năm.</p>

<p>Ông Nguyễn Văn A, Giám đốc một sàn giao dịch bất động sản tại TP.HCM cho biết: "Thị trường đang có dấu hiệu phục hồi rõ rệt. Người mua đã bắt đầu quay trở lại sau giai đoạn trầm lắng kéo dài từ cuối năm 2022. Niềm tin vào thị trường đang dần được củng cố, đặc biệt là khi lãi suất ngân hàng đã giảm và chính sách cho vay mua nhà cũng linh hoạt hơn."</p>

<p>Đáng chú ý, các dự án thuộc các chủ đầu tư uy tín, có pháp lý minh bạch vẫn thu hút được sự quan tâm của người mua dù giá không giảm. Nhiều dự án mở bán trong quý 3/2023 đã ghi nhận tỷ lệ hấp thụ từ 60-70%, cao hơn nhiều so với mức 30-40% của quý trước.</p>

<p>Bên cạnh đó, thị trường đất nền tại các tỉnh vệ tinh cũng có dấu hiệu ấm lên. Các khu vực có quy hoạch hạ tầng rõ ràng, tiến độ triển khai dự án đúng kế hoạch vẫn thu hút nhà đầu tư. Tuy nhiên, giá đất nền chưa có sự tăng trưởng đáng kể do nguồn cung khá dồi dào.</p>

<p>Các chuyên gia dự báo, thị trường bất động sản phía Nam sẽ tiếp tục đà phục hồi trong quý 4/2023 nhưng với tốc độ chậm và ổn định hơn. Các yếu tố hỗ trợ thị trường bao gồm: lãi suất vay mua nhà giảm, nhiều dự án luật liên quan đến bất động sản dự kiến được thông qua, và đặc biệt là sự đẩy mạnh giải ngân vốn đầu tư công vào các dự án hạ tầng trọng điểm.</p>`,
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cmVhbCUyMGVzdGF0ZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60',
    date: '15/09/2023',
    category: 'Thị trường',
    author: 'Nguyễn Văn A',
    relatedTags: ['Thị trường BĐS', 'TP.HCM', 'Phục hồi', 'Căn hộ']
  },
  {
    id: 2,
    title: 'Đà Nẵng phê duyệt quy hoạch mới với nhiều khu đô thị sinh thái',
    summary: 'UBND thành phố Đà Nẵng vừa phê duyệt quy hoạch phân khu 1/2000 cho một số khu vực, mở ra cơ hội phát triển các dự án bất động sản sinh thái.',
    content: `<p>UBND thành phố Đà Nẵng vừa phê duyệt quy hoạch phân khu 1/2000 cho khu vực phía Tây Bắc thành phố, với tổng diện tích hơn 750 hecta. Đây là một động thái quan trọng mở ra cơ hội phát triển các dự án bất động sản sinh thái tại địa phương này.</p>

<p>Theo quy hoạch mới, khu vực này sẽ được phát triển theo hướng đô thị sinh thái, thông minh với mật độ xây dựng thấp (khoảng 35-40%), ưu tiên không gian xanh và hệ thống giao thông kết nối thông minh.</p>

<p>Ông Trần Bình, Giám đốc Sở Xây dựng Đà Nẵng cho biết: "Quy hoạch lần này nhằm phát triển không gian đô thị theo hướng bền vững, thân thiện với môi trường, phù hợp với định hướng phát triển Đà Nẵng trở thành thành phố môi trường, thành phố đáng sống."</p>

<p>Theo quy hoạch, khu vực này sẽ có 5 phân khu chính: khu đô thị sinh thái ven sông, khu đô thị thương mại dịch vụ, khu đô thị nghỉ dưỡng cao cấp, khu công viên chuyên đề và khu bảo tồn sinh thái.</p>

<p>Đặc biệt, quy hoạch lần này chú trọng phát triển các không gian công cộng, với hệ thống công viên cây xanh chiếm tới 25% tổng diện tích quy hoạch. Bên cạnh đó, hệ thống giao thông nội khu cũng được thiết kế thông minh với các làn đường dành riêng cho xe đạp, đi bộ và phương tiện công cộng.</p>

<p>Các chuyên gia bất động sản đánh giá, quy hoạch mới này sẽ tạo điều kiện thuận lợi cho việc phát triển các dự án bất động sản cao cấp, hướng đến phân khúc khách hàng có nhu cầu sống trong môi trường sinh thái, gần gũi với thiên nhiên.</p>

<p>Dự kiến, sau khi quy hoạch được công bố, nhiều doanh nghiệp bất động sản lớn sẽ tham gia đấu thầu để được phát triển dự án tại khu vực này. Giá bất động sản tại các khu vực lân cận cũng được dự báo sẽ tăng từ 20-30% trong thời gian tới.</p>`,
    image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cmVhbCUyMGVzdGF0ZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60',
    date: '28/08/2023',
    category: 'Quy hoạch',
    author: 'Trần Bình',
    relatedTags: ['Đà Nẵng', 'Quy hoạch', 'Đô thị sinh thái', 'Phân khu 1/2000']
  },
  // Thêm dữ liệu mẫu cho các bài viết khác tương tự...
];

// Sample related news (other news in same category)
const getRelatedNews = (currentId: number, category: string) => {
  return mockNews.filter(item => item.id !== currentId && item.category === category).slice(0, 3);
};

const NewsDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [newsItem, setNewsItem] = useState<any | null>(null);
  const [relatedNews, setRelatedNews] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    window.scrollTo(0, 0);
    
    // Simulate API request to get news detail
    setTimeout(() => {
      const foundNews = mockNews.find(item => item.id === parseInt(id || '0'));
      if (foundNews) {
        setNewsItem(foundNews);
        setRelatedNews(getRelatedNews(foundNews.id, foundNews.category));
      }
      setLoading(false);
    }, 1000);
  }, [id]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="text" height={40} width="70%" />
        <Skeleton variant="text" height={30} width="50%" sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={400} sx={{ mb: 3 }} />
        <Box sx={{ mb: 3 }}>
          {Array.from(new Array(5)).map((_, index) => (
            <Skeleton key={index} variant="text" height={30} sx={{ mb: 1 }} />
          ))}
        </Box>
      </Container>
    );
  }

  if (!newsItem) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" gutterBottom>
            Không tìm thấy bài viết
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            component={Link} 
            to="/tin-tuc"
            startIcon={<ArrowBackIcon />}
            sx={{ mt: 2 }}
          >
            Quay lại trang tin tức
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />} 
        aria-label="breadcrumb"
        sx={{ mb: 2 }}
      >
        <Link to="/" style={{ textDecoration: 'none', color: theme.palette.text.secondary }}>
          Trang chủ
        </Link>
        <Link to="/tin-tuc" style={{ textDecoration: 'none', color: theme.palette.text.secondary }}>
          Tin tức
        </Link>
        <Typography color="text.primary">{newsItem.title.substring(0, 30)}...</Typography>
      </Breadcrumbs>
      
      {/* News Title and Meta */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          component="h1" 
          gutterBottom 
          fontWeight="bold"
        >
          {newsItem.title}
        </Typography>
        
        <Box 
          sx={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 2,
            mb: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {newsItem.date}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AccountCircleIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {newsItem.author}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CategoryIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
            <Chip 
              label={newsItem.category} 
              size="small" 
              color="primary"
              sx={{ height: 24 }}
            />
          </Box>
        </Box>
        
        <Typography 
          variant="subtitle1" 
          sx={{ 
            fontStyle: 'italic',
            color: 'text.secondary',
            mb: 3
          }}
        >
          {newsItem.summary}
        </Typography>
      </Box>
      
      {/* Featured Image */}
      <Box
        component="img"
        src={newsItem.image}
        alt={newsItem.title}
        sx={{
          width: '100%',
          height: { xs: 250, sm: 400, md: 500 },
          objectFit: 'cover',
          borderRadius: 2,
          mb: 4
        }}
      />
      
      {/* Main Content */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {/* News Content */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: { xs: 2, sm: 3 }, 
              borderRadius: 2,
              bgcolor: 'background.paper',
              mb: 4
            }}
          >
            <Box 
              className="news-content"
              sx={{
                '& p': {
                  mb: 2,
                  lineHeight: 1.8
                },
                '& h2, & h3, & h4': {
                  mt: 3,
                  mb: 2
                }
              }}
              dangerouslySetInnerHTML={{ __html: newsItem.content }}
            />
            
            {/* Tags */}
            <Box sx={{ mt: 4 }}>
              <Typography 
                variant="subtitle2" 
                component="span" 
                sx={{ mr: 2 }}
              >
                Tags:
              </Typography>
              {newsItem.relatedTags.map((tag: string) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  sx={{ mr: 1, mb: 1 }}
                  clickable
                  component={Link}
                  to={`/tin-tuc?tag=${tag}`}
                />
              ))}
            </Box>
          </Paper>
          
          {/* Author Box */}
          <Paper 
            elevation={1}
            sx={{
              p: 3,
              borderRadius: 2,
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'center', sm: 'flex-start' },
              gap: 2,
              mb: 4
            }}
          >
            <Avatar
              sx={{ 
                width: { xs: 60, sm: 80 }, 
                height: { xs: 60, sm: 80 }
              }}
            >
              {newsItem.author.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h6" component="h3" gutterBottom>
                {newsItem.author}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Chuyên gia trong lĩnh vực bất động sản với hơn 10 năm kinh nghiệm. Nhà phân tích thị trường và cố vấn đầu tư cho nhiều dự án bất động sản lớn tại Việt Nam.
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          {/* Related News Sidebar */}
          <Paper 
            elevation={1}
            sx={{
              p: 2,
              borderRadius: 2,
              mb: 3
            }}
          >
            <Typography 
              variant="h6" 
              component="h3" 
              sx={{ mb: 2, pb: 1, borderBottom: `1px solid ${theme.palette.divider}` }}
            >
              Tin liên quan
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {relatedNews.map((item) => (
                <Card 
                  key={item.id}
                  sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row', md: 'column' },
                    height: 'auto',
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 3
                    }
                  }}
                  component={Link}
                  to={`/tin-tuc/${item.id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <CardMedia
                    component="img"
                    sx={{ 
                      width: { xs: '100%', sm: 120, md: '100%' },
                      height: { xs: 140, sm: 120, md: 140 }
                    }}
                    image={item.image}
                    alt={item.title}
                  />
                  <CardContent sx={{ flex: 1, p: 2 }}>
                    <Typography variant="subtitle2" component="div" gutterBottom noWrap>
                      {item.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.date}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
            
            <Button 
              fullWidth 
              variant="outlined" 
              component={Link} 
              to="/tin-tuc"
              sx={{ mt: 2 }}
            >
              Xem tất cả
            </Button>
          </Paper>
          
          {/* Categories Box */}
          <Paper 
            elevation={1}
            sx={{
              p: 2,
              borderRadius: 2,
              mb: 3
            }}
          >
            <Typography 
              variant="h6" 
              component="h3" 
              sx={{ mb: 2, pb: 1, borderBottom: `1px solid ${theme.palette.divider}` }}
            >
              Chuyên mục
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {['Thị trường', 'Quy hoạch', 'Tư vấn', 'Thiết kế', 'Pháp lý', 'Phân tích'].map((category) => (
                <Button 
                  key={category}
                  component={Link}
                  to={`/tin-tuc?category=${category}`}
                  color="inherit"
                  sx={{ 
                    justifyContent: 'flex-start',
                    py: 1,
                    borderRadius: 1,
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                >
                  <CategoryIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                  {category}
                </Button>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Navigation Buttons */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          mt: 4,
          pt: 2,
          borderTop: `1px solid ${theme.palette.divider}`
        }}
      >
        <Button 
          variant="outlined" 
          component={Link} 
          to="/tin-tuc"
          startIcon={<ArrowBackIcon />}
        >
          Quay lại
        </Button>
      </Box>
    </Container>
  );
};

export default NewsDetailPage; 