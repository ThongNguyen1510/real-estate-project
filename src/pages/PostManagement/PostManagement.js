import React, { useEffect, useState } from 'react';
import { Container, Box, Tabs, Tab, Typography, CircularProgress, Alert, Snackbar, Paper } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { 
  addPostStart,
  updatePostStart,
  deletePostStart,
  fetchPostsStart,
  addPostSuccess,
  updatePostSuccess,
  deletePostSuccess
} from '../../store/postSlice';
import PostForm from '../../components/PostForm/PostForm';
import PostList from '../../components/PostList/PostList';

const PostManagement = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [editingPost, setEditingPost] = useState(null);
  const dispatch = useDispatch();
  const { posts, loading, error } = useSelector(state => state.posts);
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    if (user) {
      dispatch(fetchPostsStart());
      // Trong thực tế, bạn sẽ gọi API để lấy bài đăng của user hiện tại
      // dispatch(fetchPostsSuccess(mockPosts));
    }
  }, [user, dispatch]);

  const handleTabChange = (event, newValue) => {
    // Reset editing post when switching tabs
    if (editingPost && newValue === 1) {
      setEditingPost(null);
    }
    setActiveTab(newValue);
  };

  const handleSubmitPost = (newPost) => {
    // Xử lý khi là chỉnh sửa bài đăng
    if (editingPost) {
      const updatedPost = {
        ...editingPost,
        ...newPost,
        updatedAt: new Date().toISOString()
      };
      
      dispatch(updatePostStart());
      // Trong thực tế, bạn sẽ gọi API để cập nhật bài đăng
      // Sau khi API thành công:
      dispatch(updatePostSuccess(updatedPost));
      setNotification({
        open: true,
        message: 'Cập nhật bài đăng thành công!',
        severity: 'success'
      });
      setEditingPost(null);
      setActiveTab(1);
      return;
    }

    // Xử lý khi là thêm bài đăng mới
    const postWithUser = {
      ...newPost,
      id: Date.now(),
      userId: user?.id || 1,
      createdAt: new Date().toISOString(),
      status: 'pending' // Trạng thái chờ duyệt
    };
    
    dispatch(addPostStart());
    // Simulate API delay
    setTimeout(() => {
      // Trong thực tế, bạn sẽ gọi API để thêm bài đăng
      // Sau khi API thành công:
      dispatch(addPostSuccess(postWithUser));
      setNotification({
        open: true,
        message: 'Đăng bài thành công! Bài đăng của bạn đang chờ duyệt.',
        severity: 'success'
      });
      setActiveTab(1);
    }, 1500);
  };

  const handleEditPost = (postToEdit) => {
    setEditingPost(postToEdit);
    setActiveTab(0);
  };

  const handleDeletePost = (postId) => {
    dispatch(deletePostStart());
    // Trong thực tế, bạn sẽ gọi API để xóa bài đăng
    // Sau khi API thành công:
    dispatch(deletePostSuccess(postId));
    setNotification({
      open: true,
      message: 'Xóa bài đăng thành công!',
      severity: 'success'
    });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3, color: 'primary.main' }}>
        {activeTab === 0 ? (editingPost ? "Chỉnh sửa bài đăng" : "Đăng tin bất động sản") : "Quản lý bài đăng"}
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ 
            '& .MuiTab-root': { 
              fontWeight: 'bold',
              py: 2
            }
          }}
        >
          <Tab label={editingPost ? "Chỉnh sửa bài đăng" : "Đăng bài mới"} />
          <Tab label="Bài đăng của tôi" />
        </Tabs>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {loading && activeTab === 1 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {activeTab === 0 ? (
            <PostForm 
              onSubmit={handleSubmitPost} 
              initialData={editingPost}
            />
          ) : (
            <>
              {posts.length === 0 ? (
                <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Bạn chưa có bài đăng nào
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Hãy bắt đầu đăng tin để tiếp cận với nhiều khách hàng hơn
                  </Typography>
                </Paper>
              ) : (
                <PostList 
                  posts={posts.filter(post => !user?.id || post.userId === user?.id)} 
                  onEdit={handleEditPost} 
                  onDelete={handleDeletePost} 
                />
              )}
            </>
          )}
        </>
      )}

      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default PostManagement;