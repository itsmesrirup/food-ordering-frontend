import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next'; // 1. Import 'Trans'
import { Container, Typography, Button, Box } from '@mui/material';

function OrderConfirmationPage() {
    const { orderId } = useParams();
    const { t } = useTranslation(); // 2. Get the 't' function

    return (
        <Container maxWidth="sm" sx={{ textAlign: 'center', py: 4 }}>
            <Box>
                <Typography variant="h4" component="h2" gutterBottom>
                    {t('orderConfirmation_thankYou')}
                </Typography>
                <Typography sx={{ mb: 2 }}>
                    {t('orderConfirmation_success')}
                </Typography>
                <Typography sx={{ mb: 2 }}>
                    {/* 3. Use the Trans component for mixed content */}
                    <Trans i18nKey="orderConfirmation_orderNumber" values={{ orderId }}>
                        Your order number is: <strong>#{{orderId}}</strong>
                    </Trans>
                </Typography>
                <Typography sx={{ mb: 4 }}>
                    {t('orderConfirmation_preparation')}
                </Typography>
                <Button component={Link} to="/" variant="contained">
                    {t('orderConfirmation_backHome')}
                </Button>
            </Box>
        </Container>
    );
}

export default OrderConfirmationPage;