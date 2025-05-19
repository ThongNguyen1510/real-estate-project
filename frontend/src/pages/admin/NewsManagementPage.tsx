import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Paper,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Pagination,
  Tooltip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import { adminService } from '../../services/adminApi';
import { useNavigate } from 'react-router-dom';

interface NewsItem {
  id: number;
  title: string;
  summary: string;
  content: string;
  image_url: string;
  category_id: number;
  category_name: string;
  author_id: number;
  author_name: string;
  created_at: string;
  updated_at: string;
  status: string;
}

interface Category {
  id: number;
  name: string;
}

const NewsManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [tabValue, setTabValue] = useState<number>(0);

  // Form state
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [currentNews, setCurrentNews] = useState<NewsItem | null>(null);
  const [title, setTitle] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [status, setStatus] = useState<string>('published');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  // Confirmation dialog
  const [openConfirmDialog, setOpenConfirmDialog] = useState<boolean>(false);
  const [newsToDelete, setNewsToDelete] = useState<number | null>(null);

  // Notification state
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  // Validation
  const [errors, setErrors] = useState<{
    title?: string;
    summary?: string;
    content?: string;
    category_id?: string;
    image_url?: string;
    status?: string;
  }>({});

  // Load news and categories on page load
  useEffect(() => {
    fetchNews();
    fetchCategories();
  }, [page, tabValue]);

  const fetchNews = async () => {
    setLoading(true);
    try {
      let statusFilter = '';
      if (tabValue === 1) {
        statusFilter = 'published';
      } else if (tabValue === 2) {
        statusFilter = 'draft';
      }
      
      const response = await adminService.getNews(page, 10, searchQuery, statusFilter);
      if (response.success) {
        setNews(response.data.news);
        setTotalPages(response.data.total_pages);
      } else {
        showSnackbar(response.message || 'Lỗi khi tải danh sách tin tức', 'error');
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      showSnackbar('Đã xảy ra lỗi khi tải danh sách tin tức', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await adminService.getNewsCategories();
      if (response.success) {
        setCategories(response.data);
      } else {
        console.error('Failed to fetch categories:', response.message);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSearch = () => {
    setPage(1);
    fetchNews();
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setPage(1); // Reset to first page when changing tabs
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  // Open dialog for create/edit
  const handleOpenDialog = (mode: 'create' | 'edit', newsItem?: NewsItem) => {
    setFormMode(mode);
    setErrors({});
    
    if (mode === 'edit' && newsItem) {
      setCurrentNews(newsItem);
      setTitle(newsItem.title);
      setSummary(newsItem.summary);
      setContent(newsItem.content);
      setCategoryId(newsItem.category_id);
      setStatus(newsItem.status);
      setImageUrl(newsItem.image_url);
      setImagePreview(newsItem.image_url);
    } else {
      setCurrentNews(null);
      setTitle('');
      setSummary('');
      setContent('');
      setCategoryId('');
      setStatus('published');
      setImageUrl('');
      setImageFile(null);
      setImagePreview('');
    }
    
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const validateForm = () => {
    const newErrors: any = {};
    
    if (!title.trim()) newErrors.title = 'Tiêu đề không được để trống';
    if (!summary.trim()) newErrors.summary = 'Tóm tắt không được để trống';
    if (!content.trim()) newErrors.content = 'Nội dung không được để trống';
    if (!categoryId) newErrors.category_id = 'Vui lòng chọn danh mục';
    if (!imageUrl && !imageFile) newErrors.image_url = 'Vui lòng chọn ảnh hoặc nhập URL ảnh';
    if (!status) newErrors.status = 'Vui lòng chọn trạng thái';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setImageFile(file);
      setImageUrl('');
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('summary', summary);
      formData.append('content', content);
      formData.append('category_id', categoryId.toString());
      formData.append('status', status);
      
      if (imageFile) {
        formData.append('image', imageFile);
      } else if (imageUrl) {
        formData.append('image_url', imageUrl);
      }
      
      let response;
      
      if (formMode === 'create') {
        response = await adminService.createNews(formData);
        if (response.success) {
          showSnackbar('Tạo tin tức thành công', 'success');
        }
      } else if (formMode === 'edit' && currentNews) {
        response = await adminService.updateNews(currentNews.id, formData);
        if (response.success) {
          showSnackbar('Cập nhật tin tức thành công', 'success');
        }
      }
      
      handleCloseDialog();
      fetchNews();
    } catch (error) {
      console.error('Error saving news:', error);
      showSnackbar('Đã xảy ra lỗi khi lưu tin tức', 'error');
    }
  };

  // Handle delete confirmation
  const handleOpenConfirmDelete = (newsId: number) => {
    setNewsToDelete(newsId);
    setOpenConfirmDialog(true);
  };

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
    setNewsToDelete(null);
  };

  const handleDeleteNews = async () => {
    if (!newsToDelete) return;
    
    try {
      const response = await adminService.deleteNews(newsToDelete);
      if (response.success) {
        showSnackbar('Xóa tin tức thành công', 'success');
        fetchNews();
      } else {
        showSnackbar(response.message || 'Lỗi khi xóa tin tức', 'error');
      }
    } catch (error) {
      console.error('Error deleting news:', error);
      showSnackbar('Đã xảy ra lỗi khi xóa tin tức', 'error');
    } finally {
      handleCloseConfirmDialog();
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getCategoryById = (id: number) => {
    const category = categories.find(cat => cat.id === id);
    return category ? category.name : 'Không xác định';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  const viewNewsOnFrontend = (newsId: number) => {
    window.open(`/tin-tuc/${newsId}`, '_blank');
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Quản lý tin tức
        </Typography>
        
        <Paper sx={{ p: 2, mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="news management tabs">
            <Tab label="Tất cả tin tức" />
            <Tab label="Đã đăng" />
            <Tab label="Bản nháp" />
          </Tabs>
        </Paper>
        
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tìm kiếm tin tức"
                variant="outlined"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleKeyPress}
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={handleSearch}>
                      <SearchIcon />
                    </IconButton>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6} textAlign="right">
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog('create')}
              >
                Thêm tin tức mới
              </Button>
            </Grid>
          </Grid>
        </Paper>
        
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Tiêu đề</TableCell>
                  <TableCell>Danh mục</TableCell>
                  <TableCell>Ngày tạo</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell align="center">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <CircularProgress />
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Đang tải dữ liệu...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : news.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body1">
                        Không có tin tức nào. Hãy tạo tin tức mới!
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  news.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.id}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {item.image_url && (
                            <Box
                              component="img"
                              src={item.image_url}
                              alt={item.title}
                              sx={{
                                width: 50,
                                height: 50,
                                objectFit: 'cover',
                                borderRadius: 1,
                                mr: 2,
                              }}
                            />
                          )}
                          <Typography variant="body2">
                            {truncateText(item.title, 60)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getCategoryById(item.category_id)}
                          size="small"
                          color="primary"
                        />
                      </TableCell>
                      <TableCell>{formatDate(item.created_at)}</TableCell>
                      <TableCell>
                        <Chip
                          label={item.status === 'published' ? 'Đã đăng' : 'Bản nháp'}
                          size="small"
                          color={item.status === 'published' ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Xem trên website">
                          <IconButton
                            color="info"
                            onClick={() => viewNewsOnFrontend(item.id)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Chỉnh sửa">
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenDialog('edit', item)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa">
                          <IconButton
                            color="error"
                            onClick={() => handleOpenConfirmDelete(item.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </Paper>
      </Box>
      
      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {formMode === 'create' ? 'Thêm tin tức mới' : 'Chỉnh sửa tin tức'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tiêu đề tin tức"
                variant="outlined"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                error={!!errors.title}
                helperText={errors.title}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tóm tắt tin tức"
                variant="outlined"
                multiline
                rows={3}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                error={!!errors.summary}
                helperText={errors.summary}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.category_id}>
                <InputLabel>Danh mục</InputLabel>
                <Select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value as number)}
                  label="Danh mục"
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.category_id && (
                  <Typography variant="caption" color="error">
                    {errors.category_id}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.status}>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  label="Trạng thái"
                >
                  <MenuItem value="published">Đã đăng</MenuItem>
                  <MenuItem value="draft">Bản nháp</MenuItem>
                </Select>
                {errors.status && (
                  <Typography variant="caption" color="error">
                    {errors.status}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Ảnh đại diện
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<ImageIcon />}
                  >
                    Chọn ảnh
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </Button>
                  <Typography variant="caption" sx={{ flex: 1 }}>
                    {imageFile ? imageFile.name : (imageUrl ? 'Sử dụng URL ảnh' : 'Chưa chọn ảnh')}
                  </Typography>
                </Box>
                {errors.image_url && (
                  <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                    {errors.image_url}
                  </Typography>
                )}
              </Box>
              
              {!imageFile && (
                <TextField
                  fullWidth
                  label="Hoặc nhập URL ảnh"
                  variant="outlined"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  sx={{ mt: 2 }}
                />
              )}
              
              {imagePreview && (
                <Box
                  sx={{
                    mt: 2,
                    width: '100%',
                    height: 150,
                    backgroundImage: `url(${imagePreview})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderRadius: 1,
                    border: '1px solid #ddd',
                  }}
                />
              )}
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Nội dung tin tức
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={10}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Nhập nội dung tin tức chi tiết ở đây..."
                variant="outlined"
                error={!!errors.content}
                helperText={errors.content}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
          >
            {formMode === 'create' ? 'Tạo tin tức' : 'Cập nhật'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={openConfirmDialog} onClose={handleCloseConfirmDialog}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa tin tức này không? Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog}>Hủy</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteNews}
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default NewsManagementPage; 