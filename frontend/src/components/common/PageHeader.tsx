import React from 'react';
import { Box, Typography, Button, useTheme, useMediaQuery } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backButton?: boolean;
  onBackClick?: () => void;
  actionButton?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  backButton = false,
  onBackClick,
  actionButton
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(-1);
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: subtitle ? 1 : 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {backButton && (
            <Button
              color="inherit"
              startIcon={<ArrowBackIcon />}
              onClick={handleBackClick}
              sx={{ 
                mr: 2,
                textTransform: 'none',
                fontWeight: 'normal',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              {!isMobile && 'Quay lại'}
            </Button>
          )}
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            component="h1" 
            fontWeight="bold"
          >
            {title}
          </Typography>
        </Box>
        
        {actionButton && (
          <Box>
            {actionButton}
          </Box>
        )}
      </Box>
      
      {subtitle && (
        <Typography variant="body1" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </Box>
  );
};

export default PageHeader; 