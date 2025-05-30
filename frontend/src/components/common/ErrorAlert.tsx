import React from 'react';
import { Alert, AlertTitle, Box } from '@mui/material';

interface ErrorAlertProps {
  error: string | null;
  severity?: 'error' | 'warning' | 'info' | 'success';
  onClose?: () => void;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ 
  error, 
  severity = 'error',
  onClose
}) => {
  if (!error) return null;
  
  // Determine error title based on content
  let title = 'Lỗi';
  if (error.includes('đã tồn tại') || error.includes('đã được sử dụng')) {
    title = 'Thông tin đã tồn tại';
  } else if (error.includes('không hợp lệ')) {
    title = 'Dữ liệu không hợp lệ';
  } else if (error.includes('mật khẩu')) {
    title = 'Lỗi mật khẩu';
  } else if (error.includes('không được để trống')) {
    title = 'Dữ liệu bắt buộc';
  }

  return (
    <Box sx={{ mb: 2, width: '100%' }}>
      <Alert 
        severity={severity}
        onClose={onClose}
        sx={{
          '& .MuiAlert-icon': {
            fontSize: '1.25rem'
          },
          '& .MuiAlert-message': {
            width: '100%'
          }
        }}
      >
        <AlertTitle sx={{ fontWeight: 'bold' }}>{title}</AlertTitle>
        {error}
      </Alert>
    </Box>
  );
};

export default ErrorAlert; 