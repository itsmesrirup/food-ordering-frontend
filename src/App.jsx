import React from 'react';
import { Routes, Route, Link as RouterLink, Outlet } from 'react-router-dom';
import { Container, Typography, Box, Link, Button } from '@mui/material';
import LandingPage from './pages/LandingPage';
import MenuPage from './pages/MenuPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import ReservationPage from './pages/ReservationPage';
import LanguageSwitcher from './components/LanguageSwitcher';
import { Toaster } from 'react-hot-toast';

// A simple layout wrapper for pages that use the default "Tablo" header
const MainLayout = () => (
  <>
    <header>
      <Box sx={{ p: 2, backgroundColor: 'primary.main', color: 'white' }}>
        <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="div">
            <Link component={RouterLink} to="/" color="inherit" underline="none">
              Tablo
            </Link>
          </Typography>
          <LanguageSwitcher />
        </Container>
      </Box>
    </header>
    <main>
      <Outlet /> {/* The actual page component will render here */}
    </main>
  </>
);

function App() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Toaster position="top-center" />
      
      <Routes>
        {/* All pages now render inside a layout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
        </Route>

        {/* Restaurant-specific pages are top-level routes and handle their own layout/theming */}
        <Route path="/restaurants/:restaurantId" element={<MenuPage />} />
        <Route path="/restaurants/:restaurantId/reserve" element={<ReservationPage />} />
        
        <Route path="*" element={
          <Container sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="h4">Page Not Found</Typography>
            <Button component={RouterLink} to="/" variant="contained" sx={{ mt: 2 }}>Go Home</Button>
          </Container>
        } />
      </Routes>

      <Box component="footer" sx={{ py: 2, px: 2, mt: 'auto', backgroundColor: '#f5f5f5', textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Online ordering powered by{' '}
          <Link color="inherit" href="#">
            <strong>Tablo</strong>
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}

export default App;