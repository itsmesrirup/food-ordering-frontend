import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button } from '@mui/material';

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    // ✅ Safely check if the language string starts with the code (e.g., 'fr-FR' starts with 'fr')
    const isActive = (lng) => i18n.language?.startsWith(lng);

    return (
        <Box sx={{ display: 'flex', gap: 1 }}>
            {['en', 'fr', 'de'].map((lng) => (
                <Button 
                    key={lng}
                    // Use a subtle grey background if active, otherwise transparent
                    variant={isActive(lng) ? 'contained' : 'outlined'} 
                    onClick={() => changeLanguage(lng)}
                    size="small"
                    sx={{ 
                        minWidth: '40px', 
                        // Inherit the exact text color of the parent container
                        color: 'inherit',
                        // Make active text bold
                        fontWeight: isActive(lng) ? 'bold' : 'normal',
                        // Custom colors to ensure it's visible on ANY background (Light or Dark mode)
                        backgroundColor: isActive(lng) ? 'rgba(128, 128, 128, 0.2)' : 'transparent',
                        borderColor: isActive(lng) ? 'transparent' : 'rgba(128, 128, 128, 0.4)',
                        boxShadow: 'none',
                        '&:hover': {
                            backgroundColor: 'rgba(128, 128, 128, 0.3)',
                            borderColor: 'currentColor',
                            boxShadow: 'none'
                        }
                    }}
                >
                    {lng.toUpperCase()}
                </Button>
            ))}
        </Box>
    );
};

export default LanguageSwitcher;