import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import userService from '../services/api/userService';
import { toggleFavorite as toggleFavoriteAPI } from '../services/api/propertyService';

// Define types for properties and favorites
interface Property {
  id: number;
  title: string;
  price: number;
  area: number;
  property_type: string;
  status: string;
}

interface FavoritesContextType {
  favorites: number[];
  loading: boolean;
  toggleFavorite: (propertyId: number) => Promise<void>;
  isFavorite: (propertyId: number) => boolean;
  loadFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType>({} as FavoritesContextType);

export const useFavorites = () => useContext(FavoritesContext);

interface FavoritesProviderProps {
  children: ReactNode;
}

export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({ children }) => {
  const [favorites, setFavorites] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { isAuthenticated } = useAuth();

  // Load favorites when user authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      loadFavorites();
    } else {
      // Clear favorites when user logs out
      setFavorites([]);
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadFavorites = async () => {
    if (!isAuthenticated) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await userService.getFavorites();
      console.log("Fetched favorites:", response);
      if (response.success && response.data) {
        // Extract property IDs from the favorite properties
        const favoriteIds = response.data.map((property: any) => property.id);
        console.log("Favorite IDs:", favoriteIds);
        setFavorites(favoriteIds);
      } else {
        console.error('Failed to load favorites:', response.message);
        setFavorites([]);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (propertyId: number) => {
    if (!isAuthenticated) {
      // If not authenticated, prompt to log in
      alert('Vui lòng đăng nhập để thêm vào danh sách yêu thích');
      return;
    }

    try {
      // Use the proper toggleFavorite function from propertyService
      const response = await toggleFavoriteAPI(propertyId);
      console.log("Toggle favorite response:", response);
      
      if (response.success) {
        // Update the favorites list based on action returned from API
        if (response.action === 'added') {
          // Add to favorites if not already there
          if (!isFavorite(propertyId)) {
            setFavorites(prevFavorites => [...prevFavorites, propertyId]);
          }
        } else if (response.action === 'removed') {
          // Remove from favorites
          setFavorites(prevFavorites => prevFavorites.filter(id => id !== propertyId));
        } else {
          // Fallback to previous toggle logic if action not specified
          setFavorites(prevFavorites => {
            const isFav = prevFavorites.includes(propertyId);
            if (isFav) {
              return prevFavorites.filter(id => id !== propertyId);
            } else {
              return [...prevFavorites, propertyId];
            }
          });
        }
      } else {
        console.error('Failed to toggle favorite:', response.message);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const isFavorite = (propertyId: number): boolean => {
    return favorites.includes(propertyId);
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        loading,
        toggleFavorite,
        isFavorite,
        loadFavorites
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export default FavoritesContext; 