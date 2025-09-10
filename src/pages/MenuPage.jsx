import React, {useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Cart from '../components/Cart';
import { useRestaurant } from '../layouts/RestaurantLayout';
import { Container, Typography, Grid, Paper, Button, CircularProgress, Box, Divider, Alert } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import EventIcon from '@mui/icons-material/Event';
import { toast } from 'react-hot-toast';

function MenuPage() {
    const { restaurant } = useRestaurant();
    const theme = useTheme();
    const { t } = useTranslation();
    const { restaurantId } = useParams();
    const { addToCart, setCartContext } = useCart();
    
    const [categorizedMenu, setCategorizedMenu] = useState([]);
    const [isLoadingMenu, setIsLoadingMenu] = useState(true);

    useEffect(() => {
        const fetchMenu = async () => {
            setIsLoadingMenu(true);
            try {
                const menuResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/restaurants/${restaurantId}/menu`);
                if (!menuResponse.ok) throw new Error("Failed to load menu");
                const menuData = await menuResponse.json();
                setCategorizedMenu(menuData);
            } catch (error) { toast.error(error.message); } 
            finally { setIsLoadingMenu(false); }
        };
        fetchMenu();
    }, [restaurantId]);

    // NEW useEffect to set the restaurant context for the cart
    useEffect(() => {
        if (restaurant) {
            setCartContext(restaurant);
        }
    }, [restaurant, setCartContext]);

    const handleAddToCart = (item) => {
        addToCart(item);
        toast.success(t('itemAddedToCart', { itemName: item.name }));
    };

    const MenuItemCard = ({ item }) => (
        <Paper elevation={2} sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 2 }}>
            <Box>
                <Typography variant="h6">{item.name}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ my: 1 }}>{item.description}</Typography>
                <Typography variant="h6" color="primary" fontWeight="bold">${item.price.toFixed(2)}</Typography>
            </Box>
            <Button variant="outlined" color="secondary" startIcon={<AddShoppingCartIcon />} onClick={() => handleAddToCart(item)} disabled={!item.isAvailable}>
                {item.isAvailable ? t('add') : t('unavailable')}
            </Button>
        </Paper>
    );

    const MenuCategory = ({ category }) => (
        <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom>{category.name}</Typography>
            <Divider sx={{ mb: 2 }} />
            {category.menuItems?.map(item => <MenuItemCard key={item.id} item={item} />)}
            {category.subCategories?.length > 0 && (
                <Box sx={{ pl: { xs: 2, md: 4 }, mt: category.menuItems?.length > 0 ? 4 : 0 }}>
                    {category.subCategories.map(subCategory => <MenuCategory key={subCategory.id} category={subCategory} />)}
                </Box>
            )}
        </Box>
    );

    // This is the guard clause that prevents the "Cannot destructure" error.
    if (!restaurant) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {/* ✅ NEW: Full-width Hero Image Banner */}
            {restaurant.heroImageUrl && (
                <Box
                    sx={{
                        height: '300px',
                        mb: 4,
                        borderRadius: 4,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundImage: `url(${restaurant.heroImageUrl})`,
                    }}
                />
            )}
            
            <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 3 }}>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h4" component="h1" gutterBottom>{restaurant.name}</Typography>
                        <Typography variant="subtitle1" color="text.secondary">{restaurant.address}</Typography>
                    </Box>
                    {restaurant.reservationsEnabled && (
                        <Button component={Link} to={`/restaurants/${restaurantId}/reserve`} variant="outlined" color="secondary" startIcon={<EventIcon />}>
                            {t('bookTable')}
                        </Button>
                    )}
                </Box>
            </Paper>

            <Grid container spacing={4}>
                <Grid item xs={12} md={8}>
                    <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                        <RestaurantMenuIcon sx={{ mr: 1 }} /> {t('menu')}
                    </Typography>
                    {isLoadingMenu ? <CircularProgress /> : (
                        categorizedMenu.length > 0 ? (
                            categorizedMenu.map(category => <MenuCategory key={category.id} category={category} />)
                        ) : (
                            <Typography>{t('noMenuCategoriesYet')}</Typography>
                        )
                    )}
                </Grid>
                <Grid item xs={12} md={4}><Cart /></Grid>
            </Grid>
        </Container>
    );
}

export default MenuPage;