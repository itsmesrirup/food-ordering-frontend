import React from 'react';
import { Box, Container, Typography, Grid, Paper } from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useTranslation } from 'react-i18next';

// Order to display days
const DAYS_ORDER = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

const InfoBlock = ({ restaurant }) => {
  const { t } = useTranslation();

  // --- HELPER: Parse and Format Hours ---
  const renderOpeningHours = () => {
    // 1. Try to use the structured JSON first
    if (restaurant.openingHoursJson) {
      try {
        const schedule = JSON.parse(restaurant.openingHoursJson);
        
        return (
          <Box sx={{ width: '100%' }}>
            {DAYS_ORDER.map((dayKey) => {
              const slots = schedule[dayKey] || [];
              
              // Format the times: "11:00 - 14:00, 18:00 - 22:00" OR "Closed"
              let timeString = "";
              if (slots.length === 0) {
                timeString = t('closed');
              } else {
                timeString = slots.map(s => `${s.open} - ${s.close}`).join(', ');
              }

              return (
                <Box key={dayKey} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, borderBottom: '1px dashed #eee', pb: 0.5 }}>
                  <Typography sx={{ fontFamily: '"Lato"', fontWeight: 'bold', width: '100px' }}>
                    {t(`days.${dayKey}`)}
                  </Typography>
                  <Typography sx={{ fontFamily: '"Lato"', flexGrow: 1, textAlign: 'right' }}>
                    {timeString}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        );
      } catch (e) {
        console.error("Error parsing opening hours", e);
        // Fall through to text backup if JSON is corrupt
      }
    }

    // 2. Fallback to the old simple text field
    return (
        <Typography sx={{ fontFamily: '"Lato"', fontSize: '1.1rem', whiteSpace: 'pre-wrap', textAlign: 'left' }}>
            {restaurant.openingHours || t('notSet')}
        </Typography>
    );
  };

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
                        {/* Only show icon if using fallback text mode, otherwise grid looks cleaner without it */}
                        {!restaurant.openingHoursJson && <AccessTimeIcon sx={{ color: 'text.secondary', mt: 0.5 }} />}
                        
                        {/* --- RENDER THE HOURS HERE --- */}
                        {renderOpeningHours()}
                    </Box>
                </Grid>

                {/* --- Vertical Divider (Desktop) --- */}
                <Grid item xs={12} md={2}>
                    <Box sx={{ display: { xs: 'none', md: 'block' }, height: '100%', width: '1px', backgroundColor: '#ddd', mx: 'auto' }} />
                    <Box sx={{ display: { xs: 'block', md: 'none' }, width: '50%', height: '1px', backgroundColor: '#ddd', mx: 'auto', my: 2 }} />
                </Grid>

                {/* --- Contact Section --- */}
                <Grid item xs={12} md={5}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: '#d32f2f', textTransform: 'uppercase', letterSpacing: 1 }}>
                        {t('contactTitle')}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
                        <LocationOnIcon sx={{ color: 'text.secondary', mt: 0.5 }} />
                        <Typography sx={{ fontFamily: '"Lato"', fontSize: '1.1rem', textAlign: 'left' }}>
                            {restaurant.address}
                        </Typography>
                    </Box>

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