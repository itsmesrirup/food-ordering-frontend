import React, { useState, useEffect } from 'react';
import { useParams, Outlet, Link as RouterLink, useOutletContext } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import defaultTheme from '../theme';
import { Container, Typography, Box, Link, CircularProgress } from '@mui/material';
import LanguageSwitcher from '../components/LanguageSwitcher';

function RestaurantLayout() {
    const { restaurantId } = useParams();
    const [theme, setTheme] = useState(null);
    const [restaurantData, setRestaurantData] = useState(null);

    useEffect(() => {
        const fetchRestaurantAndTheme = async () => {
            setTheme(null); // Reset on navigation
            setRestaurantData(null);
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/restaurants/${restaurantId}`);
                if (!response.ok) throw new Error("Restaurant data not found");
                
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
                console.error("Theme/data loading failed:", error);
                setTheme(defaultTheme); // Fallback to default on error
            }
        };
        fetchRestaurantAndTheme();
    }, [restaurantId]);

    if (!theme || !restaurantData) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <ThemeProvider theme={theme}>
            <header>
                <Box sx={{ p: 2, backgroundColor: 'primary.main', color: 'white' }}>
                    <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Link component={RouterLink} to={`/restaurants/${restaurantId}`}>
                            {restaurantData.logoUrl ? (
                                <img src={restaurantData.logoUrl} alt={`${restaurantData.name} logo`} style={{ height: '40px', display: 'block' }} />
                            ) : (
                                <Typography variant="h6" color="inherit" component="div" sx={{ textDecoration: 'none' }}>{restaurantData.name}</Typography>
                            )}
                        </Link>
                        <LanguageSwitcher />
                    </Container>
                </Box>
            </header>
            <Outlet context={{ restaurant: restaurantData }} />
        </ThemeProvider>
    );
}

// Custom hook to be used by child components (MenuPage, ReservationPage)
export function useRestaurant() {
    return useOutletContext();
}

export default RestaurantLayout;