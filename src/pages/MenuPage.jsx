import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Cart from '../components/Cart';
import CustomizeItemModal from '../components/CustomizeItemModal';
import { useRestaurant } from '../layouts/RestaurantLayout';
import { Container, Typography, Grid, Paper, Button, CircularProgress, Box, Divider, Card, CardMedia, AppBar, Tabs, Tab, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SpecialsBoard from '../components/SpecialsBoard';
import EventIcon from '@mui/icons-material/Event';
import { toast } from 'react-hot-toast';
import { formatPrice } from '../utils/formatPrice';

// --- MenuItemCard (Unchanged) ---
const MenuItemCard = React.memo(({ item, restaurant, justAddedItemId, onAddToCart, onCustomizeClick, t, theme }) => {
    const isJustAdded = justAddedItemId === item.id;

    return (
        <Card elevation={2} sx={{ 
            mb: 2, 
            display: 'flex', 
            borderRadius: 2,
            transition: 'all 0.2s ease-in-out',
            // Ensure card doesn't overflow its container
            width: '100%', 
            '&:hover': {
                transform: 'scale(1.01)', // Reduced scale slightly to prevent overflow jitter
                boxShadow: theme.shadows[4]
            }
        }}>
            {item.imageUrl && (
                <CardMedia
                    component="img"
                    sx={{ width: 100, height: 'auto', objectFit: 'cover', flexShrink: 0 }} // Fixed width 100px
                    image={item.imageUrl}
                    alt={item.name}
                />
            )}
            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: 0 }}>
                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontSize: '1.1rem', lineHeight: 1.2 }}>{item.name}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ my: 0.5, fontSize: '0.85rem' }}>{item.description}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    <Typography variant="subtitle1" color="primary" fontWeight="bold">
                        {formatPrice(item.price, restaurant?.currency)}
                    </Typography>
                    <Button 
                        variant={isJustAdded ? "contained" : "outlined"}
                        color={isJustAdded ? "success" : "secondary"}
                        size="small"
                        startIcon={isJustAdded ? <CheckCircleOutlineIcon /> : <AddShoppingCartIcon />} 
                        onClick={() => !isJustAdded && (item.bundle ? onCustomizeClick(item) : onAddToCart(item))} 
                        disabled={!item.isAvailable || isJustAdded}
                        sx={{ minWidth: '90px', px: 1 }}
                    >
                        {isJustAdded ? t('added') : (item.isAvailable ? (item.bundle ? t('customize') : t('add')) : t('unavailable'))}
                    </Button>
                </Box>
            </Box>
            {!item.isAvailable && (
                <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "rgba(255,255,255,0.6)" }}>
                    <Chip label={t("soldOut")} color="error" />
                </Box>
            )}
        </Card>
    );
});

// --- MenuCategory (Unchanged) ---
const MenuCategory = React.forwardRef(({ category, ...menuItemCardProps }, ref) => (
    <Box ref={ref} sx={{ mb: 5, scrollMarginTop: '140px' }} id={`category-${category.id}`}>
        <Typography 
            variant="h5" 
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
            <Box sx={{ pl: { xs: 1, md: 4 }, mt: 4 }}>
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
    const [justAddedItemId, setJustAddedItemId] = useState(null);

    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [currentItem, setCurrentItem] = useState(null);
    const [editingCartIndex, setEditingCartIndex] = useState(null);

    const [activeTab, setActiveTab] = useState(0);
    const categoryRefs = useRef([]);
    const isTabClickScroll = useRef(false);

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
                categoryRefs.current = menuData.map((_, i) => categoryRefs.current[i] || React.createRef());
            } catch (error) { toast.error(error.message); } 
            finally { setIsLoadingMenu(false); }
        };

        if (restaurant) {
            fetchMenu();
        }
    }, [restaurantId, restaurant, setCartContext]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (isTabClickScroll.current) return;
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const index = categoryRefs.current.findIndex(ref => ref.current === entry.target);
                        if (index !== -1) setActiveTab(index);
                    }
                });
            },
            { rootMargin: '-15% 0px -70% 0px', threshold: 0 }
        );

        categoryRefs.current.forEach(ref => {
            if (ref.current) observer.observe(ref.current);
        });

        return () => {
            categoryRefs.current.forEach(ref => {
                if (ref.current) observer.unobserve(ref.current);
            });
        };
    }, [categorizedMenu]);

    const handleAddToCart = (item) => {
        addToCart(item);
        setJustAddedItemId(item.id);
        setTimeout(() => { setJustAddedItemId(null); }, 1500);
        toast.success(t('itemAddedToCart', { itemName: item.name }));
        setModalOpen(false);
    };

    const handleCustomizeClick = (item) => {
        setCurrentItem(item);
        setModalMode('add');
        setEditingCartIndex(null);
        setModalOpen(true);
    };

    const handleCustomizeEdit = (cartIndex) => {
        setCurrentItem(cartItems[cartIndex]);
        setModalMode('edit');
        setEditingCartIndex(cartIndex);
        setModalOpen(true);
    };

    const handleEditSave = (item) => {
        updateCartItem(editingCartIndex, item);
        toast.success(t('cartItemUpdated', { itemName: item.name }));
        setModalOpen(false);
        setEditingCartIndex(null);
    };

    const handleTabChange = (event, newValue) => {
        isTabClickScroll.current = true;
        setActiveTab(newValue);
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }

        const targetRef = categoryRefs.current[newValue];
        if (targetRef && targetRef.current) {
            targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        setTimeout(() => { isTabClickScroll.current = false; }, 1000);
    };

    if (!restaurant) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4, pb: { xs: '100px', md: 4 } }}> 
            <SpecialsBoard />

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
                
                {/* --- LEFT COLUMN --- */}
                <Box sx={{ width: { xs: '100%', md: '65%' }, flexShrink: 0 }}>
                    
                    {/* --- THE STICKY BAR (FIXED) --- */}
                    {/* Removed negative margins and calc width to fix overflow */}
                    <AppBar 
                        position="sticky" 
                        color="default" 
                        elevation={1}
                        sx={{ 
                            top: 0, // Sticks to top of viewport
                            mb: 3,
                            backgroundColor: 'background.paper',
                            zIndex: 110, // Ensure it's above other content
                            borderRadius: 1 // Slight rounding for polish
                        }}
                    >
                         <Tabs
                            value={activeTab}
                            onChange={handleTabChange}
                            variant="scrollable"
                            scrollButtons="auto"
                            allowScrollButtonsMobile
                            aria-label="menu categories"
                        >
                            {categorizedMenu.map((category) => (
                                <Tab label={category.name} key={category.id} />
                            ))}
                        </Tabs>
                    </AppBar>

                    {isLoadingMenu ? <CircularProgress /> : (
                        categorizedMenu.length > 0 ? (
                            categorizedMenu.map((category, index) => (
                                <MenuCategory 
                                    key={category.id} 
                                    category={category}
                                    ref={categoryRefs.current[index]}
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

                {/* --- RIGHT COLUMN (CART) --- */}
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
                handleClose={() => setModalOpen(false)}
                menuItem={currentItem}
                onSave={modalMode === 'edit' ? handleEditSave : handleAddToCart}
                initialSelections={modalMode === 'edit' && currentItem?.selectedOptions ? currentItem.selectedOptions : null}
                isEditing={modalMode === 'edit'}
            />
        </Container>
    );
}

export default MenuPage;