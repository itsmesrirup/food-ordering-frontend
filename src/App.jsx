import React, { useState, useEffect } from 'react';
import { Routes, Route, Link as RouterLink, useLocation, matchPath, Outlet } from 'react-router-dom';
import { Container, Typography, Box, Link, Button, createTheme, ThemeProvider, CircularProgress, CssBaseline } from '@mui/material';
import { lightTheme, darkTheme } from './theme'; // Import both theme templates
import LandingPage from './pages/LandingPage';
import MenuPage from './pages/MenuPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import ReservationPage from './pages/ReservationPage';
import LanguageSwitcher from './components/LanguageSwitcher';
import { Toaster } from 'react-hot-toast';

function App() {
  const [theme, setTheme] = useState(lightTheme);
  const [restaurantData, setRestaurantData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const restaurantRouteMatch = matchPath('/restaurants/:restaurantId/*', location.pathname);
    
    if (restaurantRouteMatch) {
      const { restaurantId } = restaurantRouteMatch.params;
      setIsLoading(true);
      
      const fetchRestaurantAndTheme = async () => {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/restaurants/${restaurantId}`);
          if (!response.ok) throw new Error("Data not found for theming");
          
          const data = await response.json();
          setRestaurantData(data);

          // --- DYNAMIC THEME LOGIC ---
          if (data.useDarkTheme) {
            // Start with the dark theme template
            let customDarkThemeOptions = { ...darkTheme };
            
            // Allow overriding specific dark theme colors if provided
            if (data.themePrimaryColor || data.themeSecondaryColor) {
                customDarkThemeOptions.palette = {
                    ...darkTheme.palette,
                    primary: { main: data.themePrimaryColor || darkTheme.palette.primary.main },
                    secondary: { main: data.themeSecondaryColor || darkTheme.palette.secondary.main },
                };
            }
            setTheme(createTheme(customDarkThemeOptions));
          } else {
            // Logic for custom LIGHT themes (same as before)
             if (data.themePrimaryColor) {
                const customLightThemeOptions = {
                    ...lightTheme,
                    palette: {
                        ...lightTheme.palette,
                        primary: { main: data.themePrimaryColor },
                        secondary: { main: data.themeSecondaryColor || lightTheme.palette.secondary.main },
                    },
                };
                setTheme(createTheme(customLightThemeOptions));
            } else {
                 setTheme(lightTheme);
            }
          }
        } catch (error) {
          console.error("Failed to load custom theme, using default:", error);
          setTheme(lightTheme);
          setRestaurantData(null);
        } finally {
          setIsLoading(false);
        }
      };
      fetchRestaurantAndTheme();
    } else {
      setTheme(lightTheme);
      setRestaurantData(null);
    }
  }, [location.pathname]);

  const headerContent = () => {
    if (isLoading) return null;

    if (restaurantData) {
      return (
        <Link component={RouterLink} to={`/restaurants/${restaurantData.id}`} color="inherit" underline="none">
          {restaurantData.logoUrl ? (
            <img src={restaurantData.logoUrl} alt={`${restaurantData.name} logo`} style={{ height: '40px', display: 'block' }} />
          ) : (
            <Typography variant="h6">{restaurantData.name}</Typography>
          )}
        </Link>
      );
    }
    return (
      <Link component={RouterLink} to="/" color="inherit" underline="none">
        <Typography variant="h6">Tablo</Typography>
      </Link>
    );
  };
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* This applies the background color from the theme */}
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Toaster position="top-center" />
        <header>
          <Box sx={{ p: 2, backgroundColor: 'primary.main', color: theme.palette.getContrastText(theme.palette.primary.main) }}>
            <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {headerContent()}
              <LanguageSwitcher />
            </Container>
          </Box>
        </header>

        <main style={{ flexGrow: 1 }}>
          {isLoading ? (
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