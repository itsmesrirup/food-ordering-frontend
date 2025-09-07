import React, { useState, useEffect } from 'react';
import { useParams, Outlet, Link as RouterLink, useOutletContext } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { lightTheme, darkTheme } from '../theme'; // ✅ Import your theme templates
import { Container, Typography, Box, Link, CircularProgress } from '@mui/material';
import LanguageSwitcher from '../components/LanguageSwitcher';

function RestaurantLayout() {
    const { restaurantId } = useParams();
    const [theme, setTheme] = useState(null);
    const [restaurantData, setRestaurantData] = useState(null);

    useEffect(() => {
        const fetchRestaurantAndTheme = async () => {
            setTheme(null);
            setRestaurantData(null);
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/restaurants/${restaurantId}`);
                if (!response.ok) throw new Error("Restaurant data not found");
                
                const data = await response.json();
                setRestaurantData(data);

                // --- ✅ NEW, CORRECT THEME LOGIC ---
                if (data.useDarkTheme) {
                    // Start with the darkTheme template
                    let customThemeOptions = { ...darkTheme };
                    // Allow overrides if they are provided
                    if (data.themePrimaryColor) customThemeOptions.palette.primary.main = data.themePrimaryColor;
                    if (data.themeSecondaryColor) customThemeOptions.palette.secondary.main = data.themeSecondaryColor;
                    setTheme(createTheme(customThemeOptions));
                } else {
                    // Start with the lightTheme template
                    let customThemeOptions = { ...lightTheme };
                    // Allow overrides if they are provided
                    if (data.themePrimaryColor) customThemeOptions.palette.primary.main = data.themePrimaryColor;
                    if (data.themeSecondaryColor) customThemeOptions.palette.secondary.main = data.themeSecondaryColor;
                    setTheme(createTheme(customThemeOptions));
                }

            } catch (error) {
                console.error("Theme/data loading failed:", error);
                setTheme(lightTheme); // Fallback to the default light theme on error
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
                <Outlet context={{ restaurant: restaurantData }} />
            </main>
        </ThemeProvider>
    );
}

// Custom hook for child components to get the restaurant data
export function useRestaurant() {
    return useOutletContext() || {};
}

export default RestaurantLayout;