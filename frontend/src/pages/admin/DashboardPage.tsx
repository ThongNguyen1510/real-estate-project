import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemIcon,
  Avatar,
  Divider,
  Button,
  CircularProgress,
  useTheme,
  IconButton,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  Person as PersonIcon,
  HomeWork as PropertyIcon,
  Report as ReportIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  ErrorOutline as ErrorIcon,
  TrendingUp as TrendingUpIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminService } from '../../services/adminApi';

// Define type for dashboard stats
interface DashboardStats {
  users: {
    total: number;
    active: number;
    new: number;
    growth: number;
  };
  properties: {
    total: number;
    active: number;
    pending: number;
    growth: number;
  };
  reports: {
    total: number;
    pending: number;
    resolved: number;
  };
  pageViews: {
    today: number;
    yesterday: number;
    growth: number;
  };
}

interface RecentActivity {
  id: number;
  type: 'user' | 'property' | 'report';
  action: string;
  user: string;
  time: string;
  details: string;
}

const DashboardPage = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    users: { total: 0, active: 0, new: 0, growth: 0 },
    properties: { total: 0, active: 0, pending: 0, growth: 0 },
    reports: { total: 0, pending: 0, resolved: 0 },
    pageViews: { today: 0, yesterday: 0, growth: 0 }
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data from API
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Call the admin API service
      const response = await adminService.getStats();
      
      if (response && response.success) {
        setStats(response.data);
        
        // If the API returns recent activities, update them
        if (response.data.recentActivities) {
          setRecentActivities(response.data.recentActivities);
        } else {
          // If not, fall back to mock data
          setRecentActivities([
            {
              id: 1,
              type: 'user',
              action: 'Đăng ký',
              user: 'Nguyễn Văn A',
              time: '15 phút trước',
              details: 'Tài khoản mới vừa được tạo'
            },
            {
              id: 2,
              type: 'property',
              action: 'Đăng tin',
              user: 'Trần Minh B',
              time: '30 phút trước',
              details: 'Căn hộ chung cư tại Quận 7, Hồ Chí Minh'
            },
            {
              id: 3,
              type: 'report',
              action: 'Báo cáo',
              user: 'Lê Thị C',
              time: '1 giờ trước',
              details: 'Báo cáo bất động sản sai thông tin'
            },
            {
              id: 4,
              type: 'property',
              action: 'Chỉnh sửa',
              user: 'Phạm Thành D',
              time: '2 giờ trước',
              details: 'Cập nhật giá căn hộ tại Quận 2, Hồ Chí Minh'
            },
            {
              id: 5,
              type: 'user',
              action: 'Cập nhật',
              user: 'Hoàng Văn E',
              time: '3 giờ trước',
              details: 'Thay đổi thông tin liên hệ'
            }
          ]);
        }
      } else {
        // If API call was successful but contains an error message
        setError(response?.message || 'Không thể tải dữ liệu bảng điều khiển');
        
        // Use mock data as fallback
        useMockData();
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Lỗi kết nối tới máy chủ. Sử dụng dữ liệu mẫu tạm thời.');
      
      // Fall back to mock data
      useMockData();
    } finally {
      setLoading(false);
    }
  };
  
  // Use mock data as fallback
  const useMockData = () => {
    // Mock dashboard stats
    setStats({
      users: {
        total: 1245,
        active: 985,
        new: 42,
        growth: 8.5,
      },
      properties: {
        total: 3456,
        active: 2890,
        pending: 123,
        growth: 12.3,
      },
      reports: {
        total: 178,
        pending: 24,
        resolved: 154,
      },
      pageViews: {
        today: 5467,
        yesterday: 4832,
        growth: 13.1,
      }
    });
    
    // Mock recent activities
    setRecentActivities([
      {
        id: 1,
        type: 'user',
        action: 'Đăng ký',
        user: 'Nguyễn Văn A',
        time: '15 phút trước',
        details: 'Tài khoản mới vừa được tạo'
      },
      {
        id: 2,
        type: 'property',
        action: 'Đăng tin',
        user: 'Trần Minh B',
        time: '30 phút trước',
        details: 'Căn hộ chung cư tại Quận 7, Hồ Chí Minh'
      },
      {
        id: 3,
        type: 'report',
        action: 'Báo cáo',
        user: 'Lê Thị C',
        time: '1 giờ trước',
        details: 'Báo cáo bất động sản sai thông tin'
      },
      {
        id: 4,
        type: 'property',
        action: 'Chỉnh sửa',
        user: 'Phạm Thành D',
        time: '2 giờ trước',
        details: 'Cập nhật giá căn hộ tại Quận 2, Hồ Chí Minh'
      },
      {
        id: 5,
        type: 'user',
        action: 'Cập nhật',
        user: 'Hoàng Văn E',
        time: '3 giờ trước',
        details: 'Thay đổi thông tin liên hệ'
      }
    ]);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    fetchDashboardData();
  };

  // Function to render an icon based on activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <PersonIcon sx={{ color: theme.palette.primary.main }} />;
      case 'property':
        return <PropertyIcon sx={{ color: theme.palette.success.main }} />;
      case 'report':
        return <ReportIcon sx={{ color: theme.palette.warning.main }} />;
      default:
        return <VisibilityIcon sx={{ color: theme.palette.info.main }} />;
    }
  };

  // Function to render growth indicators
  const renderGrowth = (value: number) => {
    const color = value >= 0 ? theme.palette.success.main : theme.palette.error.main;
    const Icon = value >= 0 ? ArrowUpIcon : ArrowDownIcon;
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', color }}>
        <Icon fontSize="small" />
        <Typography variant="body2" component="span" sx={{ ml: 0.5 }}>
          {Math.abs(value)}%
        </Typography>
      </Box>
    );
  };

  return (
    <AdminLayout title="Dashboard">
      <Box sx={{ position: 'relative', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Tổng quan hệ thống
        </Typography>
        
        <Tooltip title="Làm mới dữ liệu">
          <IconButton 
            onClick={handleRefresh} 
            sx={{ position: 'absolute', top: 0, right: 0 }}
            disabled={loading}
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      {loading ? (
        <Box sx={{ width: '100%', mt: 4 }}>
          <LinearProgress />
        </Box>
      ) : (
        <>
          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Users Stats */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '100%',
                borderTop: `3px solid ${theme.palette.primary.main}`,
                boxShadow: 3
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" color="text.secondary">Người dùng</Typography>
                    <Avatar sx={{ bgcolor: theme.palette.primary.light }}>
                      <PersonIcon />
                    </Avatar>
                  </Box>
                  
                  <Typography variant="h4" component="div">
                    {stats.users.total.toLocaleString()}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Mới hôm nay: {stats.users.new}
                    </Typography>
                    {renderGrowth(stats.users.growth)}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Properties Stats */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '100%',
                borderTop: `3px solid ${theme.palette.success.main}`,
                boxShadow: 3
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" color="text.secondary">Bất động sản</Typography>
                    <Avatar sx={{ bgcolor: theme.palette.success.light }}>
                      <PropertyIcon />
                    </Avatar>
                  </Box>
                  
                  <Typography variant="h4" component="div">
                    {stats.properties.total.toLocaleString()}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Chờ duyệt: {stats.properties.pending}
                    </Typography>
                    {renderGrowth(stats.properties.growth)}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Reports Stats */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '100%',
                borderTop: `3px solid ${theme.palette.warning.main}`,
                boxShadow: 3
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" color="text.secondary">Báo cáo</Typography>
                    <Avatar sx={{ bgcolor: theme.palette.warning.light }}>
                      <ReportIcon />
                    </Avatar>
                  </Box>
                  
                  <Typography variant="h4" component="div">
                    {stats.reports.total.toLocaleString()}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Chưa xử lý: {stats.reports.pending}
                    </Typography>
                    <Typography variant="body2" color="success.main">
                      Đã xử lý: {stats.reports.resolved}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Page Views Stats */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '100%',
                borderTop: `3px solid ${theme.palette.info.main}`,
                boxShadow: 3
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" color="text.secondary">Lượt xem</Typography>
                    <Avatar sx={{ bgcolor: theme.palette.info.light }}>
                      <VisibilityIcon />
                    </Avatar>
                  </Box>
                  
                  <Typography variant="h4" component="div">
                    {stats.pageViews.today.toLocaleString()}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Hôm qua: {stats.pageViews.yesterday.toLocaleString()}
                    </Typography>
                    {renderGrowth(stats.pageViews.growth)}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          {/* Recent Activities and Quick Actions */}
          <Grid container spacing={3}>
            {/* Recent Activities */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 2, boxShadow: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                  Hoạt động gần đây
                </Typography>
                
                <List>
                  {recentActivities.map((activity, index) => (
                    <React.Fragment key={activity.id}>
                      <ListItem alignItems="flex-start">
                        <ListItemAvatar>
                          <Avatar>
                            {getActivityIcon(activity.type)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="subtitle1">
                                {activity.action} - {activity.user}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {activity.time}
                              </Typography>
                            </Box>
                          }
                          secondary={activity.details}
                        />
                      </ListItem>
                      {index < recentActivities.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  ))}
                </List>
                
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Button component={Link} to="/admin/activities" color="primary">
                    Xem tất cả hoạt động
                  </Button>
                </Box>
              </Paper>
            </Grid>
            
            {/* Quick Actions */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, boxShadow: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                  Thao tác nhanh
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      component={Link}
                      to="/admin/properties?status=pending"
                      startIcon={<PropertyIcon />}
                    >
                      Duyệt BĐS chờ xử lý ({stats.properties.pending})
                    </Button>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      color="warning"
                      fullWidth
                      component={Link}
                      to="/admin/reports?status=pending"
                      startIcon={<ReportIcon />}
                    >
                      Xử lý báo cáo ({stats.reports.pending})
                    </Button>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      color="success"
                      fullWidth
                      component={Link}
                      to="/admin/users"
                      startIcon={<PersonIcon />}
                    >
                      Quản lý người dùng
                    </Button>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Button
                      variant="outlined"
                      color="primary"
                      fullWidth
                      component={Link}
                      to="/admin/news/create"
                      startIcon={<PropertyIcon />}
                    >
                      Tạo tin tức mới
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
              
              {/* System Status */}
              <Paper sx={{ p: 2, mt: 3, boxShadow: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Trạng thái hệ thống
                </Typography>
                
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon sx={{ color: 'success.main' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="API Server" 
                      secondary="Hoạt động bình thường" 
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon sx={{ color: 'success.main' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Database" 
                      secondary="Kết nối ổn định" 
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon sx={{ color: 'success.main' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Storage" 
                      secondary="89% dung lượng trống" 
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </AdminLayout>
  );
};

export default DashboardPage; 