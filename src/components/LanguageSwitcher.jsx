import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Box } from '@mui/material';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const buttonStyle = (isActive) => ({
    color: 'white',
    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
    }
  });

  return (
    <Box>
      <Button 
        onClick={() => changeLanguage('en')}
        size="small"
        sx={{ ...buttonStyle(i18n.language.startsWith('en')), mr: 1 }}
      >
        EN
      </Button>
      <Button 
        onClick={() => changeLanguage('fr')}
        size="small"
        sx={{ ...buttonStyle(i18n.language.startsWith('fr')), mr: 1 }} // Add margin right
      >
        FR
      </Button>
      {/*Add the German button */}
      <Button 
        onClick={() => changeLanguage('de')}
        size="small"
        sx={buttonStyle(i18n.language.startsWith('de'))}
      >
        DE
      </Button>
    </Box>
  );
};

export default LanguageSwitcher;