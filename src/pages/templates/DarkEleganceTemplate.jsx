import React from 'react';
import { Box, Container, Typography, Button, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SpecialOccasionBanner from '../../components/website/SpecialOccasionBanner';
import WebsiteNavigation from '../../components/website/WebsiteNavigation';
import { isVideoUrl } from '../../utils/mediaUtils';

export default function DarkEleganceTemplate({ restaurant, menuData }) {
    const { t } = useTranslation();
    const gold = "#d4af37";
    const hasVideoHero = isVideoUrl(restaurant.heroImageUrl);

    return (
        <Box sx={{ backgroundColor: '#0a0a0a', color: '#e0e0e0', minHeight: '100vh', fontFamily: '"Playfair Display", serif' }}>
            <WebsiteNavigation restaurantName={restaurant.name} />

            <Box sx={{ pt: 8 }}> 
                <SpecialOccasionBanner restaurantId={restaurant.id} restaurantSlug={restaurant.slug} />
            </Box>

            {/* HERO */}
            <Box id="home" sx={{ 
                height: '90vh', 
                position: 'relative', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                overflow: 'hidden' 
            }}>
                {/* Background Layer */}
                {hasVideoHero ? (
                    <video 
                        autoPlay loop muted playsInline 
                        style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', zIndex: 0, filter: 'brightness(0.3)' }}
                    >
                        <source src={restaurant.heroImageUrl} type="video/mp4" />
                    </video>
                ) : (
                    <Box sx={{ 
                        position: 'absolute', width: '100%', height: '100%', zIndex: 0,
                        backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url('${restaurant.heroImageUrl}')`, 
                        backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' 
                    }} />
                )}

                {/* Content Layer */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    transition={{ duration: 1.5, ease: "easeOut" }} // Smoother ease
                    style={{ zIndex: 1, position: 'relative' }}
                >
                    <Box sx={{ border: `1px solid ${gold}`, p: { xs: 4, md: 8 }, textAlign: 'center', backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                        {restaurant.logoUrl && <img src={restaurant.logoUrl} alt="logo" style={{ height: '90px', mb: 3 }} />}
                        <Typography variant="h1" sx={{ color: gold, textTransform: 'uppercase', letterSpacing: '6px', fontSize: { xs: '2.5rem', md: '4rem' }, mb: 2 }}>
                            {restaurant.name}
                        </Typography>
                        <Button component={Link} to={`/order/${restaurant.slug}`} variant="outlined" sx={{ mt: 4, borderColor: gold, color: gold, px: 5, py: 1.5, letterSpacing: '2px', transition: 'all 0.4s ease', '&:hover': { backgroundColor: gold, color: '#000', transform: 'translateY(-3px)', boxShadow: `0 10px 20px rgba(212, 175, 55, 0.3)` } }}>
                            {t('viewMenu')}
                        </Button>
                    </Box>
                </motion.div>
            </Box>

            {/* ABOUT */}
            <Container id="about" maxWidth="md" sx={{ py: 15, textAlign: 'center' }}>
                <Typography variant="h6" sx={{ color: gold, textTransform: 'uppercase', letterSpacing: '4px', mb: 4 }}>{t('aboutUs')}</Typography>
                <Typography variant="body1" sx={{ fontSize: '1.2rem', lineHeight: 2.2, color: '#ccc', fontFamily: '"Lato", sans-serif', fontWeight: 300 }}>
                    {restaurant.aboutUsText}
                </Typography>
            </Container>

            {/* MENU */}
            <Box id="menu" sx={{ backgroundColor: '#111', py: 12 }}>
                <Container maxWidth="lg">
                    <Typography variant="h3" align="center" sx={{ color: gold, mb: 8, letterSpacing: '4px' }}>{t('ourMenu')}</Typography>
                    <Grid container spacing={8}>
                        {menuData.slice(0, 6).map((category) => (
                            <Grid item xs={12} md={6} key={category.id}>
                                <Typography variant="h5" sx={{ color: '#fff', borderBottom: `1px solid ${gold}`, pb: 1, mb: 4, textTransform: 'uppercase' }}>
                                    {category.name}
                                </Typography>
                                {category.menuItems?.map(item => (
                                    <Box key={item.id} sx={{ mb: 3 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                            <Typography variant="h6" sx={{ color: '#fff', fontSize: '1.1rem' }}>{item.name}</Typography>
                                            <Box sx={{ flexGrow: 1, borderBottom: '1px dotted #444', mx: 2, position: 'relative', top: '-6px' }} />
                                            <Typography variant="h6" sx={{ color: gold }}>€{item.price.toFixed(2)}</Typography>
                                        </Box>
                                        <Typography variant="body2" sx={{ color: '#888', fontStyle: 'italic', fontFamily: '"Lato", sans-serif' }}>{item.description}</Typography>
                                    </Box>
                                ))}
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* RESERVATION BLOCK */}
            {restaurant.reservationsEnabled && (
                <Box id="reservation" sx={{ py: 12, backgroundColor: '#050505', textAlign: 'center', borderTop: `1px solid ${gold}40` }}>
                    <Container maxWidth="sm">
                        <Typography variant="h3" sx={{ color: gold, mb: 3, fontFamily: '"Playfair Display", serif' }}>{t('bookTable')}</Typography>
                        <Typography variant="body1" sx={{ color: '#aaa', mb: 5, fontFamily: '"Lato", sans-serif' }}>
                            {t('bookTableSubtitle', { restaurantName: restaurant.name })}
                        </Typography>
                        <Button component={Link} to={`/order/${restaurant.slug}/reserve`} variant="contained" sx={{ backgroundColor: gold, color: '#000', px: 6, py: 2, fontSize: '1.1rem', letterSpacing: '2px', '&:hover': { backgroundColor: '#b5952f' } }}>
                            {t('reserveNow')}
                        </Button>
                    </Container>
                </Box>
            )}

            {/* CONTACT & MAPS */}
            <Box id="contact" sx={{ backgroundColor: '#111', py: 10, borderTop: `1px solid #333` }}>
                <Container maxWidth="lg">
                    <Grid container spacing={6} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Typography variant="h4" sx={{ color: gold, mb: 4 }}>{t('visitUs')}</Typography>
                            <Box sx={{ fontFamily: '"Lato", sans-serif', color: '#ccc', fontSize: '1.1rem', lineHeight: 2 }}>
                                <Typography sx={{ mb: 2 }}>{restaurant.address}</Typography>
                                <Typography sx={{ mb: 4 }}>{restaurant.phoneNumber}</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            {restaurant.googleMapsUrl && (
                                <Box id="maps" sx={{ height: '300px', width: '100%', filter: 'grayscale(80%) contrast(1.2)' }}>
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