import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const HeroBlock = ({ restaurant }) => {
    const { t } = useTranslation();
  return (
    <Box sx={{ 
        height: '90vh', // Takes up 90% of the screen height
        width: '100%',
        position: 'relative',
        backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.7)), url(${restaurant.heroImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed', // This creates the Parallax effect
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        textAlign: 'center',
        px: 2
    }}>
      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 1 }}
      >
          {restaurant.logoUrl && (
              <Box component="img" src={restaurant.logoUrl} sx={{ width: '120px', mb: 3, borderRadius: '50%', border: '2px solid white' }} />
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
          
          <Button 
              component={Link}
              to={`/restaurants/${restaurant.id}`}
              variant="contained" 
              size="large"
              sx={{ 
                  mt: 4,
                  borderRadius: '50px', 
                  px: 5, py: 1.5, 
                  fontSize: '1.1rem',
                  backgroundColor: '#d32f2f', // Or use theme.palette.primary.main
                  textTransform: 'none',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 14px 0 rgba(211, 47, 47, 0.39)'
              }}
          >
              {t('orderOnline')}
          </Button>
      </motion.div>
    </Box>
  );
};

export default HeroBlock;