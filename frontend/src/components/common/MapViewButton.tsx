import React from 'react';
import { Button } from '@mui/material';
import { Map as MapIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface MapViewButtonProps {
  customStyles?: React.CSSProperties;
}

const MapViewButton: React.FC<MapViewButtonProps> = ({ customStyles }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/ban-do');
  };

  return (
    <Button
      variant="contained"
      startIcon={<MapIcon />}
      onClick={handleClick}
      sx={{
        backgroundColor: '#00a0a0',
        color: 'white',
        fontWeight: 'bold',
        padding: '8px 16px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
        '&:hover': {
          backgroundColor: '#008080',
          boxShadow: '0 6px 12px rgba(0,0,0,0.2)',
        },
        ...customStyles
      }}
    >
      Xem bản đồ
    </Button>
  );
};

export default MapViewButton; 