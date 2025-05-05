import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { authService, userService } from '../services/api';

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string | null;
  role?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (userData: any) => Promise<any>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<any>;
  updateAvatar: (formData: FormData) => Promise<any>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<any>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // On component mount, check if user is authenticated
  useEffect(() => {
    const initAuth = async () => {
      const isLoggedIn = authService.checkAuth();
      if (isLoggedIn) {
        try {
          // Try to get fresh user data from the server
          const userData = await authService.getProfile();
          
          // Ensure the avatar field is properly mapped from avatar_url if needed
          if (userData.data) {
            // Handle potential field mapping issues from backend to frontend
            if (userData.data.avatar_url && !userData.data.avatar) {
              userData.data.avatar = userData.data.avatar_url;
            }
            
            // Update localStorage with latest user data to ensure consistency
            localStorage.setItem('user', JSON.stringify(userData.data));
            
            setUser(userData.data);
            setIsAuthenticated(true);
            console.log('Auth context initialized with fresh user data:', userData.data);
          }
        } catch (error) {
          // If server request fails, use the cached user data
          const cachedUser = authService.getCurrentUser();
          if (cachedUser) {
            // Ensure the avatar field exists
            if (cachedUser.avatar_url && !cachedUser.avatar) {
              cachedUser.avatar = cachedUser.avatar_url;
            }
            
            setUser(cachedUser);
            setIsAuthenticated(true);
            console.log('Auth context initialized with cached user data:', cachedUser);
          } else {
            // No cached user, clear auth state
            setIsAuthenticated(false);
            setUser(null);
          }
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('AuthContext: Gửi yêu cầu đăng nhập...', { email });
      const response = await authService.login(email, password);
      console.log('AuthContext: Phản hồi đăng nhập:', response);
      
      // Kiểm tra cấu trúc phản hồi
      if (!response.data || !response.data.token || !response.data.user) {
        console.error('AuthContext: Phản hồi thiếu thông tin data:', response);
        throw new Error('Phản hồi từ máy chủ không hợp lệ');
      }
      
      // Tham chiếu trực tiếp đến các đối tượng token và user từ data
      const { token, user } = response.data;
      
      // Handle avatar_url mapping to avatar if needed
      if (user) {
        if (user.avatar_url && !user.avatar) {
          user.avatar = user.avatar_url;
        }
      }
      
      // Lưu token và thông tin người dùng vào localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Cập nhật trạng thái
      setUser(user);
      setIsAuthenticated(true);
      
      console.log('AuthContext: Đăng nhập thành công, trạng thái đã được cập nhật');
      return response;
    } catch (error) {
      console.error('AuthContext: Lỗi đăng nhập:', error);
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await authService.register(userData);
      
      // Không lưu token và không đặt trạng thái đăng nhập sau khi đăng ký
      // Người dùng sẽ cần đăng nhập sau khi đăng ký thành công
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Update state
    setIsAuthenticated(false);
    setUser(null);
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const response = await authService.updateProfile(data);
      
      // Sửa: Lấy trực tiếp từ response, không cần .data
      setUser(response.user);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const updateAvatar = async (formData: FormData) => {
    try {
      console.log('Starting avatar update...');
      const response = await userService.updateAvatar(formData);
      console.log('Avatar update successful, response:', response);
      
      // Extract avatar path from response
      let avatarPath;
      if (response.data && response.data.avatar) {
        avatarPath = response.data.avatar;
      } else if (response.avatar) {
        avatarPath = response.avatar;
      } else {
        console.warn('Could not find avatar path in response.');
        throw new Error('Could not find avatar path in response');
      }
      
      // Update user state with new avatar
      if (user) {
        console.log('Updating user with new avatar path:', avatarPath);
        
        // First update localStorage to ensure persistence
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        currentUser.avatar = avatarPath;
        localStorage.setItem('user', JSON.stringify(currentUser));
        
        // Then update state
        const updatedUser = { ...user, avatar: avatarPath };
        setUser(updatedUser);
        
        // Log updates for debugging
        console.log('User state updated with new avatar');
        console.log('Updated localStorage user:', JSON.parse(localStorage.getItem('user') || '{}'));
      }
      
      return response;
    } catch (error: any) {
      console.error('Avatar update error in AuthContext:', error);
      throw error;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      const response = await authService.changePassword(currentPassword, newPassword);
      return response;
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider 
      value={{
        isAuthenticated,
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        updateAvatar,
        changePassword,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 