import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { Container, Box, Typography, Button, Grid, Paper } from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import DevicesIcon from '@mui/icons-material/Devices';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

function LandingPage() {
    const { t } = useTranslation();
    const { setCartContext } = useCart();
    // --- ADDED: Clear the restaurant context on mount ---
    useEffect(() => {
        setCartContext(null); 
    }, [setCartContext]);

    return (
        <Box>
            {/* --- HERO SECTION --- */}
            <Box sx={{ 
                bgcolor: '#1a1a1a', 
                color: 'white', 
                py: 15, 
                textAlign: 'center',
                // Uses a high-quality dark restaurant background
                backgroundImage: 'linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)), url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1920&q=80)',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}>
                <Container maxWidth="md">
                    <Typography variant="h2" component="h1" fontWeight="bold" sx={{ mb: 2, fontFamily: '"Playfair Display", serif' }}>
                        {t('empowerRestaurant')}
                    </Typography>
                    <Typography variant="h5" sx={{ mb: 5, opacity: 0.9, lineHeight: 1.6 }}>
                        {t('empowerSubtitle')}
                    </Typography>
                    <Button 
                        variant="contained" 
                        size="large" 
                        href="mailto:itsmesrirup@gmail.com"
                        sx={{ borderRadius: 50, px: 5, py: 1.5, fontSize: '1.2rem', textTransform: 'none' }}
                    >
                        {t('contactSales')}
                    </Button>
                </Container>
            </Box>

            {/* --- FEATURES SECTION --- */}
            <Container maxWidth="lg" sx={{ py: 10 }}>
                <Typography variant="h3" align="center" fontWeight="bold" gutterBottom sx={{ mb: 8, fontFamily: '"Playfair Display", serif' }}>
                    {t('growthTitle')}
                </Typography>
                <Grid container spacing={4}>
                    <FeatureCard 
                        icon={<RestaurantIcon fontSize="large" color="primary" />}
                        title={t('featureOrdering')}
                        desc={t('featureOrderingDesc')}
                    />
                    <FeatureCard 
                        icon={<DevicesIcon fontSize="large" color="primary" />}
                        title={t('featureWebsite')}
                        desc={t('featureWebsiteDesc')}
                    />
                    <FeatureCard 
                        icon={<TrendingUpIcon fontSize="large" color="primary" />}
                        title={t('featureAnalytics')}
                        desc={t('featureAnalyticsDesc')}
                    />
                </Grid>
            </Container>
        </Box>
    );
}

// Helper component for features
const FeatureCard = ({ icon, title, desc }) => (
    <Grid item xs={12} md={4}>
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', height: '100%', border: '1px solid #eee', borderRadius: 4 }}>
            <Box sx={{ mb: 2 }}>{icon}</Box>
            <Typography variant="h5" gutterBottom fontWeight="bold">{title}</Typography>
            <Typography variant="body1" color="text.secondary">{desc}</Typography>
        </Paper>
    </Grid>
);

export default LandingPage;