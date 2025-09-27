import React, { useState, useEffect } from 'react';
import { useParams, Outlet, Link as RouterLink, useOutletContext } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { lightTheme, darkTheme } from '../theme';
import { Container, Typography, Box, Link, CircularProgress, CssBaseline, Button } from '@mui/material';
import LanguageSwitcher from '../components/LanguageSwitcher';

function RestaurantLayout() {
    const { restaurantId } = useParams();
    const [theme, setTheme] = useState(null);
    const [restaurantData, setRestaurantData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null); // State to hold errors

    useEffect(() => {
        const fetchRestaurantAndTheme = async () => {
            if (!restaurantId) {
                return;
            }
            setIsLoading(true);
            setError(null);
            setTheme(null);
            setRestaurantData(null);
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/restaurants/${restaurantId}`);
                if (response.status === 404) {
                    throw new Error("Restaurant not found");
                }
                if (!response.ok) {
                    throw new Error("Restaurant data not found");
                }

                const data = await response.json();
                setRestaurantData(data); // Save the restaurant data first

                if (data.useDarkTheme) {
                    let customThemeOptions = { ...darkTheme };
                    if (data.themePrimaryColor) customThemeOptions.palette.primary.main = data.themePrimaryColor;
                    if (data.themeSecondaryColor) customThemeOptions.palette.secondary.main = data.themeSecondaryColor;
                    setTheme(createTheme(customThemeOptions));
                } else {
                    let customThemeOptions = { ...lightTheme };
                    if (data.themePrimaryColor) customThemeOptions.palette.primary.main = data.themePrimaryColor;
                    if (data.themeSecondaryColor) customThemeOptions.palette.secondary.main = data.themeSecondaryColor;
                    setTheme(createTheme(customThemeOptions));
                }
            } catch (error) {
                console.error("Theme/data loading failed:", error);
                setError(error.message);
                setTheme(lightTheme); // Fallback to default on error
            }finally {
                setIsLoading(false);
            }
        };
        fetchRestaurantAndTheme();
    }, [restaurantId]);

    if (error) {
        return (
            <Container sx={{ textAlign: 'center', mt: 4 }}>
                <Typography variant="h4">Oops! Page Not Found</Typography>
                <Typography>The restaurant you are looking for is not available.</Typography>
                <Button component={Link} to="/" variant="contained" sx={{ mt: 2 }}>Go to Homepage</Button>
            </Container>
        );
    }

    // If the theme or data is not yet loaded, show a full-page spinner.
    // This prevents child routes from rendering prematurely.
    if (isLoading || !theme || !restaurantData) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <header>
                <Box sx={{ p: 2, backgroundColor: 'primary.main', color: theme.palette.getContrastText(theme.palette.primary.main) }}>
                    <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Link component={RouterLink} to={`/restaurants/${restaurantId}`} color="inherit" underline="none">
                            {restaurantData.logoUrl ? (
                                <img src={restaurantData.logoUrl} alt={`${restaurantData.name} logo`} style={{ height: '40px', display: 'block' }} />
                            ) : (
                                <Typography variant="h6">{restaurantData.name}</Typography>
                            )}
                        </Link>
                        <LanguageSwitcher />
                    </Container>
                </Box>
            </header>
            <main>
                {/* The Outlet renders the child route (MenuPage or ReservationPage) */}
                {/* and passes the fetched restaurantData down to it via context */}
                <Outlet context={{ restaurant: restaurantData }} />
            </main>
        </ThemeProvider>
    );
}

// Custom hook for child components to get the restaurant data.
// This is the key fix for the "Cannot destructure" error.
export function useRestaurant() {
    return useOutletContext();
}

export default RestaurantLayout;