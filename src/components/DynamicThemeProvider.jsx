import React, { useState, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useParams } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import defaultTheme from '../theme'; // Import our default "Tablo" theme

function DynamicThemeProvider({ children }) {
    const { restaurantId } = useParams();
    const [theme, setTheme] = useState(defaultTheme);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRestaurantTheme = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/restaurants/${restaurantId}`);
                if (!response.ok) {
                    throw new Error("Restaurant not found");
                }
                const data = await response.json();

                // Check if the restaurant has custom theme colors
                if (data.themePrimaryColor) {
                    const customTheme = createTheme({
                        ...defaultTheme, // Start with the default theme
                        palette: {
                            ...defaultTheme.palette,
                            primary: {
                                main: data.themePrimaryColor,
                            },
                            secondary: {
                                main: data.themeSecondaryColor || defaultTheme.palette.secondary.main,
                            },
                        },
                    });
                    setTheme(customTheme);
                } else {
                    // If no custom theme, use the default
                    setTheme(defaultTheme);
                }
            } catch (error) {
                console.error("Theme loading failed, using default:", error);
                setTheme(defaultTheme);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRestaurantTheme();
    }, [restaurantId]);

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    // Provide the calculated theme to all children
    return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}

export default DynamicThemeProvider;