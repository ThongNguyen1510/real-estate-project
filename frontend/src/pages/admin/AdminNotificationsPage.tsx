import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Stack,
  Alert,
  Snackbar,
  FormHelperText,
  CircularProgress,
  SelectChangeEvent,
  Divider,
  Card,
  CardContent,
  CardActions,
  Grid,
  Badge,
  Switch,
  FormControlLabel,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  BroadcastOnPersonal as BroadcastIcon,
  Notifications as NotificationsIcon,
  Campaign as CampaignIcon,
  Groups as GroupsIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { vi } from 'date-fns/locale';
import axios from 'axios';
import { API_URL } from '../../config';
import { useAuth } from '../../contexts/AuthContext';
import AdminLayout from '../../components/admin/AdminLayout';

interface AdminNotification {
  id: number;
  title: string;
  message: string;
  target_type: 'all_users' | 'property_owners' | 'specific_users';
  target_users: string | null;
  is_active: boolean;
  start_date: string;
  end_date: string | null;
  created_by: number;
  created_by_name: string;
  created_at: string;
  updated_at: string | null;
}

type FormValues = {
  title: string;
  message: string;
  target_type: 'all_users' | 'property_owners' | 'specific_users';
  target_users: number[];
  is_active: boolean;
  start_date: string;
  end_date: string | null;
};

const initialFormValues: FormValues = {
  title: '',
  message: '',
  target_type: 'all_users',
  target_users: [],
  is_active: true,
  start_date: new Date().toISOString(),
  end_date: null,
};

