import React, { useState, useEffect } from 'react';
import { useParams, Outlet, Link as RouterLink, useOutletContext, useSearchParams, useLocation } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { lightTheme, darkTheme } from '../theme';
import { Container, Typography, Box, Link, CircularProgress, CssBaseline, Button, Alert, Paper } from '@mui/material';
import EventSeatIcon from '@mui/icons-material/EventSeat'; 
import LanguageSwitcher from '../components/LanguageSwitcher';

function RestaurantLayout() {
    const { restaurantId } = useParams();
    const location = useLocation();
    const isReservationPage = location.pathname.endsWith('/reserve');
    const [searchParams] = useSearchParams();
    const tableNumber = searchParams.get('table');

    const [theme, setTheme] = useState(lightTheme);
    const [restaurantData, setRestaurantData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRestaurantAndTheme = async () => {
            if (!restaurantId) return;
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/restaurants/${restaurantId}`);
                if (response.status === 404) throw new Error("Restaurant not found");
                if (!response.ok) throw new Error("Restaurant data not found");

                const data = await response.json();
                setRestaurantData(data);

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
                setTheme(createTheme(lightTheme));
            } finally {
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

    if (isLoading || !theme || !restaurantData) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;
    }

    // QR Code Guard Clause
    if (tableNumber && restaurantData && !restaurantData.qrCodeOrderingEnabled) {
        return (
            <Container sx={{ textAlign: 'center', mt: 4 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    <Typography variant="h6">QR Code Ordering Not Available</Typography>
                    This restaurant is not currently accepting orders via QR code.
                </Alert>
                <Button component={RouterLink} to="/" variant="contained">Go to Homepage</Button>
            </Container>
        );
    }

    const heroHeaderStyle = {
        color: '#fff',
        position: 'relative',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${restaurantData.heroImageUrl})`,
        height: '350px', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        textAlign: 'center',
        p: 2
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <header>
                {/* --- RESTORED: White Header Layout --- */}
                <Box sx={{ p: 1, backgroundColor: '#fff', borderBottom: '1px solid #eaeaea' }}>
                    <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        
                        <Link component={RouterLink} to={`/restaurants/${restaurantId}`} color="inherit" underline="none" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            {restaurantData.logoUrl && (
                                <img 
                                    src={restaurantData.logoUrl} 
                                    alt={`${restaurantData.name} logo`} 
                                    style={{ height: '32px', objectFit: 'contain' }} 
                                />
                            )}
                            {/* Hide Name on Mobile */}
                            <Typography 
                                variant="h6" 
                                fontWeight="bold" 
                                sx={{ 
                                    display: { xs: 'none', sm: 'block' }, 
                                    color: '#333', 
                                    letterSpacing: '-0.5px' 
                                }}
                            >
                                {restaurantData.name}
                            </Typography>
                        </Link>

                        {/* --- RESTORED: mode="dark" for visibility on white background --- */}
                        <LanguageSwitcher mode="dark" />
                    </Container>
                </Box>

                {/* Hero Section */}
                {restaurantData.heroImageUrl ? (
                    <Box sx={heroHeaderStyle}>
                        {restaurantData.logoUrl && (
                             <Box
                                component="img"
                                src={restaurantData.logoUrl}
                                alt={`${restaurantData.name} logo`}
                                sx={{ 
                                    maxHeight: '80px', 
                                    maxWidth: '200px',
                                    mb: 2,
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    p: 1,
                                    borderRadius: 3,
                                    boxShadow: 3
                                }}
                            />
                        )}
                        <Typography component="h1" variant="h3" color="inherit" fontWeight="bold" gutterBottom sx={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                            {restaurantData.name}
                        </Typography>
                        <Typography variant="h6" color="inherit" sx={{ opacity: 0.95, mb: 3, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                            {restaurantData.address}
                        </Typography>

                        {restaurantData.reservationsEnabled && !isReservationPage && (
                            <Button 
                                component={RouterLink} 
                                to={`/restaurants/${restaurantId}/reserve`} 
                                variant="contained" 
                                color="secondary" 
                                size="large"
                                startIcon={<EventSeatIcon />}
                                sx={{ fontWeight: 'bold', px: 4, py: 1.2, borderRadius: '50px', boxShadow: 4 }}
                            >
                                Book a Table
                            </Button>
                        )}
                    </Box>
                ) : (
                    <Container sx={{ my: 4 }}>
                         <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 4 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 3 }}>
                                {restaurantData.logoUrl && <img src={restaurantData.logoUrl} alt={`${restaurantData.name} logo`} style={{ height: '60px' }} />}
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="h4" component="h1" gutterBottom>{restaurantData.name}</Typography>
                                    <Typography variant="subtitle1" color="text.secondary">{restaurantData.address}</Typography>
                                </Box>
                                {restaurantData.reservationsEnabled && !isReservationPage && (
                                    <Button 
                                        component={RouterLink} 
                                        to={`/restaurants/${restaurantId}/reserve`} 
                                        variant="contained" 
                                        color="secondary" 
                                        startIcon={<EventSeatIcon />}
                                    >
                                        Book a Table
                                    </Button>
                                )}
                            </Box>
                        </Paper>
                    </Container>
                )}
            </header>
            
            <main>
                <Outlet context={{ restaurant: restaurantData }} />
            </main>
        </ThemeProvider>
    );
}

export function useRestaurant() {
    return useOutletContext();
}

export default RestaurantLayout;