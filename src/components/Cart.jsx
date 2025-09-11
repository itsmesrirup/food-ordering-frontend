import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { Link, useLocation } from 'react-router-dom';
import Recommendations from './Recommendations';
import { Box, Typography, Button, List, ListItem, ListItemText, IconButton, Divider, Modal, Paper } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

// This is the detailed content of the cart, used in both sidebar and modal.
// It is built from your original component's JSX.
const CartContent = () => {
    const { t } = useTranslation();
    const { cartItems, updateQuantity, lastAddedItemId, currentRestaurant } = useCart();
    const location = useLocation();
    const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

    return (
        <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>{t('yourOrder')}</Typography>
            {cartItems.length === 0 ? (
                <Typography variant="body2">{t('yourCartIsCurrentlyEmpty')}</Typography>
            ) : (
                <>
                    <List>
                        {cartItems.map(item => (
                            <ListItem key={item.id} disableGutters>
                                <ListItemText 
                                  primary={item.name} 
                                  secondary={`$${(item.price * item.quantity).toFixed(2)}`} 
                                />
                                <IconButton size="small" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                                    <RemoveCircleOutlineIcon fontSize="small" />
                                </IconButton>
                                <Typography sx={{ mx: 1 }}>{item.quantity}</Typography>
                                <IconButton size="small" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
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
                    <Button 
                        component={Link} 
                        to={`/checkout${location.search}`}
                        variant="contained" 
                        fullWidth
                    >
                        {t('proceedToCheckout')}
                    </Button>
                    
                    {currentRestaurant?.recommendationsEnabled && (
                        <Recommendations lastAddedItemId={lastAddedItemId} />
                    )}
                </>
            )}
        </Paper>
    );
};


// This is the new main Cart component that handles the responsive logic.
function Cart() {
    const { cartItems } = useCart();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
    const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

    const handleOpen = () => setIsModalOpen(true);
    const handleClose = () => setIsModalOpen(false);
    
    return (
        <>
            {/* --- Desktop Sidebar View --- */}
            {/* This is visible only on medium screens and up */}
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <CartContent />
            </Box>

            {/* --- Mobile Floating Button View --- */}
            {/* This button only appears on small screens and if there are items in the cart */}
            {cartItems.length > 0 && (
                <Box sx={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    p: 2,
                    zIndex: 1100, // Make sure it's on top of other content
                    display: { xs: 'block', md: 'none' }
                }}>
                    <Button 
                        variant="contained" 
                        color="secondary" 
                        fullWidth 
                        size="large"
                        startIcon={<ShoppingCartIcon />}
                        onClick={handleOpen}
                    >
                        {totalItems} item(s) - View Cart (${totalPrice.toFixed(2)})
                    </Button>
                </Box>
            )}

            {/* --- Mobile Cart Modal --- */}
            <Modal
                open={isModalOpen}
                onClose={handleClose}
                aria-labelledby="cart-modal-title"
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
                <Box sx={{ width: '90%', maxWidth: 400 }}>
                    <CartContent />
                </Box>
            </Modal>
        </>
    );
}

export default Cart;