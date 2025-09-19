import React from 'react';
import { Routes, Route, Link as RouterLink, Outlet, Navigate } from 'react-router-dom';
import { Container, Typography, Box, Link, Button, ButtonGroup } from '@mui/material';
import LandingPage from './pages/LandingPage';
import MenuPage from './pages/MenuPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import ReservationPage from './pages/ReservationPage';
import LanguageSwitcher from './components/LanguageSwitcher';
import RestaurantLayout from './layouts/RestaurantLayout';
import { Toaster } from 'react-hot-toast';

// ✅ 1. Import the new pages and the customer auth context
import { CustomerAuthProvider, useCustomerAuth } from './context/CustomerAuthContext';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import AccountPage from './pages/AccountPage';

// This is a new component that will protect routes
const ProtectedRoute = ({ children }) => {
    const { token, isLoading } = useCustomerAuth();
    if (isLoading) {
        return <div>Loading session...</div>; // Or a spinner
    }
    return token ? children : <Navigate to="/login" replace />;
};

// Layout for non-restaurant pages, now auth-aware
const MainLayout = () => {
    const { customer } = useCustomerAuth(); // Get customer state

    return (
      <>
        <header>
          <Box sx={{ p: 2, backgroundColor: 'primary.main', color: 'white' }}>
            <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" component="div">
                <Link component={RouterLink} to="/" color="inherit" underline="none">Tablo</Link>
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {customer ? (
                  <Button component={RouterLink} to="/account" color="inherit">My Account</Button>
                ) : (
                  <ButtonGroup variant="text" color="inherit">
                    <Button component={RouterLink} to="/login">Login</Button>
                    {/* Note: Sign Up requires restaurant context - users should go to a restaurant page first */}
                  </ButtonGroup>
                )}
                <LanguageSwitcher />
              </Box>
            </Container>
          </Box>
        </header>
        <main><Outlet /></main>
      </>
    );
};

// The main App component is now just a wrapper for the routes
function App() {
  return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Toaster position="top-center" />
          
          <Box sx={{ flexGrow: 1 }}>
            <Routes>
              <Route element={<MainLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
                <Route path="/login/:restaurantId?" element={<LoginPage />} />
                <Route path="/signup/:restaurantId" element={<SignUpPage />} />
                {/* ✅ 3. Add a protected route for the account page */}
                <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
              </Route>

              <Route element={<RestaurantLayout />}>
                <Route path="/restaurants/:restaurantId" element={<MenuPage />} />
                <Route path="/restaurants/:restaurantId/reserve" element={<ReservationPage />} />
              </Route>
              
              <Route path="*" element={
                <Container sx={{ textAlign: 'center', mt: 4 }}>
                  <Typography variant="h4">Page Not Found</Typography>
                  <Button component={RouterLink} to="/" variant="contained" sx={{ mt: 2 }}>Go Home</Button>
                </Container>
              } />
            </Routes>
          </Box>

          <Box component="footer" sx={{ py: 2, px: 2, backgroundColor: '#f5f5f5', textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Online ordering powered by <strong>Tablo</strong>
            </Typography>
          </Box>
        </Box>
  );
}

export default App;