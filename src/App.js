import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Container, CircularProgress } from '@mui/material';
import { Provider, useSelector } from 'react-redux';
import theme from './theme';
import store from './store/store';

// Components
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import ChatWidget from './components/ChatWidget/ChatWidget';

// Pages
import Home from './pages/Home/Home';
import Properties from './pages/Properties/Properties';
import PropertyDetails from './pages/PropertyDetails/PropertyDetails';
import About from './pages/About/About';
import Contact from './pages/Contact/Contact';
import PostManagement from './pages/PostManagement/PostManagement';
import Favorites from './pages/Favorites/Favorites';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import NotFound from './pages/NotFound/NotFound';

// Layout component với ChatWidget
const LayoutWithChat = ({ children }) => {
  return (
    <>
      {children}
      <ChatWidget />
    </>
  );
};

// Private Route Component
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector(state => state.auth);
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            minHeight: '100vh' 
          }}>
            <Header />
            <Box component="main" sx={{ 
              flex: 1,
              py: { xs: 2, md: 4 },
              backgroundColor: 'background.default'
            }}>
              <Container maxWidth="xl">
                <Routes>
                  {/* Public Routes with Chat */}
                  <Route path="/" element={<LayoutWithChat><Home /></LayoutWithChat>} />
                  <Route path="/properties" element={<LayoutWithChat><Properties /></LayoutWithChat>} />
                  <Route path="/property/:id" element={<LayoutWithChat><PropertyDetails /></LayoutWithChat>} />
                  <Route path="/about" element={<LayoutWithChat><About /></LayoutWithChat>} />
                  <Route path="/contact" element={<LayoutWithChat><Contact /></LayoutWithChat>} />
                  <Route path="/favorites" element={<LayoutWithChat><Favorites /></LayoutWithChat>} />

                  {/* Auth Routes without Chat */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Protected Routes */}
                  <Route path="/post-management" element={
                    <PrivateRoute>
                      <LayoutWithChat><PostManagement /></LayoutWithChat>
                    </PrivateRoute>
                  } />

                  {/* 404 Not Found */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Container>
            </Box>
            <Footer />
          </Box>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;