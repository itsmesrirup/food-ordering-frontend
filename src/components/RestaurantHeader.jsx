import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { Paper, Typography, Box, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import EventIcon from '@mui/icons-material/Event';

// This component receives the full restaurant object as a prop
function RestaurantHeader({ restaurant }) {
    const theme = useTheme();
    const { t } = useTranslation();
    const { restaurantId } = useParams();

    // Define styles for the banner
    const headerStyle = {
        p: { xs: 2, md: 4 },
        mb: 4,
        borderRadius: 4,
        color: theme.palette.common.white, // Default text color to white
        position: 'relative',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        // Use the hero image if it exists, otherwise use a dark fallback
        backgroundImage: restaurant.heroImageUrl 
            ? `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${restaurant.heroImageUrl})`
            : `linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8))`, // Dark overlay for text readability
    };

    return (
        <Paper elevation={4} sx={headerStyle}>
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 3, position: 'relative', zIndex: 1 }}>
                {restaurant.logoUrl && (
                    <Box sx={{ 
                        p: 1, 
                        backgroundColor: 'rgba(255, 255, 255, 0.9)', // White background for the logo
                        borderRadius: 2,
                        display: 'flex'
                    }}>
                        <img 
                            src={restaurant.logoUrl} 
                            alt={`${restaurant.name} logo`} 
                            style={{ height: '80px', width: 'auto', objectFit: 'contain' }} 
                        />
                    </Box>
                )}
                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'white', fontWeight: 'bold' }}>
                        {restaurant.name}
                    </Typography>
                    <Typography variant="subtitle1" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                        {restaurant.address}
                    </Typography>
                </Box>
                {restaurant.reservationsEnabled && (
                    <Button 
                        component={Link} 
                        to={`/restaurants/${restaurantId}/reserve`} 
                        variant="contained" 
                        color="secondary" // Use the accent color
                        startIcon={<EventIcon />}
                    >
                        {t('bookTable')}
                    </Button>
                )}
            </Box>
        </Paper>
    );
}

export default RestaurantHeader;