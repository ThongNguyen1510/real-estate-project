import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { Report as ReportIcon } from '@mui/icons-material';
import { reportProperty } from '../../services/api/propertyService';
import { useAuth } from '../../contexts/AuthContext';

interface ReportPropertyDialogProps {
  open: boolean;
  onClose: () => void;
  propertyId: number;
  propertyTitle: string;
}

const ReportPropertyDialog: React.FC<ReportPropertyDialogProps> = ({
  open,
  onClose,
  propertyId,
  propertyTitle
}) => {
  const { isAuthenticated } = useAuth();
  const [reason, setReason] = useState<string>('spam');
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setError('Vui lòng đăng nhập để báo cáo tin đăng');
      return;
    }
    
    if (!description.trim()) {
      setError('Vui lòng nhập mô tả chi tiết về vấn đề');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await reportProperty(propertyId, reason, description);
      
      if (response.success) {
        setSuccess(true);
        // Reset form after success
        setReason('spam');
        setDescription('');
      } else {
        setError(response.message || 'Có lỗi xảy ra khi gửi báo cáo');
      }
    } catch (error: any) {
      setError(error.message || 'Có lỗi xảy ra khi gửi báo cáo');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      // Reset state when closing
      setReason('spam');
      setDescription('');
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center',
        bgcolor: 'error.main',
        color: 'white'
      }}>
        <ReportIcon sx={{ mr: 1 }} />
        Báo cáo tin đăng
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 3 }}>
          {!isAuthenticated && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              Vui lòng đăng nhập để báo cáo tin đăng
            </Alert>
          )}
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {success ? (
            <Alert severity="success" sx={{ mb: 3 }}>
              Cảm ơn bạn đã báo cáo. Chúng tôi sẽ xem xét tin đăng này trong thời gian sớm nhất.
            </Alert>
          ) : (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Tin đăng: {propertyTitle}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Vui lòng cho chúng tôi biết lý do bạn báo cáo tin đăng này
                </Typography>
              </Box>
              
              <FormControl component="fieldset" sx={{ mb: 3 }} fullWidth>
                <FormLabel component="legend">Lý do báo cáo</FormLabel>
                <RadioGroup
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                >
                  <FormControlLabel value="spam" control={<Radio />} label="Tin đăng spam/lừa đảo" />
                  <FormControlLabel value="duplicate" control={<Radio />} label="Tin đăng trùng lặp" />
                  <FormControlLabel value="wrong_info" control={<Radio />} label="Thông tin sai sự thật" />
                  <FormControlLabel value="sold" control={<Radio />} label="Bất động sản đã bán/cho thuê" />
                  <FormControlLabel value="expired" control={<Radio />} label="Tin đã hết hạn" />
                  <FormControlLabel value="inappropriate" control={<Radio />} label="Nội dung không phù hợp" />
                  <FormControlLabel value="other" control={<Radio />} label="Lý do khác" />
                </RadioGroup>
              </FormControl>
              
              <TextField
                label="Mô tả chi tiết"
                multiline
                rows={4}
                fullWidth
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Vui lòng mô tả chi tiết vấn đề bạn gặp phải với tin đăng này"
                required
                disabled={loading}
              />
            </>
          )}
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleClose} 
            disabled={loading}
          >
            {success ? 'Đóng' : 'Hủy'}
          </Button>
          
          {!success && (
            <Button 
              type="submit" 
              variant="contained" 
              color="error"
              disabled={loading || !isAuthenticated}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ReportIcon />}
            >
              {loading ? 'Đang gửi...' : 'Gửi báo cáo'}
            </Button>
          )}
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ReportPropertyDialog; 