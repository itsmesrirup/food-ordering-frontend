import React from 'react';
import { useParams, Link, Link as RouterLink } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next'; // 1. Import 'Trans'
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { Container, Typography, Button, Box, Alert, ButtonGroup } from '@mui/material';

function OrderConfirmationPage() {
    const { orderId } = useParams();
    const { t } = useTranslation(); // 2. Get the 't' function
    const { customer } = useCustomerAuth(); // Get customer auth state

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

                {/* Show different messaging for guests vs registered users */}
                {customer ? (
                    <Alert severity="success" sx={{ mb: 3, textAlign: 'left' }}>
                        <Typography variant="body2" gutterBottom>
                            <strong>Account Benefits:</strong> This order is saved to your account. 
                            You can view your order history anytime!
                        </Typography>
                        <Button component={RouterLink} to="/account" variant="outlined" size="small" sx={{ mr: 1 }}>
                            View Account
                        </Button>
                        <Button component={Link} to="/" variant="contained" size="small">
                            {t('orderConfirmation_backHome')}
                        </Button>
                    </Alert>
                ) : (
                    <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
                        <Typography variant="body2" gutterBottom>
                            <strong>Guest Order:</strong> Your order was placed as a guest. 
                            Visit a restaurant page to create an account and track future orders!
                        </Typography>
                        <ButtonGroup size="small" sx={{ mt: 1 }}>
                            <Button component={RouterLink} to="/login" variant="outlined">
                                Login
                            </Button>
                            <Button component={Link} to="/" variant="contained">
                                {t('orderConfirmation_backHome')}
                            </Button>
                        </ButtonGroup>
                    </Alert>
                )}

                {!customer && (
                    <Button component={Link} to="/" variant="contained">
                        {t('orderConfirmation_backHome')}
                    </Button>
                )}
            </Box>
        </Container>
    );
}

export default OrderConfirmationPage;