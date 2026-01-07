import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Paper, Typography, TextField, Button, Box, CircularProgress, Alert, Divider, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { toast } from 'react-hot-toast';
import { formatPrice } from '../utils/formatPrice';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { isRestaurantOpen, isRestaurantOpenOnDay, getFirstOpenSlot } from '../utils/timeValidation';

// --- STRIPE IMPORTS ---
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

// --- COMPONENT 1: Pure UI for Inputs & Summary (No Stripe Hooks here) ---
const CheckoutUI = ({ 
    t, customerDetails, handleInputChange, orderType, setOrderType, 
    selectedDate, handleDateChange, filterPassedTime, currentRestaurant, 
    cartItems, totalPrice 
}) => {
    return (
        <Box>
            <Typography variant="h6" gutterBottom>{t('yourDetails')}</Typography>
            <TextField 
                label={t('fullNameLabel')}
                name="name" 
                value={customerDetails.name} 
                onChange={handleInputChange} 
                required fullWidth margin="normal"
            />
            <TextField 
                label={t('emailLabel')} 
                name="email" 
                type="email"
                value={customerDetails.email} 
                onChange={handleInputChange} 
                required fullWidth margin="normal"
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
                <Box sx={{ mb: 2, '& .react-datepicker-wrapper': { width: '100%' } }}>
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
        </Box>
    );
};

// --- COMPONENT 2: Stripe Specific Section (Must be inside <Elements>) ---
const StripePaymentSection = ({ t, isSubmitting, onConfirmPayment, totalPrice, currency }) => {
    const stripe = useStripe();
    const elements = useElements();

    const handlePayClick = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        // This triggers the actual payment
        await onConfirmPayment(stripe, elements);
    };

    return (
        <Box component="form" onSubmit={handlePayClick} sx={{ mt: 3 }}>
            <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2, mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>{t('paymentMethodTitle')}</Typography>
                <PaymentElement />
            </Box>
            <Button type="submit" variant="contained" fullWidth disabled={isSubmitting || !stripe}>
                {isSubmitting ? <CircularProgress size={24} /> : t('payButton', { amount: formatPrice(totalPrice, currency) })}
            </Button>
        </Box>
    );
};


