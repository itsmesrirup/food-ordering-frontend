import React from 'react';
import { Box, Container, Typography, Grid, Paper } from '@mui/material';
import QrCodeIcon from '@mui/icons-material/QrCode2';
import { useTranslation } from 'react-i18next';

const QrPromoBlock = ({ restaurant }) => {
    const { t } = useTranslation();
    // Only render if the feature is enabled
    if (!restaurant.qrCodeOrderingEnabled) return null;

    return (
        <Box sx={{ py: 8, backgroundColor: '#f4f4f4' }}>
            <Container maxWidth="md">
                <Paper elevation={0} sx={{ p: 4, display: 'flex', alignItems: 'center', gap: 4, borderRadius: 4, flexDirection: {xs: 'column', md: 'row'} }}>
                    <Box sx={{ 
                        width: 100, height: 100, 
                        backgroundColor: 'primary.main', 
                        borderRadius: '50%', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white'
                    }}>
                        <QrCodeIcon sx={{ fontSize: 60 }} />
                    </Box>
                    <Box>
                        <Typography variant="h4" sx={{ fontFamily: '"Playfair Display", serif', mb: 1 }}>
                            {t('dineInTitle')}
                        </Typography>
                        <Typography variant="body1" sx={{ fontFamily: '"Lato", sans-serif', color: 'text.secondary' }}>
                            {t('dineInSubtitle')}
                        </Typography>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default QrPromoBlock;