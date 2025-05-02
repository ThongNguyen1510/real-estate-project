import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  TextField,
  Paper,
  Divider,
  CircularProgress,
  IconButton
} from '@mui/material';
import { VerifiedUser, Close, Upload, AddPhotoAlternate, Delete } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { addNotification } from '../../store/notificationsSlice';

const VerifyDialog = ({ open, onClose, propertyTitle, propertyId }) => {
  const dispatch = useDispatch();
  const [images, setImages] = useState([]);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  const handleImageUpload = (event) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      
      // Convert files to preview URLs
      const newImages = newFiles.map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      
      setImages([...images, ...newImages]);
      setError('');
    }
  };

  const handleImageDelete = (index) => {
    const newImages = [...images];
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleSubmit = () => {
    if (images.length === 0) {
      setError('Vui lòng tải lên ít nhất một ảnh làm bằng chứng');
      return;
    }

    setLoading(true);

    // Simulate API call - In a real app, upload images to server
    setTimeout(() => {
      // Notify user of successful submission
      dispatch(addNotification({
        title: 'Yêu cầu xác thực đã được gửi',
        message: `Yêu cầu xác thực cho tin đăng "${propertyTitle}" đã được gửi thành công. Chúng tôi sẽ xem xét và phản hồi trong thời gian sớm nhất.`,
        type: 'system'
      }));
      
      setLoading(false);
      setSubmitted(true);
      
      // Reset form and close dialog after delay
      setTimeout(() => {
        handleClose();
      }, 3000);
    }, 1500);
  };

  const handleClose = () => {
    // Clean up image previews to avoid memory leaks
    images.forEach(image => URL.revokeObjectURL(image.preview));
    
    setImages([]);
    setDescription('');
    setError('');
    setSubmitted(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        bgcolor: 'primary.main', 
        color: 'primary.contrastText'
      }}>
        <VerifiedUser /> Xác thực tin đăng
        <Box sx={{ ml: 'auto' }}>
          <IconButton 
            onClick={handleClose} 
            color="inherit" 
            sx={{ minWidth: 'auto', p: 0.5 }}
          >
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        {submitted ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Alert severity="success" sx={{ mb: 2 }}>
              Cảm ơn bạn! Yêu cầu xác thực đã được gửi thành công.
            </Alert>
            <Typography>
              Chúng tôi sẽ xem xét bằng chứng của bạn và cập nhật trạng thái xác thực cho tin đăng này.
            </Typography>
          </Box>
        ) : (
          <>
            <Typography variant="subtitle1" gutterBottom>
              Bạn đang yêu cầu xác thực tin đăng: <strong>{propertyTitle}</strong>
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Xác thực tin đăng giúp người dùng tin tưởng hơn vào thông tin bạn cung cấp. Vui lòng tải lên hình ảnh 
              giấy tờ chứng minh quyền sở hữu hoặc đại diện bán bất động sản này (Sổ đỏ, Hợp đồng đại lý, Giấy ủy quyền, v.v.).
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            {/* Upload section */}
            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
              Tải lên hình ảnh chứng minh *
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 2, 
                mb: 2 
              }}>
                {images.map((image, index) => (
                  <Paper 
                    key={index}
                    elevation={2}
                    sx={{ 
                      position: 'relative',
                      width: 150,
                      height: 150
                    }}
                  >
                    <Box
                      component="img"
                      src={image.preview}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: 1
                      }}
                    />
                    <IconButton
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 5,
                        right: 5,
                        bgcolor: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'rgba(255,0,0,0.7)',
                        }
                      }}
                      onClick={() => handleImageDelete(index)}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Paper>
                ))}
                
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<AddPhotoAlternate />}
                  sx={{ 
                    width: 150, 
                    height: 150,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  Thêm ảnh
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={handleImageUpload}
                  />
                </Button>
              </Box>
              
              <Typography variant="caption" color="text.secondary">
                Hỗ trợ định dạng: JPG, PNG, JPEG. Kích thước tối đa: 5MB/ảnh.
              </Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
              Mô tả bổ sung
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={description}
              onChange={handleDescriptionChange}
              placeholder="Mô tả thêm về giấy tờ bạn đang cung cấp..."
            />
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                <strong>Lưu ý:</strong> Thông tin bạn cung cấp chỉ được sử dụng để xác thực tin đăng và sẽ được bảo mật. 
                Vui lòng che đi các thông tin nhạy cảm không cần thiết trên giấy tờ (số CMND, địa chỉ cá nhân, v.v.).
              </Typography>
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
            color="primary" 
            onClick={handleSubmit}
            disabled={loading || images.length === 0}
            startIcon={loading ? <CircularProgress size={20} /> : <Upload />}
          >
            {loading ? 'Đang xử lý...' : 'Gửi yêu cầu xác thực'}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default VerifyDialog; 