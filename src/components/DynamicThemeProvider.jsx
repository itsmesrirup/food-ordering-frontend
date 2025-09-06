import React, { useState, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useParams } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import defaultTheme from '../theme';

function DynamicThemeProvider({ children }) {
    const { restaurantId } = useParams();
    const [theme, setTheme] = useState(defaultTheme);
    const [restaurantData, setRestaurantData] = useState(null); // State for the data
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRestaurantAndTheme = async () => {
            if (!restaurantId) {
                setIsLoading(false);
                return;
            }
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/restaurants/${restaurantId}`);
                if (!response.ok) throw new Error("Restaurant not found");
                
                const data = await response.json();
                setRestaurantData(data); // Save the fetched restaurant data

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
                setTheme(defaultTheme);
            } finally {
                setIsLoading(false);
            }
        };
        fetchRestaurantAndTheme();
    }, [restaurantId]);

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    // ✅ Pass the fetched restaurant data down to the child component (e.g., MenuPage)
    // React.cloneElement is used to add new props to the child
    const childrenWithProps = React.Children.map(children, child => {
        if (React.isValidElement(child)) {
            return React.cloneElement(child, { restaurantData });
        }
        return child;
    });

    return <ThemeProvider theme={theme}>{childrenWithProps}</ThemeProvider>;
}

export default DynamicThemeProvider;