import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Box } from '@mui/material';

// Accepts a 'mode' prop: 'light' (default, for dark backgrounds) or 'dark' (for light backgrounds)
const LanguageSwitcher = ({ mode = 'light' }) => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  // Helper function for dynamic styling
  const getButtonStyle = (isActive) => {
    const isLightMode = mode === 'light'; // White text (for dark headers like RestaurantLayout)
    
    return {
      color: isLightMode ? 'white' : '#333',
      borderColor: isLightMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.23)',
      fontWeight: isActive ? 'bold' : 'normal',
      backgroundColor: isActive 
        ? (isLightMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)') 
        : 'transparent',
      borderWidth: isActive ? '2px' : '1px',
      '&:hover': {
        backgroundColor: isLightMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.05)',
        borderColor: isLightMode ? 'white' : 'black',
      }
    };
  };

  return (
    <Box>
      <Button 
        variant="outlined" 
        onClick={() => changeLanguage('en')} 
        size="small" 
        sx={{ ...getButtonStyle(i18n.language.startsWith('en')), mr: 1 }}
      >
        EN
      </Button>
      <Button 
        variant="outlined" 
        onClick={() => changeLanguage('fr')} 
        size="small" 
        sx={{ ...getButtonStyle(i18n.language.startsWith('fr')), mr: 1 }}
      >
        FR
      </Button>
      <Button 
        variant="outlined" 
        onClick={() => changeLanguage('de')} 
        size="small" 
        sx={getButtonStyle(i18n.language.startsWith('de'))}
      >
        DE
      </Button>
    </Box>
  );
};

export default LanguageSwitcher;