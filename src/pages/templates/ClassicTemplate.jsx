import React from 'react';
import { Box } from '@mui/material';
import HeroBlock from '../../components/website/HeroBlock';
import StoryBlock from '../../components/website/StoryBlock';
import MenuPreviewBlock from '../../components/website/MenuPreviewBlock';
import QrPromoBlock from '../../components/website/QrPromoBlock';
import ReservationBlock from '../../components/website/ReservationBlock';
import InfoBlock from '../../components/website/InfoBlock';
import SocialMediaBlock from '../../components/website/SocialMediaBlock';
import WebsiteNavigation from '../../components/website/WebsiteNavigation';
import SpecialOccasionBanner from '../../components/website/SpecialOccasionBanner';

export default function ClassicTemplate({ restaurant }) {
    return (
        <Box sx={{ backgroundColor: '#fff', minHeight: '100vh' }}>
            <WebsiteNavigation restaurantName={restaurant.name} />
            
            {/* ✅ MOVED BANNER TO THE TOP (Just below the Navbar) */}
            <Box sx={{ pt: 8 }}> 
                <SpecialOccasionBanner restaurantId={restaurant.id} restaurantSlug={restaurant.slug} />
            </Box>

            <div id="home"><HeroBlock restaurant={restaurant} /></div>
            
            <div id="about">
                <StoryBlock title="About Us" text={restaurant.aboutUsText} galleryImages={restaurant.galleryImageUrls} />
            </div>
            <div id="menu"><MenuPreviewBlock restaurant={restaurant} /></div>
            <div id="qrcode"><QrPromoBlock restaurant={restaurant} /></div>
            <div id="reservation"><ReservationBlock restaurant={restaurant} /></div>
            <div id="social"><SocialMediaBlock restaurant={restaurant} /></div>
            <div id="contact"><InfoBlock restaurant={restaurant} /></div>
            
            {restaurant.googleMapsUrl && (
                <Box id="maps" sx={{ height: '450px', width: '100%', filter: 'grayscale(20%)' }}>
                    <iframe src={restaurant.googleMapsUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy" title="Map"></iframe>
                </Box>
            )}
        </Box>
    );
}