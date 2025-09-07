import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useRestaurant } from '../layouts/RestaurantLayout';
import { Container, Paper, Typography, TextField, Button, Box, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

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

    return (
        <main>
            <Container maxWidth="sm" sx={{ mt: 4 }}>
                <Button component={Link} to={`/restaurants/${restaurantId}`} startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
                    {t('backToMenu')}
                </Button>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Typography variant="h4" align="center" gutterBottom>
                        {t('bookTable')} at {restaurant.name}
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit}>
                        <TextField label={t('fullNameLabel')} name="customerName" onChange={handleInputChange} required fullWidth margin="normal" />
                        <TextField label={t('emailLabel')} name="customerEmail" type="email" onChange={handleInputChange} required fullWidth margin="normal" />
                        <TextField label={t('phoneNumberLabel')} name="customerPhone" onChange={handleInputChange} required fullWidth margin="normal" />
                        <TextField label={t('partySizeLabel')} name="partySize" type="number" defaultValue={2} onChange={handleInputChange} required fullWidth margin="normal" />
                        <TextField 
                            label={t('dateAndTimeLabel')} 
                            name="reservationTime" 
                            type="datetime-local"
                            onChange={handleInputChange} 
                            required 
                            fullWidth 
                            margin="normal"
                            InputLabelProps={{ shrink: true }}
                        />
                        <Box sx={{ mt: 3, position: 'relative' }}>
                            <Button type="submit" variant="contained" color="primary" fullWidth disabled={isSubmitting}>
                                {isSubmitting ? t('sendingRequest') : t('requestReservation')}
                            </Button>
                            {isSubmitting && <CircularProgress size={24} sx={{ position: 'absolute', top: '50%', left: '50%', mt: '-12px', ml: '-12px' }} />}
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </main>
    );
}

export default ReservationPage;