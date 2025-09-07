import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { lightTheme, darkTheme } from '../theme';
import { Container, Paper, Typography, TextField, Button, Box, CircularProgress, CssBaseline, Link } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LanguageSwitcher from '../components/LanguageSwitcher';

const ReservationPageContent = ({ restaurant }) => {
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
        <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
            <Button component={RouterLink} to={`/restaurants/${restaurantId}`} startIcon={<ArrowBackIcon />}>
                {t('backToMenu')}
            </Button>
            <Paper elevation={3} sx={{ p: 4, mt: 2 }}>
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

function ReservationPage() {
    const { restaurantId } = useParams();
    const [theme, setTheme] = useState(null);
    const [restaurant, setRestaurant] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAllDataAndTheme = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/restaurants/${restaurantId}`);
                if (!response.ok) throw new Error("Restaurant data not found");
                const data = await response.json();
                setRestaurant(data);

                if (data.useDarkTheme) {
                    let customTheme = { ...darkTheme };
                    if (data.themePrimaryColor) customTheme.palette.primary.main = data.themePrimaryColor;
                    if (data.themeSecondaryColor) customTheme.palette.secondary.main = data.themeSecondaryColor;
                    setTheme(createTheme(customTheme));
                } else {
                    let customTheme = { ...lightTheme };
                    if (data.themePrimaryColor) customTheme.palette.primary.main = data.themePrimaryColor;
                    if (data.themeSecondaryColor) customTheme.palette.secondary.main = data.themeSecondaryColor;
                    setTheme(createTheme(customTheme));
                }
            } catch (error) {
                toast.error(error.message);
                setTheme(lightTheme);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAllDataAndTheme();
    }, [restaurantId]);

    if (isLoading || !theme) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <header>
                 <Box sx={{ p: 2, backgroundColor: 'primary.main', color: theme.palette.getContrastText(theme.palette.primary.main) }}>
                    <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Link component={RouterLink} to={`/restaurants/${restaurantId}`} color="inherit" underline="none">
                            {restaurant.logoUrl ? (
                                <img src={restaurant.logoUrl} alt={`${restaurant.name} logo`} style={{ height: '40px', display: 'block' }} />
                            ) : (
                                <Typography variant="h6">{restaurant.name}</Typography>
                            )}
                        </Link>
                        <LanguageSwitcher />
                    </Container>
                </Box>
            </header>
            <ReservationPageContent restaurant={restaurant} />
        </ThemeProvider>
    );
}

export default ReservationPage;