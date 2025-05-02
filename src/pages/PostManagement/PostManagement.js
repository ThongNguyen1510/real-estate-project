import React, { useState } from 'react';
import { Container, Box, Tabs, Tab, Typography } from '@mui/material';
import PostForm from '../../components/PostForm/PostForm';
import PostList from '../../components/PostList/PostList';

const PostManagement = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [posts, setPosts] = useState([]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSubmitPost = (newPost) => {
    setPosts([...posts, { ...newPost, id: Date.now() }]);
    setActiveTab(1); // Chuyển sang tab quản lý sau khi đăng
  };

  const handleEditPost = (postToEdit) => {
    setPosts(posts.map(post => 
      post.id === postToEdit.id ? postToEdit : post
    ));
  };

  const handleDeletePost = (postId) => {
    setPosts(posts.filter(post => post.id !== postId));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Quản lý bài đăng
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Đăng bài mới" />
          <Tab label="Bài đăng của tôi" />
        </Tabs>
      </Box>
      
      {activeTab === 0 ? (
        <PostForm onSubmit={handleSubmitPost} />
      ) : (
        <PostList 
          posts={posts} 
          onEdit={handleEditPost} 
          onDelete={handleDeletePost} 
        />
      )}
    </Container>
  );
};

export default PostManagement;