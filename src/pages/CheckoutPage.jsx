import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';
import { Container, Paper, Typography, TextField, Button, Box, CircularProgress, Alert, Divider, ToggleButton, ToggleButtonGroup, IconButton, Card, useTheme, useMediaQuery, Autocomplete } from '@mui/material';
import { toast } from 'react-hot-toast';
import { formatPrice } from '../utils/formatPrice';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { isRestaurantOpen, isRestaurantOpenOnDay } from '../utils/timeValidation';
import usePageTitle from '../hooks/usePageTitle';

// ✅ IMPORTS FOR CART EDITING AND NAVIGATION
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

// --- STRIPE IMPORTS ---
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

// --- DYNAMIC TIME HELPERS FOR SPLIT CART ---
const getMinAllowedDateForGroup = (leadTimeHours) => {
    const currentDate = new Date();
    const leadTimeMs = (leadTimeHours || 0) * 60 * 60 * 1000;
    // Base 20-min prep buffer + Bakery Lead Time
    return new Date(currentDate.getTime() + (20 * 60000) + leadTimeMs);
};

const filterPassedTimeForGroup = (time, leadTimeHours, currentRestaurant) => {
    const selectedDate = new Date(time);
    if (selectedDate < getMinAllowedDateForGroup(leadTimeHours)) return false;
    if (currentRestaurant && currentRestaurant.openingHoursJson) {
        return isRestaurantOpen(selectedDate, currentRestaurant.openingHoursJson);
    }
    return true; 
};

const getNextValidPickupTimeForGroup = (leadTimeHours, currentRestaurant, startingFromDate = null) => {
    
    // 1. If the user clicked a specific date, start scanning from there.
    // Otherwise, start scanning from the minimum allowed time (Today + lead time).
    let checkTime;
    if (startingFromDate) {
        checkTime = new Date(startingFromDate);
        
        // Safety: Ensure the date they clicked isn't BEFORE the bakery's required lead time!
        const minAllowed = getMinAllowedDateForGroup(leadTimeHours);
        if (checkTime < minAllowed) {
            checkTime = minAllowed;
        }
    } else {
        checkTime = getMinAllowedDateForGroup(leadTimeHours);
    }

    // Round up to the next 15-minute mark
    const remainder = 15 - (checkTime.getMinutes() % 15);
    checkTime.setMinutes(checkTime.getMinutes() + remainder);
    checkTime.setSeconds(0);
    checkTime.setMilliseconds(0);

    // Scan forward in 15-minute increments
    for (let i = 0; i < 24 * 4 * 7; i++) {
        if (isRestaurantOpen(checkTime, currentRestaurant?.openingHoursJson)) {
            return checkTime;
        }
        checkTime = new Date(checkTime.getTime() + 15 * 60000); 
    }
    return null;
};

