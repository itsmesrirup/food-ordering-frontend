import React from 'react';
import { Box, Container, Typography, Button, Grid, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SpecialOccasionBanner from '../../components/website/SpecialOccasionBanner';
import WebsiteNavigation from '../../components/website/WebsiteNavigation';
import { isVideoUrl } from '../../utils/mediaUtils';

export default function VibrantTemplate({ restaurant, menuData }) {
    const { t } = useTranslation();
    const primary = "#FF3366"; 
    const dark = "#111";
    const hasVideoHero = isVideoUrl(restaurant.heroImageUrl);

    return (
        <Box sx={{ backgroundColor: '#fff', color: dark, minHeight: '100vh', fontFamily: '"Montserrat", sans-serif' }}>
            <WebsiteNavigation restaurantName={restaurant.name} />

            <Box sx={{ pt: 7 }}> 
                <SpecialOccasionBanner restaurantId={restaurant.id} restaurantSlug={restaurant.slug} />
            </Box>

            <Grid id="home" container sx={{ minHeight: '80vh' }}>
                <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 4, md: 10 }, backgroundColor: '#FFE600' }}>
                    <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
                        {restaurant.logoUrl && <img src={restaurant.logoUrl} alt="logo" style={{ height: '80px', marginBottom: '20px' }} />}
                        <Typography variant="h1" sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: { xs: '3.5rem', md: '5.5rem' }, lineHeight: 1, mb: 3, color: dark, letterSpacing: '-2px' }}>
                            {restaurant.name}
                        </Typography>
                        <Button component={Link} to={`/order/${restaurant.slug}`} variant="contained" sx={{ backgroundColor: dark, color: '#fff', px: 5, py: 2, fontSize: '1.2rem', fontWeight: 900, borderRadius: 0, '&:hover': { backgroundColor: primary } }}>
                            {t('orderOnline')}
                        </Button>
                    </motion.div>
                </Grid>
                
                {/* ✅ FIXED RIGHT SIDE (VIDEO OR IMAGE) */}
                <Grid item xs={12} md={6} sx={{ position: 'relative', minHeight: { xs: '50vh', md: 'auto' }, overflow: 'hidden' }}>
                    {hasVideoHero ? (
                        <video 
                            autoPlay loop muted playsInline 
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                        >
                            <source src={restaurant.heroImageUrl} type="video/mp4" />
                        </video>
                    ) : (
                        <Box sx={{ 
                            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
                            backgroundImage: `url('${restaurant.heroImageUrl}')`, 
                            backgroundSize: 'cover', backgroundPosition: 'center' 
                        }} />
                    )}
                </Grid>
            </Grid>

            <Box id="about" sx={{ backgroundColor: primary, color: '#fff', py: 10, px: 4, textAlign: 'center', borderTop: `8px solid ${dark}`, borderBottom: `8px solid ${dark}` }}>
                <Container maxWidth="md">
                    <Typography variant="h2" sx={{ fontWeight: 900, textTransform: 'uppercase', mb: 4 }}>{t('aboutUs')}</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600, lineHeight: 1.6 }}>{restaurant.aboutUsText}</Typography>
                </Container>
            </Box>

            {/* FULL MENU - VIBRANT STYLE */}
            <Container id="menu" maxWidth="lg" sx={{ py: 12 }}>
                <Typography variant="h2" sx={{ fontWeight: 900, textTransform: 'uppercase', mb: 6, textAlign: 'center' }}>{t('ourMenu')}</Typography>
                
                {menuData.map((category) => (
                    <Box key={category.id} sx={{ mb: 8 }}>
                        <Typography variant="h3" sx={{ fontWeight: 900, mb: 4, color: primary, textTransform: 'uppercase', borderBottom: `4px solid ${dark}`, display: 'inline-block' }}>
                            {category.name}
                        </Typography>
                        <Grid container spacing={4}>
                            {category.menuItems?.map((item, index) => (
                                <Grid item xs={12} md={6} key={item.id}>
                                    {/* ✅ STAGGERED SPRING ANIMATION ON SCROLL & HOVER */}
                                    <motion.div 
                                        initial={{ opacity: 0, y: 30 }} 
                                        whileInView={{ opacity: 1, y: 0 }} 
                                        viewport={{ once: true }} 
                                        transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
                                        whileHover={{ scale: 1.03, rotate: -1 }} // Playful tilt on hover
                                    >
                                        <Paper sx={{ p: 3, border: `4px solid ${dark}`, borderRadius: 0, boxShadow: `6px 6px 0px ${primary}`, display: 'flex', justifyContent: 'space-between', cursor: 'default' }}>
                                            <Box sx={{ pr: 2 }}>
                                                <Typography variant="h6" sx={{ fontWeight: 900, textTransform: 'uppercase' }}>{item.name}</Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#555' }}>{item.description}</Typography>
                                            </Box>
                                            <Typography variant="h5" sx={{ color: primary, fontWeight: 900 }}>€{item.price.toFixed(2)}</Typography>
                                        </Paper>
                                    </motion.div>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                ))}
            </Container>

            {/* RESERVATIONS */}
            {restaurant.reservationsEnabled && (
                <Box id="reservation" sx={{ backgroundColor: '#FFE600', py: 10, textAlign: 'center', borderTop: `8px solid ${dark}`, borderBottom: `8px solid ${dark}` }}>
                    <Container maxWidth="sm">
                        <Typography variant="h2" sx={{ fontWeight: 900, textTransform: 'uppercase', color: dark, mb: 3 }}>{t('bookTable')}</Typography>
                        <Button component={Link} to={`/order/${restaurant.slug}/reserve`} variant="contained" sx={{ backgroundColor: dark, color: '#fff', px: 6, py: 2, fontSize: '1.2rem', fontWeight: 900, borderRadius: 0, '&:hover': { backgroundColor: primary } }}>
                            {t('reserveNow')}
                        </Button>
                    </Container>
                </Box>
            )}

            {/* CONTACT & MAPS */}
            <Box id="contact" sx={{ backgroundColor: dark, color: '#fff', py: 10 }}>
                <Container maxWidth="lg">
                    <Grid container spacing={6}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h3" sx={{ fontWeight: 900, color: primary, mb: 3 }}>{t('findUs')}</Typography>
                            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>{restaurant.address}</Typography>
                            <Typography variant="h5" sx={{ fontWeight: 700, mb: 4 }}>{restaurant.phoneNumber}</Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            {restaurant.googleMapsUrl && (
                                <Box id="maps" sx={{ border: `4px solid ${primary}`, height: '300px', width: '100%', backgroundColor: '#fff' }}>
                                    <iframe src={restaurant.googleMapsUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy" title="Map"></iframe>
                                </Box>
                            )}
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </Box>
    );
}