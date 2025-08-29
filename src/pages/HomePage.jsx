import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Import MUI components for a rich UI
import { 
    Container, 
    Grid, 
    Card, 
    CardMedia,
    CardContent, 
    CardActions, 
    Typography, 
    Button,
    CircularProgress, // A loading spinner
    Box // A helper for layout
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'; // An icon for the button

function HomePage() {
    const [restaurants, setRestaurants] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                // Fetch data from your public backend endpoint
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/restaurants`);

                if (!response.ok) {
                    throw new Error('Network response was not ok. Please try again later.');
                }
                const data = await response.json();
                setRestaurants(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchRestaurants();
    }, []); // Empty dependency array means this runs only once on mount

    // --- Render Logic ---

    if (isLoading) {
        return (
            // Centered loading spinner for a good initial user experience
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }
    
    if (error) {
        return (
            <Container>
                <Typography color="error" align="center" sx={{ mt: 4 }}>
                    Error: {error}
                </Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}> {/* py adds vertical padding */}
            <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 6, fontWeight: 'bold' }}>
                Découvrez les saveurs de Strasbourg
            </Typography>
            <Grid container spacing={4}>
                {restaurants.map((restaurant, index) => (
                    <Grid item key={restaurant.id} xs={12} sm={6} md={4}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <CardMedia
                                component="img"
                                height="180"
                                // Using a unique, visually appealing placeholder image for each card
                                image={`https://picsum.photos/seed/${restaurant.id}/600/400`}
                                alt={restaurant.name}
                            />
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography gutterBottom variant="h5" component="h2">
                                    {restaurant.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {restaurant.address}
                                </Typography>
                            </CardContent>
                            <CardActions sx={{ p: 2 }}>
                                <Button 
                                    component={Link} 
                                    to={`/restaurants/${restaurant.id}`} 
                                    variant="contained" 
                                    fullWidth
                                    endIcon={<ArrowForwardIcon />}
                                >
                                    View Menu & Order
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
}

export default HomePage;