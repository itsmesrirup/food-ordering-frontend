import React from 'react';
import { Routes, Route, Link as RouterLink } from 'react-router-dom';
import { Container, Typography, Box, Button, Link } from '@mui/material';
import LandingPage from './pages/LandingPage';
import MenuPage from './pages/MenuPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import ReservationPage from './pages/ReservationPage';
import RestaurantLayout from './layouts/RestaurantLayout';
import RestaurantWebsitePage from './pages/RestaurantWebsitePage';
import { Toaster } from 'react-hot-toast';
import MainLayout from './layouts/MainLayout';

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

      {/* --- UPDATED FOOTER --- */}
      <Box component="footer" sx={{ py: 3, px: 2, backgroundColor: '#fafafa', textAlign: 'center', borderTop: '1px solid #eee' }}>
        <Typography variant="body2" color="text.secondary">
          Online ordering seamlessly powered by{' '}
          <Link 
            component={RouterLink} 
            to="/" 
            color="inherit" 
            sx={{ fontWeight: 'bold', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            Tablo
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}

export default App;