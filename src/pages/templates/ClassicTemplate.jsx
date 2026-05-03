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
import { Helmet } from 'react-helmet-async';

export default function ClassicTemplate({ restaurant }) {
    return (
        <Box sx={{ backgroundColor: '#fff', minHeight: '100vh' }}>
            <Helmet>
                <title>{restaurant.metaTitle || `${restaurant.name} | Restaurant Strasbourg`}</title>
                <meta name="description" content={restaurant.metaDescription || `Order online from ${restaurant.name} in Strasbourg.`} />
                <meta property="og:title" content={restaurant.name} />
                <meta property="og:description" content={restaurant.metaDescription} />
                <meta property="og:image" content={restaurant.heroImageUrl} />
            </Helmet>
            <WebsiteNavigation 
                restaurantName={restaurant.name}
                textColor="#1A1A1A" 
                scrolledBgColor="#FCFCFC" 
                scrolledTextColor="#1A1A1A"
                logoUrl={restaurant.logoUrl} 
                announcementMessage={restaurant.announcementEnabled ? restaurant.announcementMessage : null}
            />
            
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