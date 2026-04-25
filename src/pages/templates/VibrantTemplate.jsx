import React, { useState, useEffect, useRef } from 'react';
import { Box, Container, Typography, Button, Grid, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SpecialOccasionBanner from '../../components/website/SpecialOccasionBanner';
import WebsiteNavigation from '../../components/website/WebsiteNavigation';
import { isVideoUrl, getPosterUrl } from '../../utils/mediaUtils';
import FullMenuModal from '../../components/website/FullMenuModal';

export default function VibrantTemplate({ restaurant, menuData }) {
    const { t } = useTranslation();
    const primary = "#FF3366"; 
    const dark = "#111";
    const hasVideoHero = isVideoUrl(restaurant.heroImageUrl);
    
    const videoRef = useRef(null);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        if (hasVideoHero && videoRef.current) {
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => console.warn("Autoplay blocked", e));
            }
        }
    }, [hasVideoHero, restaurant.heroImageUrl]);

    // ✅ SMART TEASER ALGORITHM: 
    // Grab up to 2 items from each category to ensure a good mix of Entrees, Mains, etc.
    const teaserItems = [];
    if (menuData) {
        menuData.forEach(category => {
            if (category.menuItems && category.menuItems.length > 0) {
                // Add the first 2 items from this category
                teaserItems.push(...category.menuItems.slice(0, 2));
            }
        });
    }
    // Limit the final array to 9 items (for a perfect 3x3 grid on desktop)
    const displayTeasers = teaserItems.slice(0, 9);

    return (
        <Box sx={{ backgroundColor: '#fff', color: dark, minHeight: '100vh', fontFamily: '"Montserrat", sans-serif' }}>
            <WebsiteNavigation 
                restaurantName={restaurant.name} 
                textColor="#111" // Dark text when at top
                scrolledBgColor="#111" // Turns black when scrolling
                scrolledTextColor="#fff" // Turns white when scrolling
            />

            <Box sx={{ pt: 7 }}> 
                <SpecialOccasionBanner restaurantId={restaurant.id} restaurantSlug={restaurant.slug} />
            </Box>

            {/* ✅ HERO SECTION (Fixed the white space bug on the right side) */}
            <Box id="home" sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', md: 'row' }, // Stack on mobile, side-by-side on desktop
                minHeight: '80vh', 
                width: '100%' 
            }}>
                
                {/* LEFT SIDE (Content) - Takes 50% width on Desktop */}
                <Box sx={{ 
                    width: { xs: '100%', md: '50%' }, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    p: { xs: 4, md: 10 }, 
                    backgroundColor: '#FFE600' 
                }}>
                    <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
                        {restaurant.logoUrl && <img src={restaurant.logoUrl} alt="logo" style={{ height: '80px', marginBottom: '20px' }} />}
                        <Typography variant="h1" sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: { xs: '3.5rem', md: '5.5rem' }, lineHeight: 1, mb: 3, color: dark, letterSpacing: '-2px' }}>
                            {restaurant.name}
                        </Typography>
                        <Typography variant="h6" sx={{ mb: 4, fontWeight: 700, color: '#333' }}>
                            {restaurant.metaDescription || t('vibrantHeroSubtitle')} 
                        </Typography>
                        <Button component={Link} to={`/order/${restaurant.slug}`} variant="contained" sx={{ backgroundColor: dark, color: '#fff', px: 5, py: 2, fontSize: '1.2rem', fontWeight: 900, borderRadius: 0, '&:hover': { backgroundColor: primary } }}>
                            {t('orderOnline')}
                        </Button>
                    </motion.div>
                </Box>
                
                {/* RIGHT SIDE (Video / Image) - Takes 50% width on Desktop */}
                <Box sx={{ 
                    width: { xs: '100%', md: '50%' }, 
                    position: 'relative', 
                    minHeight: { xs: '50vh', md: 'auto' }, // Gives height on mobile, stretches to match left side on desktop
                    overflow: 'hidden', 
                    backgroundColor: '#000', 
                    transform: 'translateZ(0)', 
                    WebkitTransform: 'translateZ(0)'
                }}>
                    {hasVideoHero ? (
                        <video 
                            ref={videoRef}
                            autoPlay loop muted playsInline preload="auto"
                            poster={getPosterUrl(restaurant.heroImageUrl)}
                            style={{ 
                                position: 'absolute', 
                                top: 0, left: 0, width: '100%', height: '100%', 
                                objectFit: 'cover', 
                                transform: 'translate3d(0,0,0)', 
                                WebkitTransform: 'translate3d(0,0,0)' 
                            }}
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
                </Box>
            </Box>

            {/* ABOUT */}
            <Box id="about" sx={{ backgroundColor: primary, color: '#fff', py: 10, px: 4, textAlign: 'center', borderTop: `8px solid ${dark}`, borderBottom: `8px solid ${dark}` }}>
                <Container maxWidth="md">
                    {/* ✅ TRANSLATED TITLE */}
                    <Typography variant="h2" sx={{ fontWeight: 900, textTransform: 'uppercase', mb: 4 }}>{t('theVibe')}</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600, lineHeight: 1.6 }}>{restaurant.aboutUsText}</Typography>
                </Container>
            </Box>

            {/* 🔥 SMART TEASER MENU (With restored Hover Animations!) */}
            <Container id="menu" maxWidth="lg" sx={{ py: 12 }}>
                {/* ✅ TRANSLATED HITS */}
                <Typography variant="h2" sx={{ fontWeight: 900, textTransform: 'uppercase', mb: 6, textAlign: 'center' }}>{t('popularHits')}</Typography>
                
                <Grid container spacing={4} alignItems="stretch">
                    {displayTeasers.map((item, index) => (
                        <Grid item xs={12} sm={6} md={4} key={item.id} sx={{ display: 'flex' }}>
                            <motion.div 
                                style={{ display: 'flex', width: '100%' }}
                                initial={{ opacity: 0, y: 30 }} 
                                whileInView={{ opacity: 1, y: 0 }} 
                                viewport={{ once: true }} 
                                transition={{ delay: (index % 3) * 0.1, type: "spring", stiffness: 100 }}
                                whileHover={{ scale: 1.03, rotate: -1 }} 
                            >
                                <Paper sx={{ p: 4, width: '100%', border: `4px solid ${dark}`, borderRadius: 0, boxShadow: `8px 8px 0px ${primary}`, display: 'flex', flexDirection: 'column', cursor: 'default' }}>
                                    <Typography variant="h5" sx={{ fontWeight: 900, textTransform: 'uppercase', mb: 1 }}>{item.name}</Typography>
                                    <Typography variant="h4" sx={{ color: primary, fontWeight: 900, mb: 2 }}>€{item.price.toFixed(2)}</Typography>
                                    <Typography variant="body1" sx={{ flexGrow: 1, fontWeight: 500, color: '#555' }}>{item.description}</Typography>
                                </Paper>
                            </motion.div>
                        </Grid>
                    ))}
                </Grid>

                <Box textAlign="center" mt={8}>
                    <Button onClick={() => setMenuOpen(true)} variant="outlined" sx={{ border: `4px solid ${dark}`, color: dark, px: 6, py: 2, fontWeight: 900, fontSize: '1.2rem', borderRadius: 0, '&:hover': { backgroundColor: dark, color: '#fff' } }}>
                        {t('viewFullMenu')} {/* ✅ TRANSLATED */}
                    </Button>
                </Box>
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

            {/* THE MENU MODAL */}
            <FullMenuModal 
                open={menuOpen} 
                onClose={() => setMenuOpen(false)} 
                menuData={menuData} 
                restaurantName={restaurant.name}
                currency={restaurant.currency}
                themeConfig={{
                    fontHeader: '"Montserrat", sans-serif',
                    fontBody: '"Montserrat", sans-serif',
                    accentColor: primary,
                    bgColor: '#fff',
                    textColor: dark
                }}
            />
        </Box>
    );
}