import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container, Typography, Button, Box, CircularProgress, Paper, Divider, List, ListItem, ListItemText } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { motion } from 'framer-motion'; // ✅ ADDED FOR ANIMATION
import usePageTitle from '../hooks/usePageTitle';

function OrderConfirmationPage() {
    const { orderId } = useParams(); 
    const { t } = useTranslation();
    usePageTitle(t('orderConfirmationTitle'));
    
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
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
        <Container maxWidth="sm" sx={{ textAlign: 'center', py: { xs: 4, md: 8 } }}>
            <Paper elevation={4} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, overflow: 'hidden' }}>
                
                {/* ✅ SUCCESS ANIMATION */}
                <motion.div 
                    initial={{ scale: 0, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }} 
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                    <CheckCircleIcon color="success" sx={{ fontSize: 90, mb: 2 }} />
                </motion.div>
                
                <Typography variant="h4" component="h1" gutterBottom fontWeight="900" sx={{ letterSpacing: '-0.5px' }}>
                    {t('orderConfirmation_thankYou')}
                </Typography>
                
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                    {t('orderConfirmation_success')}
                </Typography>

                {/* ✅ DIGITAL RECEIPT LAYOUT */}
                {orders.map(order => (
                    <Box key={order.id} sx={{ 
                        bgcolor: '#fafafa', 
                        p: 3, 
                        borderRadius: 3, 
                        mb: 3, 
                        textAlign: 'left',
                        border: '1px solid #eaeaea',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                    }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" fontWeight="bold" sx={{ color: '#333' }}>
                                {t('orderNumberLabel')} {order.orderNumber}
                            </Typography>
                            <Typography variant="caption" sx={{ bgcolor: 'success.light', color: 'success.dark', px: 1.5, py: 0.5, borderRadius: 1, fontWeight: 'bold' }}>
                                {t('confirmed')}
                            </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, color: 'primary.main', bgcolor: 'primary.50', p: 1.5, borderRadius: 2 }}>
                            <AccessTimeIcon fontSize="small" />
                            <Typography variant="body1" fontWeight="bold">
                                {/* ✅ FULLY TRANSLATED TIME */}
                                {order.pickupTime ? new Date(order.pickupTime).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' }) : t('pickupAsap')}
                            </Typography>
                        </Box>
                        
                        <Divider sx={{ my: 2, borderStyle: 'dashed' }} />
                        
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, textTransform: 'uppercase', letterSpacing: '1px' }}>
                            {t('orderDetails')}
                        </Typography>

                        {/* ✅ DISPLAYING THE ITEMS */}
                        <List disablePadding>
                            {order.items.map((item, idx) => {
                                let selectedOptions = [];
                                if (item.selectedOptions) try { selectedOptions = JSON.parse(item.selectedOptions); } catch (e) {}
                                
                                return (
                                    <ListItem key={idx} sx={{ px: 0, py: 1, alignItems: 'flex-start' }}>
                                        <ListItemText 
                                            primary={<Typography fontWeight="600">{item.quantity}x {item.name}</Typography>}
                                            secondary={
                                                selectedOptions.length > 0 && (
                                                    <Box component="span" sx={{ display: 'block', mt: 0.5 }}>
                                                        {selectedOptions.map((opt, i) => (
                                                            <Typography key={i} variant="caption" display="block" color="text.secondary">
                                                                - {opt.choices.join(', ')}
                                                            </Typography>
                                                        ))}
                                                    </Box>
                                                )
                                            }
                                        />
                                    </ListItem>
                                );
                            })}
                        </List>

                        <Divider sx={{ my: 2, borderStyle: 'dashed' }} />

                        {/* TOTAL */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                                {/* ✅ SMART PLURALIZATION TRANSLATION */}
                                {t('itemCount', { count: order.items.length })}
                            </Typography>
                            <Typography variant="h6" fontWeight="900" color="primary.main">
                                €{order.totalPrice?.toFixed(2)}
                            </Typography>
                        </Box>
                    </Box>
                ))}

                <Typography variant="body2" sx={{ mb: 4, color: '#666', fontStyle: 'italic' }}>
                    {t('orderConfirmation_preparation')}
                </Typography>

                <Button 
                    component={Link} 
                    to={backLink} 
                    variant="contained" 
                    size="large" 
                    fullWidth 
                    sx={{ py: 1.8, fontSize: '1.1rem', fontWeight: 'bold', borderRadius: 50 }}
                >
                    {t('orderConfirmation_backHome')}
                </Button>
            </Paper>
        </Container>
    );
}

export default OrderConfirmationPage;