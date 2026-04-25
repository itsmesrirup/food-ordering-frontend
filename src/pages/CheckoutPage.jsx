import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';
import { Container, Paper, Typography, TextField, Button, Box, CircularProgress, Alert, Divider, ToggleButton, ToggleButtonGroup, IconButton } from '@mui/material';
import { toast } from 'react-hot-toast';
import { formatPrice } from '../utils/formatPrice';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { isRestaurantOpen, isRestaurantOpenOnDay, getFirstOpenSlot } from '../utils/timeValidation';
import usePageTitle from '../hooks/usePageTitle';

// ✅ NEW IMPORTS FOR CART EDITING AND NAVIGATION
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

// --- STRIPE IMPORTS ---
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

// --- COMPONENT 1: Pure UI for Inputs & Summary ---
const CheckoutUI = ({ 
    t, customerDetails, handleInputChange, orderType, setOrderType, 
    selectedDate, handleDateChange, filterPassedTime, currentRestaurant, 
    cartItems, totalPrice, updateQuantity // ✅ ADDED updateQuantity prop
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
                    <DatePicker
                        selected={selectedDate}
                        onChange={handleDateChange}
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={15}
                        dateFormat="MMMM d, yyyy h:mm aa"
                        placeholderText={t('selectPickupTime')}
                        filterTime={filterPassedTime} 
                        filterDate={(date) => {
                            if (!currentRestaurant?.openingHoursJson) return true;
                            return isRestaurantOpenOnDay(date, currentRestaurant.openingHoursJson);
                        }}
                        minDate={new Date()}
                        customInput={
                            <TextField 
                                fullWidth 
                                label={t('selectPickupTime')}
                                InputLabelProps={{ shrink: true }}
                                sx={{ '& input': { textOverflow: 'ellipsis' } }}
                            />
                        }
                    />
                </Box>
            )}

            <Divider sx={{ my: 3 }} />
            
            {/* ✅ UPDATED ORDER SUMMARY WITH EDIT CONTROLS */}
            <Typography variant="h6" gutterBottom>{t('orderSummary')}</Typography>
            <Box sx={{ bgcolor: '#fafafa', p: 2, borderRadius: 2, mb: 3 }}>
                {cartItems.map(item => (
                    <Box key={item.cartItemId} sx={{ mb: 2, pb: 2, borderBottom: '1px dashed #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ flex: 1, pr: 2 }}>
                            <Typography fontWeight="bold">{item.name}</Typography>
                            {item.selectedOptions && (
                                <Box component="ul" sx={{ pl: 2, my: 0.5, fontSize: '0.85rem', color: 'text.secondary' }}>
                                    {item.selectedOptions.map(opt => (
                                        <li key={opt.optionName}><strong>{opt.optionName}:</strong> {opt.choices.join(', ')}</li>
                                    ))}
                                </Box>
                            )}
                            <Typography variant="body2" color="text.secondary">
                                {formatPrice(item.price, currentRestaurant?.currency)} / ea
                            </Typography>
                        </Box>
                        
                        {/* +/- Controls directly in Checkout */}
                        <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                            <IconButton size="small" onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)} color="error">
                                <RemoveCircleOutlineIcon />
                            </IconButton>
                            <Typography sx={{ mx: 1, fontWeight: 'bold' }}>{item.quantity}</Typography>
                            <IconButton size="small" onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)} color="primary">
                                <AddCircleOutlineIcon />
                            </IconButton>
                        </Box>
                    </Box>
                ))}
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, pt: 2, borderTop: '2px solid #ddd' }}>
                    <Typography variant="h6">{t('total')}</Typography>
                    <Typography variant="h6" fontWeight="bold" color="primary.main">
                        {formatPrice(totalPrice, currentRestaurant?.currency)}
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

// --- COMPONENT 2: Stripe Specific Section ---
const StripePaymentSection = ({ t, isSubmitting, onConfirmPayment, totalPrice, currency }) => {
    const stripe = useStripe();
    const elements = useElements();

    const handlePayClick = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;
        await onConfirmPayment(stripe, elements);
    };

    return (
        <Box component="form" onSubmit={handlePayClick} sx={{ mt: 3 }}>
            <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2, mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>{t('paymentMethodTitle')}</Typography>
                <PaymentElement />
            </Box>
            <Button type="submit" variant="contained" fullWidth disabled={isSubmitting || !stripe} size="large" sx={{ py: 1.5, fontSize: '1.1rem' }}>
                {isSubmitting ? <CircularProgress size={24} /> : t('payButton', { amount: formatPrice(totalPrice, currency) })}
            </Button>
        </Box>
    );
};