const AdminNotificationsPage: React.FC = () => {
  // @ts-ignore - Ignoring token property missing in AuthContext
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<AdminNotification | null>(null);
  const [formValues, setFormValues] = useState<FormValues>(initialFormValues);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [confirmSend, setConfirmSend] = useState<number | null>(null);
  const [users, setUsers] = useState<{ id: number; full_name: string }[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // New state for quick notification
  const [quickNotification, setQuickNotification] = useState({
    title: '',
    message: ''
  });
  const [sendingQuickNotification, setSendingQuickNotification] = useState(false);

  // New state for broadcast notification
  const [broadcastNotification, setBroadcastNotification] = useState({
    title: '',
    message: '',
    isUrgent: false,
    showConfirmation: false
  });
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [userCount, setUserCount] = useState<number | null>(null);
  const [confirmBroadcast, setConfirmBroadcast] = useState(false);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/admin/notifications?page=${page}`, {
        headers: { Authorization: token }
      });
      
      setNotifications(response.data.data.notifications);
      setTotalPages(response.data.data.pagination.total_pages);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      showSnackbar('Lỗi khi tải danh sách thông báo', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch users for specific targeting
  const fetchUsers = async () => {
    if (formValues.target_type === 'specific_users' && users.length === 0) {
      try {
        setLoadingUsers(true);
        const response = await axios.get(`${API_URL}/api/admin/users?limit=100`, {
          headers: { Authorization: token }
        });
        
        setUsers(response.data.data.users);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoadingUsers(false);
      }
    }
  };

  // Fetch user count for broadcast stats
  const fetchUserCount = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/users/count`, {
        headers: { Authorization: token }
      });
      
      if (response.data.success) {
        setUserCount(response.data.data.count);
      }
    } catch (error) {
      console.error('Error fetching user count:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [page, token]);

  useEffect(() => {
    if (openDialog) {
      fetchUsers();
    }
  }, [openDialog, formValues.target_type]);

  useEffect(() => {
    fetchUserCount();
  }, []);

  const handleOpenDialog = (notification?: AdminNotification) => {
    if (notification) {
      // Edit mode
      setIsEditing(true);
      setSelectedNotification(notification);
      
      let parsedTargetUsers: number[] = [];
      if (notification.target_users) {
        try {
          parsedTargetUsers = JSON.parse(notification.target_users);
        } catch (e) {
          console.error('Error parsing target_users:', e);
        }
      }
      
      setFormValues({
        title: notification.title,
        message: notification.message,
        target_type: notification.target_type,
        target_users: parsedTargetUsers,
        is_active: notification.is_active,
        start_date: notification.start_date,
        end_date: notification.end_date,
      });
    } else {
      // Create mode
      setIsEditing(false);
      setSelectedNotification(null);
      setFormValues(initialFormValues);
    }
    
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormErrors({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormValues(prev => ({ ...prev, [name]: value }));
      
      // Clear validation errors
      if (formErrors[name]) {
        setFormErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  };

  const handleSelectChange = (e: SelectChangeEvent<any>) => {
    const { name, value } = e.target;
    if (name) {
      if (name === 'target_users') {
        // Handle multi-select for target_users
        setFormValues(prev => ({ ...prev, [name]: Array.isArray(value) ? value : [value] }));
      } else if (name === 'is_active') {
        // Handle boolean conversion for is_active
        setFormValues(prev => ({ ...prev, [name]: value === 'true' }));
      } else {
        setFormValues(prev => ({ ...prev, [name]: value }));
      }
    }
  };

  const handleDateChange = (name: string) => (date: Date | null) => {
    setFormValues(prev => ({ ...prev, [name]: date ? date.toISOString() : null }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formValues.title.trim()) {
      errors.title = 'Tiêu đề không được để trống';
    }
    
    if (!formValues.message.trim()) {
      errors.message = 'Nội dung thông báo không được để trống';
    }
    
    if (formValues.target_type === 'specific_users' && formValues.target_users.length === 0) {
      errors.target_users = 'Vui lòng chọn ít nhất một người dùng';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      const payload = {
        ...formValues,
        target_users: formValues.target_type === 'specific_users' ? JSON.stringify(formValues.target_users) : null,
      };
      
      if (isEditing && selectedNotification) {
        // Update
        await axios.put(`${API_URL}/api/admin/notifications/${selectedNotification.id}`, payload, {
          headers: { Authorization: token }
        });
        
        showSnackbar('Cập nhật thông báo thành công');
      } else {
        // Create
        await axios.post(`${API_URL}/api/admin/notifications`, payload, {
          headers: { Authorization: token }
        });
        
        showSnackbar('Tạo thông báo thành công');
      }
      
      handleCloseDialog();
      fetchNotifications();
    } catch (error) {
      console.error('Error saving notification:', error);
      showSnackbar('Lỗi khi lưu thông báo', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = (id: number) => {
    setConfirmDelete(id);
  };

  const handleDeleteCancel = () => {
    setConfirmDelete(null);
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    
    try {
      setLoading(true);
      
      await axios.delete(`${API_URL}/api/admin/notifications/${confirmDelete}`, {
        headers: { Authorization: token }
      });
      
      showSnackbar('Xóa thông báo thành công');
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
      showSnackbar('Lỗi khi xóa thông báo', 'error');
    } finally {
      setLoading(false);
      setConfirmDelete(null);
    }
  };

  const handleSendConfirm = (id: number) => {
    setConfirmSend(id);
  };

  const handleSendCancel = () => {
    setConfirmSend(null);
  };

  const handleSend = async () => {
    if (!confirmSend) return;
    
    try {
      setLoading(true);
      
      const response = await axios.post(`${API_URL}/api/admin/notifications/${confirmSend}/send`, {}, {
        headers: { Authorization: token }
      });
      
      showSnackbar(`Đã gửi thông báo đến ${response.data.data.sent_count} người dùng`);
    } catch (error) {
      console.error('Error sending notification:', error);
      showSnackbar('Lỗi khi gửi thông báo', 'error');
    } finally {
      setLoading(false);
      setConfirmSend(null);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Không có';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getTargetTypeLabel = (type: string) => {
    switch (type) {
      case 'all_users': return 'Tất cả người dùng';
      case 'property_owners': return 'Chủ bất động sản';
      case 'specific_users': return 'Người dùng cụ thể';
      default: return type;
    }
  };

  // Handle quick notification input change
  const handleQuickNotificationChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setQuickNotification(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // Send quick notification to all users
  const sendQuickNotification = async () => {
    if (!quickNotification.title.trim() || !quickNotification.message.trim()) {
      showSnackbar('Vui lòng nhập đầy đủ tiêu đề và nội dung thông báo', 'error');
      return;
    }
    
    try {
      setSendingQuickNotification(true);
      
      // Create a new admin notification
      const createResponse = await axios.post(`${API_URL}/api/admin/notifications`, {
        title: quickNotification.title,
        message: quickNotification.message,
        target_type: 'all_users',
        is_active: true,
        start_date: new Date().toISOString()
      }, {
        headers: { Authorization: token }
      });
      
      // Send the notification immediately
      if (createResponse.data.success && createResponse.data.data.id) {
        const sendResponse = await axios.post(
          `${API_URL}/api/admin/notifications/${createResponse.data.data.id}/send`, 
          {}, 
          { headers: { Authorization: token } }
        );
        
        if (sendResponse.data.success) {
          showSnackbar(`Đã gửi thông báo đến ${sendResponse.data.data.sent_count} người dùng`);
          // Reset the form
          setQuickNotification({ title: '', message: '' });
          // Refresh the notification list
          fetchNotifications();
        }
      }
    } catch (error) {
      console.error('Error sending quick notification:', error);
      showSnackbar('Lỗi khi gửi thông báo nhanh', 'error');
    } finally {
      setSendingQuickNotification(false);
    }
  };

  // Handle broadcast notification input change
  const handleBroadcastChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setBroadcastNotification(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // Handle urgent toggle
  const handleUrgentToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBroadcastNotification(prev => ({ ...prev, isUrgent: e.target.checked }));
  };
  
  // Open confirmation dialog
  const handleOpenBroadcastConfirm = () => {
    if (!broadcastNotification.title.trim() || !broadcastNotification.message.trim()) {
      showSnackbar('Vui lòng nhập đầy đủ tiêu đề và nội dung thông báo', 'error');
      return;
    }
    setConfirmBroadcast(true);
  };
  
  // Close confirmation dialog
  const handleCloseBroadcastConfirm = () => {
    setConfirmBroadcast(false);
  };
  
  // Send broadcast notification to all users
  const sendBroadcastNotification = async () => {
    try {
      setSendingBroadcast(true);
      
      // Prepare notification title with urgent prefix if needed
      const titlePrefix = broadcastNotification.isUrgent ? '🔴 THÔNG BÁO KHẨN: ' : '';
      const title = titlePrefix + broadcastNotification.title;
      
      // Create a new admin notification
      const createResponse = await axios.post(`${API_URL}/api/admin/notifications`, {
        title: title,
        message: broadcastNotification.message,
        target_type: 'all_users',
        is_active: true,
        start_date: new Date().toISOString()
      }, {
        headers: { Authorization: token }
      });
      
      // Send the notification immediately
      if (createResponse.data.success && createResponse.data.data.id) {
        const sendResponse = await axios.post(
          `${API_URL}/api/admin/notifications/${createResponse.data.data.id}/send`, 
          {}, 
          { headers: { Authorization: token } }
        );
        
        if (sendResponse.data.success) {
          showSnackbar(`Đã phát thông báo đến ${sendResponse.data.data.sent_count} người dùng`);
          // Reset the form
          setBroadcastNotification({ 
            title: '',
            message: '',
            isUrgent: false,
            showConfirmation: false
          });
          // Refresh the notification list
          fetchNotifications();
        }
      }
    } catch (error) {
      console.error('Error sending broadcast notification:', error);
      showSnackbar('Lỗi khi phát thông báo', 'error');
    } finally {
      setSendingBroadcast(false);
      setConfirmBroadcast(false);
    }
  };

  return (
    <AdminLayout title="Quản lý thông báo">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1" fontWeight="bold">
          Quản lý thông báo
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Tạo thông báo mới
        </Button>
      </Box>
      
      {/* Broadcast notification card - new enhanced version */}
      <Card 
        sx={{ 
          mb: 4, 
          border: '1px solid #2196f3',
          boxShadow: '0 4px 8px rgba(33, 150, 243, 0.1)',
          background: 'linear-gradient(to right, #ffffff, #e3f2fd)'
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CampaignIcon color="primary" sx={{ mr: 1, fontSize: 32 }} />
            <Typography variant="h5" component="div" color="primary" fontWeight="bold">
              Phát thông báo cho toàn bộ người dùng
            </Typography>
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Stack spacing={3}>
                <TextField
                  label="Tiêu đề thông báo"
                  name="title"
                  value={broadcastNotification.title}
                  onChange={handleBroadcastChange}
                  fullWidth
                  required
                  placeholder="Nhập tiêu đề thông báo"
                  variant="outlined"
                  InputProps={{
                    startAdornment: broadcastNotification.isUrgent ? (
                      <Typography color="error" sx={{ mr: 1 }}>🔴 THÔNG BÁO KHẨN: </Typography>
                    ) : null
                  }}
                />
                
                <TextField
                  label="Nội dung thông báo"
                  name="message"
                  value={broadcastNotification.message}
                  onChange={handleBroadcastChange}
                  fullWidth
                  multiline
                  rows={4}
                  required
                  placeholder="Nhập nội dung thông báo chi tiết"
                  variant="outlined"
                />
                
                <FormControlLabel
                  control={
                    <Switch 
                      checked={broadcastNotification.isUrgent}
                      onChange={handleUrgentToggle}
                      color="error"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography color={broadcastNotification.isUrgent ? 'error' : 'inherit'}>
                        Đánh dấu là thông báo khẩn cấp
                      </Typography>
                      <Tooltip title="Thông báo khẩn sẽ được đánh dấu nổi bật cho người dùng">
                        <InfoIcon fontSize="small" sx={{ ml: 1, color: 'text.secondary' }} />
                      </Tooltip>
                    </Box>
                  }
                />
              </Stack>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, height: '100%', bgcolor: 'rgba(33, 150, 243, 0.05)' }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Thông tin phát thông báo
                </Typography>
                
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <GroupsIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography>
                      Số người dùng sẽ nhận: {userCount !== null ? (
                        <Typography component="span" fontWeight="bold">{userCount}</Typography>
                      ) : (
                        <CircularProgress size={14} sx={{ ml: 1 }} />
                      )}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary">
                    Thông báo sẽ được gửi ngay lập tức đến tất cả người dùng đang hoạt động trên hệ thống.
                  </Typography>
                  
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Thông báo sẽ hiển thị trong phần thông báo của người dùng và có thể được gửi qua email nếu người dùng đã cấu hình.
                  </Alert>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
        
        <CardActions sx={{ justifyContent: 'flex-end', p: 2, bgcolor: 'rgba(33, 150, 243, 0.05)' }}>
          <Button
            variant="contained"
            color={broadcastNotification.isUrgent ? "error" : "primary"}
            size="large"
            startIcon={<BroadcastIcon />}
            onClick={handleOpenBroadcastConfirm}
            disabled={sendingBroadcast}
            sx={{ 
              px: 4, 
              py: 1,
              fontWeight: 'bold',
              boxShadow: broadcastNotification.isUrgent ? '0 4px 8px rgba(244, 67, 54, 0.3)' : '0 4px 8px rgba(33, 150, 243, 0.3)'
            }}
          >
            {broadcastNotification.isUrgent ? 'Phát thông báo khẩn' : 'Phát thông báo cho tất cả người dùng'}
          </Button>
        </CardActions>
      </Card>
      
      <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
        Danh sách thông báo đã tạo
      </Typography>
      
      {loading && notifications.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : notifications.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            Chưa có thông báo nào. Hãy tạo thông báo mới.
          </Typography>
        </Paper>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Tiêu đề</TableCell>
                  <TableCell>Đối tượng</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Ngày bắt đầu</TableCell>
                  <TableCell>Ngày kết thúc</TableCell>
                  <TableCell>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {notifications.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell>{notification.id}</TableCell>
                    <TableCell>{notification.title}</TableCell>
                    <TableCell>{getTargetTypeLabel(notification.target_type)}</TableCell>
                    <TableCell>
                      <Chip
                        label={notification.is_active ? 'Đang kích hoạt' : 'Vô hiệu hóa'}
                        color={notification.is_active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatDate(notification.start_date)}</TableCell>
                    <TableCell>{formatDate(notification.end_date)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenDialog(notification)}
                          title="Chỉnh sửa"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteConfirm(notification.id)}
                          title="Xóa"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                        
                        <IconButton
                          size="small"
                          color="secondary"
                          onClick={() => handleSendConfirm(notification.id)}
                          title="Gửi ngay"
                        >
                          <SendIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, newPage) => setPage(newPage)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
      
      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {isEditing ? 'Chỉnh sửa thông báo' : 'Tạo thông báo mới'}
        </DialogTitle>
        
        <DialogContent dividers>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <TextField
              label="Tiêu đề thông báo"
              name="title"
              value={formValues.title}
              onChange={handleInputChange}
              fullWidth
              required
              error={!!formErrors.title}
              helperText={formErrors.title}
            />
            
            <TextField
              label="Nội dung thông báo"
              name="message"
              value={formValues.message}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={4}
              required
              error={!!formErrors.message}
              helperText={formErrors.message}
            />
            
            <FormControl fullWidth>
              <InputLabel>Đối tượng nhận thông báo</InputLabel>
              <Select
                name="target_type"
                value={formValues.target_type}
                onChange={handleSelectChange}
                label="Đối tượng nhận thông báo"
              >
                <MenuItem value="all_users">Tất cả người dùng</MenuItem>
                <MenuItem value="property_owners">Chủ bất động sản</MenuItem>
                <MenuItem value="specific_users">Người dùng cụ thể</MenuItem>
              </Select>
            </FormControl>
            
            {formValues.target_type === 'specific_users' && (
              <FormControl fullWidth error={!!formErrors.target_users}>
                <InputLabel>Chọn người dùng</InputLabel>
                <Select
                  name="target_users"
                  multiple
                  value={formValues.target_users}
                  onChange={handleSelectChange}
                  label="Chọn người dùng"
                  disabled={loadingUsers}
                >
                  {loadingUsers ? (
                    <MenuItem disabled>Đang tải danh sách người dùng...</MenuItem>
                  ) : users.length === 0 ? (
                    <MenuItem disabled>Không có người dùng nào</MenuItem>
                  ) : (
                    users.map(user => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.full_name} (ID: {user.id})
                      </MenuItem>
                    ))
                  )}
                </Select>
                {formErrors.target_users && (
                  <FormHelperText>{formErrors.target_users}</FormHelperText>
                )}
              </FormControl>
            )}
            
            <FormControl fullWidth>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
                <DateTimePicker
                  label="Ngày bắt đầu"
                  value={formValues.start_date ? new Date(formValues.start_date) : null}
                  onChange={(date: Date | null) => handleDateChange('start_date')(date)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </FormControl>
            
            <FormControl fullWidth>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
                <DateTimePicker
                  label="Ngày kết thúc (không bắt buộc)"
                  value={formValues.end_date ? new Date(formValues.end_date) : null}
                  onChange={(date: Date | null) => handleDateChange('end_date')(date)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                name="is_active"
                value={formValues.is_active ? 'true' : 'false'}
                onChange={handleSelectChange}
                label="Trạng thái"
              >
                <MenuItem value={'true'}>Kích hoạt</MenuItem>
                <MenuItem value={'false'}>Vô hiệu hóa</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {isEditing ? 'Cập nhật' : 'Tạo thông báo'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!confirmDelete} onClose={handleDeleteCancel}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa thông báo này? Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Hủy</Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Send Confirmation Dialog */}
      <Dialog open={!!confirmSend} onClose={handleSendCancel}>
        <DialogTitle>Xác nhận gửi thông báo</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn gửi thông báo này ngay lập tức đến tất cả người dùng đủ điều kiện?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSendCancel}>Hủy</Button>
          <Button onClick={handleSend} variant="contained" color="primary">
            Gửi ngay
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Add Broadcast Confirmation Dialog */}
      <Dialog open={confirmBroadcast} onClose={handleCloseBroadcastConfirm}>
        <DialogTitle>
          {broadcastNotification.isUrgent ? 
            <Box sx={{ display: 'flex', alignItems: 'center', color: 'error.main' }}>
              <CampaignIcon sx={{ mr: 1 }} />
              Xác nhận phát thông báo khẩn
            </Box> :
            "Xác nhận phát thông báo"
          }
        </DialogTitle>
        <DialogContent>
          {broadcastNotification.isUrgent ? (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Bạn đang chuẩn bị gửi một thông báo khẩn cấp đến tất cả người dùng!
            </Alert>
          ) : null}
          
          <Typography sx={{ mb: 2 }}>
            Bạn có chắc chắn muốn phát thông báo sau đây đến tất cả {userCount || 0} người dùng?
          </Typography>
          
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              {broadcastNotification.isUrgent ? '🔴 THÔNG BÁO KHẨN: ' : ''}{broadcastNotification.title}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
              {broadcastNotification.message}
            </Typography>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBroadcastConfirm}>Hủy</Button>
          <Button 
            onClick={sendBroadcastNotification} 
            variant="contained" 
            color={broadcastNotification.isUrgent ? "error" : "primary"}
            startIcon={sendingBroadcast ? <CircularProgress size={20} color="inherit" /> : <BroadcastIcon />}
            disabled={sendingBroadcast}
          >
            {sendingBroadcast ? "Đang phát..." : "Xác nhận phát thông báo"}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AdminLayout>
  );
};

export default AdminNotificationsPage; 