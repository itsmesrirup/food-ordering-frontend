import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Cart from '../components/Cart';
import { Container, Typography, Grid, Paper, Button, CircularProgress, Box, Divider, Alert } from '@mui/material';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
//import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EventIcon from '@mui/icons-material/Event'; // Icon for booking
import { toast } from 'react-hot-toast';

function MenuPage() {
    const { t } = useTranslation();
    const [restaurant, setRestaurant] = useState(null);
    const [menu, setMenu] =useState([]);
    const [searchParams] = useSearchParams();
    const tableNumber = searchParams.get("table");
    const [isLoading, setIsLoading] = useState(true);
    const { restaurantId } = useParams();
    const { addToCart } = useCart();

    useEffect(() => {
        const fetchMenuData = async () => {
            setIsLoading(true);
            try {
                const [resResponse, menuResponse] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/restaurants/${restaurantId}`),
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/restaurants/${restaurantId}/menu`)
                ]);
                if (!resResponse.ok || !menuResponse.ok) throw new Error("Failed to load restaurant data.");
                const resData = await resResponse.json();
                const menuData = await menuResponse.json();
                setRestaurant(resData);
                setMenu(menuData);
            } catch (error) {
                toast.error(error.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchMenuData();
    }, [restaurantId]);

    const handleAddToCart = (item) => {
        addToCart(item);
        toast.success(t('itemAddedToCart', { itemName: item.name }));
    };

    if (isLoading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
    }

    if (!restaurant) {
        return <Typography align="center" sx={{ mt: 4 }}>Restaurant not found.</Typography>;
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {/*<Button component={Link} to="/" startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
                {t('allRestaurants')}
            </Button>*/}

            {tableNumber && restaurant.qrCodeOrderingEnabled && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    {t('youAreOrdForTable')} #{tableNumber}
                </Alert>
            )}
            
            {/* Clean, single header section */}
            <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                        <Typography variant="h4" component="h1" gutterBottom>{restaurant.name}</Typography>
                        <Typography variant="subtitle1" color="text.secondary">{restaurant.address}</Typography>
                    </Box>
                    {restaurant.reservationsEnabled && (
                        <Button component={Link} to={`/restaurants/${restaurantId}/reserve`}>
                            {t('bookTable')}
                        </Button>
                    )}
                </Box>
            </Paper>

            {/* If QR ordering is enabled, you might show table info. Otherwise, you don't. */}
            {restaurant.qrCodeOrderingEnabled && tableNumber && (
                <Alert severity="info">
                    {t('orderingForTable')} #{tableNumber}
                </Alert>
            )}

            <Grid container spacing={4}>
                {/* Menu Items Column */}
                <Grid item xs={12} md={8}>
                    <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                        <RestaurantMenuIcon sx={{ mr: 1 }} /> {t('menu')}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    {menu.length > 0 ? menu.map(item => (
                        <Paper key={item.id} elevation={0} sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #eee', borderRadius: 2 }}>
                            <Box>
                                <Typography variant="h6">{item.name}</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ my: 1 }}>{item.description}</Typography>
                                <Typography variant="h6" color="primary.main" fontWeight="bold">${item.price.toFixed(2)}</Typography>
                            </Box>
                            <Button variant="outlined" startIcon={<AddShoppingCartIcon />} onClick={() => handleAddToCart(item)}>
                                {t('add')}
                            </Button>
                        </Paper>
                    )) : (
                        <Typography>This restaurant has not added any menu items yet.</Typography>
                    )}
                </Grid>

                {/* Cart Column */}
                <Grid item xs={12} md={4}>
                    <Cart />
                </Grid>
            </Grid>
        </Container>
    );
}

export default MenuPage;