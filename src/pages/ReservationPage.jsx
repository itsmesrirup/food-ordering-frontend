import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, Link as RouterLink, Navigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useRestaurant } from '../layouts/RestaurantLayout';
import { Container, Paper, Typography, TextField, Button, Box, CircularProgress, Grid, Divider } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EventSeatIcon from '@mui/icons-material/EventSeat';

function ReservationPage() {
    const { restaurant } = useRestaurant();
    const { t } = useTranslation();
    const { restaurantId } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ customerName: '', customerEmail: '', customerPhone: '', partySize: 2, reservationTime: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const payload = { ...formData, restaurantId: parseInt(restaurantId) };
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reservations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error('Could not submit reservation. Please try again.');
            toast.success('Your reservation request has been sent!');
            navigate(`/restaurants/${restaurantId}`);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!restaurant) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    if (!restaurant.reservationsEnabled) return <Navigate to={`/restaurants/${restaurantId}`} replace />;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
            <Button component={RouterLink} to={`/restaurants/${restaurantId}`} startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
                {t('backToMenu')}
            </Button>
            
            <Grid container spacing={4}>
                {/* Left Column: The Form */}
                <Grid item xs={12} md={7}>
                    <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                            <EventSeatIcon color="secondary" fontSize="large" />
                            <Typography variant="h4" component="h1" fontWeight="bold">
                                {t('bookTable')}
                            </Typography>
                        </Box>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                            Reserve your spot at {restaurant.name}. Please provide your details below.
                        </Typography>

                        <Box component="form" onSubmit={handleSubmit}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField label={t('fullNameLabel')} name="customerName" onChange={handleInputChange} required fullWidth />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField label={t('phoneNumberLabel')} name="customerPhone" onChange={handleInputChange} required fullWidth />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField label={t('emailLabel')} name="customerEmail" type="email" onChange={handleInputChange} required fullWidth />
                                </Grid>
                                <Divider sx={{ my: 2, width: '100%' }} />
                                <Grid item xs={12} sm={6}>
                                    <TextField label={t('partySizeLabel')} name="partySize" type="number" defaultValue={2} onChange={handleInputChange} required fullWidth />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField 
                                        label={t('dateAndTimeLabel')} 
                                        name="reservationTime" 
                                        type="datetime-local"
                                        onChange={handleInputChange} 
                                        required 
                                        fullWidth 
                                        InputLabelProps={{ shrink: true }}
                                        // Optional: Add min={new Date().toISOString().slice(0, 16)} to prevent past booking
                                    />
                                </Grid>
                            </Grid>
                            
                            <Box sx={{ mt: 4, position: 'relative' }}>
                                <Button type="submit" variant="contained" color="secondary" size="large" fullWidth disabled={isSubmitting} sx={{ py: 1.5 }}>
                                    {isSubmitting ? t('sendingRequest') : t('requestReservation')}
                                </Button>
                                {isSubmitting && <CircularProgress size={24} sx={{ position: 'absolute', top: '50%', left: '50%', mt: '-12px', ml: '-12px' }} />}
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                {/* Right Column: Visual Context (Desktop only) */}
                <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }}>
                    <Box sx={{ 
                        height: '100%', 
                        minHeight: '400px',
                        backgroundImage: `url(${restaurant.heroImageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        borderRadius: 4,
                        position: 'relative',
                        boxShadow: 3
                    }}>
                        <Box sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            p: 3,
                            background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                            borderRadius: '0 0 16px 16px',
                            color: 'white'
                        }}>
                            <Typography variant="h5" fontWeight="bold">{restaurant.name}</Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>{restaurant.address}</Typography>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </Container>
    );
}

export default ReservationPage;