import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles'; // Import useTheme

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const theme = useTheme(); // Get the current theme

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  // ✅ NEW: Dynamic button styling
  const buttonStyle = (isActive) => {
    // Check if the current theme mode is dark
    const isDark = theme.palette.mode === 'dark';
    
    return {
      // Use the theme's primary text color (white on dark, dark on light)
      color: theme.palette.getContrastText(theme.palette.primary.main),
      backgroundColor: isActive ? 'rgba(0, 0, 0, 0.2)' : 'transparent',
      // Use a border color that contrasts with the header
      borderColor: isActive ? 'transparent' : 'rgba(255, 255, 255, 0.5)',
      '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderColor: 'rgba(255, 255, 255, 0.8)',
      }
    };
  };

  return (
    <Box>
      <Button variant="outlined" onClick={() => changeLanguage('en')} size="small" sx={{ ...buttonStyle(i18n.language.startsWith('en')), mr: 1 }}>EN</Button>
      <Button variant="outlined" onClick={() => changeLanguage('fr')} size="small" sx={{ ...buttonStyle(i18n.language.startsWith('fr')), mr: 1 }}>FR</Button>
      <Button variant="outlined" onClick={() => changeLanguage('de')} size="small" sx={buttonStyle(i18n.language.startsWith('de'))}>DE</Button>
    </Box>
  );
};

export default LanguageSwitcher;