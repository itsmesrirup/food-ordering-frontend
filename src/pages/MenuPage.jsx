import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Cart from '../components/Cart';

// Import MUI components
import { 
    Container, 
    Typography, 
    Grid, 
    Paper, 
    Button, 
    CircularProgress, 
    Box, 
    Divider,
    IconButton
} from '@mui/material';

// Import MUI Icons
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { toast } from 'react-hot-toast';

function MenuPage() {
    const [restaurant, setRestaurant] = useState(null);
    const [menu, setMenu] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { restaurantId } = useParams();
    const { addToCart } = useCart();

    useEffect(() => {
        const fetchMenuData = async () => {
            setIsLoading(true);
            try {
                // Fetch both restaurant details and menu in parallel for speed
                const [resResponse, menuResponse] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/restaurants/${restaurantId}`),
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/restaurants/${restaurantId}/menu`)
                ]);

                if (!resResponse.ok || !menuResponse.ok) {
                    throw new Error("Failed to load restaurant data.");
                }

                const resData = await resResponse.json();
                const menuData = await menuResponse.json();
                
                setRestaurant(resData);
                setMenu(menuData);
            } catch (error) {
                console.error("Failed to fetch menu data:", error);
                toast.error(error.message);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchMenuData();
    }, [restaurantId]);

    const handleAddToCart = (item) => {
        addToCart(item);
        toast.success(`${item.name} added to cart!`);
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!restaurant) {
        return <Typography align="center" sx={{ mt: 4 }}>Restaurant not found.</Typography>
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Button component={Link} to="/" startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
                All Restaurants
            </Button>
            
            <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 4 }}>
                <Typography variant="h4" gutterBottom>{restaurant.name}</Typography>
                <Typography variant="subtitle1" color="text.secondary">{restaurant.address}</Typography>
            </Paper>

            <Grid container spacing={4}>
                {/* Menu Items Column */}
                <Grid item xs={12} md={8}>
                    <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                        <RestaurantMenuIcon sx={{ mr: 1 }} /> Menu
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
                                Add
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