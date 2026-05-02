import React, { useState, useEffect, useRef } from 'react';
import { Box, Container, Typography, Button, Grid, Modal, Fade, Backdrop, IconButton } from '@mui/material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SpecialOccasionBanner from '../../components/website/SpecialOccasionBanner';
import WebsiteNavigation from '../../components/website/WebsiteNavigation';
import { isVideoUrl, getPosterUrl } from '../../utils/mediaUtils';
import FullMenuModal from '../../components/website/FullMenuModal';
import CloseIcon from '@mui/icons-material/Close';

const scrollAnimation = {
  '@keyframes scroll': { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
};

export default function WarmSpiceTemplate({ restaurant, menuData }) {
    const { t } = useTranslation();
    const hasVideoHero = isVideoUrl(restaurant.heroImageUrl);
    const videoRef = useRef(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    const accent = "#E36944";     
    const darkBg = "#181412";     
    const lightText = "#FDFBF7";  
    const lightBg = "#FDFBF7";    

    useEffect(() => {
        if (hasVideoHero && videoRef.current) {
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) playPromise.catch(e => console.warn(e));
        }
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    },[hasVideoHero, restaurant.heroImageUrl]);

    const getSafeImg = (url) => url ? (isVideoUrl(url) ? getPosterUrl(url) : url) : '';
    const rawImages = (restaurant.galleryImageUrls ||[]).filter(url => url && url.trim().length > 0).map(url => url.trim());

    const teaserItems =[];
    if (menuData) menuData.forEach(cat => {
        if (cat.menuItems) teaserItems.push(...cat.menuItems);
        if (cat.subCategories) cat.subCategories.forEach(sub => { if (sub.menuItems) teaserItems.push(...sub.menuItems); });
    });
    const displayTeasers = teaserItems.slice(0, 6);

    // ✅ FIXED: Bulletproof Dynamic Gallery Renderer
    const renderGallery = () => {
        if (rawImages.length === 0) return null;
        const style = restaurant.galleryStyle || 'GRID';

        if (style === 'COLLAGE') {
            const img1 = getSafeImg(rawImages[0]);
            const img2 = rawImages.length > 1 ? getSafeImg(rawImages[1]) : null;
            return (
                <Box sx={{ position: 'relative', height: { xs: '350px', md: '500px' }, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Box component="img" src={img1} onClick={() => setSelectedImage(img1)} alt="Ambiance" 
                        sx={{ width: '80%', height: { xs: '280px', md: '400px' }, objectFit: 'cover', position: 'absolute', top: 0, right: 0, zIndex: 2, boxShadow: '0 20px 40px rgba(0,0,0,0.4)', cursor: 'pointer', borderRadius: '8px' }} 
                    />
                    {img2 && (
                        <Box component="img" src={img2} onClick={() => setSelectedImage(img2)} alt="Food" 
                            sx={{ width: '70%', height: { xs: '200px', md: '300px' }, objectFit: 'cover', position: 'absolute', bottom: 0, left: 0, zIndex: 3, border: `8px solid ${lightBg}`, boxShadow: '0 20px 40px rgba(0,0,0,0.5)', cursor: 'pointer', borderRadius: '8px' }} 
                        />
                    )}
                </Box>
            );
        }

        if (style === 'MARQUEE' && rawImages.length > 2) {
            const displayImages = [...rawImages, ...rawImages, ...rawImages]; // Triple for seamless loop
            return (
                <Box sx={{ width: '100%', position: 'relative', zIndex: 2, overflow: 'hidden' }}>
                    <Box sx={{ display: 'flex', gap: 2, width: 'max-content', ...scrollAnimation, animation: 'scroll 30s linear infinite', '&:hover': { animationPlayState: 'paused' } }}>
                        {displayImages.map((imgUrl, index) => (
                            <Box key={index} component="img" src={getSafeImg(imgUrl)} onClick={() => setSelectedImage(getSafeImg(imgUrl))} 
                                sx={{ width: { xs: '250px', md: '350px' }, height: { xs: '200px', md: '250px' }, objectFit: 'cover', borderRadius: 2, flexShrink: 0, boxShadow: '0 10px 30px rgba(0,0,0,0.1)', cursor: 'pointer', transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.02)' } }} 
                            />
                        ))}
                    </Box>
                </Box>
            );
        }

        // DEFAULT: STATIC GRID
        return (
            <Grid container spacing={2}>
                {rawImages.slice(0, 4).map((imgUrl, index) => (
                    <Grid item xs={6} key={index}>
                        <Box component="img" src={getSafeImg(imgUrl)} onClick={() => setSelectedImage(getSafeImg(imgUrl))} 
                            sx={{ width: '100%', height: { xs: '150px', md: '250px' }, objectFit: 'cover', borderRadius: 2, cursor: 'pointer', transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.03)', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' } }} 
                        />
                    </Grid>
                ))}
            </Grid>
        );
    };

    return (
        <Box sx={{ backgroundColor: lightBg, color: '#333', minHeight: '100vh', fontFamily: '"Lato", sans-serif' }}>
            <WebsiteNavigation restaurantName={restaurant.name} textColor="white" scrolledBgColor={lightBg} scrolledTextColor={darkBg} logoUrl={restaurant.logoUrl} />
            <Box sx={{ pt: 8 }}> <SpecialOccasionBanner restaurantId={restaurant.id} restaurantSlug={restaurant.slug} /> </Box>

            {/* HERO */}
            <Box id="home" sx={{ height: '100svh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: '#000', transform: 'translateZ(0)' }}>
                {hasVideoHero ? (
                    <video ref={videoRef} autoPlay loop muted playsInline preload="auto" poster={getPosterUrl(restaurant.heroImageUrl)} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} >
                        <source src={restaurant.heroImageUrl} type="video/mp4" />
                    </video>
                ) : (
                    <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, backgroundImage: `url('${restaurant.heroImageUrl}')`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                )}
                <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, background: 'radial-gradient(circle, rgba(0,0,0,0.3) 0%, rgba(24,20,18,0.9) 100%)' }} />

                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.5 }} style={{ zIndex: 2, position: 'relative', textAlign: 'center', padding: '20px', width: '100%' }}>
                    {restaurant.logoUrl && (
                        <img src={restaurant.logoUrl} alt="logo" style={{ height: '240px', maxWidth: '100%', objectFit: 'contain', marginBottom: '20px', filter: 'drop-shadow(0px 8px 16px rgba(0,0,0,0.8))' }} />
                    )}
                    <Typography variant="h6" sx={{ color: accent, fontStyle: 'italic', letterSpacing: '4px', mb: 5, fontWeight: 300 }}>{restaurant.metaDescription || "A Culinary Journey"}</Typography>
                    <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
                        {restaurant.reservationsEnabled && <Button component={Link} to={`/order/${restaurant.slug}/reserve`} variant="contained" sx={{ backgroundColor: accent, color: '#fff', px: 4, py: 1.5, fontSize: '1.1rem', borderRadius: 0, '&:hover': { backgroundColor: '#a04926' } }}>{t('bookTable')}</Button>}
                        <Button component={Link} to={`/order/${restaurant.slug}`} variant="outlined" sx={{ borderColor: '#fff', color: '#fff', px: 4, py: 1.5, fontSize: '1.1rem', borderRadius: 0, '&:hover': { backgroundColor: '#fff', color: darkBg } }}>{t('orderOnline')}</Button>
                    </Box>
                </motion.div>
            </Box>

            {/* ABOUT US (DYNAMIC GALLERY) */}
            <Box id="about" sx={{ 
                position: 'relative', py: { xs: 10, md: 15 },
                backgroundImage: restaurant.aboutSectionImageUrl ? `linear-gradient(rgba(253, 251, 247, 0.85), rgba(253, 251, 247, 0.85)), url('${restaurant.aboutSectionImageUrl}')` : 'none',
                backgroundColor: restaurant.aboutSectionImageUrl ? 'transparent' : lightBg,
                backgroundSize: 'cover', backgroundAttachment: 'fixed', backgroundPosition: 'center', overflow: 'hidden'
            }}>
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
                    {restaurant.galleryStyle === 'MARQUEE' ? (
                        <>
                            <Box sx={{ textAlign: 'center', mb: 8 }}>
                                <Typography variant="h6" sx={{ color: accent, textTransform: 'uppercase', letterSpacing: '3px', mb: 2 }}>{t('aboutUs')}</Typography>
                                <Typography variant="h3" sx={{ fontFamily: '"Playfair Display", serif', color: darkBg, fontWeight: 700, mb: 4 }}>The True Taste</Typography>
                                <Typography variant="body1" sx={{ fontSize: '1.1rem', color: '#555', lineHeight: 1.8, maxWidth: '800px', mx: 'auto' }}>{restaurant.aboutUsText}</Typography>
                            </Box>
                            {renderGallery()}
                        </>
                    ) : (
                        <Grid container spacing={8} alignItems="center">
                            <Grid item xs={12} md={6}>
                                <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                                    <Typography variant="h6" sx={{ color: accent, textTransform: 'uppercase', letterSpacing: '3px', mb: 2 }}>{t('aboutUs')}</Typography>
                                    <Typography variant="h3" sx={{ fontFamily: '"Playfair Display", serif', color: darkBg, fontWeight: 700, mb: 4 }}>The True Taste</Typography>
                                    <Typography variant="body1" sx={{ fontSize: '1.1rem', color: '#555', lineHeight: 1.8 }}>{restaurant.aboutUsText}</Typography>
                                </motion.div>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                {renderGallery()}
                            </Grid>
                        </Grid>
                    )}
                </Container>
            </Box>

            {/* MENU TEASER */}
            <Box id="menu" sx={{ 
                position: 'relative', color: '#fff', py: 12,
                backgroundImage: restaurant.menuSectionImageUrl ? `linear-gradient(rgba(24, 20, 18, 0.85), rgba(24, 20, 18, 0.85)), url('${restaurant.menuSectionImageUrl}')` : 'none',
                backgroundColor: restaurant.menuSectionImageUrl ? 'transparent' : darkBg,
                backgroundSize: 'cover', backgroundAttachment: 'fixed', backgroundPosition: 'center'
            }}>
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
                    <Box sx={{ textAlign: 'center', mb: 8 }}>
                        <Typography variant="h6" sx={{ color: accent, textTransform: 'uppercase', letterSpacing: '3px', mb: 2 }}>{t('ourMenu')}</Typography>
                        <Typography variant="h3" sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 700 }}>Discover the Flavors</Typography>
                    </Box>

                    <Grid container spacing={6}>
                        {displayTeasers.map((item, index) => (
                            <Grid item xs={12} md={6} key={item.id}>
                                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (index % 2) * 0.1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}>
                                        <Typography variant="h6" sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 700, fontSize: '1.2rem' }}>{item.name}</Typography>
                                        <Box sx={{ flexGrow: 1, borderBottom: '1px dashed rgba(255,255,255,0.2)', mx: 2, position: 'relative', top: '-6px' }} />
                                        <Typography variant="h6" sx={{ color: accent, fontWeight: 'bold' }}>€{item.price.toFixed(2)}</Typography>
                                    </Box>
                                    <Typography variant="body2" sx={{ color: '#aaa', fontStyle: 'italic' }}>{item.description}</Typography>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>

                    <Box sx={{ textAlign: 'center', mt: 8 }}>
                        <Button onClick={() => setMenuOpen(true)} variant="contained" sx={{ backgroundColor: accent, color: '#fff', px: 5, py: 1.5, fontSize: '1.1rem', borderRadius: 0, '&:hover': { backgroundColor: '#a04926' } }}>
                            {t('viewFullMenu')}
                        </Button>
                    </Box>
                </Container>
            </Box>

            {/* RESERVATION */}
            {restaurant.reservationsEnabled && (
                <Box id="reservation" sx={{ 
                    position: 'relative', py: 12, textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)',
                    backgroundImage: restaurant.reservationSectionImageUrl ? `linear-gradient(rgba(24, 20, 18, 0.85), rgba(24, 20, 18, 0.85)), url('${restaurant.reservationSectionImageUrl}')` : 'none',
                    backgroundColor: restaurant.reservationSectionImageUrl ? 'transparent' : '#110d0b',
                    backgroundSize: 'cover', backgroundAttachment: 'fixed', backgroundPosition: 'center'
                }}>
                    <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 2 }}>
                        <Typography variant="h3" sx={{ fontFamily: '"Playfair Display", serif', color: lightText, mb: 3 }}>{t('bookTable')}</Typography>
                        <Typography variant="body1" sx={{ color: '#aaa', mb: 5, fontFamily: '"Lato", sans-serif' }}>{t('bookTableSubtitle', { restaurantName: restaurant.name })}</Typography>
                        <Button component={Link} to={`/order/${restaurant.slug}/reserve`} variant="contained" sx={{ backgroundColor: accent, color: '#fff', px: 6, py: 2, fontSize: '1.1rem', borderRadius: 0, '&:hover': { backgroundColor: '#a04926' } }}>{t('reserveNow')}</Button>
                    </Container>
                </Box>
            )}

            {/* FOOTER / CONTACT */}
            <Box id="contact" sx={{ 
                position: 'relative', pt: 10, pb: 6, textAlign: 'center', borderTop: '1px solid #eaeaea',
                backgroundImage: restaurant.contactSectionImageUrl ? `linear-gradient(rgba(253, 251, 247, 0.90), rgba(253, 251, 247, 0.90)), url('${restaurant.contactSectionImageUrl}')` : 'none',
                backgroundColor: restaurant.contactSectionImageUrl ? 'transparent' : lightBg,
                backgroundSize: 'cover', backgroundAttachment: 'fixed', backgroundPosition: 'center'
            }}>
                <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2 }}>
                    <Typography variant="h4" sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 700, color: darkBg, mb: 4, letterSpacing: '2px' }}>{restaurant.name}</Typography>
                    <Grid container spacing={4} justifyContent="center" sx={{ color: '#555', fontWeight: 400, lineHeight: 2, mb: 6 }}>
                        <Grid item xs={12} sm={4}>
                            <Typography sx={{ color: accent, textTransform: 'uppercase', letterSpacing: '2px', mb: 1, fontSize: '0.8rem', fontWeight: 'bold' }}>{t('findUs')}</Typography>
                            <Typography>{restaurant.address}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Typography sx={{ color: accent, textTransform: 'uppercase', letterSpacing: '2px', mb: 1, fontSize: '0.8rem', fontWeight: 'bold' }}>{t('contactTitle')}</Typography>
                            <Typography>{restaurant.phoneNumber}</Typography>
                            <Typography>{restaurant.email}</Typography>
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

            <FullMenuModal open={menuOpen} onClose={() => setMenuOpen(false)} menuData={menuData} restaurantName={restaurant.name} restaurantSlug={restaurant.slug} currency={restaurant.currency} themeConfig={{ fontHeader: '"Playfair Display", serif', fontBody: '"Lato", sans-serif', accentColor: accent, bgColor: lightBg, textColor: darkBg, mutedTextColor: '#666' }} />
        </Box>
    );
}