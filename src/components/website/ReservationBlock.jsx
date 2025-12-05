import React from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import { useTranslation } from 'react-i18next';

const ReservationBlock = ({ restaurant }) => {
    const { t } = useTranslation();
    if (!restaurant.reservationsEnabled) return null;

    return (
        <Box sx={{ 
            py: 12, 
            backgroundColor: '#222', 
            color: 'white', 
            textAlign: 'center' 
        }}>
            <Container maxWidth="sm">
                <EventSeatIcon sx={{ fontSize: 50, mb: 2, opacity: 0.8 }} />
                <Typography variant="h3" sx={{ fontFamily: '"Playfair Display", serif', mb: 2 }}>
                    {t('bookTable')}
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: '"Lato", sans-serif', mb: 4, opacity: 0.8 }}>
                    {t('bookTableSubtitle', { restaurantName: restaurant.name })}
                </Typography>
                <Button 
                    component={Link} 
                    to={`/restaurants/${restaurant.id}/reserve`}
                    variant="contained" 
                    size="large"
                    color="primary"
                    sx={{ borderRadius: 50, px: 5, py: 1.5, fontSize: '1.1rem' }}
                >
                    {t('reserveNow')}
                </Button>
            </Container>
        </Box>
    );
};

export default ReservationBlock;