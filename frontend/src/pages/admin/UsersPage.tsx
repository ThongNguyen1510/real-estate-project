import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Avatar,
  Tooltip,
  LinearProgress,
  Card,
  CardContent,
  Grid,
  Divider,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  Key as KeyIcon,
  PersonAdd as PersonAddIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminService } from '../../services/adminApi';

// Định nghĩa kiểu dữ liệu User
interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  avatar_url?: string;
  created_at: string;
  last_login?: string;
}

// React component
const UsersPage: React.FC = () => {
  // State definitions
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [bannedUsers, setBannedUsers] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newStatus, setNewStatus] = useState('');
  
  // Fetch users from API
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      // Call the admin API service
      const response = await adminService.getUsers();
      
      if (response && response.success) {
        const userData = response.data.users || [];
        setUsers(userData);
        setFilteredUsers(userData);
        
        // Calculate statistics
        setTotalUsers(userData.length);
        setActiveUsers(userData.filter((user: User) => user.status === 'active').length);
        setBannedUsers(userData.filter((user: User) => user.status === 'banned').length);
      } else {
        // If API call was successful but contains an error message
        setError(response?.message || 'Không thể tải danh sách người dùng');
        // Use mock data as fallback
        useMockData();
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setError('Lỗi kết nối tới máy chủ. Sử dụng dữ liệu mẫu tạm thời.');
      // Fall back to mock data
      useMockData();
    } finally {
      setLoading(false);
    }
  };
  
  // Use mock data as fallback
  const useMockData = () => {
    const mockUsers: User[] = Array.from({ length: 50 }, (_, index) => {
      const statuses = ['active', 'inactive', 'banned'];
      const roles = ['user', 'admin', 'moderator', 'agent'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const randomRole = roles[Math.floor(Math.random() * roles.length)];
      
      return {
        id: index + 1,
        username: `user${index + 1}`,
        name: `Người dùng ${index + 1}`,
        email: `user${index + 1}@example.com`,
        phone: `098765432${index % 10}`,
        role: index === 0 ? 'admin' : randomRole,
        status: randomStatus,
        created_at: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
        last_login: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toISOString()
      };
    });
    
    setUsers(mockUsers);
    setFilteredUsers(mockUsers);
    
    // Calculate statistics
    setTotalUsers(mockUsers.length);
    setActiveUsers(mockUsers.filter((user: User) => user.status === 'active').length);
    setBannedUsers(mockUsers.filter((user: User) => user.status === 'banned').length);
  };
  
  // Initialize component
  useEffect(() => {
    fetchUsers();
  }, []);
  
  // Filter users when search query or filters change
  useEffect(() => {
    const filtered = users.filter((user: User) => {
      const matchesSearch = 
        searchQuery === '' ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone.includes(searchQuery);
        
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      
      return matchesSearch && matchesStatus && matchesRole;
    });
    
    setFilteredUsers(filtered);
    setPage(0); // Reset to first page when filters change
  }, [searchQuery, statusFilter, roleFilter, users]);
  
  // Handle page change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };
  
  // Handle status filter change
  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value);
  };
  
  // Handle role filter change
  const handleRoleFilterChange = (event: SelectChangeEvent) => {
    setRoleFilter(event.target.value);
  };
  
  // Handle opening status change dialog
  const handleOpenStatusDialog = (user: User) => {
    setSelectedUser(user);
    setNewStatus(user.status);
    setOpenStatusDialog(true);
  };
  
  // Handle closing status change dialog
  const handleCloseStatusDialog = () => {
    setOpenStatusDialog(false);
  };
  
  // Handle opening delete dialog
  const handleOpenDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setOpenDeleteDialog(true);
  };
  
  // Handle closing delete dialog
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };
  
  // Update user status
  const handleUpdateStatus = async () => {
    if (!selectedUser) return;
    
    setLoading(true);
    try {
      // Call the admin API service
      const response = await adminService.updateUserStatus(selectedUser.id, newStatus);
      
      if (response && response.success) {
        const updatedUsers = users.map((user: User) => 
          user.id === selectedUser.id ? { ...user, status: newStatus } : user
        );
        setUsers(updatedUsers);
        
        // Recalculate statistics
        setActiveUsers(updatedUsers.filter((user: User) => user.status === 'active').length);
        setBannedUsers(updatedUsers.filter((user: User) => user.status === 'banned').length);
        
        handleCloseStatusDialog();
      } else {
        // If API call was successful but contains an error message
        setError(response?.message || 'Không thể cập nhật trạng thái người dùng');
      }
    } catch (error) {
      console.error('Failed to update user status:', error);
      setError('Lỗi kết nối tới máy chủ. Vui lòng thử lại sau');
    } finally {
      setLoading(false);
    }
  };
  
  // Delete user
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    setLoading(true);
    try {
      // Call the admin API service
      const response = await adminService.deleteUser(selectedUser.id);
      
      if (response && response.success) {
        const updatedUsers = users.filter(user => user.id !== selectedUser.id);
        setUsers(updatedUsers);
        
        // Recalculate statistics
        setTotalUsers(updatedUsers.length);
        setActiveUsers(updatedUsers.filter((user: User) => user.status === 'active').length);
        setBannedUsers(updatedUsers.filter((user: User) => user.status === 'banned').length);
        
        handleCloseDeleteDialog();
        
        // Hiển thị thông báo thành công
        setError(null);
        // Nếu có setSuccess, có thể dùng setSuccess ở đây thay vì alert
        alert(`Đã xóa người dùng ${selectedUser.name} thành công`);
      } else {
        // If API call was successful but contains an error message
        setError(response?.message || 'Không thể xóa người dùng. Vui lòng thử lại sau.');
        handleCloseDeleteDialog();
      }
    } catch (error: any) {
      console.error('Failed to delete user:', error);
      setError('Lỗi kết nối tới máy chủ. Vui lòng thử lại sau');
      handleCloseDeleteDialog();
    } finally {
      setLoading(false);
    }
  };
  
  // Get status chip color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      case 'banned':
        return 'error';
      default:
        return 'default';
    }
  };
  
  // Get role chip color
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'moderator':
        return 'warning';
      case 'agent':
        return 'info';
      default:
        return 'default';
    }
  };
  
  // Get role display name
  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Quản trị viên';
      case 'moderator':
        return 'Kiểm duyệt viên';
      case 'agent':
        return 'Đại lý';
      case 'user':
        return 'Người dùng';
      default:
        return role;
    }
  };
  
  // Get status display name
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'active':
        return 'Hoạt động';
      case 'inactive':
        return 'Không hoạt động';
      case 'banned':
        return 'Bị khóa';
      default:
        return status;
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <AdminLayout title="Quản lý người dùng">
      <Box sx={{ position: 'relative', mb: 4, pl: 0 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Quản lý người dùng
        </Typography>
      </Box>
      
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3, ml: -1 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ boxShadow: 3, borderLeft: 5, borderColor: 'primary.main' }}>
            <CardContent>
              <Typography variant="h5" component="div">
                {totalUsers}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tổng số người dùng
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ boxShadow: 3, borderLeft: 5, borderColor: 'success.main' }}>
            <CardContent>
              <Typography variant="h5" component="div">
                {activeUsers}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Người dùng đang hoạt động
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ boxShadow: 3, borderLeft: 5, borderColor: 'error.main' }}>
            <CardContent>
              <Typography variant="h5" component="div">
                {bannedUsers}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Người dùng bị khóa
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Filters and Search */}
      <Paper sx={{ p: 1.5, mb: 2, boxShadow: 3 }}>
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              variant="outlined"
              size="small"
              fullWidth
              placeholder="Tìm kiếm người dùng..."
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
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="status-filter-label">Trạng thái</InputLabel>
              <Select
                labelId="status-filter-label"
                id="status-filter"
                value={statusFilter}
                label="Trạng thái"
                onChange={handleStatusFilterChange}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="active">Hoạt động</MenuItem>
                <MenuItem value="inactive">Không hoạt động</MenuItem>
                <MenuItem value="banned">Bị khóa</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="role-filter-label">Vai trò</InputLabel>
              <Select
                labelId="role-filter-label"
                id="role-filter"
                value={roleFilter}
                label="Vai trò"
                onChange={handleRoleFilterChange}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="admin">Quản trị viên</MenuItem>
                <MenuItem value="moderator">Kiểm duyệt viên</MenuItem>
                <MenuItem value="agent">Đại lý</MenuItem>
                <MenuItem value="user">Người dùng</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2}>
            <Button 
              variant="outlined" 
              color="secondary" 
              startIcon={<RefreshIcon />}
              onClick={fetchUsers}
              fullWidth
              size="small"
            >
              Làm mới
            </Button>
          </Grid>
          <Grid item xs={6} md={2}>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<PersonAddIcon />}
              fullWidth
              href="/admin/users/create"
              size="small"
            >
              Thêm mới
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Users Table */}
      <Paper sx={{ boxShadow: 3 }}>
        {loading && <LinearProgress />}
        <TableContainer>
          <Table size="small" sx={{ minWidth: 650 }} aria-label="users table">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">ID</TableCell>
                <TableCell>Tên người dùng</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Vai trò</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Đăng ký</TableCell>
                <TableCell>Đăng nhập</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user: User) => (
                  <TableRow key={user.id} hover>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          alt={user.name}
                          src={user.avatar_url || ''}
                          sx={{ width: 30, height: 30, mr: 1 }}
                        />
                        <Box>
                          <Typography variant="body2" component="div" sx={{ fontWeight: 'bold' }}>
                            {user.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            @{user.username}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{user.email}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user.phone}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getRoleDisplay(user.role)}
                        color={getRoleColor(user.role) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusDisplay(user.status)}
                        color={getStatusColor(user.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatDate(user.created_at)}</TableCell>
                    <TableCell>{user.last_login ? formatDate(user.last_login) : 'Chưa đăng nhập'}</TableCell>
                    <TableCell align="center">
                      <Box>
                        <Tooltip title="Đổi trạng thái">
                          <IconButton 
                            color="primary" 
                            size="small"
                            onClick={() => handleOpenStatusDialog(user)}
                            sx={{ p: 0.5 }}
                          >
                            {user.status === 'active' ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Sửa thông tin">
                          <IconButton 
                            color="secondary" 
                            size="small"
                            href={`/admin/users/edit/${user.id}`}
                            sx={{ p: 0.5 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Xóa người dùng">
                          <IconButton 
                            color="error" 
                            size="small"
                            onClick={() => handleOpenDeleteDialog(user)}
                            disabled={user.role === 'admin'} // Prevent admin deletion
                            sx={{ p: 0.5 }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              
              {filteredUsers.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2" sx={{ py: 1 }}>
                      Không tìm thấy người dùng nào
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số hàng:"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} của ${count}`
          }
          sx={{ py: 0 }}
        />
      </Paper>
      
      {/* Status Change Dialog */}
      <Dialog open={openStatusDialog} onClose={handleCloseStatusDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Thay đổi trạng thái</DialogTitle>
        <DialogContent>
          <DialogContentText variant="body2">
            Bạn đang thay đổi trạng thái của người dùng <strong>{selectedUser?.name}</strong>
          </DialogContentText>
          <FormControl fullWidth sx={{ mt: 2 }} size="small">
            <InputLabel id="new-status-label">Trạng thái mới</InputLabel>
            <Select
              labelId="new-status-label"
              id="new-status"
              value={newStatus}
              label="Trạng thái mới"
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <MenuItem value="active">Hoạt động</MenuItem>
              <MenuItem value="inactive">Không hoạt động</MenuItem>
              <MenuItem value="banned">Khóa tài khoản</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStatusDialog} size="small">Hủy</Button>
          <Button onClick={handleUpdateStatus} variant="contained" color="primary" size="small">
            Cập nhật
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Xác nhận xóa người dùng</DialogTitle>
        <DialogContent>
          <DialogContentText variant="body2">
            Bạn có chắc chắn muốn xóa người dùng <strong>{selectedUser?.name}</strong>?
            Hành động này không thể được hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} size="small">Hủy</Button>
          <Button onClick={handleDeleteUser} variant="contained" color="error" size="small">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
};

export default UsersPage; 