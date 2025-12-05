import React from 'react';
import { Box, Container, Typography, Grid, Paper } from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useTranslation } from 'react-i18next';

const InfoBlock = ({ restaurant }) => {
  const { t } = useTranslation();

  return (
    <Box id="contact" sx={{ py: 10, backgroundColor: '#f8f8f8' }}>
      <Container maxWidth="md">
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', backgroundColor: 'transparent' }}>
           <Typography variant="h3" sx={{ fontFamily: '"Playfair Display", serif', mb: 6 }}>
                {t('visitUs')}
           </Typography>
           
           <Grid container spacing={4} justifyContent="center">
                
                {/* --- Hours Section --- */}
                <Grid item xs={12} md={5}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: '#d32f2f', textTransform: 'uppercase', letterSpacing: 1 }}>
                        {t('openingHoursTitle')}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                        <AccessTimeIcon sx={{ color: 'text.secondary', mt: 0.5 }} />
                        <Typography sx={{ fontFamily: '"Lato"', fontSize: '1.1rem', whiteSpace: 'pre-wrap', textAlign: 'left' }}>
                            {restaurant.openingHours}
                        </Typography>
                    </Box>
                </Grid>

                {/* --- Vertical Divider (Desktop) --- */}
                <Grid item xs={12} md={2}>
                    <Box sx={{ display: { xs: 'none', md: 'block' }, height: '100%', width: '1px', backgroundColor: '#ddd', mx: 'auto' }} />
                    {/* Horizontal Divider (Mobile) */}
                    <Box sx={{ display: { xs: 'block', md: 'none' }, width: '50%', height: '1px', backgroundColor: '#ddd', mx: 'auto', my: 2 }} />
                </Grid>

                {/* --- Contact Section --- */}
                <Grid item xs={12} md={5}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: '#d32f2f', textTransform: 'uppercase', letterSpacing: 1 }}>
                        {t('contactTitle')}
                    </Typography>
                    
                    {/* Address */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
                        <LocationOnIcon sx={{ color: 'text.secondary', mt: 0.5 }} />
                        <Typography sx={{ fontFamily: '"Lato"', fontSize: '1.1rem', textAlign: 'left' }}>
                            {restaurant.address}
                        </Typography>
                    </Box>

                    {/* Phone */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                        <PhoneIcon sx={{ color: 'text.secondary', mt: 0.5 }} />
                        <Typography sx={{ fontFamily: '"Lato"', fontSize: '1.2rem', fontWeight: 'bold' }}>
                            {restaurant.phoneNumber}
                        </Typography>
                    </Box>
                </Grid>
           </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default InfoBlock;