// --- MAIN COMPONENT: CheckoutPage ---
function CheckoutPage() {
    const { t } = useTranslation(); 
    usePageTitle(t('checkoutTitle'));
    // ✅ Extract updateQuantity from useCart
    const { cartItems, clearCart, currentRestaurant, cartRestaurantId, updateQuantity } = useCart();
    const navigate = useNavigate();
    const [customerDetails, setCustomerDetails] = useState({ name: '', email: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [searchParams] = useSearchParams();
    const tableNumber = searchParams.get("table");
    
    const [orderType, setOrderType] = useState('asap');
    const [selectedDate, setSelectedDate] = useState(null);
    const [clientSecret, setClientSecret] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('online'); 

    const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

    // ✅ Auto-redirect to menu if cart becomes empty during checkout edit
    useEffect(() => {
        if (cartItems.length === 0 && !isSubmitting && currentRestaurant) {
            navigate(`/order/${currentRestaurant.slug}`);
        }
    }, [cartItems.length, currentRestaurant, navigate, isSubmitting]);

    useEffect(() => {
        if (currentRestaurant && cartRestaurantId && String(currentRestaurant.id) !== String(cartRestaurantId)) return; 

        const paymentsSupported = currentRestaurant?.stripeDetailsSubmitted && currentRestaurant?.paymentsEnabled;

        if (cartItems.length > 0 && paymentsSupported) {
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
        } else {
            setPaymentMethod('counter');
        }
    }, [cartItems, currentRestaurant, totalPrice, cartRestaurantId]);

    const handleInputChange = (e) => setCustomerDetails({ ...customerDetails, [e.target.name]: e.target.value });

    const filterPassedTime = (time) => {
        const currentDate = new Date();
        const selectedDate = new Date(time);
        const minTime = new Date(currentDate.getTime() + 20 * 60000);
        if (selectedDate < minTime) return false;
        if (currentRestaurant && currentRestaurant.openingHoursJson) {
            return isRestaurantOpen(selectedDate, currentRestaurant.openingHoursJson);
        }
        return true; 
    };

    const handleDateChange = (newDate) => {
        if (!newDate) {
            setSelectedDate(null);
            return;
        }
        const isValid = filterPassedTime(newDate);
        if (isValid) {
            setSelectedDate(newDate);
        } else {
            const nextAvailableTime = getFirstOpenSlot(newDate, currentRestaurant?.openingHoursJson);
            if (nextAvailableTime) {
                setSelectedDate(nextAvailableTime);
            } else {
                setSelectedDate(newDate);
            }
        }
    };

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

    const finalizeOrder = async (paymentIntentId) => {
        try {
            const customerResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/customers/find-or-create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(customerDetails)
            });
            if (!customerResponse.ok) throw new Error('Failed to create customer');
            const customerData = await customerResponse.json();

            let finalPickupTime = null;
            if (orderType === 'scheduled') {
                if (!selectedDate) {
                    setError(t('pickupTimeRequired'));
                    setIsSubmitting(false);
                    return;
                }
                if (!filterPassedTime(selectedDate)) {
                    setError(t('restaurantClosedAtTime'));
                    setIsSubmitting(false);
                    return;
                }
                const offsetMs = selectedDate.getTimezoneOffset() * 60 * 1000;
                finalPickupTime = new Date(selectedDate.getTime() - offsetMs).toISOString();
            }

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
            await finalizeOrder(paymentIntent.id);
        }
    };

    const handlePayAtCounter = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsSubmitting(true);
        setError(null);
        await finalizeOrder(null);
    };

    const paymentsSupported = currentRestaurant?.stripeDetailsSubmitted && currentRestaurant?.paymentsEnabled;

    // Prevent rendering the form if the cart is empty (it will auto-redirect shortly)
    if (cartItems.length === 0) return null;

    return (
        <Container maxWidth="sm" sx={{ mt: 4, mb: 10 }}>
            
            {/* ✅ NEW: BACK TO MENU BUTTON */}
            <Button 
                component={RouterLink} 
                to={currentRestaurant ? `/order/${currentRestaurant.slug}` : '/'}
                startIcon={<ArrowBackIcon />} 
                sx={{ mb: 2, color: 'text.secondary', fontWeight: 'bold' }}
            >
                {t('backToMenu')}
            </Button>

            <Paper elevation={4} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
                <Typography variant="h4" align="center" gutterBottom fontWeight="bold">
                    {t('checkoutTitle')}
                </Typography>
                
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
                    updateQuantity={updateQuantity} // ✅ Passed down to UI
                />

                <Divider sx={{ my: 3 }} />

                {totalPrice > 25 && paymentsSupported && (
                    <Alert severity="info" sx={{ mb: 3 }}>
                         {t('ticketRestaurantLimitWarning')}
                    </Alert>
                )}

                {paymentsSupported && (
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom>{t('paymentMethodTitle')}</Typography>
                        <ToggleButtonGroup
                            value={paymentMethod}
                            exclusive
                            onChange={(e, val) => val && setPaymentMethod(val)}
                            fullWidth
                            color="primary"
                            sx={{ bgcolor: 'background.paper' }}
                        >
                            <ToggleButton value="online" sx={{ fontWeight: 'bold' }}>{t('payOnline')}</ToggleButton>
                            <ToggleButton value="counter" sx={{ fontWeight: 'bold' }}>{t('payAtCounter')}</ToggleButton>
                        </ToggleButtonGroup>
                    </Box>
                )}

                {error && <Alert severity="error" sx={{ mt: 2, mb: 3 }}>{error}</Alert>}

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
                    <Box component="form" onSubmit={handlePayAtCounter} sx={{ mt: 3, position: 'relative' }}>
                        <Button 
                            type="submit" 
                            variant="contained" 
                            fullWidth 
                            disabled={isSubmitting || cartItems.length === 0}
                            size="large"
                            sx={{ py: 1.5, fontSize: '1.1rem', fontWeight: 'bold' }}
                        >
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