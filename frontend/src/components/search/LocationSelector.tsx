import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Modal, 
  Paper,
  Button
} from '@mui/material';
import { 
  LocationOn as LocationIcon,
  Close as CloseIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon
} from '@mui/icons-material';
import ProvinceList from './ProvinceList';

interface LocationSelectorProps {
  selectedLocation?: string;
  onLocationSelected?: (id: string, name: string) => void;
  placeholder?: string;
  sx?: any;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({ 
  selectedLocation = '',
  onLocationSelected,
  placeholder = 'Chọn tỉnh thành',
  sx = {}
}) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleLocationSelect = (id: string, name: string) => {
    if (onLocationSelected) {
      onLocationSelected(id, name);
    }
    handleClose();
  };

  // Đảm bảo hiển thị tên thành phố thay vì ID
  const displayName = selectedLocation && !selectedLocation.match(/^\d+$/) 
    ? selectedLocation 
    : placeholder;

  return (
    <>
      <Box 
        onClick={handleOpen}
        sx={{
          display: 'flex',
          position: 'relative',
          alignItems: 'center',
          padding: '8px 12px',
          border: '1px solid transparent',
          borderRadius: 'inherit',
          cursor: 'pointer',
          backgroundColor: 'white',
          transition: 'all 0.2s ease',
          height: '100%',
          '&:hover': {
            backgroundColor: 'rgba(0,0,0,0.01)',
          },
          ...sx
        }}
      >
        <LocationIcon sx={{ color: 'primary.main', mr: 1, fontSize: '1.2rem' }} />
        <Typography 
          sx={{ 
            flexGrow: 1, 
            fontSize: '0.95rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            color: selectedLocation ? 'text.primary' : 'text.secondary',
          }}
        >
          {displayName}
        </Typography>
        <KeyboardArrowDownIcon sx={{ ml: 0.5, fontSize: '1.2rem', color: 'text.secondary' }} />
      </Box>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="location-selector-modal"
        aria-describedby="select-a-location-for-search"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2
        }}
      >
        <Paper
          sx={{
            position: 'relative',
            width: '100%',
            maxWidth: 1200,
            maxHeight: '90vh',
            overflow: 'auto',
            p: 0,
            outline: 'none',
            borderRadius: 2
          }}
        >
          <Box sx={{ 
            position: 'sticky', 
            top: 0, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            p: 2,
            backgroundColor: 'white',
            borderBottom: '1px solid #e0e0e0',
            zIndex: 10
          }}>
            <Typography variant="h6" component="h2">
              Chọn tỉnh thành
            </Typography>
            <IconButton 
              onClick={handleClose}
              size="small"
              sx={{ ml: 2 }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ p: 0 }}>
            <ProvinceList onProvinceSelected={handleLocationSelect} />
          </Box>
          
          <Box sx={{ 
            position: 'sticky', 
            bottom: 0,
            display: 'flex', 
            justifyContent: 'flex-end', 
            p: 2,
            backgroundColor: 'white',
            borderTop: '1px solid #e0e0e0',
          }}>
            <Button onClick={handleClose} color="inherit">
              Đóng
            </Button>
          </Box>
        </Paper>
      </Modal>
    </>
  );
};

export default LocationSelector; 