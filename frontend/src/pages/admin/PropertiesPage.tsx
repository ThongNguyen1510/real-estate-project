import React from 'react';
import { 
  Typography, 
  Box, 
  Alert,
  Paper,
  LinearProgress
} from '@mui/material';
import AdminLayout from '../../components/admin/AdminLayout';

const PropertiesPage = () => {
  return (
    <AdminLayout title="Quản lý bất động sản">
      <Box sx={{ position: 'relative', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Quản lý bất động sản
        </Typography>
      </Box>
      
      <Paper sx={{ p: 3, mt: 3, mb: 3 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          Tính năng này đang được phát triển và sẽ sớm ra mắt.
        </Alert>
        <Typography variant="body1">
          Chức năng quản lý bất động sản sẽ cho phép bạn:
        </Typography>
        <ul>
          <li>Xem danh sách tất cả bất động sản trên hệ thống</li>
          <li>Duyệt và kiểm duyệt các bất động sản mới</li>
          <li>Chỉnh sửa thông tin bất động sản</li>
          <li>Xóa các bất động sản không phù hợp</li>
          <li>Phân loại và sắp xếp theo các tiêu chí khác nhau</li>
        </ul>
        <LinearProgress sx={{ mt: 2 }} />
      </Paper>
    </AdminLayout>
  );
};

export default PropertiesPage; 