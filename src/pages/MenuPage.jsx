import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Cart from '../components/Cart';
import { Container, Typography, Grid, Paper, Button, CircularProgress, Box, Divider, Alert } from '@mui/material';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import EventIcon from '@mui/icons-material/Event';
import { toast } from 'react-hot-toast';
import { useTheme } from '@mui/material/styles';

function MenuPage() {
    const theme = useTheme();
    const { t } = useTranslation();
    const { restaurantId } = useParams();
    const [restaurant, setRestaurant] = useState(null);
    const [categorizedMenu, setCategorizedMenu] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { addToCart } = useCart();
    const [searchParams] = useSearchParams();
    const tableNumber = searchParams.get("table");

    const MenuItemCard = ({ item, onAddToCart }) => (
        <Paper elevation={0} sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #eee', borderRadius: 2, opacity: item.isAvailable ? 1 : 0.4 }}>
            <Box>
                <Typography variant="h6">{item.name}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ my: 1 }}>{item.description}</Typography>
                <Typography variant="h6" sx={{ color: theme.palette.primary.main }} fontWeight="bold">${item.price.toFixed(2)}</Typography>
            </Box>
            <Button variant="outlined" startIcon={<AddShoppingCartIcon />} onClick={() => onAddToCart(item)} disabled={!item.isAvailable} sx={{ borderColor: theme.palette.primary.main, color: theme.palette.primary.main }}>
                {item.isAvailable ? t('add') : t('unavailable')}
            </Button>
        </Paper>
    );

    const MenuCategory = ({ category, onAddToCart }) => (
        <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom>{category.name}</Typography>
            <Divider sx={{ mb: 2 }} />
            {category.menuItems?.map(item => <MenuItemCard key={item.id} item={item} onAddToCart={onAddToCart} />)}
            {category.subCategories?.length > 0 && (
                <Box sx={{ pl: { xs: 2, md: 4 }, mt: category.menuItems?.length > 0 ? 4 : 0 }}>
                    {category.subCategories.map(subCategory => <MenuCategory key={subCategory.id} category={subCategory} onAddToCart={onAddToCart} />)}
                </Box>
            )}
        </Box>
    );

    useEffect(() => {
        const fetchPageData = async () => {
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
                setCategorizedMenu(menuData);
            } catch (error) {
                toast.error(error.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPageData();
    }, [restaurantId]);

    const handleAddToCart = (item) => {
        addToCart(item);
        toast.success(t('itemAddedToCart', { itemName: item.name }));
    };

    if (isLoading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
    }

    if (!restaurant) {
        return <Typography align="center" sx={{ mt: 4 }}>{t('restaurantNotFound')}</Typography>; // Add a key for this
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 3 }}>
                    {restaurant.logoUrl && <img src={restaurant.logoUrl} alt={`${restaurant.name} logo`} style={{ height: '80px', width: 'auto', objectFit: 'contain' }} />}
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h4" component="h1" gutterBottom>{restaurant.name}</Typography>
                        <Typography variant="subtitle1" color="text.secondary">{restaurant.address}</Typography>
                    </Box>
                    {restaurant.reservationsEnabled && (
                        <Button component={Link} to={`/restaurants/${restaurantId}/reserve`} variant="outlined" startIcon={<EventIcon />} sx={{ borderColor: theme.palette.secondary.main, color: theme.palette.secondary.main }}>
                            {t('bookTable')}
                        </Button>
                    )}
                </Box>
            </Paper>

            {tableNumber && restaurant.qrCodeOrderingEnabled && (
                <Alert severity="info" sx={{ mb: 2 }}>{t('orderingForTable')} #{tableNumber}</Alert>
            )}

            <Grid container spacing={4}>
                <Grid item xs={12} md={8}>
                    <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                        <RestaurantMenuIcon sx={{ mr: 1 }} /> {t('menu')}
                    </Typography>
                    {categorizedMenu.length > 0 ? (
                        categorizedMenu.map(category => <MenuCategory key={category.id} category={category} onAddToCart={handleAddToCart} />)
                    ) : (
                        <Typography>{t('noMenuCategoriesYet')}</Typography> // Add a key for this
                    )}
                </Grid>
                <Grid item xs={12} md={4}>
                    <Cart />
                </Grid>
            </Grid>
        </Container>
    );
}

export default MenuPage;