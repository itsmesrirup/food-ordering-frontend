import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Button, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SpecialOccasionBanner from '../../components/website/SpecialOccasionBanner';
import WebsiteNavigation from '../../components/website/WebsiteNavigation';
import { isVideoUrl } from '../../utils/mediaUtils';

export default function MinimalistTemplate({ restaurant }) {
    const { t } = useTranslation();
    const [menuData, setMenuData] = useState([]);
    const hasVideoHero = isVideoUrl(restaurant.heroImageUrl);
    
    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/restaurants/${restaurant.id}/menu`)
            .then(res => res.json()).then(setMenuData).catch(console.error);
    }, [restaurant.id]);

    return (
        <Box sx={{ backgroundColor: '#FCFCFC', color: '#1A1A1A', minHeight: '100vh', fontFamily: '"Space Grotesk", sans-serif' }}>
            
            <WebsiteNavigation restaurantName={restaurant.name} />

            <Box sx={{ pt: 8 }}> 
                <SpecialOccasionBanner restaurantId={restaurant.id} restaurantSlug={restaurant.slug} />
            </Box>

            {/* CLEAN HERO */}
            <Container id="home" maxWidth="lg" sx={{ pt: 5, pb: 5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 8 }}>
                    {restaurant.logoUrl ? (
                        <img src={restaurant.logoUrl} alt="logo" style={{ height: '40px' }} />
                    ) : (
                        <Typography variant="h5" sx={{ fontWeight: 600, letterSpacing: '-1px' }}>{restaurant.name}</Typography>
                    )}
                    <Button component={Link} to={`/order/${restaurant.slug}`} variant="text" sx={{ color: '#1A1A1A', fontWeight: 600, borderBottom: '1px solid #1A1A1A', borderRadius: 0, px: 0 }}>
                        {t('orderOnline')}
                    </Button>
                </Box>

                <Grid container spacing={6} alignItems="center">
                    <Grid item xs={12} md={5}>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }}>
                            <Typography variant="h2" sx={{ fontWeight: 400, lineHeight: 1.1, mb: 4, letterSpacing: '-2px' }}>
                                {restaurant.metaTitle || restaurant.name}
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#666', fontSize: '1.1rem', lineHeight: 1.8, mb: 5 }}>
                                {restaurant.aboutUsText}
                            </Typography>
                            {restaurant.reservationsEnabled && (
                                <Button component={Link} to={`/order/${restaurant.slug}/reserve`} sx={{ backgroundColor: '#1A1A1A', color: '#fff', px: 4, py: 1.5, borderRadius: '4px', fontWeight: 400, textTransform: 'none', '&:hover': { backgroundColor: '#333' } }}>
                                    {t('bookTable')}
                                </Button>
                            )}
                        </motion.div>
                    </Grid>
                    
                    {/* ✅ FIXED RIGHT SIDE (VIDEO OR IMAGE) */}
                    <Grid item xs={12} md={7} sx={{ position: 'relative', height: { xs: '40vh', md: '70vh' } }}>
                        {hasVideoHero ? (
                            <motion.video 
                                initial={{ opacity: 0, scale: 0.98 }} 
                                animate={{ opacity: 1, scale: 1 }} 
                                transition={{ duration: 1.5 }}
                                autoPlay loop muted playsInline 
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                            >
                                <source src={restaurant.heroImageUrl} type="video/mp4" />
                            </motion.video>
                        ) : (
                            <motion.img 
                                initial={{ opacity: 0, scale: 0.98 }} 
                                animate={{ opacity: 1, scale: 1 }} 
                                transition={{ duration: 1.5 }}
                                src={restaurant.heroImageUrl} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} 
                            />
                        )}
                    </Grid>
                </Grid>
            </Container>

            {/* MINIMALIST MENU */}
            <Container maxWidth="md" sx={{ py: 15 }}>
                <Typography variant="h4" sx={{ fontWeight: 400, mb: 8, textAlign: 'center', letterSpacing: '-1px' }}>Curated Menu</Typography>
                <Box sx={{ columnCount: { xs: 1, md: 2 }, columnGap: '60px' }}>
                    {menuData.flatMap(cat => cat.menuItems || []).slice(0, 10).map((item) => (
                        <Box key={item.id} sx={{ mb: 5, breakInside: 'avoid' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography sx={{ fontWeight: 600, fontSize: '1.1rem' }}>{item.name}</Typography>
                                <Typography sx={{ fontWeight: 400 }}>{item.price.toFixed(2)}</Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: '#888', lineHeight: 1.6 }}>{item.description}</Typography>
                        </Box>
                    ))}
                </Box>
                <Box textAlign="center" mt={6}>
                    <Button component={Link} to={`/order/${restaurant.slug}`} variant="outlined" sx={{ color: '#1A1A1A', borderColor: '#E0E0E0', px: 4, py: 1, borderRadius: '4px', textTransform: 'none', '&:hover': { borderColor: '#1A1A1A', backgroundColor: 'transparent' } }}>
                        See Everything
                    </Button>
                </Box>
            </Container>

            {/* PRECISE GALLERY */}
            <Container maxWidth="xl" sx={{ pb: 15 }}>
                <Grid container spacing={2}>
                    {restaurant.galleryImageUrls?.slice(0, 3).map((img, idx) => (
                        <Grid item xs={12} md={4} key={idx}>
                            <img src={img} alt="Gallery" style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '4px' }} />
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* FOOTER */}
            <Box sx={{ borderTop: '1px solid #EAEAEA', py: 8 }}>
                <Container maxWidth="lg">
                    <Grid container spacing={4} justifyContent="space-between">
                        <Grid item xs={12} md={4}>
                            <Typography sx={{ fontWeight: 600, mb: 2 }}>Location</Typography>
                            <Typography sx={{ color: '#666', lineHeight: 1.8 }}>{restaurant.address}</Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography sx={{ fontWeight: 600, mb: 2 }}>Contact</Typography>
                            <Typography sx={{ color: '#666', lineHeight: 1.8 }}>{restaurant.phoneNumber}<br/>{restaurant.email}</Typography>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </Box>
    );
}