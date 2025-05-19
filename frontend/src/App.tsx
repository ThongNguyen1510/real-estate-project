import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './styles/theme';
import './styles/GlobalStyles.scss';

// Layout components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ScrollToTop from './components/layout/ScrollToTop';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserProfilePage from './pages/UserProfilePage';
import PublicProfilePage from './pages/PublicProfilePage';
import PropertyListingPage from './pages/PropertyListingPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import PropertyMapPage from './pages/PropertyMapPage';
import CreateListingPage from './pages/CreateListingPage';
import MyProperties from './pages/user/MyProperties';
import NewsPage from './pages/NewsPage';
import NewsDetailPage from './pages/NewsDetailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import FavoritesPage from './pages/user/FavoritesPage';
import SearchPage from './pages/SearchPage';
import NotificationsPage from './pages/NotificationsPage';

// Admin Pages
import DashboardPage from './pages/admin/DashboardPage';
import UsersPage from './pages/admin/UsersPage';
import PropertiesPage from './pages/admin/PropertiesPage';
import ReportsManagementPage from './pages/admin/ReportsManagementPage';
import NewsManagementPage from './pages/admin/NewsManagementPage';
import AdminLayout from './pages/admin/AdminLayout';

// Context
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { NotificationProvider } from './contexts/NotificationContext';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router basename="/">
        <AuthProvider>
          <NotificationProvider>
          <FavoritesProvider>
            <ScrollToTop />
            <AppContent />
          </FavoritesProvider>
          </NotificationProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

// Separate component to use the auth context
const AppContent = () => {
  const { loading, isAuthenticated, user } = useAuth();

  // Kiểm tra quyền admin
  const isAdmin = user && user.role === 'admin';

  // Giả sử đang tải
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/quen-mat-khau" element={<ForgotPasswordPage />} />
          <Route path="/dat-lai-mat-khau" element={<ResetPasswordPage />} />
          <Route path="/reset-password" element={<Navigate to="/dat-lai-mat-khau" replace state={{ preserveQuery: true }} />} />
          <Route path="/ho-so" element={isAuthenticated ? <UserProfilePage /> : <Navigate to="/login" />} />
          <Route path="/nguoi-dung/:userId" element={<PublicProfilePage />} />
          <Route path="/mua-ban" element={<Navigate to="/tim-kiem?listing_type=sale" replace />} />
          <Route path="/cho-thue" element={<Navigate to="/tim-kiem?listing_type=rent" replace />} />
          <Route path="/ban-do" element={<PropertyMapPage />} />
          <Route path="/bat-dong-san/:id" element={<PropertyDetailPage />} />
          <Route path="/dang-tin" element={isAuthenticated ? <CreateListingPage /> : <Navigate to="/login" />} />
          <Route path="/user/my-properties" element={isAuthenticated ? <MyProperties /> : <Navigate to="/login" state={{ from: '/user/my-properties' }} />} />
          <Route path="/user/favorites" element={isAuthenticated ? <FavoritesPage /> : <Navigate to="/login" state={{ from: '/user/favorites' }} />} />
          <Route path="/thong-bao" element={isAuthenticated ? <NotificationsPage /> : <Navigate to="/login" state={{ from: '/thong-bao' }} />} />
          <Route path="/tin-tuc" element={<NewsPage />} />
          <Route path="/tin-tuc/:id" element={<NewsDetailPage />} />
          <Route path="/tim-kiem" element={<SearchPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={isAuthenticated && isAdmin ? <DashboardPage /> : <Navigate to="/login" state={{ from: '/admin' }} />} />
          <Route path="/admin/users" element={isAuthenticated && isAdmin ? <UsersPage /> : <Navigate to="/login" state={{ from: '/admin/users' }} />} />
          <Route path="/admin/properties" element={isAuthenticated && isAdmin ? <PropertiesPage /> : <Navigate to="/login" state={{ from: '/admin/properties' }} />} />
          <Route path="/admin/reports" element={isAuthenticated && isAdmin ? <ReportsManagementPage /> : <Navigate to="/login" state={{ from: '/admin/reports' }} />} />
          <Route path="/admin/news" element={isAuthenticated && isAdmin ? <NewsManagementPage /> : <Navigate to="/login" state={{ from: '/admin/news' }} />} />
          
          {/* Fallback route - 404 Not Found */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
};

export default App;
