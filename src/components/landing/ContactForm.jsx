import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Alert, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
// --- IMPORT THE API CLIENT ---
// Note: Depending on your setup, you might need to use standard fetch here 
// if apiClient is strictly for authenticated requests. 
// Since /api/public is open, standard fetch is safest and easiest here.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ContactForm = () => {
    const { t } = useTranslation();
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        restaurantName: '',
        message: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/public/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            setSubmitted(true);
        } catch (err) {
            console.error(err);
            setError(t('unexpectedError')); // Reuse your generic error message
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <Alert severity="success" sx={{ mt: 2, fontSize: '1.1rem', py: 2 }}>
                {t('messageSent')}
            </Alert>
        );
    }

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField 
                label={t('formName')} 
                name="name"
                value={formData.name}
                onChange={handleChange}
                required fullWidth variant="outlined" 
            />
            <TextField 
                label={t('formRestaurant')} 
                name="restaurantName"
                value={formData.restaurantName}
                onChange={handleChange}
                required fullWidth variant="outlined" 
            />
            <TextField 
                label={t('formEmail')} 
                name="email"
                type="email" 
                value={formData.email}
                onChange={handleChange}
                required fullWidth variant="outlined" 
            />
            <TextField 
                label={t('formMessage')} 
                name="message"
                value={formData.message}
                onChange={handleChange}
                required fullWidth multiline rows={4} variant="outlined" 
            />
            
            {error && <Alert severity="error">{error}</Alert>}

            <Button 
                type="submit" 
                variant="contained" 
                size="large"
                disabled={isSubmitting}
                sx={{ 
                    py: 1.5, 
                    fontSize: '1.1rem', 
                    borderRadius: 50,
                    textTransform: 'none',
                    alignSelf: 'flex-start'
                }}
            >
                {isSubmitting ? 'Sending...' : t('sendMessage')}
            </Button>
        </Box>
    );
};

export default ContactForm;