import { createSlice } from '@reduxjs/toolkit';

// Sample user data for development/testing
const sampleUser = {
  id: 1,
  fullName: 'Nguyễn Văn A',
  email: 'nguyenvana@example.com',
  phone: '0912345678',
  address: 'Quận 1, TP. Hồ Chí Minh',
  bio: 'Môi giới bất động sản chuyên nghiệp với hơn 5 năm kinh nghiệm.',
  avatar: null, // Will be set by the user
  isVerified: false, // Verification status
  verificationDocuments: [] // Array of document URLs or file objects
};

const initialState = {
  isAuthenticated: true, // Set to true for frontend development
  user: sampleUser, // Use sample data for frontend testing
  loading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      state.loading = false;
      state.error = null;
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.loading = false;
      state.error = null;
    },
    registerStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    registerSuccess: (state, action) => {
      state.loading = false;
      state.error = null;
    },
    registerFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateProfile: (state, action) => {
      state.user = {
        ...state.user,
        ...action.payload
      };
    },
    verifyUser: (state, action) => {
      if (state.user) {
        state.user.isVerified = action.payload.isVerified;
        if (action.payload.verificationDocuments) {
          state.user.verificationDocuments = action.payload.verificationDocuments;
        }
      }
    }
  }
});

export const { 
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  registerStart,
  registerSuccess,
  registerFailure,
  updateProfile,
  verifyUser
} = authSlice.actions;

export default authSlice.reducer;