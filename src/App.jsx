import React from 'react';
import { Routes, Route, Link as RouterLink } from 'react-router-dom';
import { Container, Typography, Box, Link, Button } from '@mui/material';
import LandingPage from './pages/LandingPage';
import MenuPage from './pages/MenuPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import ReservationPage from './pages/ReservationPage';
import LanguageSwitcher from './components/LanguageSwitcher'; // Make sure this component exists
import { Toaster } from 'react-hot-toast';
import DynamicThemeProvider from './components/DynamicThemeProvider';

function App() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Toaster position="top-center" />
      
      <header>
        <Box sx={{ p: 2, backgroundColor: 'primary.main', color: 'white' }}>
          <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* Left Side: Brand Name */}
            <Typography variant="h6" component="div">
              <Link component={RouterLink} to="/" color="inherit" underline="none">
                Tablo
              </Link>
            </Typography>

            {/* ✅ Right Side: Language Switcher */}
            <LanguageSwitcher />
          </Container>
        </Box>
      </header>

      <main style={{ flexGrow: 1, padding: '1rem 0' }}>
        <Routes>
          {/* Landing, Checkout, etc., use the default theme */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
          {/* ✅ Wrap restaurant-specific pages with the dynamic theme provider */}
          <Route 
            path="/restaurants/:restaurantId" 
            element={<DynamicThemeProvider><MenuPage /></DynamicThemeProvider>} 
          />
          <Route 
            path="/restaurants/:restaurantId/reserve" 
            element={<DynamicThemeProvider><ReservationPage /></DynamicThemeProvider>} 
          />
          <Route path="*" element={
            <Container sx={{ textAlign: 'center', mt: 4 }}>
              <Typography variant="h4">Page Not Found</Typography>
              <Button component={RouterLink} to="/" variant="contained" sx={{ mt: 2 }}>Go Home</Button>
            </Container>
          } />
        </Routes>
      </main>

      <Box 
        component="footer" 
        sx={{ py: 2, px: 2, mt: 'auto', backgroundColor: '#f5f5f5', textAlign: 'center' }}
      >
        <Typography variant="body2" color="text.secondary">
          Online ordering powered by{' '}
          <Link color="inherit" href="https://your-website.com">
            <strong>Tablo</strong>
          </Link>
        </Typography>
      </Box>
    </Box>
  )
}

export default App;