import React, { useEffect, useRef } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { isVideoUrl, getPosterUrl } from '../../utils/mediaUtils';

const HeroBlock = ({ restaurant }) => {
    const { t } = useTranslation();
    const hasVideoHero = isVideoUrl(restaurant.heroImageUrl);
    
    // ✅ ADDED: Reference to the video element
    const videoRef = useRef(null);

    // ✅ ADDED: Catch the mobile data block error
    useEffect(() => {
        if (hasVideoHero && videoRef.current) {
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    // If Mobile Data or Battery Saver blocks the video, this prevents the app from breaking.
                    // The 'poster' image will remain visible instead of a black screen!
                    console.warn("Autoplay blocked to save data. Displaying fallback poster image.", error);
                });
            }
        }
    }, [hasVideoHero, restaurant.heroImageUrl]);

    return (
        <Box sx={{ 
            // ✅ ADDED: height '100svh' for mobile to prevent scroll glitches, and translateZ for GPU acceleration
            height: { xs: '100svh', md: '90vh' }, 
            width: '100%', 
            position: 'relative', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center',
            color: 'white', 
            textAlign: 'center', 
            px: 2,
            overflow: 'hidden', 
            backgroundColor: '#000',
            transform: 'translateZ(0)', 
            WebkitTransform: 'translateZ(0)'
        }}>
            
            {/* LAYER 1: THE MEDIA (VIDEO OR IMAGE) */}
            {hasVideoHero ? (
                <video 
                    ref={videoRef} // ✅ ADDED
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    preload="auto" // ✅ ADDED
                    poster={getPosterUrl(restaurant.heroImageUrl)} // ✅ ADDED: Displays image if video is blocked
                    style={{ 
                        position: 'absolute', 
                        top: 0,
                        left: 0,
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover', 
                        zIndex: 0,
                        transform: 'translate3d(0, 0, 0)', // ✅ ADDED: GPU Acceleration
                        WebkitTransform: 'translate3d(0, 0, 0)'
                    }}
                >
                    <source src={restaurant.heroImageUrl} type="video/mp4" />
                </video>
            ) : (
                <Box sx={{ 
                    position: 'absolute', 
                    top: 0,
                    left: 0,
                    width: '100%', 
                    height: '100%', 
                    zIndex: 0, 
                    backgroundImage: `url('${restaurant.heroImageUrl}')`, 
                    backgroundSize: 'cover', 
                    backgroundPosition: 'center', 
                    backgroundRepeat: 'no-repeat'
                }} />
            )}

            {/* LAYER 2: THE DARK GRADIENT OVERLAY */}
            <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 1, 
                background: 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.7))',
                pointerEvents: 'none' // ✅ ADDED: Allows clicks to pass through
            }} />

            {/* LAYER 3: THE CONTENT (TEXT & BUTTONS) */}
            <motion.div 
                initial={{ opacity: 0, y: 30 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 1 }}
                style={{ zIndex: 2, position: 'relative' }} 
            >
                {restaurant.logoUrl && (
                    <Box 
                        component="img" 
                        src={restaurant.logoUrl} 
                        sx={{ width: '120px', mb: 3, borderRadius: '50%', border: '2px solid white', backgroundColor: 'rgba(255,255,255,0.1)' }} 
                    />
                )}
                
                <Typography variant="h1" sx={{ 
                    fontFamily: '"Playfair Display", serif', 
                    fontWeight: 700, 
                    fontSize: { xs: '3rem', md: '5rem' }, 
                    mb: 2, 
                    textShadow: '2px 2px 4px rgba(0,0,0,0.5)' 
                }}>
                    {restaurant.name}
                </Typography>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                        component={Link} 
                        to={`/order/${restaurant.slug}`} 
                        variant="contained" 
                        size="large" 
                        sx={{ 
                            mt: 4, 
                            borderRadius: '50px', 
                            px: 5, 
                            py: 1.5, 
                            fontSize: '1.1rem', 
                            backgroundColor: '#d32f2f', 
                            textTransform: 'none', 
                            fontWeight: 'bold', 
                            boxShadow: '0 4px 14px 0 rgba(211, 47, 47, 0.39)', 
                            '&:hover': { backgroundColor: '#b71c1c' } 
                        }}
                    >
                        {t('orderOnline')}
                    </Button>
                </motion.div>
            </motion.div>

        </Box>
    );
};

export default HeroBlock;