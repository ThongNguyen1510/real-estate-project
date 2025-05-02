import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Typography,
  Box,
  Alert,
  Snackbar
} from '@mui/material';
import { Report, Close, Send } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { addNotification } from '../../store/notificationsSlice';

const reportReasons = [
  { value: 'spam', label: 'Tin đăng là spam' },
  { value: 'fake', label: 'Tin đăng giả mạo' },
  { value: 'sold', label: 'Bất động sản đã được bán/cho thuê' },
  { value: 'incorrect', label: 'Thông tin không chính xác' },
  { value: 'duplicate', label: 'Tin đăng trùng lặp' },
  { value: 'inappropriate', label: 'Nội dung không phù hợp' },
  { value: 'scam', label: 'Lừa đảo' },
  { value: 'other', label: 'Lý do khác' }
];

const ReportDialog = ({ open, onClose, propertyTitle, propertyId }) => {
  const dispatch = useDispatch();
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleReasonChange = (event) => {
    setReason(event.target.value);
    setError('');
  };

  const handleDetailsChange = (event) => {
    setDetails(event.target.value);
  };

  const handleSubmit = () => {
    if (!reason) {
      setError('Vui lòng chọn lý do báo cáo');
      return;
    }

    if (reason === 'other' && !details.trim()) {
      setError('Vui lòng mô tả chi tiết lý do báo cáo');
      return;
    }

    // In a real app, send report to server
    // For now, just add a notification
    dispatch(addNotification({
      title: 'Báo cáo đã được gửi',
      message: `Cảm ơn bạn đã báo cáo tin đăng "${propertyTitle}". Chúng tôi sẽ xem xét trong thời gian sớm nhất.`,
      type: 'system'
    }));

    setSubmitted(true);
    
    // Reset form after successful submission
    setTimeout(() => {
      setReason('');
      setDetails('');
      setSubmitted(false);
      onClose();
    }, 2000);
  };

  const handleClose = () => {
    setReason('');
    setDetails('');
    setError('');
    setSubmitted(false);
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          bgcolor: 'error.light', 
          color: 'error.contrastText'
        }}>
          <Report /> Báo cáo tin đăng
          <Box sx={{ ml: 'auto' }}>
            <Button 
              variant="text" 
              onClick={handleClose} 
              color="inherit" 
              sx={{ minWidth: 'auto', p: 0.5 }}
            >
              <Close />
            </Button>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          {submitted ? (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Alert severity="success" sx={{ mb: 2 }}>
                Cảm ơn bạn! Báo cáo của bạn đã được gửi thành công.
              </Alert>
              <Typography>
                Chúng tôi sẽ xem xét báo cáo của bạn và có biện pháp xử lý phù hợp.
              </Typography>
            </Box>
          ) : (
            <>
              <Typography variant="subtitle1" gutterBottom>
                Bạn đang báo cáo tin đăng: <strong>{propertyTitle}</strong>
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Hãy cho chúng tôi biết lý do bạn báo cáo tin đăng này. Báo cáo của bạn sẽ được gửi đến đội ngũ kiểm duyệt nội dung.
              </Typography>
              
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              
              <FormControl required component="fieldset" sx={{ width: '100%' }}>
                <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                  Lý do báo cáo *
                </Typography>
                <RadioGroup value={reason} onChange={handleReasonChange}>
                  {reportReasons.map((item) => (
                    <FormControlLabel
                      key={item.value}
                      value={item.value}
                      control={<Radio />}
                      label={item.label}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                  Chi tiết bổ sung {reason === 'other' && '*'}
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={details}
                  onChange={handleDetailsChange}
                  placeholder="Vui lòng cung cấp thêm thông tin để giúp chúng tôi hiểu rõ hơn về vấn đề..."
                  required={reason === 'other'}
                />
              </Box>
            </>
          )}
        </DialogContent>
        
        {!submitted && (
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button 
              variant="outlined" 
              onClick={handleClose}
              startIcon={<Close />}
            >
              Hủy bỏ
            </Button>
            <Button 
              variant="contained" 
              color="error" 
              onClick={handleSubmit}
              startIcon={<Send />}
              disabled={!reason || (reason === 'other' && !details.trim())}
            >
              Gửi báo cáo
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </>
  );
};

export default ReportDialog; 