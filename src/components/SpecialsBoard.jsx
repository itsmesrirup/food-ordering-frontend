import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRestaurant } from '../layouts/RestaurantLayout';
import { Paper, Typography, Box, CircularProgress, Grid, Divider } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { format } from 'date-fns'; 
import { fr, de, enUS } from 'date-fns/locale';
import StarIcon from '@mui/icons-material/Star';

const localeMap = { en: enUS, fr: fr, de: de };

const getTodayKey = () => {
    const days = ["DIMANCHE", "LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI", "SAMEDI"];
    return days[new Date().getDay()];
};

function SpecialsBoard() {
    const { t, i18n } = useTranslation();
    const theme = useTheme();
    const { restaurant } = useRestaurant();
    const [activeMenu, setActiveMenu] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const todayKey = getTodayKey();

    useEffect(() => {
        const fetchActiveSpecialMenu = async () => {
            if (!restaurant || !restaurant.id) return;
            setIsLoading(true);
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/special-menus/restaurant/${restaurant.id}/active`);
                if (response.ok) {
                    const data = await response.json();
                    const dayOrder = { "LUNDI": 1, "MARDI": 2, "MERCREDI": 3, "JEUDI": 4, "VENDREDI": 5, "SAMEDI": 6, "DIMANCHE": 7 };
                    if (data.items) {
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
    }, [restaurant]);

    const formatDateRange = (start, end) => {
        try {
            const currentLocale = localeMap[i18n.language] || enUS;
            const startDate = new Date(start + 'T00:00:00');
            const endDate = new Date(end + 'T00:00:00');
            const formattedStart = format(startDate, 'dd');
            const formattedEnd = format(endDate, 'dd MMMM yyyy', { locale: currentLocale });
            return t('dateRangeFromTo', { startDate: formattedStart, endDate: formattedEnd });
        } catch (e) { 
            return null; 
        }
    };

    if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress size={24} /></Box>;
    
    // Only show if there is an active menu AND it has items
    if (!activeMenu || !activeMenu.items || activeMenu.items.length === 0) {
        return null;
    }

    return (
        <Paper elevation={3} sx={{ 
            mb: 4, 
            borderRadius: 4, 
            overflow: 'hidden', 
            border: activeMenu.themeColor ? `2px solid ${activeMenu.themeColor}` : 'none'
        }}>
            
            {/* IF A BANNER IMAGE EXISTS, DISPLAY IT HERE */}
            {activeMenu.bannerImageUrl ? (
                <Box sx={{ 
                    height: { xs: '150px', md: '250px' }, 
                    backgroundImage: `url('${activeMenu.bannerImageUrl}')`, // Added quotes to fix URL parsing
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    backgroundBlendMode: 'darken'
                }}>
                    {/* ✅ FIXED: Changed activeEvent to activeMenu */}
                    <Typography variant="h3" sx={{ color: activeMenu.themeColor || '#fff', fontWeight: 'bold', fontFamily: '"Playfair Display", serif', textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                        {activeMenu.title}
                    </Typography>
                </Box>
            ) : (
                /* Standard Text Header (If no image) */
                <Box sx={{ textAlign: 'center', p: { xs: 2, md: 4 } }}>
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
            )}

            {/* The Special Items Grid */}
            <Box sx={{ p: { xs: 2, md: 4 }, pt: activeMenu.bannerImageUrl ? 4 : 2 }}>
                {!activeMenu.bannerImageUrl && <Divider sx={{ mb: 3 }} />}
                <Grid container spacing={3} justifyContent="flex-start">
                    {activeMenu.items.map(item => {
                        const isToday = item.dayTitle.toUpperCase() === todayKey;
                        return (
                            <Grid item xs={12} sm={6} md={4} key={item.id}>
                                <Box sx={{
                                    p: 2,
                                    height: '100%',
                                    borderLeft: 4,
                                    borderColor: isToday ? (activeMenu.themeColor || 'secondary.main') : 'transparent',
                                    transform: isToday ? 'scale(1.02)' : 'none',
                                    transition: 'all 0.2s ease-in-out',
                                }}>
                                    <Typography variant="h6" component="h3" fontWeight="bold" sx={{ textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {isToday && <StarIcon fontSize="small" sx={{ color: activeMenu.themeColor || 'secondary.main' }} />}
                                        {item.dayTitle?.toLowerCase()}
                                    </Typography>
                                    <Divider sx={{ my: 1 }} />
                                    <Typography variant="body1" fontWeight={500} gutterBottom>{item.name}</Typography>
                                    <Typography variant="body2" color="text.secondary">{item.description}</Typography>
                                </Box>
                            </Grid>
                        );
                    })}
                </Grid>
            </Box>
        </Paper>
    );
}

export default SpecialsBoard;