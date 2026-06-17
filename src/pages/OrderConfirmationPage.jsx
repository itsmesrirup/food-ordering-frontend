import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container, Typography, Button, Box, CircularProgress, Paper, Divider } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import usePageTitle from '../hooks/usePageTitle';

function OrderConfirmationPage() {
    const { orderId } = useParams(); // This will be "123,124"
    const { t } = useTranslation();
    usePageTitle(t('orderConfirmationTitle'));
    
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                // Split the IDs and fetch each one
                const ids = orderId.split(',');
                const promises = ids.map(id => 
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders/${id}`).then(res => res.json())
                );
                
                const data = await Promise.all(promises);
                setOrders(data);
            } catch (error) {
                console.error("Error fetching orders", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [orderId]);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
    if (orders.length === 0) return <Typography align="center" mt={5}>Orders not found.</Typography>;

    const backLink = orders[0]?.restaurantSlug ? `/order/${orders[0].restaurantSlug}` : '/';

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

                {/* LIST THE ORDERS AND THEIR PICKUP TIMES */}
                {orders.map(order => (
                    <Box key={order.id} sx={{ bgcolor: '#f5f5f5', p: 3, borderRadius: 2, mb: 2, textAlign: 'left' }}>
                        <Typography variant="h6" fontWeight="bold">
                            Order #: {order.orderNumber}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, color: 'primary.main' }}>
                            <AccessTimeIcon fontSize="small" />
                            <Typography variant="body1" fontWeight="bold">
                                {order.pickupTime ? new Date(order.pickupTime).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' }) : "ASAP"}
                            </Typography>
                        </Box>
                        
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="body2" color="text.secondary">
                            {order.items.length} items
                        </Typography>
                    </Box>
                ))}

                <Button component={Link} to={backLink} variant="contained" size="large" fullWidth sx={{ mt: 3 }}>
                    {t('orderConfirmation_backHome')}
                </Button>
            </Paper>
        </Container>
    );
}

export default OrderConfirmationPage;