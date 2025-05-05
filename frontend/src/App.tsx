import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './styles/theme';
import './styles/GlobalStyles.scss';

// Layout components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserProfilePage from './pages/UserProfilePage';
import PropertyListingPage from './pages/PropertyListingPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import CreateListingPage from './pages/CreateListingPage';
import MyProperties from './pages/user/MyProperties';
import NewsPage from './pages/NewsPage';
import NewsDetailPage from './pages/NewsDetailPage';

// Context
import { AuthProvider, useAuth } from './contexts/AuthContext';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router basename="/">
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

// Separate component to use the auth context
const AppContent = () => {
  const { loading, isAuthenticated } = useAuth();

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
          <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" />} />
          <Route path="/ho-so" element={isAuthenticated ? <UserProfilePage /> : <Navigate to="/login" />} />
          <Route path="/mua-ban" element={<PropertyListingPage />} />
          <Route path="/cho-thue" element={<PropertyListingPage />} />
          <Route path="/bat-dong-san/:id" element={<PropertyDetailPage />} />
          <Route path="/dang-tin" element={isAuthenticated ? <CreateListingPage /> : <Navigate to="/login" />} />
          <Route path="/user/my-properties" element={isAuthenticated ? <MyProperties /> : <Navigate to="/login" state={{ from: '/user/my-properties' }} />} />
          <Route path="/tin-tuc" element={<NewsPage />} />
          <Route path="/tin-tuc/:id" element={<NewsDetailPage />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
};

export default App;
