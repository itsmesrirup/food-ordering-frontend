import React, { useState, useEffect } from 'react';
import { useParams, Outlet } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CircularProgress, Box } from '@mui/material';
import defaultTheme from '../theme'; //  default Tablo theme

function RestaurantLayout() {
    const { restaurantId } = useParams();
    const [theme, setTheme] = useState(defaultTheme);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRestaurantAndBuildTheme = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/restaurants/${restaurantId}`);
                if (!response.ok) throw new Error("Restaurant not found");
                
                const data = await response.json();

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
                console.error("Theme loading failed, using default:", error);
                setTheme(defaultTheme);
            } finally {
                setIsLoading(false);
            }
        };

        if (restaurantId) {
            fetchRestaurantAndBuildTheme();
        }
    }, [restaurantId]);

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    // The Outlet component from react-router-dom renders the nested child route (e.g., MenuPage).
    // The ThemeProvider wraps it, providing the correct theme.
    return (
        <ThemeProvider theme={theme}>
            <Outlet />
        </ThemeProvider>
    );
}

export default RestaurantLayout;