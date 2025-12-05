import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';

// --- Import ALL Blocks ---
import HeroBlock from '../components/website/HeroBlock';
import StoryBlock from '../components/website/StoryBlock';
import MenuPreviewBlock from '../components/website/MenuPreviewBlock';
import QrPromoBlock from '../components/website/QrPromoBlock';
import ReservationBlock from '../components/website/ReservationBlock';
import InfoBlock from '../components/website/InfoBlock';
import SocialMediaBlock from '../components/website/SocialMediaBlock';
import WebsiteNavigation from '../components/website/WebsiteNavigation';

function RestaurantWebsitePage() {
    const { t } = useTranslation();
    const { slug } = useParams();
    const [restaurant, setRestaurant] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRestaurantData = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/public/restaurants/by-slug/${slug}`);
                if (!response.ok) throw new Error(t('restaurantNotFound'));
                const data = await response.json();
                setRestaurant(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchRestaurantData();
    }, [slug, t]);

    if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;
    if (error) return <Typography variant="h5" align="center" sx={{ p: 5 }}>{error}</Typography>;
    if (!restaurant) return null;

    return (
        <>
            <title>{restaurant.metaTitle || restaurant.name}</title>
            <meta name="description" content={restaurant.metaDescription || `Order online from ${restaurant.name}.`} />
            <meta property="og:title" content={restaurant.metaTitle || restaurant.name} />
            <meta property="og:description" content={restaurant.metaDescription || `Order online from ${restaurant.name}.`} />
            <meta property="og:image" content={restaurant.heroImageUrl || restaurant.logoUrl} />

            {/* 1. THE NAVIGATION BAR */}
            <WebsiteNavigation restaurantName={restaurant.name} />
            
            <Box sx={{ backgroundColor: '#fff', minHeight: '100vh', overflowX: 'hidden' }}>
                
                {/* 2. Hero */}
                <div id="home"><HeroBlock restaurant={restaurant} /></div>

                {/* 3. Story */}
                <div id="about">
                    <StoryBlock 
                        title={t('aboutUs')} 
                        text={restaurant.aboutUsText} 
                        image={restaurant.heroImageUrl}
                        // --- ADD THIS ---
                        galleryImages={restaurant.galleryImageUrls} 
                    />
                </div>

                {/* 4. Menu Preview (New) */}
                <div id="menu"><MenuPreviewBlock restaurant={restaurant} /></div>

                {/* 5. QR Code Promo (New) */}
                <div id="qrcode"><QrPromoBlock restaurant={restaurant} /></div>

                {/* 6. Reservation CTA (New) */}
                <div id="reservation"><ReservationBlock restaurant={restaurant} /></div>

                {/* 7. Social Media Block (NEW) */}
                <div id="social"><SocialMediaBlock restaurant={restaurant} /></div>

                {/* 8. Info (Hours/Contact) */}
                <div id="contact"><InfoBlock restaurant={restaurant} /></div>

                {/* 9. Map */}
                <div id="maps">
                    {restaurant.googleMapsUrl && (
                        <Box sx={{ height: '450px', width: '100%', filter: 'grayscale(20%)' }}>
                            <iframe
                                src={restaurant.googleMapsUrl}
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Restaurant Location"
                            ></iframe>
                        </Box>
                    )}
                </div>
            </Box>
        </>
    );
}

export default RestaurantWebsitePage;