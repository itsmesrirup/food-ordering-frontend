import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Tabs, Tab, Grid, CircularProgress, Button, AppBar } from '@mui/material';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion'; // --- IMPORT ANIMATION ---
import PublicMenuItemCard from './PublicMenuItemCard';

// --- Helper to Render Recursive Categories ---
const CategoryRenderer = ({ category, currency }) => {
    const hasDirectItems = category.menuItems && category.menuItems.length > 0;
    const hasSubcategories = category.subCategories && category.subCategories.length > 0;

    if (!hasDirectItems && !hasSubcategories) return null;

    return (
        <Box sx={{ mb: 6 }}>
            {/* Subcategory Title */}
            <Typography variant="h5" sx={{ 
                fontFamily: '"Playfair Display", serif', 
                mb: 3, mt: 4, 
                fontWeight: 'bold', 
                color: '#444',
                borderLeft: '3px solid #d32f2f',
                pl: 2
            }}>
                {category.name}
            </Typography>

            {/* Render Items in a SINGLE COLUMN for perfect alignment */}
            {hasDirectItems && (
                <Box> 
                    {category.menuItems.map(item => (
                        // No Grid here, just a stack of items.
                        // This ensures the width is 100% and dots calculate correctly.
                        <PublicMenuItemCard key={item.id} item={item} currency={currency} />
                    ))}
                </Box>
            )}

            {/* Recursion */}
            {hasSubcategories && (
                <Box sx={{ pl: { md: 4 } }}> {/* Indent subcategories slightly on desktop */}
                    {category.subCategories.map(subCat => (
                        <CategoryRenderer key={subCat.id} category={subCat} currency={currency} />
                    ))}
                </Box>
            )}
        </Box>
    );
};

const MenuPreviewBlock = ({ restaurant }) => {
    const { t } = useTranslation();
    const [menuData, setMenuData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/restaurants/${restaurant.id}/menu`);
                if (!response.ok) throw new Error('Failed to load menu');
                const data = await response.json();
                setMenuData(data);
            } catch (error) {
                console.error("Failed to load menu", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMenu();
    }, [restaurant.id]);

    const handleTabChange = (event, newValue) => setActiveTab(newValue);

    if (loading) return <Box sx={{ py: 10, textAlign: 'center' }}><CircularProgress /></Box>;
    if (!menuData.length) return null;

    const currentCategory = menuData[activeTab];

    return (
        <Box sx={{ py: 10, backgroundColor: '#fff', minHeight: '600px', position: 'relative' }}>
            <Container maxWidth="md">
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    whileInView={{ opacity: 1, y: 0 }} 
                    viewport={{ once: true }}
                >
                    <Typography variant="h2" align="center" sx={{ fontFamily: '"Playfair Display", serif', mb: 2 }}>
                        {t('ourMenu')}
                    </Typography>
                    <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 6, maxWidth: 600, mx: 'auto', fontFamily: '"Lato"' }}>
                        {t('menuSubtitle')}
                    </Typography>
                </motion.div>

                {/* Tabs */}
                <AppBar 
                    position="sticky" 
                    color="default" 
                    elevation={0} // Flat look to blend in
                    sx={{ 
                        // Stick 60px from the top to account for the main website navigation bar
                        top: '56px', 
                        mb: 6, 
                        backgroundColor: '#fff', // Match page background
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        zIndex: 10 // Ensure it sits above content but below main nav (which is usually zIndex 1100+)
                    }}
                >
                    <Tabs 
                        value={activeTab} 
                        onChange={handleTabChange} 
                        variant="scrollable" 
                        scrollButtons="auto"
                        textColor="primary"
                        indicatorColor="primary"
                        sx={{ 
                            '& .MuiTab-root': { fontFamily: '"Lato", sans-serif', fontWeight: 700, fontSize: '1rem' },
                            // Center the tabs container
                            '& .MuiTabs-flexContainer': { justifyContent: { sm: 'center' } }
                        }}
                    >
                        {menuData.map((cat, index) => (
                            <Tab key={cat.id} label={cat.name} />
                        ))}
                    </Tabs>
                </AppBar>

                {/* Animated Content Area */}
                <Box sx={{ maxWidth: '100%', overflow: 'visible' }}>
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                            {/* Direct Items of Top Category */}
                            {currentCategory.menuItems && currentCategory.menuItems.length > 0 && (
                                <Box sx={{ mb: 4 }}>
                                    {currentCategory.menuItems.map(item => (
                                        <PublicMenuItemCard key={item.id} item={item} currency={restaurant.currency} />
                                    ))}
                                </Box>
                            )}

                            {/* Subcategories */}
                            {currentCategory.subCategories?.map(subCat => (
                                <CategoryRenderer key={subCat.id} category={subCat} currency={restaurant.currency} />
                            ))}
                        </motion.div>
                    </AnimatePresence>
                </Box>

                {/* Footer Button */}
                <Box sx={{ textAlign: 'center', mt: 8 }}>
                     <Button 
                        component={Link} 
                        to={`/restaurants/${restaurant.id}`}
                        variant="contained" 
                        size="large"
                        sx={{ 
                            borderRadius: 50, 
                            px: 5, py: 1.5, 
                            textTransform: 'none', 
                            fontSize: '1.1rem',
                            backgroundColor: '#222',
                            '&:hover': { backgroundColor: '#444' }
                        }}
                    >
                        {t('viewFullMenu')}
                    </Button>
                </Box>
            </Container>
        </Box>
    );
};

export default MenuPreviewBlock;