// --- MAIN COMPONENT: CheckoutPage ---
function CheckoutPage() {
    const { t } = useTranslation(); 
    const { cartItems, clearCart, currentRestaurant } = useCart();
    const navigate = useNavigate();
    const [customerDetails, setCustomerDetails] = useState({ name: '', email: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [searchParams] = useSearchParams();
    const tableNumber = searchParams.get("table");
    
    // State
    const [orderType, setOrderType] = useState('asap');
    const [selectedDate, setSelectedDate] = useState(null);
    const [clientSecret, setClientSecret] = useState(null);

    // --- NEW STATE: Payment Method Preference ---
    // Default to 'online' if available, otherwise 'counter'
    const [paymentMethod, setPaymentMethod] = useState('online'); 

    const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

    // 1. Fetch Payment Intent Logic
    useEffect(() => {
        // Only fetch intent if restaurant supports payments AND user has selected 'online'
        // But to be responsive, we can fetch it eagerly if supported
        const paymentsSupported = currentRestaurant?.stripeDetailsSubmitted && currentRestaurant?.paymentsEnabled;

        if (cartItems.length > 0 && currentRestaurant?.stripeDetailsSubmitted && currentRestaurant?.paymentsEnabled) {
            const amountInCents = Math.round(totalPrice * 100);
            fetch(`${import.meta.env.VITE_API_BASE_URL}/api/payments/create-intent`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    amount: amountInCents, 
                    currency: currentRestaurant.currency || "eur",
                    restaurantId: currentRestaurant.id 
                }),
            })
            .then((res) => res.json())
            .then((data) => setClientSecret(data.clientSecret))
            .catch((err) => console.error("Error creating payment intent:", err));
        }else {
            // If payments not supported, force method to counter
            setPaymentMethod('counter');
        }
    }, [cartItems, currentRestaurant, totalPrice]);

    const handleInputChange = (e) => setCustomerDetails({ ...customerDetails, [e.target.name]: e.target.value });

    // Validation Helpers
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

    // 2. Validate Form Data
    const validateForm = () => {
        if (cartItems.length === 0) {
            setError(t('cartIsEmptyError'));
            return false;
        }
        if (!customerDetails.name || !customerDetails.email) {
            setError("Name and Email are required.");
            return false;
        }
        if (orderType === 'scheduled') {
            if (!selectedDate) {
                setError(t('pickupTimeRequired'));
                return false;
            }
            if (!filterPassedTime(selectedDate)) {
                setError(t('restaurantClosedAtTime'));
                return false;
            }
        }
        return true;
    };

    // 3. Finalize Order (Call Backend)
    const finalizeOrder = async (paymentIntentId) => {
        try {
            // Create Customer
            const customerResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/customers/find-or-create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(customerDetails)
            });
            if (!customerResponse.ok) throw new Error('Failed to create customer');
            const customerData = await customerResponse.json();

            // Calculate Pickup Time
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

            // Create Order
            const orderPayload = {
                customerId: customerData.id,
                tableNumber: tableNumber,
                pickupTime: finalPickupTime,
                paymentIntentId: paymentIntentId, 
                items: cartItems.map(item => ({
                    menuItemId: item.id,
                    quantity: item.quantity,
                    selectedOptions: item.selectedOptions || []
                }))
            };

            const orderResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderPayload)
            });
            
            if (!orderResponse.ok) {
                const errData = await orderResponse.json().catch(() => ({}));
                throw new Error(errData.message || 'Failed to place order');
            }
            
            const newOrder = await orderResponse.json();
            clearCart();
            navigate(`/order-confirmation/${newOrder.id}`);

        } catch (err) {
            setError(err.message || t('unexpectedError'));
            toast.error(err.message);
            setIsSubmitting(false);
        }
    };

    // 4. Handler: Pay with Stripe
    const handleStripeConfirm = async (stripe, elements) => {
        if (!validateForm()) return;
        setIsSubmitting(true);
        setError(null);

        const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
            elements,
            redirect: 'if_required',
        });

        if (stripeError) {
            toast.error(stripeError.message);
            setIsSubmitting(false);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            console.log("PAYMENT SUCCESS! ID:", paymentIntent.id);
            await finalizeOrder(paymentIntent.id);
        }
    };

    // 5. Handler: Pay at Counter
    const handlePayAtCounter = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsSubmitting(true);
        setError(null);
        await finalizeOrder(null); // No payment ID
    };

    const paymentsSupported = currentRestaurant?.stripeDetailsSubmitted && currentRestaurant?.paymentsEnabled;

    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h4" align="center" gutterBottom>{t('checkoutTitle')}</Typography>
                
                {/* 1. Render Common Inputs */}
                <CheckoutUI 
                    t={t}
                    customerDetails={customerDetails}
                    handleInputChange={handleInputChange}
                    orderType={orderType}
                    setOrderType={setOrderType}
                    selectedDate={selectedDate}
                    handleDateChange={handleDateChange}
                    filterPassedTime={filterPassedTime}
                    currentRestaurant={currentRestaurant}
                    cartItems={cartItems}
                    totalPrice={totalPrice}
                />

                <Divider sx={{ my: 3 }} />

                {totalPrice > 25 && paymentsSupported && (
                    <Alert severity="info" sx={{ mb: 3 }}>
                         {t('ticketRestaurantLimitWarning')}
                    </Alert>
                )}

                {/* --- NEW: Payment Method Selection --- */}
                {paymentsSupported && (
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom>{t('paymentMethodTitle')}</Typography>
                        <ToggleButtonGroup
                            value={paymentMethod}
                            exclusive
                            onChange={(e, val) => val && setPaymentMethod(val)}
                            fullWidth
                            color="primary"
                        >
                            <ToggleButton value="online">{t('payOnline')}</ToggleButton>
                            <ToggleButton value="counter">{t('payAtCounter')}</ToggleButton>
                        </ToggleButtonGroup>
                    </Box>
                )}

                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

                {/* 2. Render Payment Button (Stripe OR Counter) based on Toggle */}
                {paymentsSupported && paymentMethod === 'online' && clientSecret && stripePromise ? (
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                        <StripePaymentSection 
                            t={t}
                            isSubmitting={isSubmitting}
                            onConfirmPayment={handleStripeConfirm}
                            totalPrice={totalPrice}
                            currency={currentRestaurant?.currency}
                        />
                    </Elements>
                ) : (
                    // Render "Place Order" button if:
                    // 1. User selected "Pay at Counter"
                    // 2. OR Payments are not supported at all
                    <Box component="form" onSubmit={handlePayAtCounter} sx={{ mt: 3, position: 'relative' }}>
                        <Button type="submit" variant="contained" fullWidth disabled={isSubmitting || cartItems.length === 0}>
                            {paymentsSupported ? t('placeOrderCounter') : t('placeOrder')}
                        </Button>
                        {isSubmitting && <CircularProgress size={24} sx={{ position: 'absolute', top: '50%', left: '50%', marginTop: '-12px', marginLeft: '-12px' }} />}
                    </Box>
                )}
            </Paper>
        </Container>
    );
}

export default CheckoutPage;