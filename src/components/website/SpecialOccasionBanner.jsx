import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Container, Grid, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const SpecialOccasionBanner = ({ restaurantId, restaurantSlug }) => {
    const [activeEvents, setActiveEvents] = useState([]);

    useEffect(() => {
        if (!restaurantId) return;
        // ✅ NOW FETCHING A LIST OF EVENTS
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/special-menus/restaurant/${restaurantId}/active`)
            .then(res => res.ok ? res.json() : [])
            .then(data => {
                // Filter out any events that don't have a banner image to keep the site looking premium
                const visualEvents = data.filter(event => event.bannerImageUrl);
                setActiveEvents(visualEvents);
            })
            .catch(console.error);
    }, [restaurantId]);

    if (activeEvents.length === 0) return null;

    return (
        <Box>
            {/* ✅ LOOP THROUGH ALL ACTIVE PROMO BLOCKS */}
            {activeEvents.map((event, index) => {
                const hasItems = event.items && event.items.length > 0;
                const accentColor = event.themeColor || '#f5d76e';

                return (
                    <Box key={event.id} sx={{ 
                        position: 'relative', 
                        py: { xs: 8, md: 12 }, 
                        backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.85)), url('${event.bannerImageUrl}')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundAttachment: 'fixed', // Keeps the rich parallax effect
                        color: 'white',
                        textAlign: 'center',
                        borderBottom: `4px solid ${accentColor}`,
                        // Optional: Add a subtle gap if there are multiple banners stacked
                        mb: index !== activeEvents.length - 1 ? 0 : 0 
                    }}>
                        <Container maxWidth="lg">
                            <motion.div initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
                                
                                <Typography variant="h2" sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 'bold', mb: 2, color: accentColor }}>
                                    {event.title}
                                </Typography>
                                
                                {event.subtitle && (
                                    <Typography variant="h5" sx={{ mb: hasItems ? 6 : 4, fontStyle: 'italic', opacity: 0.9, maxWidth: '800px', mx: 'auto', lineHeight: 1.6 }}>
                                        {event.subtitle}
                                    </Typography>
                                )}

                                {hasItems && (
                                    <Grid container spacing={3} justifyContent="center" sx={{ mb: 6 }}>
                                        {event.items.map(item => (
                                            <Grid item xs={12} sm={6} md={4} key={item.id}>
                                                <Paper sx={{ 
                                                    p: 4, 
                                                    backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                                                    backdropFilter: 'blur(10px)',
                                                    color: 'white',
                                                    border: `1px solid ${accentColor}40`,
                                                    borderRadius: 2,
                                                    height: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center',
                                                    transition: 'transform 0.3s ease',
                                                    '&:hover': { transform: 'translateY(-5px)', backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                                                }}>
                                                    <Typography variant="h5" sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 'bold', mb: 1 }}>
                                                        {item.name}
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ opacity: 0.8 }}>
                                                        {item.description}
                                                    </Typography>
                                                </Paper>
                                            </Grid>
                                        ))}
                                    </Grid>
                                )}

                                <Button 
                                    component={Link} 
                                    to={`/order/${restaurantSlug}`}
                                    variant="contained" 
                                    size="large"
                                    sx={{ 
                                        backgroundColor: accentColor, 
                                        color: '#111', 
                                        fontWeight: 'bold', 
                                        borderRadius: 50, 
                                        px: 5, py: 1.8,
                                        fontSize: '1.1rem',
                                        '&:hover': { backgroundColor: accentColor, filter: 'brightness(0.85)' }
                                    }}
                                >
                                    {hasItems ? "Commander ce menu" : "Commander en ligne"}
                                </Button>

                            </motion.div>
                        </Container>
                    </Box>
                );
            })}
        </Box>
    );
};

export default SpecialOccasionBanner;