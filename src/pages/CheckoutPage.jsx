import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';
import { Container, Paper, Typography, TextField, Button, Box, CircularProgress, Alert, Divider, ToggleButton, ToggleButtonGroup, IconButton, Card } from '@mui/material';
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
const FulfillmentGroupUI = ({ group, schedule, updateSchedule, currentRestaurant, isCurrentlyClosed, t }) => {
    const isImmediateAllowed = group.leadTime === 0;
    const hideAsap = !isImmediateAllowed || isCurrentlyClosed;

    // Force scheduled if ASAP is hidden but state is still asap
    useEffect(() => {
        if (hideAsap && schedule.type === 'asap') {
            updateSchedule(group.leadTime, 'type', 'scheduled');
            if (!schedule.date) {
                const nextSlot = getNextValidPickupTimeForGroup(group.leadTime, currentRestaurant);
                if (nextSlot) updateSchedule(group.leadTime, 'date', nextSlot);
            }
        }
    }, [hideAsap, schedule.type, group.leadTime, schedule.date, updateSchedule, currentRestaurant]);

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
    if (group.leadTime > 0) {
        groupStatusText = t('requiresNotice', { hours: group.leadTime, defaultValue: `(Requires ${group.leadTime}h notice)` });
    } else if (isCurrentlyClosed) {
        groupStatusText = t('preOrderOnly', { defaultValue: '(Pre-order for later)' });
    } else {
        groupStatusText = t('availableAsapText', { defaultValue: '(Available ASAP)' });
    }

    return (
        <Card variant="outlined" sx={{ mb: 3, p: 3, borderColor: 'primary.main', borderWidth: '2px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <AccessTimeIcon color="primary" />
                <Typography variant="h6" fontWeight="bold">
                    {/* ✅ TRANSLATED & DYNAMIC TEXT */}
                    {t('pickupGroup')} {groupStatusText}
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

            <Typography variant="subtitle2" gutterBottom>{t('selectPickupTime')}</Typography>
            
            <ToggleButtonGroup
                value={schedule.type}
                exclusive
                onChange={(e, val) => { if(val) updateSchedule(group.leadTime, 'type', val); }}
                fullWidth
                sx={{ mb: 2 }}
            >
                {!hideAsap && <ToggleButton value="asap">{t('asap')}</ToggleButton>}
                <ToggleButton value="scheduled">{t('scheduleForLater')}</ToggleButton>
            </ToggleButtonGroup>

            {schedule.type === 'scheduled' && (
                <Box sx={{ '& .react-datepicker-wrapper': { width: '100%' } }}>
                    <DatePicker
                        selected={schedule.date}
                        onChange={handleDateChange}
                        showTimeSelect timeFormat="HH:mm" timeIntervals={15} dateFormat="MMMM d, yyyy h:mm aa"
                        placeholderText={t('selectPickupTime')}
                        filterTime={(time) => filterPassedTimeForGroup(time, group.leadTime, currentRestaurant)} 
                        filterDate={(date) => currentRestaurant?.openingHoursJson ? isRestaurantOpenOnDay(date, currentRestaurant.openingHoursJson) : true}
                        minDate={getMinAllowedDateForGroup(group.leadTime)}
                        customInput={
                            <TextField fullWidth label={t('selectPickupTime')} InputLabelProps={{ shrink: true }} inputProps={{ readOnly: true }} sx={{ '& input': { cursor: 'pointer', textOverflow: 'ellipsis' } }} />
                        }
                    />
                </Box>
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
    
    const { cartItems, clearCart, currentRestaurant, cartRestaurantId, updateQuantity } = useCart();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const tableNumber = searchParams.get("table");

    const [customerDetails, setCustomerDetails] = useState({ name: '', email: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [clientSecret, setClientSecret] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('online'); 

    const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

    // ✅ SMART CLOSED DETECTION
    const isCurrentlyClosed = useMemo(() => {
        if (currentRestaurant?.openingHoursJson) {
            return !isRestaurantOpen(new Date(), currentRestaurant.openingHoursJson);
        }
        return false;
    }, [currentRestaurant]);

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
            const amountInCents = Math.round(totalPrice * 100);
            fetch(`${import.meta.env.VITE_API_BASE_URL}/api/payments/create-intent`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: amountInCents, currency: currentRestaurant.currency || "eur", restaurantId: currentRestaurant.id }),
            }).then(res => res.json()).then(data => setClientSecret(data.clientSecret)).catch(console.error);
        } else {
            setPaymentMethod('counter');
        }
    }, [cartItems, currentRestaurant, totalPrice, cartRestaurantId]);

    const handleInputChange = (e) => setCustomerDetails({ ...customerDetails, [e.target.name]: e.target.value });

    const validateForm = () => {
        if (cartItems.length === 0) {
            setError(t('cartIsEmptyError'));
            return false;
        }
        if (!customerDetails.name || !customerDetails.email) {
            setError("Name and Email are required.");
            return false;
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

            <Paper elevation={4} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
                <Typography variant="h4" align="center" gutterBottom fontWeight="bold">
                    {t('checkoutTitle')}
                </Typography>
                
                {/* --- CUSTOMER DETAILS --- */}
                <Box>
                    <Typography variant="h6" gutterBottom>{t('yourDetails')}</Typography>
                    <TextField label={t('fullNameLabel')} name="name" value={customerDetails.name} onChange={handleInputChange} required fullWidth margin="normal" />
                    <TextField label={t('emailLabel')} name="email" type="email" value={customerDetails.email} onChange={handleInputChange} required fullWidth margin="normal" />
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* --- PICKUP TIME SELECTION --- */}
                <Box>
                    <Typography variant="h6" gutterBottom>{t('pickupTimeTitle')}</Typography>
                    
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
                                {formatPrice(totalPrice, currentRestaurant?.currency)}
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* --- WARNINGS & ERRORS --- */}
                {totalPrice > 25 && paymentsSupported && (
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
                        <StripePaymentSection t={t} isSubmitting={isSubmitting} onConfirmPayment={handleStripeConfirm} totalPrice={totalPrice} currency={currentRestaurant?.currency} />
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