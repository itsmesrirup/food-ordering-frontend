import React, { createContext, useState, useContext, useCallback, useMemo, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { t } = useTranslation();
    // 1. Initialize from LocalStorage
    const [cartItems, setCartItems] = useState(() => {
        try {
            const saved = localStorage.getItem('cartItems');
            return saved ? JSON.parse(saved) : [];
        } catch (e) { return []; }
    });
    // Also persist restaurant ID so we don't lose context
    const [cartRestaurantId, setCartRestaurantId] = useState(() => {
        return localStorage.getItem('cartRestaurantId') || null;
    });
    const [lastAddedItemId, setLastAddedItemId] = useState(null);
    const [currentRestaurant, setCurrentRestaurant] = useState(null);

    // --- NEW STATE: For the Conflict Modal ---
    const [conflictDialogOpen, setConflictDialogOpen] = useState(false);
    const [pendingItem, setPendingItem] = useState(null);

    // --- Hydrate Restaurant Data on Refresh ---
    useEffect(() => {
        // If we have an ID stored, but no data in memory (e.g. after refresh), fetch it.
        if (cartRestaurantId && !currentRestaurant) {
            const fetchRestaurantData = async () => {
                try {
                    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/restaurants/${cartRestaurantId}`);
                    if (response.ok) {
                        const data = await response.json();
                        setCurrentRestaurant(data);
                    }
                } catch (error) {
                    console.error("Failed to re-hydrate restaurant data", error);
                }
            };
            fetchRestaurantData();
        }
    }, [cartRestaurantId, currentRestaurant]);

    // 2. Save to LocalStorage whenever cart changes
    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
        if (cartRestaurantId) {
            localStorage.setItem('cartRestaurantId', cartRestaurantId);
        } else {
            localStorage.removeItem('cartRestaurantId');
        }
    }, [cartItems, cartRestaurantId]);

    // Wrapped function in useCallback to prevent it from being recreated on every render
    const setCartContext = useCallback((restaurant) => {
        setCurrentRestaurant(restaurant);
    }, []); // Empty dependency array means this function is created only once.

    // Wrap function in useCallback
    const updateCartItem = useCallback((index, updatedItem) => {
        setCartItems(prevItems => {
            const newItems = [...prevItems];
            const originalItem = prevItems[index];
            newItems[index] = { 
                ...updatedItem, 
                quantity: originalItem.quantity,
                cartItemId: originalItem.cartItemId
            };
            return newItems;
        });
    }, []);

    // --- Wrap function in useCallback ---
    const addToCart = useCallback((item) => {
        if (!item.restaurantId) { console.error("Item is missing restaurantId:", item); return false; }

        // Check for conflict
        if (cartRestaurantId && cartRestaurantId != item.restaurantId) { 
            // Instead of window.confirm, we save the item and open the custom dialog
            setPendingItem(item);
            setConflictDialogOpen(true);
            return false;
        }

        // Normal Add Logic (extracted to reuse)
        executeAddItem(item);
        return true;
    }, [cartRestaurantId]); // Depend on cartRestaurantId

    // Helper to actually add the item (used by addToCart and the Modal)
    const executeAddItem = (item) => {
        if (!cartRestaurantId) setCartRestaurantId(item.restaurantId);

        setCartItems(prevItems => {
            const existingItem = prevItems.find(i => i.id === item.id && JSON.stringify(i.selectedOptions) === JSON.stringify(item.selectedOptions));
            if (existingItem) {
                return prevItems.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            const newItemWithId = { ...item, quantity: 1, cartItemId: `${item.id || 'bundle'}-${new Date().getTime()}` };
            return [...prevItems, newItemWithId];
        });
        setLastAddedItemId(item.id);
    };

    // --- NEW: Handle Confirming the Clear ---
    const handleClearAndAdd = () => {
        if (pendingItem) {
            setCartItems([]); // Clear old items
            setCartRestaurantId(pendingItem.restaurantId); // Set new ID
            // We need to wait a tick or just set state directly. 
            // Setting state is batched, so calling executeAddItem right away works 
            // because we are passing the item explicitly, but we need to ensure setCartItems([]) 
            // doesn't get overwritten.
            
            // Safer approach: Set directly here
            const newItemWithId = { ...pendingItem, quantity: 1, cartItemId: `${pendingItem.id || 'bundle'}-${new Date().getTime()}` };
            setCartItems([newItemWithId]);
            setLastAddedItemId(pendingItem.id);
        }
        setConflictDialogOpen(false);
        setPendingItem(null);
    };

    const handleCancelAdd = () => {
        setConflictDialogOpen(false);
        setPendingItem(null);
    };

    // --- Wrap function in useCallback ---
    const removeFromCart = useCallback((cartItemId) => {
        setCartItems(prevItems => {
            const newItems = prevItems.filter(item => item.cartItemId !== cartItemId);
            if (newItems.length === 0) {
                setCartRestaurantId(null);
                setLastAddedItemId(null);
            }
            return newItems;
        });
    }, []);

    // --- Wrap function in useCallback ---
    const updateQuantity = useCallback((cartItemId, quantity) => {
        if (quantity <= 0) {
            // We can call removeFromCart directly since it's also memoized
            removeFromCart(cartItemId);
        } else {
            setCartItems(prevItems => 
                prevItems.map(item => 
                    item.cartItemId === cartItemId ? { ...item, quantity } : item
                )
            );
        }
    }, [removeFromCart]); // Depends on the memoized removeFromCart

    // --- Wrap function in useCallback ---
    const clearCart = useCallback(() => {
        setCartItems([]);
        setCartRestaurantId(null);
        setLastAddedItemId(null);
        setCurrentRestaurant(null);
    }, []);
    
    // --- Memoize the entire context value object with useMemo ---
    // This ensures that consumers of the context only re-render
    // when the specific values they use have actually changed.
    const value = useMemo(() => ({
        cartItems, 
        cartRestaurantId, 
        lastAddedItemId, 
        addToCart, 
        removeFromCart, 
        updateQuantity, 
        clearCart, 
        currentRestaurant, 
        setCartContext, 
        updateCartItem
    }), [
        cartItems, cartRestaurantId, lastAddedItemId, currentRestaurant, 
        addToCart, removeFromCart, updateQuantity, clearCart, setCartContext, updateCartItem
    ]);

    return (
        <CartContext.Provider value={value}>
            {children}
            
            {/* --- ADDED: The Global Dialog --- */}
            <Dialog
                open={conflictDialogOpen}
                onClose={handleCancelAdd}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {t('startNewOrder', 'Start a new order?')}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {t('cartConflictMessage', 'You have items from another restaurant in your cart. Adding this item will clear your current cart. Do you want to proceed?')}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelAdd} color="inherit">
                        {t('cancel', 'Cancel')}
                    </Button>
                    <Button onClick={handleClearAndAdd} variant="contained" color="primary" autoFocus>
                        {t('newOrder', 'Start New Order')}
                    </Button>
                </DialogActions>
            </Dialog>
        </CartContext.Provider>
    );
};

export const useCart = () => {
    return useContext(CartContext);
};