import React, { useState, useEffect } from 'react';
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
import WebsiteRouter from './pages/WebsiteRouter';

function App() {
  // 1. Detect if we are on a custom domain or the main SaaS platform
  const hostname = window.location.hostname;
  const isMainSaaSPlatform = 
      hostname.includes('netlify.app') || 
      hostname.includes('localhost') || 
      hostname === 'tablo.io'; // (If you buy tablo.io later)

  // 2. Custom Domain Routing Override
  // If we are NOT on the main platform, we hijack the root route "/" to show their website.
  if (!isMainSaaSPlatform) {
      return (
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Toaster position="top-center" />
              <Box sx={{ flexGrow: 1 }}>
                  <Routes>
                      {/* Instead of LandingPage, show the Restaurant Website */}
                      <Route path="/" element={<WebsiteRouter isCustomDomain={true} />} />
                      
                      {/* The Ordering Page (e.g. www.tikkanway.fr/order) */}
                      <Route element={<RestaurantLayout isCustomDomain={true} />}>
                          <Route path="/order" element={<MenuPage />} />
                          <Route path="/order/reserve" element={<ReservationPage />} />
                      </Route>
                      
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
                  </Routes>
              </Box>
          </Box>
      );
  }
  // 3. Standard Routing (Your existing App.jsx return statement for tablo.netlify.app)
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
            <Route path="/order/:slug" element={<MenuPage />} />
            <Route path="/order/:slug/reserve" element={<ReservationPage />} />
          </Route>

          <Route path="/r/:slug" element={<WebsiteRouter isCustomDomain={false} />} />
          
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