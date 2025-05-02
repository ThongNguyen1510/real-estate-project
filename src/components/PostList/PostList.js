import React from 'react';
import { Box, Typography, Paper, Button, Grid, Chip } from '@mui/material';
import { Edit, Delete, Visibility } from '@mui/icons-material';

const PostList = ({ posts, onEdit, onDelete }) => {
  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        Quản lý bài đăng
      </Typography>
      
      {posts.length === 0 ? (
        <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
          Bạn chưa có bài đăng nào
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {posts.map((post) => (
            <Grid item xs={12} key={post.id}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={3}>
                    <Box sx={{ 
                      height: 150, 
                      bgcolor: 'grey.200', 
                      borderRadius: 1,
                      backgroundImage: post.images.length > 0 
                        ? `url(${URL.createObjectURL(post.images[0])}` 
                        : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }} />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {post.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {post.location}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <Chip label={post.type} size="small" />
                      <Chip label={`${post.area}m²`} size="small" />
                      <Chip label={`${post.price} VNĐ`} size="small" color="primary" />
                    </Box>
                    <Typography variant="body2" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {post.description}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Button 
                        variant="outlined" 
                        startIcon={<Visibility />}
                        fullWidth
                      >
                        Xem
                      </Button>
                      <Button 
                        variant="outlined" 
                        startIcon={<Edit />}
                        fullWidth
                        onClick={() => onEdit(post)}
                      >
                        Sửa
                      </Button>
                      <Button 
                        variant="outlined" 
                        color="error"
                        startIcon={<Delete />}
                        fullWidth
                        onClick={() => onDelete(post.id)}
                      >
                        Xóa
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default PostList;