import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Box, Typography, Button, Paper, CircularProgress, Grid, Divider } from '@mui/material';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import { useTranslation } from 'react-i18next';

function RestaurantWebsitePage() {
    const { t } = useTranslation();
    const { slug } = useParams();
    const [restaurant, setRestaurant] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRestaurantData = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/public/restaurants/by-slug/${slug}`);
                if (!response.ok) throw new Error(t('restaurantNotFound'));
                const data = await response.json();
                setRestaurant(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchRestaurantData();
    }, [slug, t]);

    if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
    if (error) return <Typography variant="h5" align="center" sx={{ p: 5 }}>{error}</Typography>;
    if (!restaurant) return null;

    return (
        // --- ADDED: A React Fragment <> to wrap the JSX and the new meta tags ---
        <>
            {/* --- THIS IS THE NEW REACT 19 WAY --- */}
            {/* You can now use title and meta tags directly in your component's return statement. */}
            {/* React is smart enough to manage them in the document head. */}
            <title>{restaurant.metaTitle || restaurant.name}</title>
            <meta name="description" content={restaurant.metaDescription || `Order online from ${restaurant.name}.`} />
            <meta property="og:title" content={restaurant.metaTitle || restaurant.name} />
            <meta property="og:description" content={restaurant.metaDescription || `Order online from ${restaurant.name}.`} />
            <meta property="og:image" content={restaurant.heroImageUrl || restaurant.logoUrl} />
            <Box>
                {/* Hero Section */}
                <Box sx={{
                    height: '50vh',
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${restaurant.heroImageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: 'white',
                    textAlign: 'center',
                    p: 2
                }}>
                    {restaurant.logoUrl && <img src={restaurant.logoUrl} alt={`${restaurant.name} logo`} style={{ maxHeight: '100px', marginBottom: '16px' }} />}
                    <Typography variant="h2" component="h1" fontWeight="bold">{restaurant.name}</Typography>
                    <Typography variant="h5">{restaurant.address}</Typography>
                </Box>

                <Container maxWidth="md" sx={{ py: 4 }}>
                    {/* Action Buttons */}
                    <Paper elevation={3} sx={{ p: 2, display: 'flex', justifyContent: 'center', gap: 2, mb: 4 }}>
                        <Button component={Link} to={`/restaurants/${restaurant.id}`} variant="contained" size="large" startIcon={<RestaurantMenuIcon />}>
                            {t('orderOnline')}
                        </Button>
                        {restaurant.reservationsEnabled && (
                            <Button component={Link} to={`/restaurants/${restaurant.id}/reserve`} variant="outlined" size="large" startIcon={<EventSeatIcon />}>
                                {t('bookTable')}
                            </Button>
                        )}
                    </Paper>

                    <Grid container spacing={4}>
                        {/* About Us Section */}
                        <Grid item xs={12} md={8}>
                            <Typography variant="h4" gutterBottom>{t('aboutUs')}</Typography>
                            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{restaurant.aboutUsText}</Typography>
                        </Grid>

                        {/* Contact & Hours Section */}
                        <Grid item xs={12} md={4}>
                            <Typography variant="h5" gutterBottom>{t('contactAndHours')}</Typography>
                            <Typography variant="body1"><strong>{t('phoneLabel')}</strong> {restaurant.phoneNumber}</Typography>
                            <Typography variant="body1" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}><strong>{t('hoursLabel')}</strong><br/>{restaurant.openingHours}</Typography>
                        </Grid>

                        {/* Map Section */}
                        {restaurant.googleMapsUrl && (
                            <Grid item xs={12}>
                                <Typography variant="h5" gutterBottom>{t('findUs')}</Typography>
                                <Box sx={{ height: 400, width: '100%', border: '1px solid #ccc', borderRadius: 1, overflow: 'hidden' }}>
                                    <iframe
                                        src={restaurant.googleMapsUrl}
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        allowFullScreen=""
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                    ></iframe>
                                </Box>
                            </Grid>
                        )}
                    </Grid>
                </Container>
            </Box>
        </>
    );
}

export default RestaurantWebsitePage;