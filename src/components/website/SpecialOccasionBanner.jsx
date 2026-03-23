import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Container, Grid, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const SpecialOccasionBanner = ({ restaurantId, restaurantSlug }) => {
    const [activeEvent, setActiveEvent] = useState(null);

    useEffect(() => {
        if (!restaurantId) return;
        // Fetch the currently active special menu/event
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/special-menus/restaurant/${restaurantId}/active`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                // Only show this banner on the website IF they provided a banner image
                if (data && data.bannerImageUrl) {
                    setActiveEvent(data);
                }
            })
            .catch(console.error);
    }, [restaurantId]);

    if (!activeEvent) return null;

    const hasItems = activeEvent.items && activeEvent.items.length > 0;

    // ✅ Define the dynamic color (fallback to gold if missing)
    const accentColor = activeEvent.themeColor || '#f5d76e';

    return (
        <Box sx={{ 
            position: 'relative', 
            py: 10, 
            backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.8)), url(${activeEvent.bannerImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed', 
            color: 'white',
            textAlign: 'center',
            // Optional: Add a top/bottom border using the accent color to frame the banner nicely
            borderTop: `4px solid ${accentColor}`,
            borderBottom: `4px solid ${accentColor}`
        }}>
            <Container maxWidth="md">
                <motion.div initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
                    
                    {/* ✅ Apply accentColor to the Title */}
                    <Typography variant="h2" sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 'bold', mb: 2, color: accentColor }}>
                        {activeEvent.title}
                    </Typography>
                    
                    {activeEvent.subtitle && (
                        <Typography variant="h6" sx={{ mb: hasItems ? 6 : 4, fontStyle: 'italic', opacity: 0.9 }}>
                            {activeEvent.subtitle}
                        </Typography>
                    )}

                    {hasItems && (
                        <Grid container spacing={3} justifyContent="center" sx={{ mb: 4 }}>
                            {activeEvent.items.map(item => (
                                <Grid item xs={12} sm={6} md={4} key={item.id}>
                                    <Paper sx={{ 
                                        p: 3, 
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                                        backdropFilter: 'blur(10px)',
                                        color: 'white',
                                        // ✅ Apply accentColor to the card borders
                                        border: `1px solid ${accentColor}40`, // 40 adds 25% transparency to the hex color
                                        height: '100%'
                                    }}>
                                        <Typography variant="h6" sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 'bold', mb: 1 }}>
                                            {item.name}
                                        </Typography>
                                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                            {item.description}
                                        </Typography>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    )}

                    {/* ✅ Apply accentColor to the Button */}
                    <Button 
                        component={Link} 
                        to={`/order/${restaurantSlug}`}
                        variant="contained" 
                        size="large"
                        sx={{ 
                            backgroundColor: accentColor, 
                            color: '#111', // Dark text on bright button
                            fontWeight: 'bold', 
                            borderRadius: 50, 
                            px: 4, py: 1.5,
                            '&:hover': { 
                                backgroundColor: accentColor, 
                                filter: 'brightness(0.85)' // Slightly darken on hover
                            }
                        }}
                    >
                        {hasItems ? "Order Event Specials Now" : "Order Online Now"}
                    </Button>

                </motion.div>
            </Container>
        </Box>
    );
};

export default SpecialOccasionBanner;