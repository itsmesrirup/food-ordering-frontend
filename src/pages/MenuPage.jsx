import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link as RouterLink, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Cart from '../components/Cart';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles';
import { lightTheme, darkTheme } from '../theme';
import { Container, Typography, Grid, Paper, Button, CircularProgress, Box, Divider, Alert, Link, CssBaseline } from '@mui/material';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import EventIcon from '@mui/icons-material/Event';
import { toast } from 'react-hot-toast';

// Inner component to render the main content
const MenuPageContent = ({ restaurant, categorizedMenu, isLoadingMenu }) => {
    const theme = useTheme();
    const { t } = useTranslation();
    const { addToCart } = useCart();
    const { restaurantId } = useParams();
    const [searchParams] = useSearchParams();
    const tableNumber = searchParams.get("table");

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
                    {category.subCategories.map(subCategory => <MenuCategory key={subCategory.id} category={category} />)}
                </Box>
            )}
        </Box>
    );

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 3 }}>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h4" component="h1" gutterBottom>{restaurant.name}</Typography>
                        <Typography variant="subtitle1" color="text.secondary">{restaurant.address}</Typography>
                    </Box>
                    {restaurant.reservationsEnabled && (
                        <Button component={RouterLink} to={`/restaurants/${restaurantId}/reserve`} variant="outlined" color="secondary" startIcon={<EventIcon />}>
                            {t('bookTable')}
                        </Button>
                    )}
                </Box>
            </Paper>

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
};

// Main wrapper component for the page
function MenuPage() {
    const { restaurantId } = useParams();
    const [theme, setTheme] = useState(null);
    const [restaurant, setRestaurant] = useState(null);
    const [categorizedMenu, setCategorizedMenu] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAllDataAndTheme = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/restaurants/${restaurantId}`);
                if (!response.ok) throw new Error("Restaurant data not found");
                const data = await response.json();
                setRestaurant(data);

                if (data.useDarkTheme) {
                    let customTheme = { ...darkTheme };
                    if (data.themePrimaryColor) customTheme.palette.primary.main = data.themePrimaryColor;
                    if (data.themeSecondaryColor) customTheme.palette.secondary.main = data.themeSecondaryColor;
                    setTheme(createTheme(customTheme));
                } else {
                    let customTheme = { ...lightTheme };
                    if (data.themePrimaryColor) customTheme.palette.primary.main = data.themePrimaryColor;
                    if (data.themeSecondaryColor) customTheme.palette.secondary.main = data.themeSecondaryColor;
                    setTheme(createTheme(customTheme));
                }

                const menuResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/restaurants/${restaurantId}/menu`);
                const menuData = await menuResponse.json();
                setCategorizedMenu(menuData);
            } catch (error) {
                toast.error(error.message);
                setTheme(lightTheme);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAllDataAndTheme();
    }, [restaurantId]);

    if (isLoading || !theme) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <header>
                <Box sx={{ p: 2, backgroundColor: 'primary.main', color: theme.palette.getContrastText(theme.palette.primary.main) }}>
                    <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Link component={RouterLink} to={`/restaurants/${restaurantId}`} color="inherit" underline="none">
                            {restaurant.logoUrl ? (
                                <img src={restaurant.logoUrl} alt={`${restaurant.name} logo`} style={{ height: '40px', display: 'block' }} />
                            ) : (
                                <Typography variant="h6">{restaurant.name}</Typography>
                            )}
                        </Link>
                        <LanguageSwitcher />
                    </Container>
                </Box>
            </header>
            <MenuPageContent restaurant={restaurant} categorizedMenu={categorizedMenu} isLoadingMenu={false} />
        </ThemeProvider>
    );
}

export default MenuPage;