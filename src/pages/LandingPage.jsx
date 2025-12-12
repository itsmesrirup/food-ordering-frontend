import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { Container, Box, Typography, Button, Grid, Paper, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import DevicesIcon from '@mui/icons-material/Devices';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ContactForm from '../components/landing/ContactForm'; // Import the form

function LandingPage() {
    const { t } = useTranslation();
    const { setCartContext } = useCart();
    
    useEffect(() => {
        setCartContext(null); 
    }, [setCartContext]);

    const scrollToForm = () => {
        document.getElementById('contact-form').scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <Box sx={{ overflowX: 'hidden' }}>
            
            {/* --- 1. HERO SECTION --- */}
            <Box sx={{ 
                bgcolor: '#1a1a1a', 
                color: 'white', 
                py: { xs: 10, md: 20 }, // Responsive padding
                textAlign: 'center',
                backgroundImage: 'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1920&q=80)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed' // Parallax effect
            }}>
                <Container maxWidth="md">
                    <Typography variant="h2" component="h1" fontWeight="bold" sx={{ mb: 3, fontFamily: '"Playfair Display", serif', fontSize: { xs: '2.5rem', md: '4rem' } }}>
                        {t('empowerRestaurant')}
                    </Typography>
                    <Typography variant="h5" sx={{ mb: 6, opacity: 0.9, lineHeight: 1.6, fontSize: { xs: '1.2rem', md: '1.5rem' } }}>
                        {t('empowerSubtitle')}
                    </Typography>
                    <Button 
                        variant="contained" 
                        size="large" 
                        onClick={scrollToForm}
                        sx={{ borderRadius: 50, px: 6, py: 2, fontSize: '1.2rem', textTransform: 'none', boxShadow: '0 4px 14px 0 rgba(25, 118, 210, 0.39)' }}
                    >
                        {t('contactSales')}
                    </Button>
                </Container>
            </Box>

            {/* --- 2. FEATURES SECTION --- */}
            <Container maxWidth="lg" sx={{ py: 12 }}>
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
                     <FeatureCard 
                        icon={<EventSeatIcon fontSize="large" color="primary" />}
                        title={t('featureReservations')}
                        desc={t('featureReservationsDesc')}
                    />
                </Grid>
            </Container>

            {/* --- 3. FAQ SECTION --- */}
            <Box sx={{ bgcolor: '#f9f9f9', py: 12 }}>
                <Container maxWidth="md">
                    <Typography variant="h3" align="center" fontWeight="bold" sx={{ mb: 6, fontFamily: '"Playfair Display", serif' }}>
                        {t('faqTitle')}
                    </Typography>
                    {[1, 2, 3].map((num) => (
                        <Accordion key={num} sx={{ mb: 2, boxShadow: 'none', border: '1px solid #eee' }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="h6" fontWeight="bold">{t(`faq${num}Q`)}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography color="text.secondary">{t(`faq${num}A`)}</Typography>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Container>
            </Box>

            {/* --- 4. CONTACT FORM SECTION --- */}
            <Container maxWidth="md" sx={{ py: 12 }} id="contact-form">
                <Paper elevation={4} sx={{ p: { xs: 4, md: 8 }, borderRadius: 4 }}>
                    <Grid container spacing={6}>
                        <Grid item xs={12} md={5}>
                            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ fontFamily: '"Playfair Display", serif' }}>
                                {t('contactFormTitle')}
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, fontSize: '1.1rem' }}>
                                {t('contactSubtitle')}
                            </Typography>
                            <Box sx={{ mt: 4 }}>
                                <Typography variant="body2" fontWeight="bold" color="primary">EMAIL US</Typography>
                                <Typography variant="body1" sx={{ mb: 2 }}>itsmesrirup@gmail.com</Typography>
                                
                                <Typography variant="body2" fontWeight="bold" color="primary">CALL US</Typography>
                                <Typography variant="body1">+33 7 53 30 85 26</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={7}>
                            <ContactForm />
                        </Grid>
                    </Grid>
                </Paper>
            </Container>

        </Box>
    );
}

// Improved Feature Card
const FeatureCard = ({ icon, title, desc }) => (
    <Grid item xs={12} sm={6} md={3}>
        <Paper 
            elevation={0} 
            sx={{ 
                p: 4, 
                textAlign: 'center', 
                height: '100%', 
                border: '1px solid #eaeaea', 
                borderRadius: 4,
                transition: 'transform 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-5px)',
                    borderColor: 'primary.main',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
                }
            }}
        >
            <Box sx={{ 
                mb: 2, 
                display: 'inline-flex', 
                p: 2, 
                borderRadius: '50%', 
                bgcolor: 'primary.light', 
                color: 'primary.main' 
            }}>
                {React.cloneElement(icon, { color: 'inherit' })}
            </Box>
            <Typography variant="h6" gutterBottom fontWeight="bold">{title}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>{desc}</Typography>
        </Paper>
    </Grid>
);

export default LandingPage;