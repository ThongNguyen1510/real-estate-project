import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';

const Header = () => {
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <div>
      {/* Existing code */}

      {/* Trong phần Menu dropdown (tùy vào cấu trúc của code), thêm MenuItem mới */}
      <MenuItem component={Link} to="/user/my-properties" onClick={handleCloseUserMenu}>
        <ListItemIcon>
          <ManageSearchIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Quản lý tin đăng</ListItemText>
      </MenuItem>

      {/* Existing code */}
    </div>
  );
};

export default Header; 