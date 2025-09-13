import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Paper, Typography, TextField, Button, Box, CircularProgress, Alert, Divider } from '@mui/material';
import { toast } from 'react-hot-toast';

function CheckoutPage() {
    const { t } = useTranslation(); // Get the 't' function
    const { cartItems, clearCart } = useCart();
    const navigate = useNavigate();
    const [customerDetails, setCustomerDetails] = useState({ name: '', email: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [searchParams] = useSearchParams();
    const tableNumber = searchParams.get("table");
    const handleInputChange = (e) => {
        setCustomerDetails({ ...customerDetails, [e.target.name]: e.target.value });
    };

    const handleSubmitOrder = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        if (cartItems.length === 0) {
            setError(t('cartIsEmptyError'));
            setIsSubmitting(false);
            return;
        }

        try {
            // Step 1: Find or create the customer
            const customerResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/customers/find-or-create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: customerDetails.email, name: customerDetails.name })
            });
            if (!customerResponse.ok) throw new Error('Failed to create customer');
            const customerData = await customerResponse.json();

            // Step 2: Prepare the order payload
            const orderPayload = {
                customerId: customerData.id,
                tableNumber: tableNumber,
                items: cartItems.map(item => ({
                    menuItemId: item.id,
                    quantity: item.quantity,
                    // Send the selected options to the backend
                    selectedOptions: item.selectedOptions
                    ? item.selectedOptions.flatMap(option => option.choices)
                    : []
                }))
            };

            // Step 3: Submit the order
            const orderResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderPayload)
            });
            if (!orderResponse.ok) throw new Error('Failed to place order');
            const newOrder = await orderResponse.json();

            // Step 4: Success! Clear the cart and navigate to a confirmation page
            clearCart();
            navigate(`/order-confirmation/${newOrder.id}`);

        } catch (err) {
            const unexpectedErrorMessage = t('unexpectedError');
            const finalErrorMessage = err.message || unexpectedErrorMessage;
            setError(finalErrorMessage);
            toast.error(finalErrorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h4" align="center" gutterBottom>{t('checkoutTitle')}</Typography>
                <Box component="form" onSubmit={handleSubmitOrder}>
                    <Typography variant="h6" gutterBottom>{t('yourDetails')}</Typography>
                    <TextField 
                        label={t('fullNameLabel')}
                        name="name" 
                        value={customerDetails.name} 
                        onChange={handleInputChange} 
                        required 
                        fullWidth 
                        margin="normal"
                    />
                    <TextField 
                        label={t('emailLabel')} 
                        name="email" 
                        type="email"
                        value={customerDetails.email} 
                        onChange={handleInputChange} 
                        required 
                        fullWidth 
                        margin="normal"
                    />
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6">{t('orderSummary')}</Typography>
                    {cartItems.map(item => (
                        <Box key={item.id + JSON.stringify(item.selectedOptions)} sx={{ mb: 2 }}>
                            <Typography>
                                {item.quantity} x {item.name}
                            </Typography>
                            {item.selectedOptions && (
                                <Box component="ul" sx={{ pl: 2, my: 0, fontSize: '0.9rem', color: 'text.secondary' }}>
                                    {item.selectedOptions.map(opt => (
                                        <li key={opt.optionName}>
                                            <strong>{opt.optionName}:</strong> {opt.choices.join(', ')}
                                        </li>
                                    ))}
                                </Box>
                            )}
                            <Typography>
                                ${(item.price * item.quantity).toFixed(2)}
                            </Typography>
                        </Box>
                    ))}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <Typography variant="h6">Total:</Typography>
                        <Typography variant="h6" fontWeight="bold">${totalPrice.toFixed(2)}</Typography>
                    </Box>
                    {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                    <Box sx={{ mt: 3, position: 'relative' }}>
                        <Button 
                            type="submit" 
                            variant="contained" 
                            fullWidth 
                            disabled={isSubmitting || cartItems.length === 0}
                        >
                            {t('placeOrder')}
                        </Button>
                        {isSubmitting && (
                            <CircularProgress
                                size={24}
                                sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    marginTop: '-12px',
                                    marginLeft: '-12px',
                                }}
                            />
                        )}
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
}

export default CheckoutPage;