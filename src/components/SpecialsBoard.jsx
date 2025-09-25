import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Paper, Typography, Box, CircularProgress, Grid, Divider } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { format, getDay } from 'date-fns'; // Import getDay
import { fr } from 'date-fns/locale';
import StarIcon from '@mui/icons-material/Star';

// Helper to get today's day key. Note: Sunday is 0 in JS, Lundi is 1.
// We'll align with a Monday=1 standard for clarity.
const getTodayKey = () => {
    const days = ["DIMANCHE", "LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI", "SAMEDI"];
    return days[new Date().getDay()];
};

function SpecialsBoard() {
    const theme = useTheme();
    const { restaurantId } = useParams();
    const [activeMenu, setActiveMenu] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const todayKey = getTodayKey();

    useEffect(() => {
        const fetchActiveSpecialMenu = async () => {
            if (!restaurantId) return;
            setIsLoading(true);
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/special-menus/restaurant/${restaurantId}/active`);
                if (response.ok) {
                    const data = await response.json();
                    
                    // ✅ THIS IS THE CORRECT SORTING LOGIC
                    const dayOrder = { "LUNDI": 1, "MARDI": 2, "MERCREDI": 3, "JEUDI": 4, "VENDREDI": 5, "SAMEDI": 6, "DIMANCHE": 7 };
                    if (data.items) {
                        // Use slice() to create a copy, then sort.
                        // Convert dayTitle to UPPERCASE to match the keys in dayOrder.
                        data.items = data.items.slice().sort((a, b) => dayOrder[a.dayTitle.toUpperCase()] - dayOrder[b.dayTitle.toUpperCase()]);
                    }
                    setActiveMenu(data);
                } else {
                    setActiveMenu(null); 
                }
            } catch (error) {
                console.error("Failed to load special menu", error);
                setActiveMenu(null);
            } finally {
                setIsLoading(false);
            }
        };
        fetchActiveSpecialMenu();
    }, [restaurantId]);

    const formatDateRange = (start, end) => {
        try {
            const startDate = new Date(start + 'T00:00:00'); // Add time to avoid timezone issues
            const endDate = new Date(end + 'T00:00:00');
            return `Du ${format(startDate, 'dd')} au ${format(endDate, 'dd MMMM yyyy', { locale: fr })}`;
        } catch (e) { return null; }
    };

    if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress size={24} /></Box>;
    if (!activeMenu || !activeMenu.items || activeMenu.items.length === 0) {
        return null;
    }

    return (
        <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 4 }}>
            <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom fontWeight="bold">
                    {activeMenu.title || 'Plats du Jour'}
                </Typography>
                {activeMenu.subtitle && <Typography variant="h6" color="text.secondary">{activeMenu.subtitle}</Typography>}
                {activeMenu.startDate && activeMenu.endDate && (
                    <Typography variant="h6" color="secondary.main" sx={{ my: 1, fontWeight: 'bold' }}>
                        {formatDateRange(activeMenu.startDate, activeMenu.endDate)}
                    </Typography>
                )}
            </Box>
            <Divider sx={{ my: 3 }} />
            <Grid container spacing={3} justifyContent="center">
                {activeMenu.items.map(item => {
                    const isToday = item.dayTitle.toUpperCase() === todayKey;
                    return (
                        <Grid item xs={12} sm={6} md={4} key={item.id}>
                            <Paper 
                                elevation={isToday ? 8 : 2}
                                sx={{ 
                                    p: 3, height: '100%',
                                    border: 2,
                                    borderColor: isToday ? 'secondary.main' : 'transparent',
                                    transform: isToday ? 'scale(1.03)' : 'none',
                                    transition: 'all 0.3s'
                                }}
                            >
                                <Typography variant="h6" component="h3" fontWeight="bold" sx={{ textTransform: 'capitalize', display: 'flex', alignItems: 'center' }}>
                                    {isToday && <StarIcon fontSize="small" sx={{ mr: 1, color: 'secondary.main' }} />}
                                    {item.dayTitle?.toLowerCase()}
                                </Typography>
                                <Divider sx={{ my: 1 }} />
                                <Typography variant="h6" gutterBottom>{item.name}</Typography>
                                <Typography variant="body2" color="text.secondary">{item.description}</Typography>
                            </Paper>
                        </Grid>
                    );
                })}
            </Grid>
        </Paper>
    );
}

export default SpecialsBoard;