// --- FULFILLMENT GROUP UI COMPONENT ---
const FulfillmentGroupUI = ({ group, schedule, updateSchedule, currentRestaurant, isCurrentlyClosed, t, isMobile, diningOption }) => {
    const isImmediateAllowed = group.leadTime === 0;
    const hideAsap = !isImmediateAllowed || isCurrentlyClosed;
    const isDelivery = diningOption === 'DELIVERY'; // ✅ Check if it's a delivery

    // Force scheduled if ASAP is hidden but state is still asap
    useEffect(() => {
        if (!isDelivery && hideAsap && schedule.type === 'asap') {
            updateSchedule(group.leadTime, 'type', 'scheduled');
            if (!schedule.date) {
                const nextSlot = getNextValidPickupTimeForGroup(group.leadTime, currentRestaurant);
                if (nextSlot) updateSchedule(group.leadTime, 'date', nextSlot);
            }
        }
        // ✅ If Delivery, FORCE type to 'asap' in the background
        if (isDelivery && schedule.type !== 'asap') {
            updateSchedule(group.leadTime, 'type', 'asap');
            updateSchedule(group.leadTime, 'date', null);
        }
    }, [hideAsap, schedule.type, group.leadTime, schedule.date, updateSchedule, currentRestaurant, isDelivery]);

    const handleDateChange = (newDate) => {
        if (!newDate) {
            updateSchedule(group.leadTime, 'date', null);
            return;
        }
        if (filterPassedTimeForGroup(newDate, group.leadTime, currentRestaurant)) {
            updateSchedule(group.leadTime, 'date', newDate);
        } else {
            const nextValidSlot = getNextValidPickupTimeForGroup(group.leadTime, currentRestaurant, newDate);
            updateSchedule(group.leadTime, 'date', nextValidSlot || newDate);
        }
    };

    // ✅ SMART HEADER LOGIC
    let groupStatusText = "";
    
    if (isDelivery) {
        groupStatusText = ""; // Keep it clean for delivery
    } else if (group.leadTime > 0) {
        // Case 1: Bakery items that STRICTLY require advance notice
        groupStatusText = t('requiresNotice', { hours: group.leadTime, defaultValue: `(Requires ${group.leadTime}h notice)` });
    } else if (isCurrentlyClosed) {
        // Case 2: Restaurant is currently closed
        // ✅ SMART TEXT: Adapts based on Dine-In vs Takeaway when closed!
        groupStatusText = diningOption === 'DINE_IN' 
            ? t('scheduleArrivalLater', { defaultValue: '(Schedule arrival for later)' })
            : t('preOrderOnly', { defaultValue: '(Pre-order for later)' });
    } else if (schedule.type === 'scheduled') {
        // ✅ NEW Case 3: The user clicked "Schedule for Later"
        if (schedule.date) {
            // They picked a date! Show it in the header.
            groupStatusText = `(${schedule.date.toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })})`;
        } else {
            // They clicked the tab but haven't picked a date yet
            groupStatusText = `(${t('scheduleForLater')})`;
        }
    } else {
        // Case 4: They are on the ASAP tab
        groupStatusText = diningOption === 'DINE_IN' 
            ? `(${t('rightAway', 'Right Away')})` 
            : t('availableAsapText', { defaultValue: '(Available ASAP)' });
    }

    const groupPrefix = diningOption === 'DINE_IN' ? t('dineInGroup') : diningOption === 'DELIVERY' ? t('deliveryGroup', 'Delivery Group') : t('pickupGroup');
    const selectTimeLabel = diningOption === 'DINE_IN' ? t('selectArrivalTime') : t('selectPickupTime');
    
    // ✅ DYNAMIC ASAP BUTTON TEXT
    const asapButtonText = diningOption === 'DINE_IN' ? t('rightAway', 'Right Away') : t('asap', 'As Soon As Possible');

    return (
        <Card variant="outlined" sx={{ mb: 3, p: 3, borderColor: 'primary.main', borderWidth: '2px', overflow: 'visible' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <AccessTimeIcon color="primary" />
                <Typography variant="h6" fontWeight="bold">
                    {groupPrefix} {groupStatusText}
                </Typography>
            </Box>

            {/* Items in this group */}
            <Box sx={{ mb: 3, pl: 2, borderLeft: '2px solid #eee' }}>
                {group.items.map(item => (
                    <Typography key={item.cartItemId} variant="body2" sx={{ mb: 0.5 }}>
                        <strong>{item.quantity}x</strong> {item.name}
                    </Typography>
                ))}
            </Box>

            {/* ✅ IF DELIVERY: Hide the calendar and show simple status messages */}
            {isDelivery ? (
                <Box sx={{ mt: 2 }}>
                    {isCurrentlyClosed ? (
                        <Alert severity="error">{t('deliveryClosedMsg', 'Delivery is unavailable because the restaurant is currently closed.')}</Alert>
                    ) : group.leadTime > 0 ? (
                        <Alert severity="error">{t('deliveryNoPreorderMsg', 'Delivery is not available for items requiring advance notice. Please select Takeaway.')}</Alert>
                    ) : (
                        <Alert severity="success" icon={<AccessTimeIcon/>}>
                            {t('deliveryAsapMsg', 'Your order will be delivered as soon as possible (approx. 40-50 mins).')}
                        </Alert>
                    )}
                </Box>
            ) : (
                /* ✅ IF TAKEAWAY OR DINE-IN: Show your existing perfectly working Calendar code! */
                <>

                <Typography variant="subtitle2" gutterBottom>{selectTimeLabel}</Typography>
                
                <ToggleButtonGroup value={schedule.type} exclusive onChange={(e, val) => { if(val) updateSchedule(group.leadTime, 'type', val); }} fullWidth sx={{ mb: 2 }}>
                    {!hideAsap && <ToggleButton value="asap" sx={{ fontWeight: 'bold' }}>{asapButtonText}</ToggleButton>}
                    <ToggleButton value="scheduled">{t('scheduleForLater')}</ToggleButton>
                </ToggleButtonGroup>

                {schedule.type === 'scheduled' && (
                    <Box sx={{ '& .react-datepicker-wrapper': { width: '100%' } }}>
                        <DatePicker
                            selected={schedule.date}
                            onChange={handleDateChange}
                            showTimeSelect timeFormat="HH:mm" timeIntervals={15} dateFormat="MMMM d, yyyy h:mm aa"
                            placeholderText={selectTimeLabel}
                            filterTime={(time) => filterPassedTimeForGroup(time, group.leadTime, currentRestaurant)} 
                            filterDate={(date) => currentRestaurant?.openingHoursJson ? isRestaurantOpenOnDay(date, currentRestaurant.openingHoursJson) : true}
                            minDate={getMinAllowedDateForGroup(group.leadTime)}
                            portalId="datepicker-portal"
                            customInput={
                                <TextField fullWidth label={selectTimeLabel} InputLabelProps={{ shrink: true }} inputProps={{ readOnly: true }} sx={{ '& input': { cursor: 'pointer', textOverflow: 'ellipsis' } }} />
                            }
                        />
                    </Box>
                )}
            </>
            )}
        </Card>
    );
};

// --- STRIPE PAYMENT COMPONENT ---
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

// --- MAIN CHECKOUT COMPONENT ---
function CheckoutPage() {
    const { t } = useTranslation(); 
    usePageTitle(t('checkoutTitle'));
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    
    const { cartItems, clearCart, currentRestaurant, cartRestaurantId, updateQuantity } = useCart();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const tableNumber = searchParams.get("table");

    const [customerDetails, setCustomerDetails] = useState({ name: '', email: '', phone: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [clientSecret, setClientSecret] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('online'); 
    const [diningOption, setDiningOption] = useState('TAKEAWAY');
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [specialInstructions, setSpecialInstructions] = useState('');

    // ✅ NEW STATES FOR ADDRESS AUTOCOMPLETE
    const [addressOptions, setAddressOptions] = useState([]);
    const [isFetchingAddress, setIsFetchingAddress] = useState(false);

    // ✅ SMART CART SPLITTER (Groups items by lead time)
    const groupedCart = useMemo(() => {
        const groups = {};
        cartItems.forEach(item => {
            const leadTime = item.advanceOrderLeadTimeHours || 0;
            if (!groups[leadTime]) {
                groups[leadTime] = { leadTime, items: [] };
            }
            groups[leadTime].items.push(item);
        });
        return Object.values(groups).sort((a, b) => a.leadTime - b.leadTime);
    }, [cartItems]);

    // ✅ NEW: Fetch verified addresses from the French Government API
    useEffect(() => {
        // Only search if they typed at least 4 characters
        if (!deliveryAddress || deliveryAddress.length < 4) {
            setAddressOptions([]);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setIsFetchingAddress(true);
            try {
                // Call the free Base Adresse Nationale (BAN) API
                const response = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(deliveryAddress)}&limit=5`);
                const data = await response.json();
                if (data && data.features) {
                    // Extract the perfectly formatted official addresses
                    const formattedAddresses = data.features.map(f => f.properties.label);
                    setAddressOptions(formattedAddresses);
                }
            } catch (error) {
                console.error("Address search failed", error);
            } finally {
                setIsFetchingAddress(false);
            }
        }, 400); // Wait 400ms after they stop typing

        return () => clearTimeout(delayDebounceFn);
    }, [deliveryAddress]);

    const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

    // Add the fee for EACH fulfillment group (If they want a cake tomorrow and a croissant today, that's 2 deliveries!)
    const totalDeliveryFee = (diningOption === 'DELIVERY' && currentRestaurant?.deliveryEnabled) 
        ? (currentRestaurant.deliveryFee * groupedCart.length) 
        : 0;
    const finalTotalPrice = cartTotal + totalDeliveryFee;

    // ✅ SMART CLOSED DETECTION
    const isCurrentlyClosed = useMemo(() => {
        if (currentRestaurant?.openingHoursJson) {
            return !isRestaurantOpen(new Date(), currentRestaurant.openingHoursJson);
        }
        return false;
    }, [currentRestaurant]);

    // ✅ SCHEDULES STATE
    const [schedules, setSchedules] = useState({});

    useEffect(() => {
        setSchedules(prev => {
            const newSchedules = { ...prev };
            groupedCart.forEach(g => {
                if (!newSchedules[g.leadTime]) {
                    newSchedules[g.leadTime] = { type: g.leadTime === 0 ? 'asap' : 'scheduled', date: null };
                }
            });
            return newSchedules;
        });
    }, [groupedCart]);

    const updateSchedule = useCallback((leadTime, field, value) => {
        setSchedules(prev => ({ ...prev, [leadTime]: { ...prev[leadTime], [field]: value } }));
    }, []);

    // Auto-redirect to menu if cart empties
    useEffect(() => {
        if (cartItems.length === 0 && !isSubmitting && currentRestaurant) {
            navigate(`/order/${currentRestaurant.slug}`);
        }
    }, [cartItems.length, currentRestaurant, navigate, isSubmitting]);

    // Stripe Intent
    useEffect(() => {
        if (currentRestaurant && cartRestaurantId && String(currentRestaurant.id) !== String(cartRestaurantId)) return; 
        const paymentsSupported = currentRestaurant?.stripeDetailsSubmitted && currentRestaurant?.paymentsEnabled;

        if (cartItems.length > 0 && paymentsSupported) {
            const amountInCents = Math.round(finalTotalPrice * 100);
            fetch(`${import.meta.env.VITE_API_BASE_URL}/api/payments/create-intent`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: amountInCents, currency: currentRestaurant.currency || "eur", restaurantId: currentRestaurant.id }),
            }).then(res => res.json()).then(data => setClientSecret(data.clientSecret)).catch(console.error);
        } else {
            setPaymentMethod('counter');
        }
    }, [cartItems, currentRestaurant, finalTotalPrice, cartRestaurantId]);

    const handleInputChange = (e) => setCustomerDetails({ ...customerDetails, [e.target.name]: e.target.value });

    const validateForm = () => {
        if (cartItems.length === 0) {
            setError(t('cartIsEmptyError'));
            return false;
        }
        if (!customerDetails.name && !customerDetails.email && !customerDetails.phone) {
            setError(t('nameAndEmailRequired'));
            return false;
        }
        if (!customerDetails.name) {
            setError(t('nameRequired'));
            return false;
        }
        if (!customerDetails.email) {
            setError(t('emailRequired'));
            return false;
        }
        if (!customerDetails.phone) { 
            setError(t('phoneRequired')); 
            return false; 
        }
        // Delivery Address Validation
        if (diningOption === 'DELIVERY') {
            if (!deliveryAddress || !deliveryAddress.trim()) {
                setError(t('addressRequired', 'Delivery address is required.'));
                return false;
            }
            if (isCurrentlyClosed) {
                setError(t('deliveryClosedMsg', 'Delivery is unavailable because the restaurant is currently closed.'));
                return false;
            }
            const hasPreorderItems = groupedCart.some(g => g.leadTime > 0);
            if (hasPreorderItems) {
                setError(t('deliveryNoPreorderMsg', 'Delivery is not available for pre-order items.'));
                return false;
            }
            return true; // If delivery passes these checks, we are good to go!
        }
        for (const group of groupedCart) {
            const sched = schedules[group.leadTime];
            if (!sched) continue;
            if (sched.type === 'scheduled') {
                if (!sched.date) {
                    setError(`Please select a pickup time for the items requiring ${group.leadTime}h notice.`);
                    return false;
                }
                if (!filterPassedTimeForGroup(sched.date, group.leadTime, currentRestaurant)) {
                    setError(`Selected time for group ${group.leadTime}h is invalid or closed.`);
                    return false;
                }
            }
        }
        return true;
    };

    const finalizeOrder = async (paymentIntentId) => {
        try {
            const customerResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/customers/find-or-create`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(customerDetails)
            });
            if (!customerResponse.ok) throw new Error('Failed to create customer');
            const customerData = await customerResponse.json();

            // ✅ BATCH ORDER CREATION
            const batchPayload = groupedCart.map(group => {
                const sched = schedules[group.leadTime];
                let finalPickupTime = null;
                
                if (sched.type === 'scheduled' && sched.date) {
                    const offsetMs = sched.date.getTimezoneOffset() * 60 * 1000;
                    finalPickupTime = new Date(sched.date.getTime() - offsetMs).toISOString();
                }

                return {
                    customerId: customerData.id,
                    tableNumber: tableNumber,
                    pickupTime: finalPickupTime,
                    paymentIntentId: paymentIntentId, 
                    diningOption: diningOption,
                    deliveryAddress: diningOption === 'DELIVERY' ? deliveryAddress : null,
                    specialInstructions: specialInstructions,
                    items: group.items.map(item => ({
                        menuItemId: item.id,
                        quantity: item.quantity,
                        selectedOptions: item.selectedOptions || []
                    }))
                };
            });

            const orderResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders/batch`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(batchPayload)
            });
            
            if (!orderResponse.ok) throw new Error('Failed to place order');
            
            const newOrders = await orderResponse.json();
            clearCart();
            const orderIdsString = newOrders.map(o => o.id).join(',');
            navigate(`/order-confirmation/${orderIdsString}`);

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
            elements, redirect: 'if_required',
        });
        if (stripeError) { toast.error(stripeError.message); setIsSubmitting(false); } 
        else if (paymentIntent && paymentIntent.status === 'succeeded') {
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

    if (cartItems.length === 0) return null;
    const paymentsSupported = currentRestaurant?.stripeDetailsSubmitted && currentRestaurant?.paymentsEnabled;

    return (
        <Container maxWidth="sm" sx={{ mt: 4, mb: 10 }}>
            
            <Button 
                component={RouterLink} 
                to={currentRestaurant ? `/order/${currentRestaurant.slug}` : '/'}
                startIcon={<ArrowBackIcon />} 
                sx={{ mb: 2, color: 'text.secondary', fontWeight: 'bold' }}
            >
                {t('backToMenu')}
            </Button>

            <Paper elevation={4} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, overflow: 'visible' }}>
                <Typography variant="h4" align="center" gutterBottom fontWeight="bold">
                    {t('checkoutTitle')}
                </Typography>
                
                {/* --- CUSTOMER DETAILS --- */}
                <Box>
                    <Typography variant="h6" gutterBottom>{t('yourDetails')}</Typography>
                    <TextField label={t('fullNameLabel')} name="name" value={customerDetails.name} onChange={handleInputChange} required fullWidth margin="normal" />
                    <TextField label={t('emailLabel')} name="email" type="email" value={customerDetails.email} onChange={handleInputChange} required fullWidth margin="normal" />
                    <TextField 
                        label={t('phoneNumberLabel')} 
                        name="phone" 
                        type="tel" // Pulls up the number keypad on mobile!
                        value={customerDetails.phone} 
                        onChange={handleInputChange} 
                        required 
                        fullWidth 
                        margin="normal" 
                    />
                </Box>

                {/* ✅ MISSING BLOCK RESTORED: DINING PREFERENCE (Takeaway / Eat-In / Delivery) */}
                {(currentRestaurant?.dineInOrdersEnabled || currentRestaurant?.deliveryEnabled) && (
                    <>
                        <Divider sx={{ my: 3 }} />
                        <Box>
                            <Typography variant="h6" gutterBottom fontWeight="bold">
                                {t('diningPreference', 'Dining Preference')}
                            </Typography>
                            
                            <ToggleButtonGroup
                                value={diningOption}
                                exclusive
                                onChange={(e, val) => val && setDiningOption(val)}
                                fullWidth
                                color="primary"
                                sx={{ mb: 2, bgcolor: 'background.paper', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                            >
                                <ToggleButton value="TAKEAWAY" sx={{ fontWeight: 'bold', py: 1.5 }}>
                                    🛍️ {t('takeaway', 'Takeaway')}
                                </ToggleButton>
                                
                                {currentRestaurant?.dineInOrdersEnabled && (
                                    <ToggleButton value="DINE_IN" sx={{ fontWeight: 'bold', py: 1.5 }}>
                                        🍽️ {t('eatIn', 'Eat-In')}
                                    </ToggleButton>
                                )}

                                {currentRestaurant?.deliveryEnabled && (
                                    <ToggleButton value="DELIVERY" sx={{ fontWeight: 'bold', py: 1.5 }}>
                                        🛵 {t('delivery', 'Delivery')}
                                    </ToggleButton>
                                )}
                            </ToggleButtonGroup>

                            {/* Polite Disclaimer when Dine-In is selected */}
                            {diningOption === 'DINE_IN' && (
                                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mb: 2 }}>
                                    ⚠️ {t('dineInDisclaimer', 'Note: During peak hours, there might be a short wait for an available table. Your hot food will be prioritized!')}
                                </Typography>
                            )}

                            {/* Delivery Address Box when Delivery is selected */}
                            {diningOption === 'DELIVERY' && (
                                <Box sx={{ mt: 2, p: 2, bgcolor: '#f0f8ff', borderRadius: 2, border: '1px solid #90caf9' }}>
                                    <Autocomplete
                                    freeSolo
                                    filterOptions={(x) => x} // ✅ CRITICAL FIX: Stops MUI from hiding the API results!
                                    options={addressOptions}
                                    value={deliveryAddress}
                                    onChange={(event, newValue) => {
                                        setDeliveryAddress(newValue || '');
                                    }}
                                    onInputChange={(event, newInputValue) => {
                                        setDeliveryAddress(newInputValue || '');
                                    }}
                                    loading={isFetchingAddress}
                                    renderInput={(params) => (
                                        <TextField 
                                            {...params} 
                                            label={t('deliveryAddress')} 
                                            required={diningOption === 'DELIVERY'} // ✅ Syncs required star with state
                                            fullWidth 
                                            placeholder="Ex: 10 Rue des Boulangers, 67000 Strasbourg"
                                            sx={{ bgcolor: 'white' }}
                                            InputProps={{
                                                ...params.InputProps,
                                                endAdornment: (
                                                    <React.Fragment>
                                                        {isFetchingAddress ? <CircularProgress color="inherit" size={20} /> : null}
                                                        {params.InputProps.endAdornment}
                                                    </React.Fragment>
                                                ),
                                            }}
                                        />
                                    )}
                                />
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                        {t('deliveryFee', 'Delivery Fee')}: {formatPrice(currentRestaurant.deliveryFee || 0, currentRestaurant.currency)}
                                    </Typography>

                                    {/* ✅ NEW: LEGAL DISCLAIMER TO PROTECT YOUR SAAS */}
                                    <Typography 
                                        variant="caption" 
                                        sx={{ 
                                            display: 'block', 
                                            mt: 2, 
                                            pt: 1.5, 
                                            borderTop: '1px solid #bbdefb', 
                                            color: '#555',
                                            fontStyle: 'italic',
                                            lineHeight: 1.4
                                        }}
                                    >
                                        {t('deliveryDisclaimer', { restaurantName: currentRestaurant?.name })}
                                    </Typography>

                                </Box>
                            )}
                        </Box>
                    </>
                )}

                <TextField 
                        label={t('specialInstructions')} 
                        name="specialInstructions" 
                        value={specialInstructions} 
                        onChange={(e) => setSpecialInstructions(e.target.value)} 
                        fullWidth 
                        multiline
                        rows={2}
                        margin="normal"
                        placeholder={t('specialInstructionsHelper')}
                        sx={{ bgcolor: '#fff' }}
                    />

                <Divider sx={{ my: 3 }} />

                {/* --- PICKUP TIME SELECTION --- */}
                <Box>
                    <Typography variant="h6" gutterBottom>
                        {/* ✅ Changes from "Pickup Time" to "Arrival Time" */}
                        {diningOption === 'DINE_IN' ? t('arrivalTimeTitle', 'Arrival Time') : t('pickupTimeTitle')}
                    </Typography>
                    
                    {isCurrentlyClosed && (
                        <Alert severity="warning" icon={false} sx={{ mb: 3, backgroundColor: '#fff3e0', color: '#e65100', border: '1px solid #ffcc80' }}>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>{t('restaurantClosedMessage')}</Typography>
                            <Typography variant="body2">{t('restaurantClosedSubtext')}</Typography>
                        </Alert>
                    )}

                    {groupedCart.length > 1 && (
                        <Alert severity="info" sx={{ mb: 3 }}>
                            Your order contains items that require different preparation times. Please select a pickup time for each group.
                        </Alert>
                    )}

                    {groupedCart.map(group => (
                        schedules[group.leadTime] ? (
                            <FulfillmentGroupUI 
                                key={group.leadTime} 
                                group={group} 
                                schedule={schedules[group.leadTime]} 
                                updateSchedule={updateSchedule}
                                currentRestaurant={currentRestaurant}
                                isCurrentlyClosed={isCurrentlyClosed}
                                t={t}
                                isMobile={isMobile}
                                diningOption={diningOption}
                            />
                        ) : null
                    ))}
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* --- ORDER SUMMARY --- */}
                <Box>
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
                                {formatPrice(finalTotalPrice, currentRestaurant?.currency)}
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* --- WARNINGS & ERRORS --- */}
                {finalTotalPrice > 25 && paymentsSupported && (
                    <Alert severity="info" sx={{ mb: 3 }}>{t('ticketRestaurantLimitWarning')}</Alert>
                )}
                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                {/* --- PAYMENT METHOD SELECTION --- */}
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

                {/* --- PAYMENT ACTION BUTTONS --- */}
                {paymentsSupported && paymentMethod === 'online' && clientSecret && stripePromise ? (
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                        <StripePaymentSection t={t} isSubmitting={isSubmitting} onConfirmPayment={handleStripeConfirm} totalPrice={finalTotalPrice} currency={currentRestaurant?.currency} />
                    </Elements>
                ) : (
                    <Box component="form" onSubmit={handlePayAtCounter} sx={{ mt: 3, position: 'relative' }}>
                        <Button type="submit" variant="contained" fullWidth disabled={isSubmitting || cartItems.length === 0} size="large" sx={{ py: 1.5, fontSize: '1.1rem', fontWeight: 'bold' }}>
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