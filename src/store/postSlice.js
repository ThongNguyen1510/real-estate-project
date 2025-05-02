import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  posts: [],
  loading: false,
  error: null
};

const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    addPostStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    addPostSuccess: (state, action) => {
      const newPost = {
        ...action.payload,
        isVerified: action.payload.isVerified || false
      };
      state.posts.push(newPost);
      state.loading = false;
    },
    addPostFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updatePostStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updatePostSuccess: (state, action) => {
      const index = state.posts.findIndex(post => post.id === action.payload.id);
      if (index !== -1) {
        state.posts[index] = action.payload;
      }
      state.loading = false;
    },
    updatePostFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deletePostStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    deletePostSuccess: (state, action) => {
      state.posts = state.posts.filter(post => post.id !== action.payload);
      state.loading = false;
    },
    deletePostFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchPostsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchPostsSuccess: (state, action) => {
      const postsWithVerification = action.payload.map(post => ({
        ...post,
        isVerified: post.isVerified || false
      }));
      state.posts = postsWithVerification;
      state.loading = false;
    },
    fetchPostsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    verifyPost: (state, action) => {
      const { postId, isVerified } = action.payload;
      const index = state.posts.findIndex(post => post.id === postId);
      if (index !== -1) {
        state.posts[index].isVerified = isVerified;
      }
    }
  }
});

export const { 
  addPostStart,
  addPostSuccess,
  addPostFailure,
  updatePostStart,
  updatePostSuccess,
  updatePostFailure,
  deletePostStart,
  deletePostSuccess,
  deletePostFailure,
  fetchPostsStart,
  fetchPostsSuccess,
  fetchPostsFailure,
  verifyPost
} = postSlice.actions;

export default postSlice.reducer;