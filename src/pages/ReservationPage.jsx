import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import defaultTheme from '../theme';
import { lightTheme, darkTheme } from '../theme';
import { Container, Paper, Typography, TextField, Button, Box, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// --- Inner Content Component ---
// Renders the actual form and logic, guaranteed to be inside the correct ThemeProvider.
const ReservationPageContent = () => {
    const { t } = useTranslation();
    const { restaurantId } = useParams();
    const navigate = useNavigate();
    const [restaurantName, setRestaurantName] = useState('');
    const [isLoadingName, setIsLoadingName] = useState(true);
    const [formData, setFormData] = useState({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        partySize: 2,
        reservationTime: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchRestaurantName = async () => {
            setIsLoadingName(true);
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/restaurants/${restaurantId}`);
                if (!response.ok) throw new Error("Could not find restaurant.");
                const data = await response.json();
                setRestaurantName(data.name);
            } catch (error) {
                toast.error(error.message);
                setRestaurantName("this restaurant"); // Fallback name
            } finally {
                setIsLoadingName(false);
            }
        };
        fetchRestaurantName();
    }, [restaurantId]);

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
    
    if (isLoadingName) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    }

    return (
        <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
            <Button component={Link} to={`/restaurants/${restaurantId}`} startIcon={<ArrowBackIcon />}>
                {t('backToMenu')}
            </Button>
            <Paper elevation={3} sx={{ p: 4, mt: 2 }}>
                <Typography variant="h4" align="center" gutterBottom>
                    {t('bookTable')} at {restaurantName}
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
                        <Button type="submit" variant="contained" color="secondary" fullWidth disabled={isSubmitting}>
                            {isSubmitting ? t('sendingRequest') : t('requestReservation')}
                        </Button>
                        {isSubmitting && <CircularProgress size={24} sx={{ position: 'absolute', top: '50%', left: '50%', mt: '-12px', ml: '-12px' }} />}
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};


// --- Theme Loading Wrapper Component ---
// This is the main export. Its only job is to load the theme and then render the content.
function ReservationPage() {
    const { restaurantId } = useParams();
    const [dynamicTheme, setDynamicTheme] = useState(null);

    useEffect(() => {
        const fetchAndSetTheme = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/restaurants/${restaurantId}`);
                if (!response.ok) throw new Error('Theme data not found');
                const data = await response.json();
                
                if (data.useDarkTheme) {
                    let customDarkThemeOptions = { ...darkTheme };
                    if (data.themePrimaryColor) { // Allow overrides
                        customDarkThemeOptions.palette.primary.main = data.themePrimaryColor;
                    }
                    if (data.themeSecondaryColor) {
                        customDarkThemeOptions.palette.secondary.main = data.themeSecondaryColor;
                    }
                    setDynamicTheme(createTheme(customDarkThemeOptions));
                } else {
                    if (data.themePrimaryColor) {
                        const customLightThemeOptions = {
                            ...lightTheme,
                            palette: {
                                ...lightTheme.palette,
                                primary: { main: data.themePrimaryColor },
                                secondary: { main: data.themeSecondaryColor || lightTheme.palette.secondary.main },
                            },
                        };
                        setDynamicTheme(createTheme(customLightThemeOptions));
                    } else {
                         setDynamicTheme(lightTheme);
                    }
                }
            } catch (error) {
                console.error(error);
                setDynamicTheme(lightTheme); // Fallback to default on error
            }
        };
        fetchAndSetTheme();
    }, [restaurantId]);

    if (!dynamicTheme) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
    }

    return (
        <ThemeProvider theme={dynamicTheme}>
            <ReservationPageContent />
        </ThemeProvider>
    );
}

export default ReservationPage;