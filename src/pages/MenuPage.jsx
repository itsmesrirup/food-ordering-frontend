import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Cart from '../components/Cart';
import RestaurantHeader from '../components/RestaurantHeader'; // ✅ Import the reusable header
import { useRestaurant } from '../layouts/RestaurantLayout';
import { Container, Typography, Grid, Paper, Button, CircularProgress, Box, Divider, Alert } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { toast } from 'react-hot-toast';

function MenuPage() {
    const { restaurant } = useRestaurant();
    const theme = useTheme();
    const { t } = useTranslation();
    const { restaurantId } = useParams();
    const { addToCart } = useCart();
    
    const [categorizedMenu, setCategorizedMenu] = useState([]);
    const [isLoadingMenu, setIsLoadingMenu] = useState(true);
    const [searchParams] = useSearchParams();
    const tableNumber = searchParams.get("table");

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

    // If the restaurant data hasn't been passed down from the layout yet,
    // show a loading spinner and wait.
    if (!restaurant) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
    }

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

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {/* ✅ Use the reusable header component. No more duplicated Paper. */}
            <RestaurantHeader restaurant={restaurant} />

            {tableNumber && restaurant.qrCodeOrderingEnabled && <Alert severity="info" sx={{ mb: 2 }}>{t('orderingForTable')} #{tableNumber}</Alert>}

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