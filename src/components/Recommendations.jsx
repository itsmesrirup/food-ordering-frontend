import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { Box, Typography, Button, CircularProgress, Paper } from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { toast } from 'react-hot-toast';

function Recommendations({ lastAddedItemId }) {
    const { t } = useTranslation();
    const { addToCart } = useCart();
    const [recommendations, setRecommendations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Don't fetch if there's no item to base recommendations on
        if (!lastAddedItemId) {
            setRecommendations([]);
            return;
        }

        const fetchRecommendations = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/analytics/recommendations/${lastAddedItemId}`);
                if (!response.ok) {
                    // Fail silently, recommendations are not critical
                    console.error("Failed to fetch recommendations");
                    setRecommendations([]);
                    return;
                }
                const data = await response.json();
                setRecommendations(data);
            } catch (error) {
                console.error("Error fetching recommendations:", error);
                setRecommendations([]); // Clear recommendations on error
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecommendations();
    }, [lastAddedItemId]); // Re-run this effect whenever a NEW item is added

    const handleAddToCart = (item) => {
        addToCart(item);
        toast.success(t('itemAddedToCart', { itemName: item.name }));
    };

    // Don't render anything if loading or if there are no recommendations
    if (isLoading || recommendations.length === 0) {
        return null;
    }

    return (
        <Paper elevation={2} sx={{ p: 2, mt: 3, backgroundColor: 'grey.100' }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Goes great with...
            </Typography>
            {recommendations.map(item => (
                <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 1 }}>
                    <Box>
                        <Typography variant="body2">{item.name}</Typography>
                        <Typography variant="body2" fontWeight="bold">${item.price.toFixed(2)}</Typography>
                    </Box>
                    <Button 
                        size="small" 
                        variant="outlined" 
                        color="secondary"
                        startIcon={<AddShoppingCartIcon />}
                        onClick={() => handleAddToCart(item)}
                    >
                        {t('add')}
                    </Button>
                </Box>
            ))}
        </Paper>
    );
}

export default Recommendations;