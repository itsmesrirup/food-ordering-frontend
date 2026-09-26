import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, Container, Grid, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { isVideoUrl, getPosterUrl } from '../../utils/mediaUtils';

export default function SpecialOccasionBanner({ restaurantId, restaurantSlug }) {
    const [activeEvents, setActiveEvents] = useState([]);
    const videoRefs = useRef({}); 

    useEffect(() => {
        if (!restaurantId) return;
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/special-menus/restaurant/${restaurantId}/active`)
            .then(res => res.ok ? res.json() : [])
            .then(data => {
                // Only show events that have media attached
                const visualEvents = data.filter(event => event.bannerImageUrl);
                setActiveEvents(visualEvents);
            })
            .catch(console.error);
    }, [restaurantId]);

    // Force play videos on mobile
    useEffect(() => {
        Object.values(videoRefs.current).forEach(video => {
            if (video) video.play().catch(e => console.warn("Autoplay blocked", e));
        });
    }, [activeEvents]);

    if (activeEvents.length === 0) return null;

    const getSafeImg = (url) => {
        if (!url) return '';
        return isVideoUrl(url) ? getPosterUrl(url) : url;
    };

    return (
        <Box sx={{ py: { xs: 6, md: 10 }, backgroundColor: 'transparent' }}>
            <Container maxWidth="lg">
                {activeEvents.map((event, index) => {
                    const hasItems = event.items && event.items.length > 0;
                    const accentColor = event.themeColor || '#d32f2f'; // Fallback to a default accent
                    
                    // ✅ SMART MEDIA PARSING
                    const rawUrls = event.bannerImageUrl ? event.bannerImageUrl.split(',').map(u => u.trim()).filter(u => u) : [];
                    const isVideo = rawUrls.length === 1 && isVideoUrl(rawUrls[0]);
                    const isGallery = !isVideo && rawUrls.length > 1;
                    const isSingleImage = !isVideo && !isGallery && rawUrls.length === 1;

                    // Alternating Layout: Even index = Media on Left, Odd index = Media on Right
                    const isEven = index % 2 === 0;

                    return (
                        <Grid 
                            container 
                            spacing={6} 
                            key={event.id} 
                            alignItems="center" 
                            sx={{ 
                                mb: index !== activeEvents.length - 1 ? 12 : 0,
                                // On mobile, content always stacks normally. On desktop, we alternate!
                                flexDirection: { xs: 'column-reverse', md: isEven ? 'row' : 'row-reverse' }
                            }}
                        >
                            {/* --- THE TEXT & MENU ITEMS SIDE --- */}
                            <Grid item xs={12} md={6}>
                                <motion.div initial={{ opacity: 0, x: isEven ? -30 : 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
                                    
                                    <Typography variant="h3" sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 'bold', mb: 2, color: accentColor }}>
                                        {event.title}
                                    </Typography>
                                    
                                    {event.subtitle && (
                                        <Typography variant="h6" sx={{ mb: 4, fontStyle: 'italic', opacity: 0.8, lineHeight: 1.6 }}>
                                            {event.subtitle}
                                        </Typography>
                                    )}

                                    {/* Menu Items for this Special Event */}
                                    {hasItems && (
                                        <Box sx={{ mb: 5 }}>
                                            {event.items.map(item => (
                                                <Box key={item.id} sx={{ mb: 2.5, pb: 2.5, borderBottom: '1px dashed rgba(128,128,128,0.3)' }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.5 }}>
                                                        <Typography variant="h6" sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 'bold' }}>
                                                            {item.name}
                                                        </Typography>
                                                        <Typography variant="h6" sx={{ color: accentColor, fontWeight: 'bold', ml: 2 }}>
                                                            €{item.price.toFixed(2)}
                                                        </Typography>
                                                    </Box>
                                                    <Typography variant="body2" sx={{ opacity: 0.7, fontStyle: 'italic' }}>
                                                        {item.description}
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                    )}

                                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                        <Button 
                                            component={Link} 
                                            to={`/order/${restaurantSlug}`}
                                            variant="contained" 
                                            size="large"
                                            sx={{ 
                                                backgroundColor: accentColor, 
                                                color: '#fff', 
                                                fontWeight: 'bold', 
                                                borderRadius: 50, 
                                                px: 4, py: 1.5,
                                                '&:hover': { backgroundColor: accentColor, filter: 'brightness(0.85)' }
                                            }}
                                        >
                                            {hasItems ? "Commander ce menu" : "Commander en ligne"}
                                        </Button>
                                    </Box>

                                </motion.div>
                            </Grid>

                            {/* --- THE MEDIA SIDE (Image, Video, or Gallery) --- */}
                            <Grid item xs={12} md={6}>
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
                                    
                                    {/* 1. SINGLE VIDEO */}
                                    {isVideo && (
                                        <Box sx={{ width: '100%', height: { xs: '300px', md: '500px' }, borderRadius: 4, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
                                            <video 
                                                ref={el => videoRefs.current[event.id] = el}
                                                autoPlay loop muted playsInline preload="auto" poster={getPosterUrl(rawUrls[0])} 
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                            >
                                                <source src={rawUrls[0]} type="video/mp4" />
                                            </video>
                                        </Box>
                                    )}

                                    {/* 2. SINGLE IMAGE */}
                                    {isSingleImage && (
                                        <Box 
                                            component="img" 
                                            src={rawUrls[0]} 
                                            alt={event.title}
                                            sx={{ width: '100%', height: { xs: '300px', md: '500px' }, objectFit: 'cover', borderRadius: 4, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }} 
                                        />
                                    )}

                                    {/* 3. MULTIPLE IMAGES (GRID GALLERY) */}
                                    {isGallery && (
                                        <Grid container spacing={2}>
                                            {/* ✅ FIXED: xs={12} forces stacking on mobile. sm={6} makes a perfect 2-column grid on desktop. */}
                                            {rawUrls.map((imgUrl, i) => (
                                                <Grid item xs={12} sm={6} key={i}>
                                                    <Box 
                                                        component="img" 
                                                        src={getSafeImg(imgUrl)}
                                                        alt={`${event.title} ${i}`}
                                                        sx={{ 
                                                            width: '100%', 
                                                            height: '240px', // ✅ STRICT: Every single image is exactly 240px tall. No inconsistent sizes!
                                                            objectFit: 'cover', 
                                                            borderRadius: 3, 
                                                            boxShadow: '0 10px 20px rgba(0,0,0,0.15)',
                                                            transition: 'transform 0.3s ease',
                                                            cursor: 'pointer',
                                                            '&:hover': { transform: 'scale(1.02)' }
                                                        }} 
                                                    />
                                                </Grid>
                                            ))}
                                        </Grid>
                                    )}

                                </motion.div>
                            </Grid>

                        </Grid>
                    );
                })}
            </Container>
        </Box>
    );
}