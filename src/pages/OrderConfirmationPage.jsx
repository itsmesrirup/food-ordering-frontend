import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container, Typography, Button, Box, CircularProgress, Paper, Divider, List, ListItem, ListItemText, Stepper, Step, StepLabel, styled, stepConnectorClasses, StepConnector } from '@mui/material';
import { motion } from 'framer-motion'; 
import usePageTitle from '../hooks/usePageTitle';

// --- ICONS FOR THE TIMELINE ---
import ReceiptIcon from '@mui/icons-material/Receipt';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import MopedIcon from '@mui/icons-material/Moped';
import TakeoutDiningIcon from '@mui/icons-material/TakeoutDining';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalDiningIcon from '@mui/icons-material/LocalDining';

// ✅ CUSTOM STYLING FOR THE PROGRESS BAR LINE
const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: 'linear-gradient( 95deg, #f83600 0%, #f9d423 100%)', // Vibrant gradient for active
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: 'linear-gradient( 95deg, #f83600 0%, #f9d423 100%)',
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#eaeaf0',
    borderRadius: 1,
  },
}));

// ✅ CUSTOM STYLING FOR THE STEPPER ICONS
const ColorlibStepIconRoot = styled('div')(({ theme, ownerState }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#ccc',
  zIndex: 1,
  color: '#fff',
  width: 50,
  height: 50,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  ...(ownerState.active && {
    backgroundImage: 'linear-gradient( 136deg, #f83600 0%, #f9d423 100%)',
    boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
  }),
  ...(ownerState.completed && {
    backgroundImage: 'linear-gradient( 136deg, #f83600 0%, #f9d423 100%)',
  }),
}));

function ColorlibStepIcon(props) {
  const { active, completed, className, icon, iconsMap } = props;

  return (
    <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>
      {/* 🚀 If this is the active step, make it pulse with Framer Motion! */}
      {active ? (
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
              {iconsMap[String(icon)]}
          </motion.div>
      ) : (
          iconsMap[String(icon)]
      )}
    </ColorlibStepIconRoot>
  );
}


