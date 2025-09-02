import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
      <Button 
        variant={i18n.language === 'en' ? 'contained' : 'outlined'} 
        onClick={() => changeLanguage('en')}
        size="small"
        sx={{ mr: 1 }}
      >
        EN
      </Button>
      <Button 
        variant={i18n.language === 'fr' ? 'contained' : 'outlined'} 
        onClick={() => changeLanguage('fr')}
        size="small"
      >
        FR
      </Button>
    </div>
  );
};

export default LanguageSwitcher;