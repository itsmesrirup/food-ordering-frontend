import React from 'react';
import { Outlet, Link as RouterLink } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Box, Link } from '@mui/material';
import { useCart } from '../context/CartContext'; 
import LanguageSwitcher from '../components/LanguageSwitcher';

function MainLayout() {
    // Access the current restaurant from the cart context.
    const { currentRestaurant } = useCart(); 

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <AppBar position="static" color="default" elevation={1} sx={{ backgroundColor: 'white' }}>
                <Container maxWidth="lg">
                    <Toolbar disableGutters sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        
                        {/* --- SMART BRANDING LOGIC --- */}
                        {currentRestaurant ? (
                            // CASE A: User is in a restaurant context (Checkout/Confirmation) -> Show Restaurant Brand
                            <Link component={RouterLink} to={`/restaurants/${currentRestaurant.id}`} color="inherit" underline="none" sx={{ display: 'flex', alignItems: 'center' }}>
                                {currentRestaurant.logoUrl && (
                                    <img src={currentRestaurant.logoUrl} alt={currentRestaurant.name} style={{ height: '40px', marginRight: '10px' }} />
                                )}
                                <Typography variant="h6" fontWeight="bold" color="primary">
                                    {currentRestaurant.name}
                                </Typography>
                            </Link>
                        ) : (
                            // CASE B: User is on the Landing Page (No context) -> Show Tablo Brand
                            <Link component={RouterLink} to="/" color="inherit" underline="none">
                                <Typography variant="h5" fontWeight="bold" sx={{ fontFamily: '"Playfair Display", serif' }}>
                                    Tablo
                                </Typography>
                            </Link>
                        )}

                        <LanguageSwitcher mode="dark" />
                    </Toolbar>
                </Container>
            </AppBar>
            
            <Box component="main" sx={{ flexGrow: 1, py: 4 }}>
                <Outlet />
            </Box>
        </Box>
    );
}

export default MainLayout;