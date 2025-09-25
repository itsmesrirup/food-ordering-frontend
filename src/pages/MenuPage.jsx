import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Cart from '../components/Cart';
import CustomizeItemModal from '../components/CustomizeItemModal';
import { useRestaurant } from '../layouts/RestaurantLayout';
import { Container, Typography, Grid, Paper, Button, CircularProgress, Box, Divider, Alert } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import SpecialsBoard from '../components/SpecialsBoard';
import EventIcon from '@mui/icons-material/Event';
import { toast } from 'react-hot-toast';

function MenuPage() {
    const { restaurant } = useRestaurant();
    const theme = useTheme();
    const { t } = useTranslation();
    const { restaurantId } = useParams();
    const { addToCart, setCartContext, updateCartItem, cartItems } = useCart();
    
    const [categorizedMenu, setCategorizedMenu] = useState([]);
    const [isLoadingMenu, setIsLoadingMenu] = useState(true);

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

    const MenuItemCard = ({ item }) => (
        <Paper elevation={2} sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 2 }}>
            <Box>
                <Typography variant="h6">{item.name}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ my: 1 }}>{item.description}</Typography>
                <Typography variant="h6" color="primary" fontWeight="bold">${item.price.toFixed(2)}</Typography>
            </Box>
            <Button 
                variant="outlined" 
                color="secondary" 
                startIcon={<AddShoppingCartIcon />} 
                onClick={() => item.bundle ? handleCustomizeClick(item) : handleAddToCart(item)} 
                disabled={!item.isAvailable}
            >
                {item.isAvailable ? (item.bundle ? t('customize') : t('add')) : t('unavailable')}
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
                            categorizedMenu.map(category => <MenuCategory key={category.id} category={category} />)
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