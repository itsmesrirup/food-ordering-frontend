import React, 'useState', useEffect } from 'react';
import { Routes, Route, Link as RouterLink, useLocation, matchPath, Outlet } from 'react-router-dom';
import { Container, Typography, Box, Link, Button, createTheme, ThemeProvider, CircularProgress, CssBaseline } from '@mui/material';
import defaultTheme from './theme';
import LandingPage from './pages/LandingPage';
import MenuPage from './pages/MenuPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import ReservationPage from './pages/ReservationPage';
import LanguageSwitcher from './components/LanguageSwitcher';
import { Toaster } from 'react-hot-toast';

// --- Helper Function ---
// A simple utility to determine if a hex color is "dark".
// If the color is dark, we might want to automatically use light-colored text.
const isColorDark = (hexColor) => {
  if (!hexColor || hexColor.length < 4) return false;
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hexColor = hexColor.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexColor);
  if (!result) return false;
  
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);

  // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
  const luminance = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));
  return luminance < 127.5; // Threshold for darkness
};


function App() {
  const [theme, setTheme] = useState(defaultTheme);
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

          let dynamicThemeOptions = { ...defaultTheme };

          if (data.themePrimaryColor) {
            const isDarkBg = isColorDark(data.themeBackgroundColor);
            
            dynamicThemeOptions.palette = {
              ...dynamicThemeOptions.palette,
              primary: { main: data.themePrimaryColor },
              secondary: { main: data.themeSecondaryColor || defaultTheme.palette.secondary.main },
              background: {
                default: data.themeBackgroundColor || defaultTheme.palette.background.default,
                paper: data.themePaperColor || defaultTheme.palette.background.paper,
              },
              text: {
                // ✅ INTELLIGENT FALLBACK: If the background is dark and no text color is set, force white text.
                primary: data.themeTextColorPrimary || (isDarkBg ? '#FFFFFF' : defaultTheme.palette.text.primary),
                secondary: data.themeTextColorSecondary || (isDarkBg ? '#CCCCCC' : defaultTheme.palette.text.secondary),
              },
            };
          }
          
          setTheme(createTheme(dynamicThemeOptions));

        } catch (error) {
          console.error("Failed to load custom theme, using default:", error);
          setTheme(defaultTheme);
          setRestaurantData(null);
        } finally {
          setIsLoading(false);
        }
      };
      fetchRestaurantAndTheme();
    } else {
      setTheme(defaultTheme);
      setRestaurantData(null);
    }
  }, [location.pathname]);

  const headerContent = () => {
    // ... (This function is unchanged from the previous version)
    if (isLoading) return null;

    if (restaurantData) {
      return (
        <Link component={RouterLink} to={`/restaurants/${restaurantData.id}`}>
          {restaurantData.logoUrl ? (
            <img src={restaurantData.logoUrl} alt={`${restaurantData.name} logo`} style={{ height: '40px', display: 'block' }} />
          ) : (
            <Typography variant="h6" color="inherit">{restaurantData.name}</Typography>
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
  
  const pageStyle = restaurantData?.themeBackgroundImageUrl ? {
      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${restaurantData.themeBackgroundImageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
  } : {};

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', ...pageStyle }}>
        <Toaster position="top-center" />
        <header>
          <Box sx={{ p: 2, backgroundColor: 'primary.main', color: 'text.primary' }}>
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