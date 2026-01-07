import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { Container, Typography, Button, Box, CircularProgress, Paper } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

function OrderConfirmationPage() {
    const { orderId } = useParams();
    const { t } = useTranslation();
    
    // State to hold the order data so we know which restaurant to go back to
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders/${orderId}`);
                if (response.ok) {
                    const data = await response.json();
                    // Debug: Check what the backend actually returned
                    console.log("Order Fetched:", data);
                    setOrder(data);
                }
            } catch (error) {
                console.error("Error fetching order", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [orderId]);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

    // --- ROBUST LINK LOGIC ---
    // 1. Try order.restaurantId (Flat DTO)
    // 2. Try order.restaurant.id (Nested Entity)
    // 3. Default to "/" if neither exists
    const backLink = order?.restaurantId 
        ? `/restaurants/${order.restaurantId}` 
        : (order?.restaurant?.id ? `/restaurants/${order.restaurant.id}` : "/");

    return (
        <Container maxWidth="sm" sx={{ textAlign: 'center', py: 8 }}>
            <Paper elevation={3} sx={{ p: 5, borderRadius: 4 }}>
                <CheckCircleIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
                
                <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                    {t('orderConfirmation_thankYou')}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                    {t('orderConfirmation_success')}
                </Typography>
                
                <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 2, mb: 4, display: 'inline-block' }}>
                    <Typography variant="h6">
                        <Trans i18nKey="orderConfirmation_orderNumber" values={{ orderId: order.orderNumber }}>
                            Order #: <strong>{{orderId: order.orderNumber}}</strong>
                        </Trans>
                    </Typography>
                </Box>

                <Typography sx={{ mb: 4 }}>
                    {t('orderConfirmation_preparation')}
                </Typography>

                {/* --- FIXED: Link back to the specific restaurant --- */}
                <Button 
                    component={Link} 
                    // If we found the order, go to that restaurant. Else go home.
                    to={backLink} 
                    variant="contained" 
                    size="large"
                    fullWidth
                >
                    {t('backToMenu')}
                </Button>
            </Paper>
        </Container>
    );
}

export default OrderConfirmationPage;