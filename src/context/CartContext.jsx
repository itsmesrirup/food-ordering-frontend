import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    // State to hold the items in the cart
    const [cartItems, setCartItems] = useState([]);
    
    // ✅ NEW STATE: Track which restaurant the cart belongs to.
    // Can be null if the cart is empty.
    const [cartRestaurantId, setCartRestaurantId] = useState(null);
    const [lastAddedItemId, setLastAddedItemId] = useState(null);
    const [currentRestaurant, setCurrentRestaurant] = useState(null);

    // call this function from MenuPage when it loads
    const setCartContext = (restaurant) => {
        setCurrentRestaurant(restaurant);
    };

    // Add or update an item by index (for editing options)
    const updateCartItem = (index, updatedItem) => {
        setCartItems(prevItems => {
            const newItems = [...prevItems];
            newItems[index] = { ...updatedItem, quantity: prevItems[index].quantity };
            return newItems;
        });
    };

    const addToCart = (item) => {
        // The item being added MUST have a restaurantId.
        if (!item.restaurantId) {
            console.error("Item is missing restaurantId:", item);
            return;
        }

        // ✅ THE CORE LOGIC
        // Check if the new item is from a different restaurant
        if (cartRestaurantId && cartRestaurantId !== item.restaurantId) {
            // Ask for confirmation before clearing the cart
            const confirmSwitch = window.confirm(
                "You have items from another restaurant in your cart. Would you like to clear the cart and add this item?"
            );

            if (confirmSwitch) {
                // Clear the cart and add the new item as the first item
                setCartItems([{ ...item, quantity: 1 }]);
                setCartRestaurantId(item.restaurantId);
                setLastAddedItemId(item.id);
            }
            // If they cancel, do nothing.
            return;
        }

        // If the cart is empty, set the restaurant ID
        if (!cartRestaurantId) {
            setCartRestaurantId(item.restaurantId);
        }

        // Standard logic: add new item or update quantity for the same restaurant
        setCartItems(prevItems => {
            const existingItem = prevItems.find(i => i.id === item.id && JSON.stringify(i.selectedOptions) === JSON.stringify(item.selectedOptions)); // Also check options
            if (existingItem) {
                return prevItems.map(i => 
                    i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            return [...prevItems, { ...item, quantity: 1 }];
        });
        setLastAddedItemId(item.id);
    };

    const removeFromCart = (itemId) => {
        setCartItems(prevItems => {
            const newItems = prevItems.filter(item => item.id !== itemId);
            // If the cart becomes empty, reset the restaurant ID
            if (newItems.length === 0) {
                setCartRestaurantId(null);
                setLastAddedItemId(null);
            }
            return newItems;
        });
    };

    const updateQuantity = (itemId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(itemId);
        } else {
            setCartItems(prevItems => 
                prevItems.map(item => 
                    item.id === itemId ? { ...item, quantity } : item
                )
            );
        }
    };
    
    const clearCart = () => {
        setCartItems([]);
        // Also reset the restaurant ID
        setCartRestaurantId(null);
        setLastAddedItemId(null);
    };

    // Expose the cartRestaurantId in the context value
    const value = { cartItems, cartRestaurantId, lastAddedItemId, addToCart, removeFromCart, updateQuantity, clearCart, currentRestaurant, setCartContext, updateCartItem };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
    return useContext(CartContext);
};