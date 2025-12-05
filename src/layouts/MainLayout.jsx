import React from 'react';
import { Outlet, Link as RouterLink } from 'react-router-dom';
import { Box, Container, Link, Typography, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { lightTheme } from '../theme';

function MainLayout() {
    // We use the standard light theme for the main layout (checkout, landing, etc.)
    const theme = createTheme(lightTheme);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                
                {/* --- HEADER --- */}
                <Box 
                    component="header" 
                    sx={{ 
                        py: 2, 
                        backgroundColor: 'primary.main', 
                        color: 'white',
                        boxShadow: 2
                    }}
                >
                    <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        
                        {/* Logo / Brand Link */}
                        <Link component={RouterLink} to="/" color="inherit" underline="none" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {/* If you have a platform logo, uncomment this: */}
                            {/* <img src="/tablo-logo.png" alt="Tablo Logo" style={{ height: '32px' }} /> */}
                            
                            {/* --- THIS IS THE FIX --- */}
                            {/* Hide the text on Mobile (xs), Show on Tablet+ (sm) */}
                            <Typography 
                                variant="h5" 
                                fontWeight="bold" 
                                sx={{ display: { xs: 'none', sm: 'block' } }}
                            >
                                Tablo
                            </Typography>
                            
                            {/* Optional: Show a shorter name or icon on mobile if you don't have an image logo */}
                            <Typography 
                                variant="h5" 
                                fontWeight="bold" 
                                sx={{ display: { xs: 'block', sm: 'none' } }}
                            >
                                T {/* Or an Icon */}
                            </Typography>
                        </Link>

                        {/* Language Switcher */}
                        <LanguageSwitcher />
                        
                    </Container>
                </Box>

                {/* --- MAIN CONTENT --- */}
                <Box component="main" sx={{ flexGrow: 1, py: 4, backgroundColor: '#f9f9f9' }}>
                    <Outlet />
                </Box>

                {/* --- FOOTER --- */}
                <Box component="footer" sx={{ py: 3, px: 2, mt: 'auto', backgroundColor: '#eee', textAlign: 'center' }}>
                    <Container maxWidth="lg">
                        <Typography variant="body2" color="text.secondary">
                            Online ordering powered by <strong>Tablo</strong>
                        </Typography>
                    </Container>
                </Box>
            </Box>
        </ThemeProvider>
    );
}

export default MainLayout;