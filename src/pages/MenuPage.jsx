import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Cart from '../components/Cart';
import CustomizeItemModal from '../components/CustomizeItemModal';
import { useRestaurant } from '../layouts/RestaurantLayout';
import { Container, Typography, Grid, Paper, Button, CircularProgress, Box, Divider, Alert, Card, CardMedia } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SpecialsBoard from '../components/SpecialsBoard';
import EventIcon from '@mui/icons-material/Event';
import { toast } from 'react-hot-toast';
import { formatPrice } from '../utils/formatPrice';

// --- ADDED: MenuItemCard is now defined OUTSIDE MenuPage ---
// This prevents it from being redefined on every render, allowing React.memo to work correctly.
const MenuItemCard = React.memo(({ item, restaurant, justAddedItemId, onAddToCart, onCustomizeClick, t, theme }) => {
    const isJustAdded = justAddedItemId === item.id;

    return (
        <Card elevation={2} sx={{ 
            mb: 2, 
            display: 'flex', 
            borderRadius: 2,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
                transform: 'scale(1.02)',
                boxShadow: theme.shadows[4]
            }
        }}>
            {item.imageUrl && (
                <CardMedia
                    component="img"
                    sx={{ width: 120, height: 'auto', objectFit: 'cover', flexShrink: 0 }}
                    image={item.imageUrl}
                    alt={item.name}
                />
            )}
            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6">{item.name}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ my: 0.5 }}>{item.description}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    <Typography variant="h6" color="primary" fontWeight="bold">
                        {formatPrice(item.price, restaurant?.currency)}
                    </Typography>
                    <Button 
                        variant={isJustAdded ? "contained" : "outlined"}
                        color={isJustAdded ? "success" : "secondary"}
                        startIcon={isJustAdded ? <CheckCircleOutlineIcon /> : <AddShoppingCartIcon />} 
                        onClick={() => !isJustAdded && (item.bundle ? onCustomizeClick(item) : onAddToCart(item))} 
                        disabled={!item.isAvailable || isJustAdded}
                        sx={{ ml: 2, flexShrink: 0, minWidth: '110px' }}
                    >
                        {isJustAdded ? t('added') : (item.isAvailable ? (item.bundle ? t('customize') : t('add')) : t('unavailable'))}
                    </Button>
                </Box>
            </Box>
        </Card>
    );
});

// --- ADDED: MenuCategory is also defined OUTSIDE MenuPage ---
// It accepts all the props for MenuItemCard and passes them down.
const MenuCategory = React.memo(({ category, ...menuItemCardProps }) => (
    <Box sx={{ mb: 5 }}>
        <Typography 
            variant="h4" 
            gutterBottom 
            sx={{ 
                fontWeight: 'bold', 
                color: 'primary.main',
                textTransform: 'uppercase',
                borderBottom: `2px solid ${menuItemCardProps.theme.palette.secondary.light}`,
                pb: 1,
                mb: 3,
            }}
        >
            {category.name}
        </Typography>
        {category.menuItems?.map(item => <MenuItemCard key={item.id} item={item} {...menuItemCardProps} />)}
        {category.subCategories?.length > 0 && (
            <Box sx={{ pl: { xs: 2, md: 4 }, mt: category.menuItems?.length > 0 ? 4 : 0 }}>
                {category.subCategories.map(subCategory => <MenuCategory key={subCategory.id} category={subCategory} {...menuItemCardProps} />)}
            </Box>
        )}
    </Box>
));

