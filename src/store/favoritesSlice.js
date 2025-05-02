import { createSlice } from '@reduxjs/toolkit';

const loadFavorites = () => {
  const saved = localStorage.getItem('realEstateFavorites');
  return saved ? JSON.parse(saved) : [];
};

const saveFavorites = (favorites) => {
  localStorage.setItem('realEstateFavorites', JSON.stringify(favorites));
};

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState: {
    items: loadFavorites(),
  },
  reducers: {
    addFavorite: (state, action) => {
      if (!state.items.some(item => item.id === action.payload.id)) {
        state.items.push(action.payload);
        saveFavorites(state.items);
      }
    },
    removeFavorite: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      saveFavorites(state.items);
    },
    clearFavorites: (state) => {
      state.items = [];
      saveFavorites(state.items);
    }
  }
});

export const { addFavorite, removeFavorite, clearFavorites } = favoritesSlice.actions;
export const selectFavorites = (state) => state.favorites.items;
export default favoritesSlice.reducer;