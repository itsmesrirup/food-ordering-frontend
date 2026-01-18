import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Recommendations from './Recommendations';
import { Box, Typography, Button, List, ListItem, ListItemText, IconButton, Divider, Modal, Paper } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CustomizeItemModal from './CustomizeItemModal'; 
import { formatPrice } from '../utils/formatPrice';
import { toast } from 'react-hot-toast';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';

// This is the detailed content of the cart, used in both sidebar and modal.
const CartContent = ({onEditCartItem, onCheckout}) => {
    const { t } = useTranslation();
    const { cartItems, updateQuantity, lastAddedItemId, currentRestaurant, updateCartItem } = useCart();
    const location = useLocation();
    const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

    // State for editing
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingItemIndex, setEditingItemIndex] = useState(null);

    // Handler to open edit modal
    const handleEditClick = (index) => {
        if (typeof onEditCartItem === "function") {
            onEditCartItem(index); // <-- Call parent handler to open modal in MenuPage
        } else {
            setEditingItemIndex(index);
            setEditModalOpen(true);
        }
    };

    // Handler for saving edited options
    const handleEditSave = (updatedItem) => {
        updateCartItem(editingItemIndex, updatedItem);
        setEditModalOpen(false);
        setEditingItemIndex(null);
    };

    return (
        <>
        <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>{t('yourOrder')}</Typography>
            {cartItems.length === 0 ? (
                <Typography variant="body2">{t('yourCartIsCurrentlyEmpty')}</Typography>
            ) : (
                <>
                    <List>
                        {cartItems.map((item, idx) => (
                            <ListItem key={item.cartItemId} disableGutters sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                                <Box sx={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                                    <ListItemText 
                                      // --- CHANGED: Combined quantity and name for clarity ---
                                      primary={`${item.quantity} x ${item.name}`} 
                                      // --- CHANGED: Use formatPrice for currency ---
                                      secondary={formatPrice(item.price, currentRestaurant?.currency)} 
                                    />
                                    <IconButton size="small" onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}><RemoveCircleOutlineIcon fontSize="small" /></IconButton>
                                    <Typography sx={{ mx: 1 }}>{item.quantity}</Typography>
                                    <IconButton size="small" onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}><AddCircleOutlineIcon fontSize="small" /></IconButton>
                                    {item.selectedOptions && (
                                        <IconButton size="small" onClick={() => handleEditClick(idx)} title="Edit Choices">
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    )}
                                </Box>
                                {item.selectedOptions && (
                                    <Box component="ul" sx={{ pl: 2, my: 0, fontSize: '0.8rem', color: 'text.secondary' }}>
                                        {item.selectedOptions.map(opt => 
                                            <li key={opt.optionName}>
                                                <strong>{opt.optionName}:</strong> {opt.choices.join(', ')}
                                            </li>
                                        )}
                                    </Box>
                                )}
                            </ListItem>
                        ))}
                    </List>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">{t('total')}</Typography>
                        {/* --- CHANGED: Use formatPrice for total --- */}
                        <Typography variant="h6" fontWeight="bold">
                            {formatPrice(totalPrice, currentRestaurant?.currency)}
                        </Typography>
                    </Box>
                    <Button 
                        onClick={onCheckout} 
                        variant="contained" 
                        fullWidth
                        disabled={!currentRestaurant}
                    >
                        {t('proceedToCheckout')}
                    </Button>
                    {currentRestaurant?.recommendationsEnabled && (
                        <Recommendations lastAddedItemId={lastAddedItemId} />
                    )}
                </>
            )}
        </Paper>
        {editModalOpen && editingItemIndex !== null && (
            <CustomizeItemModal
                open={editModalOpen}
                handleClose={() => setEditModalOpen(false)}
                menuItem={cartItems[editingItemIndex]}
                initialSelections={cartItems[editingItemIndex].selectedOptions}
                onSave={handleEditSave}
                isEditing
            />
        )}
        </>
    );
}

// This is the new main Cart component that handles the responsive logic.
function Cart({ onEditCartItem, pageRestaurant }) {
    const { t } = useTranslation();
    const { cartItems, currentRestaurant, cartRestaurantId, clearCart } = useCart();
    const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
    const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

    // --- ADDED: Hooks for navigation ---
    const navigate = useNavigate();
    const location = useLocation();

    const [isModalOpen, setIsModalOpen] = useState(false);
    // --- NEW STATE ---
    const [conflictDialogOpen, setConflictDialogOpen] = useState(false);

    const handleOpen = () => setIsModalOpen(true);
    const handleClose = () => setIsModalOpen(false);

    // --- ADDED: The Validation Handler ---
    const handleCheckoutClick = () => {
        // 1. Use the explicit Page Restaurant, fallback to Context if missing
        const activeRestaurant = pageRestaurant || currentRestaurant;

        if (!activeRestaurant) {
            console.warn("Restaurant data loading...");
            return;
        }

        // 2. The Robust Check
        // Compare the PAGE'S ID (activeRestaurant) against the CART'S ID (cartRestaurantId)
        if (cartRestaurantId && String(activeRestaurant.id) !== String(cartRestaurantId)) {
            // Open the Dialog instead of Toast
            setConflictDialogOpen(true); 
            return; // BLOCK
        }

        navigate(`/checkout${location.search}`);
        handleClose();
    };

    // --- NEW: Handle User Choice ---
    const handleClearAndStay = () => {
        clearCart();
        setConflictDialogOpen(false);
        toast.success("Cart cleared. You can now order from this restaurant.");
        // We stay on the current page so they can add items
    };

    return (
        <>
            {/* --- Desktop Sidebar View --- */}
            {/* This is visible only on medium screens and up */}
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <CartContent onEditCartItem={onEditCartItem} onCheckout={handleCheckoutClick} />
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
                        {t('viewCartItems', { 
                            count: totalItems, 
                            price: formatPrice(totalPrice, currentRestaurant?.currency) 
                        })}
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
                    <CartContent onEditCartItem={onEditCartItem} 
                        onCheckout={handleCheckoutClick} />
                </Box>
            </Modal>

            <Dialog
                open={conflictDialogOpen}
                onClose={() => setConflictDialogOpen(false)}
            >
                <DialogTitle>{t('startNewOrder')}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {t('cartConflictMessage')} 
                        {/* Or specific message: "Your cart has items from another restaurant. Clear it to order here?" */}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConflictDialogOpen(false)} color="inherit">
                        {t('cancel')}
                    </Button>
                    <Button onClick={handleClearAndStay} variant="contained" color="error" autoFocus>
                        {t('clearCart', 'Clear Cart')}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default Cart;