import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Box, CircularProgress, Typography, Button } from '@mui/material';

import ClassicTemplate from './templates/ClassicTemplate';
import DarkEleganceTemplate from './templates/DarkEleganceTemplate';
import VibrantTemplate from './templates/VibrantTemplate';
import MinimalistTemplate from './templates/MinimalistTemplate';

function WebsiteRouter({ isCustomDomain }) {
    const { slug } = useParams();
    const [restaurant, setRestaurant] = useState(null);
    const [menuData, setMenuData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                let resResponse;
                
                // FETCH BY DOMAIN OR SLUG
                if (isCustomDomain) {
                    const domain = window.location.hostname;
                    resResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/public/restaurants/by-domain?domain=${domain}`);
                } else {
                    resResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/public/restaurants/by-slug/${slug}`);
                }

                if (!resResponse.ok) throw new Error("Not found");
                const resData = await resResponse.json();
                setRestaurant(resData);

                // Fetch Menu
                const menuResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/restaurants/${resData.id}/menu`);
                if (menuResponse.ok) {
                    const mData = await menuResponse.json();
                    setMenuData(mData);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [slug, isCustomDomain]);

    if (isLoading) return <Box sx={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}><CircularProgress /></Box>;
    if (!restaurant) return (
        <Box sx={{ textAlign: 'center', mt: 10 }}>
            <Typography variant="h4" gutterBottom>Restaurant Not Found</Typography>
            <Button component={Link} to="/" variant="contained">Go Home</Button>
        </Box>
    );

    // Pass BOTH restaurant and menuData to the templates
    switch (restaurant.websiteTheme) {
        case 'DARK_ELEGANCE': return <DarkEleganceTemplate restaurant={restaurant} menuData={menuData} />;
        case 'VIBRANT': return <VibrantTemplate restaurant={restaurant} menuData={menuData} />;
        case 'MINIMALIST': return <MinimalistTemplate restaurant={restaurant} menuData={menuData} />;
        case 'CLASSIC':
        default: return <ClassicTemplate restaurant={restaurant} menuData={menuData} />;
    }
}

export default WebsiteRouter;