import { configureStore } from '@reduxjs/toolkit';
import favoritesReducer from './favoritesSlice';
import authReducer from './authSlice'; // Đảm bảo import đúng

export default configureStore({
  reducer: {
    favorites: favoritesReducer,
    auth: authReducer
  },
});