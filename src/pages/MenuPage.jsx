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

// --- Reusable Sub-components for a Cleaner Layout ---

const MenuItemCard = ({ item, onAddToCart, t }) => (
    <Paper elevation={0} sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #eee', borderRadius: 2 }}>
        <Box>
            <Typography variant="h6">{item.name}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ my: 1 }}>{item.description}</Typography>
            <Typography variant="h6" color="primary.main" fontWeight="bold">${item.price.toFixed(2)}</Typography>
        </Box>
        {/* We can add the isAvailable check here from a previous feature discussion */}
        <Button variant="outlined" startIcon={<AddShoppingCartIcon />} onClick={() => onAddToCart(item)}>
            {t('add')}
        </Button>
    </Paper>
);

const MenuCategory = ({ category, onAddToCart, t }) => (
    <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>{category.name}</Typography>
        <Divider sx={{ mb: 2 }} />
        
        {category.menuItems && category.menuItems.map(item => (
            <MenuItemCard key={item.id} item={item} onAddToCart={onAddToCart} t={t} />
        ))}

        {category.subCategories && category.subCategories.length > 0 && (
            <Box sx={{ pl: { xs: 2, md: 4 }, mt: 2 }}>
                {category.subCategories.map(subCategory => (
                    <MenuCategory key={subCategory.id} category={subCategory} onAddToCart={onAddToCart} t={t} />
                ))}
            </Box>
        )}
    </Box>
);

// --- Main Page Component ---

function MenuPage() {
    const { t } = useTranslation();
    const [restaurant, setRestaurant] = useState(null);
    const [categorizedMenu, setCategorizedMenu] = useState([]); // Changed from 'menu'
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
                setCategorizedMenu(menuData); // Set the categorized menu
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
            {/* The "All Restaurants" button is removed for the white-label experience */}

            {tableNumber && restaurant.qrCodeOrderingEnabled && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    {t('orderingForTable')} #{tableNumber}
                </Alert>
            )}
            
            <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                        <Typography variant="h4" component="h1" gutterBottom>{restaurant.name}</Typography>
                        <Typography variant="subtitle1" color="text.secondary">{restaurant.address}</Typography>
                    </Box>
                    {restaurant.reservationsEnabled && (
                        <Button component={Link} to={`/restaurants/${restaurantId}/reserve`} variant="outlined" startIcon={<EventIcon />}>
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
                    {categorizedMenu.length > 0 ? (
                        categorizedMenu.map(category => (
                            <MenuCategory key={category.id} category={category} onAddToCart={handleAddToCart} t={t} />
                        ))
                    ) : (
                        <Typography>This restaurant has not added any menu categories yet.</Typography>
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