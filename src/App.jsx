import React, { useState, useEffect } from 'react';
import { Routes, Route, Link as RouterLink, useLocation, matchPath, Outlet } from 'react-router-dom';
import { Container, Typography, Box, Link, Button, createTheme, ThemeProvider, CircularProgress } from '@mui/material';
import defaultTheme from './theme';
import LandingPage from './pages/LandingPage';
import MenuPage from './pages/MenuPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import ReservationPage from './pages/ReservationPage';
import LanguageSwitcher from './components/LanguageSwitcher';
import { Toaster } from 'react-hot-toast';

function App() {
  const [theme, setTheme] = useState(defaultTheme);
  const [restaurantData, setRestaurantData] = useState(null);
  const [isLoadingTheme, setIsLoadingTheme] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const restaurantRouteMatch = matchPath('/restaurants/:restaurantId/*', location.pathname);
    
    if (restaurantRouteMatch) {
      const { restaurantId } = restaurantRouteMatch.params;
      setIsLoadingTheme(true);
      
      const fetchRestaurantAndTheme = async () => {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/restaurants/${restaurantId}`);
          if (!response.ok) throw new Error("Data not found for theming");
          
          const data = await response.json();
          setRestaurantData(data);

          if (data.themePrimaryColor) {
            const customTheme = createTheme({
              ...defaultTheme,
              palette: {
                ...defaultTheme.palette,
                primary: { main: data.themePrimaryColor },
                secondary: { main: data.themeSecondaryColor || defaultTheme.palette.secondary.main },
              },
            });
            setTheme(customTheme);
          } else {
            setTheme(defaultTheme);
          }
        } catch (error) {
          console.error("Failed to load custom theme, using default:", error);
          setTheme(defaultTheme);
        } finally {
          setIsLoadingTheme(false);
        }
      };
      fetchRestaurantAndTheme();
    } else {
      setTheme(defaultTheme);
      setRestaurantData(null);
    }
  }, [location.pathname]);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: theme.palette.background.default }}>
        <Toaster position="top-center" />
        <header>
          <Box sx={{ p: 2, backgroundColor: 'primary.main', color: 'white' }}>
            <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {restaurantData ? (
                <Link component={RouterLink} to={`/restaurants/${restaurantData.id}`}>
                  {restaurantData.logoUrl ? (
                    <img src={restaurantData.logoUrl} alt={`${restaurantData.name} logo`} style={{ height: '40px', display: 'block' }} />
                  ) : (
                    <Typography variant="h6" color="inherit">{restaurantData.name}</Typography>
                  )}
                </Link>
              ) : (
                <Link component={RouterLink} to="/" color="inherit" underline="none">
                  <Typography variant="h6">Tablo</Typography>
                </Link>
              )}
              <LanguageSwitcher />
            </Container>
          </Box>
        </header>

        <main style={{ flexGrow: 1 }}>
          {isLoadingTheme ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress color="primary" /></Box>
          ) : (
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/restaurants/:restaurantId" element={<MenuPage />} />
              <Route path="/restaurants/:restaurantId/reserve" element={<ReservationPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
              <Route path="*" element={
                <Container sx={{ textAlign: 'center', mt: 4 }}>
                  <Typography variant="h4">Page Not Found</Typography>
                  <Button component={RouterLink} to="/" variant="contained" sx={{ mt: 2 }}>Go Home</Button>
                </Container>
              } />
            </Routes>
          )}
        </main>

        <Box component="footer" sx={{ py: 2, px: 2, backgroundColor: '#f5f5f5', textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Online ordering powered by{' '}
            <Link color="inherit" href="#">
              <strong>Tablo</strong>
            </Link>
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;