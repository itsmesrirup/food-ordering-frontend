import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';

function LandingPage() {
    return (
        <Container maxWidth="md" sx={{ textAlign: 'center', mt: 8 }}>
            <Box>
                <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
                    Modern Online Ordering for Local Businesses
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                    This online ordering system is proudly powered by [Your Brand Name Here].
                </Typography>
                <Button 
                    variant="contained" 
                    href="mailto:itsmesrirup@gmail.com" // Link to your email
                >
                    Interested in our services? Contact Us
                </Button>
            </Box>
        </Container>
    );
}

export default LandingPage;