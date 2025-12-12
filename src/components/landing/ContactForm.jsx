import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';

const ContactForm = () => {
    const { t } = useTranslation();
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // In a real app, you'd send this data to your backend or a service like Formspree
        setTimeout(() => setSubmitted(true), 1000);
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
            <TextField label={t('formName')} required fullWidth variant="outlined" />
            <TextField label={t('formRestaurant')} required fullWidth variant="outlined" />
            <TextField label={t('formEmail')} type="email" required fullWidth variant="outlined" />
            <TextField label={t('formMessage')} required fullWidth multiline rows={4} variant="outlined" />
            
            <Button 
                type="submit" 
                variant="contained" 
                size="large"
                sx={{ 
                    py: 1.5, 
                    fontSize: '1.1rem', 
                    borderRadius: 50,
                    textTransform: 'none',
                    alignSelf: 'flex-start'
                }}
            >
                {t('sendMessage')}
            </Button>
        </Box>
    );
};

export default ContactForm;