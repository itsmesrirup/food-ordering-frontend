import React, { useEffect, useRef, useState } from 'react';
import { Box, Container, Typography, Button, Grid, Modal, Fade, Backdrop, IconButton } from '@mui/material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SpecialOccasionBanner from '../../components/website/SpecialOccasionBanner';
import WebsiteNavigation from '../../components/website/WebsiteNavigation';
import { isVideoUrl, getPosterUrl } from '../../utils/mediaUtils';
import FullMenuModal from '../../components/website/FullMenuModal';
import CloseIcon from '@mui/icons-material/Close';

export default function DarkEleganceTemplate({ restaurant, menuData }) {
    const { t } = useTranslation();
    const gold = "#d4af37";
    const hasVideoHero = isVideoUrl(restaurant.heroImageUrl);
    const videoRef = useRef(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        if (hasVideoHero && videoRef.current) {
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) playPromise.catch(e => console.warn(e));
        }
    }, [hasVideoHero, restaurant.heroImageUrl]);

    const displayCategories = menuData.map(cat => {
        let allItems =[];
        if (cat.menuItems) allItems.push(...cat.menuItems);
        if (cat.subCategories) cat.subCategories.forEach(sub => { if (sub.menuItems) allItems.push(...sub.menuItems); });
        return { ...cat, extractedItems: allItems };
    }).filter(cat => cat.extractedItems.length > 0).slice(0, 4);

    const getSafeImg = (url) => url ? (isVideoUrl(url) ? getPosterUrl(url) : url) : '';
    const rawImages = (restaurant.galleryImageUrls ||[]).filter(url => url && url.trim().length > 0).map(url => url.trim());

    return (
        <Box sx={{ backgroundColor: '#0a0a0a', color: '#e0e0e0', minHeight: '100vh', fontFamily: '"Playfair Display", serif' }}>
            <WebsiteNavigation restaurantName={restaurant.name} textColor="white" scrolledBgColor="#0a0a0a" scrolledTextColor={gold} />

            <Box sx={{ pt: 8 }}> 
                <SpecialOccasionBanner restaurantId={restaurant.id} restaurantSlug={restaurant.slug} />
            </Box>

            {/* HERO */}
            <Box id="home" sx={{ height: { xs: '100svh', md: '90vh' }, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: '#000', transform: 'translateZ(0)' }}>
                {hasVideoHero ? (
                    <video ref={videoRef} autoPlay loop muted playsInline preload="auto" poster={getPosterUrl(restaurant.heroImageUrl)} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0, filter: 'brightness(0.3)' }}>
                        <source src={restaurant.heroImageUrl} type="video/mp4" />
                    </video>
                ) : (
                    <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, backgroundImage: `url('${restaurant.heroImageUrl}')`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.3)' }} />
                )}

                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.5 }} style={{ zIndex: 2, position: 'relative' }}>
                    <Box sx={{ border: `1px solid ${gold}`, p: { xs: 4, md: 8 }, textAlign: 'center', backdropFilter: 'blur(3px)' }}>
                        {restaurant.logoUrl && <img src={restaurant.logoUrl} alt="logo" style={{ height: '90px', marginBottom: '30px', filter: 'drop-shadow(0px 4px 10px rgba(0,0,0,0.8))' }} />}
                        <Typography variant="h1" sx={{ color: gold, textTransform: 'uppercase', letterSpacing: '6px', fontSize: { xs: '2.5rem', md: '4rem' }, mb: 2 }}>{restaurant.name}</Typography>
                        <Button onClick={() => setMenuOpen(true)} variant="outlined" sx={{ mt: 4, borderColor: gold, color: gold, px: 5, py: 1.5, letterSpacing: '2px', fontFamily: '"Lato", sans-serif', '&:hover': { backgroundColor: gold, color: '#000' } }}>
                            {t('viewMenu')}
                        </Button>
                    </Box>
                </motion.div>
            </Box>

            {/* ABOUT US */}
            <Box id="about" sx={{ 
                py: 15, textAlign: 'center',
                backgroundImage: restaurant.aboutSectionImageUrl ? `linear-gradient(rgba(10,10,10,0.85), rgba(10,10,10,0.85)), url('${restaurant.aboutSectionImageUrl}')` : 'none',
                backgroundSize: 'cover', backgroundAttachment: 'fixed', backgroundPosition: 'center'
            }}>
                <Container maxWidth="md">
                    <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1 }}>
                        <Typography variant="h6" sx={{ color: gold, textTransform: 'uppercase', letterSpacing: '4px', mb: 4 }}>{t('aboutUs')}</Typography>
                        <Typography variant="body1" sx={{ fontSize: '1.2rem', lineHeight: 2.2, color: '#ccc', fontFamily: '"Lato", sans-serif', fontWeight: 300 }}>
                            {restaurant.aboutUsText}
                        </Typography>
                    </motion.div>
                </Container>
            </Box>

            {/* ✅ FIXED ELEGANT UNIFORM GALLERY */}
            {rawImages.length > 0 && (
                <Container maxWidth="lg" sx={{ py: 10 }}>
                    <Grid container spacing={4} justifyContent="center">
                        {rawImages.slice(0, 4).map((imgUrl, index) => {
                            // Dynamic column sizing: If 3 images, take 33% (md=4). If 4 images, take 25% (md=3).
                            const colSize = rawImages.length === 3 ? 4 : 3; 
                            return (
                                <Grid item xs={12} sm={6} md={colSize} key={index}>
                                    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1, delay: index * 0.2 }}>
                                        <Box component="img" src={getSafeImg(imgUrl)} onClick={() => setSelectedImage(getSafeImg(imgUrl))}
                                            sx={{
                                                width: '100%', height: '350px', 
                                                objectFit: 'cover', cursor: 'pointer', filter: 'grayscale(20%)', transition: 'all 0.4s ease',
                                                borderRadius: '4px', border: `1px solid ${gold}40`,
                                                '&:hover': { filter: 'grayscale(0%)', transform: 'scale(1.02)', boxShadow: `0 0 20px ${gold}40` }
                                            }}
                                        />
                                    </motion.div>
                                </Grid>
                            );
                        })}
                    </Grid>
                </Container>
            )}

            {/* MENU */}
            <Box id="menu" sx={{ 
                py: 12, backgroundColor: restaurant.menuSectionImageUrl ? 'transparent' : '#111',
                backgroundImage: restaurant.menuSectionImageUrl ? `linear-gradient(rgba(17,17,17,0.9), rgba(17,17,17,0.9)), url('${restaurant.menuSectionImageUrl}')` : 'none',
                backgroundSize: 'cover', backgroundAttachment: 'fixed', backgroundPosition: 'center'
            }}>
                <Container maxWidth="lg">
                    <Typography variant="h3" align="center" sx={{ color: gold, mb: 8, letterSpacing: '4px' }}>{t('ourMenu')}</Typography>
                    <Grid container spacing={8}>
                        {displayCategories.map((category) => (
                            <Grid item xs={12} md={6} key={category.id}>
                                <Typography variant="h5" sx={{ color: '#fff', borderBottom: `1px solid ${gold}`, pb: 1, mb: 4, textTransform: 'uppercase' }}>{category.name}</Typography>
                                {category.extractedItems.slice(0, 3).map(item => (
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
                    <Box textAlign="center" mt={8}>
                        <Button onClick={() => setMenuOpen(true)} sx={{ color: gold, borderBottom: `1px solid ${gold}`, borderRadius: 0, fontFamily: '"Lato", sans-serif', letterSpacing: '2px' }}>{t('viewFullMenu')}</Button>
                    </Box>
                </Container>
            </Box>

            {/* RESERVATION */}
            {restaurant.reservationsEnabled && (
                <Box id="reservation" sx={{ 
                    py: 12, textAlign: 'center', borderTop: `1px solid ${gold}40`, backgroundColor: restaurant.reservationSectionImageUrl ? 'transparent' : '#050505',
                    backgroundImage: restaurant.reservationSectionImageUrl ? `linear-gradient(rgba(5,5,5,0.8), rgba(5,5,5,0.8)), url('${restaurant.reservationSectionImageUrl}')` : 'none',
                    backgroundSize: 'cover', backgroundAttachment: 'fixed', backgroundPosition: 'center'
                }}>
                    <Container maxWidth="sm">
                        <Typography variant="h3" sx={{ color: gold, mb: 3, fontFamily: '"Playfair Display", serif' }}>{t('bookTable')}</Typography>
                        <Typography variant="body1" sx={{ color: '#aaa', mb: 5, fontFamily: '"Lato", sans-serif' }}>{t('bookTableSubtitle', { restaurantName: restaurant.name })}</Typography>
                        <Button component={Link} to={`/order/${restaurant.slug}/reserve`} variant="contained" sx={{ backgroundColor: gold, color: '#000', px: 6, py: 2, fontSize: '1.1rem', letterSpacing: '2px', '&:hover': { backgroundColor: '#b5952f' } }}>{t('reserveNow')}</Button>
                    </Container>
                </Box>
            )}

            {/* CONTACT */}
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

            {/* LIGHTBOX */}
            <Modal open={!!selectedImage} onClose={() => setSelectedImage(null)} closeAfterTransition slots={{ backdrop: Backdrop }} slotProps={{ backdrop: { timeout: 500, sx: { backgroundColor: 'rgba(0,0,0,0.9)' } } }} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Fade in={!!selectedImage}>
                    <Box sx={{ position: 'relative', outline: 'none', maxWidth: '90vw', maxHeight: '90vh' }}>
                        <IconButton onClick={() => setSelectedImage(null)} sx={{ position: 'absolute', top: -50, right: 0, color: 'white' }}><CloseIcon /></IconButton>
                        <Box component="img" src={selectedImage} sx={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: 1 }} />
                    </Box>
                </Fade>
            </Modal>

            <FullMenuModal open={menuOpen} onClose={() => setMenuOpen(false)} menuData={menuData} restaurantName={restaurant.name} restaurantSlug={restaurant.slug} currency={restaurant.currency} themeConfig={{ fontHeader: '"Playfair Display", serif', fontBody: '"Lato", sans-serif', accentColor: gold, bgColor: '#0a0a0a', textColor: '#e0e0e0', mutedTextColor: '#999' }} />
        </Box>
    );
}