export default function OrderConfirmationPage() {
    const { orderId } = useParams(); 
    const { t, i18n } = useTranslation(); // ✅ EXTRACTED i18n
    usePageTitle(t('orderConfirmationTitle'));
    
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const ids = orderId.split(',');
            const promises = ids.map(id => fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders/${id}`).then(res => res.json()));
            const data = await Promise.all(promises);
            setOrders(data);
        } catch (error) {
            console.error("Error fetching orders", error);
        } finally {
            setLoading(false);
        }
    };

    // Live Polling every 10 seconds
    useEffect(() => {
        fetchOrders(); 
        const interval = setInterval(fetchOrders, 10000); 
        return () => clearInterval(interval); 
    }, [orderId]);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
    if (orders.length === 0) return <Typography align="center" mt={5}>Orders not found.</Typography>;

    const backLink = orders[0]?.restaurantSlug ? `/order/${orders[0].restaurantSlug}` : '/';

    const isTotallyCancelled = orders.every(o => o.status === 'CANCELLED');

    // ✅ HELPER: MAP STATUS TO STEP INDEX
    const getStepIndex = (status) => {
        switch (status) {
            case 'PENDING': return 0;
            case 'CONFIRMED': return 1;
            case 'PREPARING': return 2;
            case 'READY_FOR_PICKUP': 
            case 'OUT_FOR_DELIVERY': return 3;
            case 'DELIVERED': return 5; // 5 means all 4 steps are completed
            default: return 0;
        }
    };

    return (
        <Container maxWidth="md" sx={{ textAlign: 'center', py: { xs: 4, md: 8 } }}>
            <Paper elevation={4} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, overflow: 'hidden' }}>
                
                {/* Header Animation */}
                <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}>
                    {isTotallyCancelled ? (
                        <CancelIcon color="error" sx={{ fontSize: 90, mb: 2 }} />
                    ) : (
                        <CheckCircleIcon color="success" sx={{ fontSize: 90, mb: 2 }} />
                    )}
                </motion.div>
                
                <Typography variant="h4" component="h1" gutterBottom fontWeight="900" sx={{ letterSpacing: '-0.5px' }}>
                    {isTotallyCancelled ? t('orderStatus.CANCELLED') : t('orderConfirmation_thankYou')}
                </Typography>
                
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                    {isTotallyCancelled ? t('orderCancelledMessage') : t('orderConfirmation_success')}
                </Typography>

                {/* DIGITAL RECEIPT + PROGRESS BAR */}
                {orders.map(order => {
                    
                    // ✅ DYNAMIC ICONS & LABELS BASED ON DINING PREFERENCE
                    const isDelivery = order.diningOption === 'DELIVERY';
                    const activeStep = getStepIndex(order.status);
                    
                    const stepLabels = [
                        t('stepSent'), 
                        t('stepConfirmed'), 
                        t('stepPreparing'), 
                        isDelivery ? t('stepOnTheWay') : t('stepReady')
                    ];

                    const stepIcons = {
                        1: <ReceiptIcon />,
                        2: <ThumbUpAltIcon />,
                        3: <LocalFireDepartmentIcon />, // Fire for cooking!
                        4: isDelivery ? <MopedIcon /> : <TakeoutDiningIcon />
                    };

                    return (
                        <Box key={order.id} sx={{ 
                            bgcolor: '#fafafa', p: { xs: 2, md: 4 }, borderRadius: 3, mb: 4, textAlign: 'left',
                            border: '1px solid #eaeaea', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
                            opacity: order.status === 'CANCELLED' ? 0.6 : 1 
                        }}>
                            
                            {/* TOP HEADER */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                                <Typography variant="h6" fontWeight="bold" sx={{ color: '#333' }}>
                                    {t('orderNumberLabel')} {order.orderNumber}
                                </Typography>
                                <Typography variant="caption" sx={{ bgcolor: order.status === 'CANCELLED' ? 'error.light' : '#111', color: order.status === 'CANCELLED' ? 'error.dark' : '#fff', px: 1.5, py: 0.5, borderRadius: 5, fontWeight: 'bold', textTransform: 'uppercase' }}>
                                    {t(`orderStatus.${order.status}`, { defaultValue: order.status })}
                                </Typography>
                            </Box>

                            {/* ✅ THE NEW VISUAL PROGRESS BAR */}
                            {order.status !== 'CANCELLED' && (
                                <Box sx={{ width: '100%', mb: 5 }}>
                                    <Stepper alternativeLabel activeStep={activeStep} connector={<ColorlibConnector />}>
                                        {stepLabels.map((label, index) => (
                                            <Step key={label}>
                                                <StepLabel StepIconComponent={(props) => <ColorlibStepIcon {...props} iconsMap={stepIcons} />}>
                                                    <Typography variant="body2" fontWeight={activeStep === index ? 'bold' : 'normal'}>
                                                        {label}
                                                    </Typography>
                                                </StepLabel>
                                            </Step>
                                        ))}
                                    </Stepper>
                                </Box>
                            )}
                            
                            {/* TIME INDICATOR */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, color: '#ff9800', bgcolor: '#fff3e0', p: 1.5, borderRadius: 2 }}>
                                {order.diningOption === 'DINE_IN' ? <LocalDiningIcon fontSize="small" /> : <AccessTimeIcon fontSize="small" />}
                                <Typography variant="body1" fontWeight="bold">
                                    {order.pickupTime ? new Date(order.pickupTime).toLocaleString(i18n.language, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' }) : t('pickupAsap')}
                                </Typography>
                            </Box>
                            
                            <Divider sx={{ my: 3, borderStyle: 'dashed' }} />
                            
                            {/* ORDER ITEMS */}
                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: '1px' }}>
                                {t('orderDetails')}
                            </Typography>

                            <List disablePadding>
                                {order.items.map((item, idx) => {
                                    let selectedOptions = [];
                                    if (item.selectedOptions) try { selectedOptions = JSON.parse(item.selectedOptions); } catch (e) {}
                                    return (
                                        <ListItem key={idx} sx={{ px: 0, py: 1, alignItems: 'flex-start' }}>
                                            <ListItemText 
                                                primary={<Typography fontWeight="600">{item.quantity}x {item.name}</Typography>}
                                                secondary={
                                                    selectedOptions.length > 0 && (
                                                        <Box component="span" sx={{ display: 'block', mt: 0.5 }}>
                                                            {selectedOptions.map((opt, i) => (
                                                                <Typography key={i} variant="caption" display="block" color="text.secondary">
                                                                    - {opt.choices.join(', ')}
                                                                </Typography>
                                                            ))}
                                                        </Box>
                                                    )
                                                }
                                            />
                                        </ListItem>
                                    );
                                })}
                            </List>

                            <Divider sx={{ my: 3, borderStyle: 'dashed' }} />

                            {/* TOTAL */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    {t('itemCount', { count: order.items.length })}
                                </Typography>
                                <Typography variant="h5" fontWeight="900" color="primary.main">
                                    €{order.totalPrice?.toFixed(2)}
                                </Typography>
                            </Box>
                        </Box>
                    );
                })}

                {!isTotallyCancelled && (
                    <Typography variant="body2" sx={{ mb: 4, color: '#666', fontStyle: 'italic' }}>
                        {t('orderConfirmation_preparation')}
                    </Typography>
                )}

                <Button component={Link} to={backLink} variant="outlined" size="large" fullWidth sx={{ py: 1.8, fontSize: '1.1rem', fontWeight: 'bold', borderRadius: 50, borderWidth: 2, '&:hover': { borderWidth: 2 } }}>
                    {t('orderConfirmation_backHome')}
                </Button>
            </Paper>
        </Container>
    );
}