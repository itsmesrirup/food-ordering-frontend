import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Outlet, Link as RouterLink, useOutletContext, useSearchParams, useLocation } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { lightTheme, darkTheme } from '../theme';
import { Container, Typography, Box, Link, CircularProgress, CssBaseline, Button, Alert, Paper } from '@mui/material';
import EventSeatIcon from '@mui/icons-material/EventSeat'; 
import LanguageSwitcher from '../components/LanguageSwitcher';

// ✅ IMPORT VIDEO HELPERS
import { isVideoUrl, getPosterUrl } from '../utils/mediaUtils';

function RestaurantLayout() {
    const { t } = useTranslation();
    const { slug } = useParams();
    const location = useLocation();
    const isReservationPage = location.pathname.endsWith('/reserve');
    const [searchParams] = useSearchParams();
    const tableNumber = searchParams.get('table');

    const [theme, setTheme] = useState(lightTheme);
    const [restaurantData, setRestaurantData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // ✅ ADDED: Video detection and ref
    const hasVideoHero = restaurantData ? isVideoUrl(restaurantData.heroImageUrl) : false;
    const videoRef = useRef(null);

    useEffect(() => {
        const fetchRestaurantAndTheme = async () => {
            if (!slug) return;
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/restaurants/by-slug-full/${slug}`);
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
    }, [slug]);

    // ✅ ADDED: Force play video to prevent mobile blocking
    useEffect(() => {
        if (hasVideoHero && videoRef.current) {
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.warn("Autoplay blocked to save data. Displaying fallback poster image.", error);
                });
            }
        }
    }, [hasVideoHero, restaurantData?.heroImageUrl]);

    if (error) {
        return (
            <Container sx={{ textAlign: 'center', mt: 4 }}>
                <Typography variant="h4">Oops! Page Not Found</Typography>
                <Typography>The restaurant you are looking for is not available.</Typography>
                <Button component={RouterLink} to="/" variant="contained" sx={{ mt: 2 }}>Go to Homepage</Button>
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

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <header>
                {/* --- RESTORED: White Header Layout --- */}
                <Box sx={{ p: 1, backgroundColor: '#fff', borderBottom: '1px solid #eaeaea' }}>
                    <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        
                        <Link component={RouterLink} to={`/order/${slug}`} color="inherit" underline="none" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
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
                    <Box sx={{
                        position: 'relative',
                        height: { xs: '100svh', md: '350px' }, // ✅ ADDED: Mobile svh fix
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        textAlign: 'center',
                        p: 2,
                        overflow: 'hidden', // Keeps video contained
                        backgroundColor: '#000', // Fallback color
                        transform: 'translateZ(0)', // ✅ ADDED: GPU Acceleration for scroll bug
                        WebkitTransform: 'translateZ(0)'
                    }}>
                        
                        {/* ✅ LAYER 1: VIDEO OR IMAGE BACKGROUND */}
                        {hasVideoHero ? (
                            <video 
                                ref={videoRef}
                                autoPlay 
                                loop 
                                muted 
                                playsInline 
                                preload="auto" // ✅ ADDED
                                poster={getPosterUrl(restaurantData.heroImageUrl)} // ✅ ADDED
                                style={{ 
                                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
                                    objectFit: 'cover', zIndex: 0, 
                                    transform: 'translate3d(0, 0, 0)', WebkitTransform: 'translate3d(0, 0, 0)' 
                                }}
                            >
                                <source src={restaurantData.heroImageUrl} type="video/mp4" />
                            </video>
                        ) : (
                            <Box sx={{ 
                                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, 
                                backgroundImage: `url('${restaurantData.heroImageUrl}')`, 
                                backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' 
                            }} />
                        )}

                        {/* ✅ LAYER 2: DARK OVERLAY */}
                        <Box sx={{
                            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, 
                            background: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5))', pointerEvents: 'none'
                        }} />

                        {/* ✅ LAYER 3: TEXT & BUTTON CONTENT */}
                        <Box sx={{ zIndex: 2, position: 'relative' }}>
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
                                    to={`/order/${slug}/reserve`} 
                                    variant="contained" 
                                    color="secondary" 
                                    size="large"
                                    startIcon={<EventSeatIcon />}
                                    sx={{ fontWeight: 'bold', px: 4, py: 1.2, borderRadius: '50px', boxShadow: 4 }}
                                >
                                    {t('bookTable')}
                                </Button>
                            )}
                        </Box>
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
                                        to={`/order/${slug}/reserve`} 
                                        variant="contained" 
                                        color="secondary" 
                                        startIcon={<EventSeatIcon />}
                                    >
                                        {t('bookTable')}
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