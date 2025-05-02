import { configureStore } from '@reduxjs/toolkit';
import favoritesReducer from './favoritesSlice';
import authReducer from './authSlice';
import postReducer from './postSlice';
import notificationsReducer from './notificationsSlice';

export default configureStore({
  reducer: {
    favorites: favoritesReducer,
    auth: authReducer,
    posts: postReducer,
    notifications: notificationsReducer
  },
});