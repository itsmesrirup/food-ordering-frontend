import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton, Typography, Box, Accordion, AccordionSummary, AccordionDetails, Slide, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { formatPrice } from '../../utils/formatPrice';
import { useTranslation } from 'react-i18next';

// Slide up animation for the modal
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// Recursive function to handle subcategories
const CategoryAccordion = ({ category, currency, fontBody, fontHeader, accentColor, mutedTextColor }) => {
    return (
        <Accordion 
            disableGutters 
            elevation={0} 
            sx={{ 
                borderBottom: `1px solid ${accentColor}30`, // Soft adapted border
                '&:before': { display: 'none' }, // removes default MUI shadow line
                backgroundColor: 'transparent',
                color: 'inherit'
            }}
        >
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: accentColor }} />}>
                <Typography sx={{ fontFamily: fontHeader, fontWeight: 'bold', fontSize: '1.2rem', textTransform: 'uppercase' }}>
                    {category.name}
                </Typography>
            </AccordionSummary>
            <AccordionDetails>
                {/* Render Items */}
                {category.menuItems && category.menuItems.map(item => (
                    <Box key={item.id} sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ pr: 2, flexGrow: 1 }}>
                            <Typography sx={{ fontFamily: fontHeader, fontWeight: 600, fontSize: '1rem' }}>
                                {item.name}
                            </Typography>
                            <Typography sx={{ fontFamily: fontBody, color: mutedTextColor, fontSize: '0.9rem', lineHeight: 1.4 }}>
                                {item.description}
                            </Typography>
                        </Box>
                        <Typography sx={{ fontFamily: fontHeader, fontWeight: 'bold', color: accentColor, flexShrink: 0 }}>
                            {formatPrice(item.price, currency)}
                        </Typography>
                    </Box>
                ))}

                {/* Render Subcategories (Recursion) */}
                {category.subCategories && category.subCategories.length > 0 && (
                    <Box sx={{ pl: 2, mt: 2, borderLeft: `2px solid ${accentColor}40` }}>
                        {category.subCategories.map(subCat => (
                            <CategoryAccordion 
                                key={subCat.id} 
                                category={subCat} 
                                currency={currency} 
                                fontBody={fontBody} 
                                fontHeader={fontHeader} 
                                accentColor={accentColor} 
                                mutedTextColor={mutedTextColor}
                            />
                        ))}
                    </Box>
                )}
            </AccordionDetails>
        </Accordion>
    );
};

export default function FullMenuModal({ open, onClose, menuData, restaurantName, currency, themeConfig }) {
    const { t } = useTranslation();
    
    // Extract theme props passed from the parent template
    const fontHeader = themeConfig?.fontHeader || '"Playfair Display", serif';
    const fontBody = themeConfig?.fontBody || '"Lato", sans-serif';
    const accentColor = themeConfig?.accentColor || '#d32f2f';
    const bgColor = themeConfig?.bgColor || '#fff';
    const textColor = themeConfig?.textColor || '#111';
    const mutedTextColor = themeConfig?.mutedTextColor || '#666';

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            fullScreen // Makes it take up the whole screen like a booklet
            TransitionComponent={Transition}
            PaperProps={{ sx: { backgroundColor: bgColor, color: textColor } }}
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, borderBottom: `1px solid ${accentColor}40` }}>
                <Typography sx={{ fontFamily: fontHeader, fontWeight: 'bold', fontSize: '1.5rem', textTransform: 'uppercase' }}>
                    {restaurantName} - {t('ourMenu')}
                </Typography>
                <IconButton onClick={onClose} sx={{ color: textColor }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            
            <DialogContent sx={{ p: { xs: 2, md: 5 } }}>
                <Box sx={{ maxWidth: '800px', margin: '0 auto' }}>
                    {menuData.map(category => (
                        <CategoryAccordion 
                            key={category.id} 
                            category={category} 
                            currency={currency}
                            fontBody={fontBody}
                            fontHeader={fontHeader}
                            accentColor={accentColor}
                            mutedTextColor={mutedTextColor}
                        />
                    ))}

                    {/* ✅ TRANSLATED CTA BUTTON */}
                    <Box sx={{ mt: 5, textAlign: 'center', p: 3, backgroundColor: `${accentColor}15`, borderRadius: 2 }}>
                        <Typography sx={{ fontFamily: fontHeader, fontWeight: 'bold', fontSize: '1.2rem', mb: 2 }}>
                            {t('readyToEat')}
                        </Typography>
                        <Button 
                            href={`/order/${window.location.pathname.split('/').pop()}`} 
                            variant="contained" 
                            size="large"
                            sx={{ backgroundColor: accentColor, color: '#fff', fontWeight: 'bold', px: 4 }}
                        >
                            {t('startOnlineOrder')}
                        </Button>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
}