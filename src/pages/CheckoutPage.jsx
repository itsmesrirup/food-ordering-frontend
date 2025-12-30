import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Paper, Typography, TextField, Button, Box, CircularProgress, Alert, Divider, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { toast } from 'react-hot-toast';
import { formatPrice } from '../utils/formatPrice';
import { isRestaurantOpen, isRestaurantOpenOnDay, getFirstOpenSlot } from '../utils/timeValidation';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


function CheckoutPage() {
    const { t } = useTranslation(); // Get the 't' function
    const { cartItems, clearCart, currentRestaurant } = useCart();
    const navigate = useNavigate();
    const [customerDetails, setCustomerDetails] = useState({ name: '', email: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [searchParams] = useSearchParams();
    const tableNumber = searchParams.get("table");
    const [orderType, setOrderType] = useState('asap'); // 'asap' or 'scheduled'
    const [selectedDate, setSelectedDate] = useState(null);

    // DatePicker uses a real Date object, not a string
    const [startDate, setStartDate] = useState(null); 
    const handleInputChange = (e) => {
        setCustomerDetails({ ...customerDetails, [e.target.name]: e.target.value });
    };

    const handleDateChange = (newDate) => {
        if (!newDate) {
            setSelectedDate(null);
            return;
        }

        // 1. Is the selected time valid for this new date?
        // (Note: react-datepicker sets time to 00:00 by default if you pick a date from calendar without time)
        const isValid = filterPassedTime(newDate);

        if (isValid) {
            // Perfect, keep it.
            setSelectedDate(newDate);
        } else {
            // 2. It's invalid (e.g. 00:00 AM or Mon 10:30 PM). 
            // Let's find the first valid opening time for this specific day.
            const nextAvailableTime = getFirstOpenSlot(newDate, currentRestaurant?.openingHoursJson);
            
            if (nextAvailableTime) {
                setSelectedDate(nextAvailableTime);
                // Optional: Show toast ("Time adjusted to opening hours")
            } else {
                // Should be impossible if filterDate works (Sunday case), 
                // but just in case, set it anyway and let validation catch it.
                setSelectedDate(newDate);
            }
        }
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
            // 1. Create Customer
            const customerResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/customers/find-or-create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: customerDetails.email, name: customerDetails.name })
            });
            if (!customerResponse.ok) throw new Error('Failed to create customer');
            const customerData = await customerResponse.json();

            // 2. Handle Pickup Time
            let finalPickupTime = null;
            if (orderType === 'scheduled') {
                // --- FIX: Check selectedDate, not pickupTime ---
                if (!selectedDate) {
                    setError(t('pickupTimeRequired'));
                    setIsSubmitting(false); // Stop the spinner!
                    return;
                }

                // --- CRITICAL FIX: Validate the final combination ---
                // The user might have switched dates to a closed day while keeping an old time.
                if (!filterPassedTime(selectedDate)) {
                    setError(t('restaurantClosedAtTime')); // "Restaurant is closed at this time"
                    setIsSubmitting(false);
                    return;
                }
                
                // --- FIX: Timezone handling ---
                // We use the Date object directly to calculate the offset
                const offsetMs = selectedDate.getTimezoneOffset() * 60 * 1000;
                finalPickupTime = new Date(selectedDate.getTime() - offsetMs).toISOString();
            }

            // 3. Prepare Payload
            const orderPayload = {
                customerId: customerData.id,
                tableNumber: tableNumber,
                pickupTime: finalPickupTime,
                items: cartItems.map(item => ({
                    menuItemId: item.id,
                    quantity: item.quantity,
                    selectedOptions: Array.isArray(item.selectedOptions) ? item.selectedOptions : []
                }))
            };

            const orderResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderPayload)
            });
            
            if (!orderResponse.ok) {
                // Try to get the error message from backend if possible
                const errData = await orderResponse.json().catch(() => ({}));
                throw new Error(errData.message || 'Failed to place order');
            }
            
            const newOrder = await orderResponse.json();

            clearCart();
            navigate(`/order-confirmation/${newOrder.id}`);

        } catch (err) {
            const unexpectedErrorMessage = t('unexpectedError');
            const finalErrorMessage = err.message || unexpectedErrorMessage;
            setError(finalErrorMessage);
            toast.error(finalErrorMessage);
        } finally {
            // Always stop spinner if we didn't navigate away
            setIsSubmitting(false);
        }
    };
    
    const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

    // Helper to get minimum time (e.g., current time + 20 mins)
    const getMinTime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() + 20); // Give restaurant 20 mins buffer
        // Format to YYYY-MM-DDTHH:MM for HTML datetime-local input
        return now.toISOString().slice(0, 16);
    };

    // --- NEW: The logic to grey out invalid times ---
    const filterPassedTime = (time) => {
        const currentDate = new Date();
        const selectedDate = new Date(time);

        // 1. Block past times (with 20 min buffer for prep)
        const minTime = new Date(currentDate.getTime() + 20 * 60000);
        if (selectedDate < minTime) {
            return false;
        }

        // 2. Block times when restaurant is closed
        if (currentRestaurant && currentRestaurant.openingHoursJson) {
            // We reuse the helper we wrote!
            // It returns true if open, false if closed.
            return isRestaurantOpen(selectedDate, currentRestaurant.openingHoursJson);
        }

        return true; // Default to open if no data
    };
    
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

                    <Divider sx={{ my: 3 }} />
                    <Typography variant="h6" gutterBottom>{t('pickupTimeTitle')}</Typography>
                    
                    <ToggleButtonGroup
                        value={orderType}
                        exclusive
                        onChange={(e, newAlignment) => { if(newAlignment) setOrderType(newAlignment); }}
                        fullWidth
                        sx={{ mb: 2 }}
                    >
                        <ToggleButton value="asap">{t('asap')}</ToggleButton>
                        <ToggleButton value="scheduled">{t('scheduleForLater')}</ToggleButton>
                    </ToggleButtonGroup>

                    {orderType === 'scheduled' && (
                        <Box sx={{ mb: 2, '& .react-datepicker-wrapper': {width: '100%' } }}>
                            {/* --- Date Picker Integration --- */}
                            <DatePicker
                                selected={selectedDate}
                                onChange={handleDateChange}
                                showTimeSelect
                                timeFormat="HH:mm"
                                timeIntervals={15}
                                dateFormat="MMMM d, yyyy h:mm aa"
                                placeholderText={t('selectPickupTime')}
                                
                                // 1. Filter Times: Greys out 10:15 PM if closed
                                filterTime={filterPassedTime} 
                                
                                // 2. Filter Days: Greys out Sunday if closed all day
                                filterDate={(date) => {
                                    if (!currentRestaurant?.openingHoursJson) return true;
                                    // Use the helper we discussed to check if the day has ANY slots
                                    return isRestaurantOpenOnDay(date, currentRestaurant.openingHoursJson);
                                }}

                                minDate={new Date()} // Can't pick yesterday
                                
                                // Visuals
                                customInput={
                                    <TextField 
                                        fullWidth 
                                        label={t('selectPickupTime')}
                                        InputLabelProps={{ shrink: true }}
                                        // This helps with the "text cut off" issue on mobile
                                        sx={{ '& input': { textOverflow: 'ellipsis' } }}
                                    />
                                }
                            />
                        </Box>
                    )}

                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6">{t('orderSummary')}</Typography>
                    {cartItems.map(item => (
                        <Box key={item.cartItemId} sx={{ mb: 2 }}>
                            <Typography>{item.quantity} x {item.name}</Typography>
                            {item.selectedOptions && (
                                <Box component="ul" sx={{ pl: 2, my: 0, fontSize: '0.9rem', color: 'text.secondary' }}>
                                    {item.selectedOptions.map(opt => (
                                        <li key={opt.optionName}><strong>{opt.optionName}:</strong> {opt.choices.join(', ')}</li>
                                    ))}
                                </Box>
                            )}
                            <Typography>{formatPrice(item.price * item.quantity, currentRestaurant?.currency)}</Typography>
                        </Box>
                    ))}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <Typography variant="h6">{t('total')}</Typography>
                        <Typography variant="h6" fontWeight="bold">{formatPrice(totalPrice, currentRestaurant?.currency)}</Typography>
                    </Box>
                    
                    {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                    
                    <Box sx={{ mt: 3, position: 'relative' }}>
                        <Button type="submit" variant="contained" fullWidth disabled={isSubmitting || cartItems.length === 0}>
                            {t('placeOrder')}
                        </Button>
                        {isSubmitting && <CircularProgress size={24} sx={{ position: 'absolute', top: '50%', left: '50%', marginTop: '-12px', marginLeft: '-12px' }} />}
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
}

export default CheckoutPage;