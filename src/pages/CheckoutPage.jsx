import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Paper, Typography, TextField, Button, Box, CircularProgress, Alert, Divider } from '@mui/material';

function CheckoutPage() {
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
            setError("Your cart is empty.");
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
                    quantity: item.quantity
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
            setError(err.message || "An unexpected error occurred. Please try again.");
            toast.error(err.message || "An unexpected error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h4" align="center" gutterBottom>Checkout</Typography>
                <Box component="form" onSubmit={handleSubmitOrder}>
                    <Typography variant="h6" gutterBottom>Your Details</Typography>
                    <TextField 
                        label="Your Name" 
                        name="name" 
                        value={customerDetails.name} 
                        onChange={handleInputChange} 
                        required 
                        fullWidth 
                        margin="normal"
                    />
                    <TextField 
                        label="Your Email" 
                        name="email" 
                        type="email"
                        value={customerDetails.email} 
                        onChange={handleInputChange} 
                        required 
                        fullWidth 
                        margin="normal"
                    />
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="h6">Order Summary</Typography>
                    {cartItems.map(item => (
                         <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography>{item.quantity} x {item.name}</Typography>
                            <Typography>${(item.price * item.quantity).toFixed(2)}</Typography>
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
                            Place Order
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