function MenuPage() {
    const { restaurant } = useRestaurant();
    const theme = useTheme();
    const { t } = useTranslation();
    const { restaurantId } = useParams();
    const { addToCart, setCartContext, updateCartItem, cartItems } = useCart();
    
    const [categorizedMenu, setCategorizedMenu] = useState([]);
    const [isLoadingMenu, setIsLoadingMenu] = useState(true);

    // --- ADDED: State to track the ID of the item just added for UI feedback ---
    const [justAddedItemId, setJustAddedItemId] = useState(null);

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [currentItem, setCurrentItem] = useState(null);
    const [editingCartIndex, setEditingCartIndex] = useState(null);

    useEffect(() => {
        if (restaurant) {
            setCartContext(restaurant);
        }
        
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

        if (restaurant) {
            fetchMenu();
        }
    }, [restaurantId, restaurant, setCartContext]);

    const handleAddToCart = (item) => {
        addToCart(item);

        // --- ADDED: Set state for the micro-interaction and reset it after a delay ---
        setJustAddedItemId(item.id);
        setTimeout(() => {
            setJustAddedItemId(null);
        }, 1500); // 1.5 seconds

        toast.success(t('itemAddedToCart', { itemName: item.name }));
        setModalOpen(false);
    };

    // PATCH: open modal for add
    const handleCustomizeClick = (item) => {
        setCurrentItem(item);
        setModalMode('add');
        setEditingCartIndex(null);
        setModalOpen(true);
    };

    // PATCH: open modal for edit
    const handleCustomizeEdit = (cartIndex) => {
        setCurrentItem(cartItems[cartIndex]);
        setModalMode('edit');
        setEditingCartIndex(cartIndex);
        setModalOpen(true);
    };

    // PATCH: handle edit save
    const handleEditSave = (item) => {
        updateCartItem(editingCartIndex, item);
        toast.success(t('cartItemUpdated', { itemName: item.name }));
        setModalOpen(false);
        setEditingCartIndex(null);
    };

    if (!restaurant) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    }

    return (
        // Added pb (padding-bottom) to account for the floating mobile button
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4, pb: { xs: 10, md: 0 } }}> 
            {restaurant.heroImageUrl && (
                <Box sx={{ height: '300px', mb: 4, borderRadius: 4, backgroundSize: 'cover', backgroundPosition: 'center', backgroundImage: `url(${restaurant.heroImageUrl})` }} />
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

            <SpecialsBoard />

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
                {/* --- Main Content: Menu --- */}
                <Box sx={{ width: { xs: '100%', md: '65%' }, flexShrink: 0 }}>
                    <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                        <RestaurantMenuIcon sx={{ mr: 1 }} /> {t('menu')}
                    </Typography>
                    {isLoadingMenu ? <CircularProgress /> : (
                        categorizedMenu.length > 0 ? (
                            categorizedMenu.map(category => (
                                // --- CHANGED: Pass all the necessary props to the memoized MenuCategory component ---
                                <MenuCategory 
                                    key={category.id} 
                                    category={category}
                                    // Pass down all props needed by MenuItemCard
                                    restaurant={restaurant}
                                    justAddedItemId={justAddedItemId}
                                    onAddToCart={handleAddToCart}
                                    onCustomizeClick={handleCustomizeClick}
                                    t={t}
                                    theme={theme}
                                />
                            ))
                        ) : (
                            <Typography>{t('noMenuCategoriesYet')}</Typography>
                        )
                    )}
                </Box>

                {/* --- Sidebar: Cart --- */}
                {/* The Cart component itself now handles being a sidebar or a modal */}
                <Box sx={{ 
                    width: { xs: '100%', md: '35%' },
                    position: { md: 'sticky' },
                    top: { md: '20px' },
                    alignSelf: 'flex-start'
                }}>
                    <Cart onEditCartItem={handleCustomizeEdit} />
                </Box>
            </Box>
            <CustomizeItemModal
                open={modalOpen}
                handleClose={() => {
                    setModalOpen(false);
                    setEditingCartIndex(null);
                }}
                menuItem={currentItem}
                onSave={modalMode === 'edit' ? handleEditSave : handleAddToCart}
                initialSelections={
                    modalMode === 'edit' && currentItem?.selectedOptions
                        ? currentItem.selectedOptions
                        : null
                }
                isEditing={modalMode === 'edit'}
            />
        </Container>
    );
}

export default MenuPage;