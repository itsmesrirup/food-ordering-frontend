import React from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { Box, Typography, Button, List, ListItem, ListItemText, IconButton, Divider } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

function Cart() {
    const { cartItems, updateQuantity } = useCart();
    const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

    if (cartItems.length === 0) {
        return (
            <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: 2, backgroundColor: 'background.paper' }}>
                <Typography variant="h6" gutterBottom>Your Cart</Typography>
                <Typography variant="body2">Your cart is currently empty.</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: 2, backgroundColor: 'background.paper' }}>
            <Typography variant="h6" gutterBottom>Your Order</Typography>
            <List>
                {cartItems.map(item => (
                    <ListItem key={item.id} disableGutters>
                        <ListItemText 
                          primary={item.name} 
                          secondary={`$${(item.price * item.quantity).toFixed(2)}`} 
                        />
                        <IconButton onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                            <RemoveCircleOutlineIcon fontSize="small" />
                        </IconButton>
                        <Typography sx={{ mx: 1 }}>{item.quantity}</Typography>
                        <IconButton onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                            <AddCircleOutlineIcon fontSize="small" />
                        </IconButton>
                    </ListItem>
                ))}
            </List>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6" fontWeight="bold">${totalPrice.toFixed(2)}</Typography>
            </Box>
            <Button component={Link} to="/checkout" variant="contained" fullWidth>
                Proceed to Checkout
            </Button>
        </Box>
    );
}

export default Cart;