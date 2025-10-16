import React from 'react';
import { Routes, Route, Link as RouterLink, Outlet } from 'react-router-dom';
import { Container, Typography, Box, Link, Button } from '@mui/material';
import LandingPage from './pages/LandingPage';
import MenuPage from './pages/MenuPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import ReservationPage from './pages/ReservationPage';
import LanguageSwitcher from './components/LanguageSwitcher';
import RestaurantLayout from './layouts/RestaurantLayout';
import RestaurantWebsitePage from './pages/RestaurantWebsitePage';
import { Toaster } from 'react-hot-toast';

// Layout for non-restaurant pages
const MainLayout = () => (
  <>
    <header>
      <Box sx={{ p: 2, backgroundColor: 'primary.main', color: 'white' }}>
        <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="div">
            <Link component={RouterLink} to="/" color="inherit" underline="none">Tablo</Link>
          </Typography>
          <LanguageSwitcher />
        </Container>
      </Box>
    </header>
    <main><Outlet /></main>
  </>
);

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
          </Route>

          <Route element={<RestaurantLayout />}>
            <Route path="/restaurants/:restaurantId" element={<MenuPage />} />
            <Route path="/restaurants/:restaurantId/reserve" element={<ReservationPage />} />
          </Route>

          <Route path="/r/:slug" element={<RestaurantWebsitePage />} />
          
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