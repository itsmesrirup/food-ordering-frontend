import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { isVideoUrl } from '../../utils/mediaUtils';

const HeroBlock = ({ restaurant }) => {
    const { t } = useTranslation();
    const hasVideoHero = isVideoUrl(restaurant.heroImageUrl);

    return (
        <Box sx={{ 
            height: '90vh', 
            width: '100%', 
            position: 'relative', // The parent must be relative for absolute children
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center',
            color: 'white', 
            textAlign: 'center', 
            px: 2,
            overflow: 'hidden', // Prevents the video from breaking the layout
            backgroundColor: '#000' // Fallback color while loading
        }}>
            
            {/* LAYER 1: THE MEDIA (VIDEO OR IMAGE) */}
            {hasVideoHero ? (
                <video 
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    style={{ 
                        position: 'absolute', 
                        top: 0,
                        left: 0,
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover', 
                        zIndex: 0 // Bottom layer
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
                    zIndex: 0, // Bottom layer
                    backgroundImage: `url('${restaurant.heroImageUrl}')`, 
                    backgroundSize: 'cover', 
                    backgroundPosition: 'center', 
                    backgroundRepeat: 'no-repeat'
                }} />
            )}

            {/* LAYER 2: THE DARK GRADIENT OVERLAY */}
            {/* This ensures the white text is always readable, regardless of how bright the video/image is */}
            <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 1, // Middle layer
                background: 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.7))'
            }} />

            {/* LAYER 3: THE CONTENT (TEXT & BUTTONS) */}
            <motion.div 
                initial={{ opacity: 0, y: 30 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 1 }}
                style={{ zIndex: 2, position: 'relative' }} // Top layer
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