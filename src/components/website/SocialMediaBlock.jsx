import React from 'react';
import { Box, Container, Typography, IconButton, Stack } from '@mui/material';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import { useTranslation } from 'react-i18next';

const SocialMediaBlock = ({ restaurant }) => {
  
  const { t } = useTranslation();
  const openLink = (url) => {
    if (!url) return;

    let finalUrl = url.trim();

    // Check if the URL starts with http:// or https://
    // If not, prepend https:// to make it an absolute external link
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        finalUrl = `https://${finalUrl}`;
    }

    window.open(finalUrl, '_blank', 'noopener,noreferrer');
  };

  if (!restaurant.instagramUrl && !restaurant.facebookUrl && !restaurant.twitterUrl) {
      return null;
  }

  return (
    <Box sx={{ py: 8, backgroundColor: '#222', color: 'white', textAlign: 'center' }}>
      <Container maxWidth="md">
        <Typography variant="h4" sx={{ fontFamily: '"Playfair Display", serif', mb: 1 }}>
            {t('followUs')}
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, opacity: 0.7, fontFamily: '"Lato"' }}>
            {t('socialSubtitle')}
        </Typography>
        
        <Stack direction="row" spacing={2} justifyContent="center">
            {restaurant.instagramUrl && (
                <IconButton 
                    onClick={() => openLink(restaurant.instagramUrl)} 
                    sx={{ color: 'white', border: '1px solid white', '&:hover': { backgroundColor: 'white', color: '#222' } }}
                    aria-label="Instagram"
                >
                    <InstagramIcon />
                </IconButton>
            )}

            {restaurant.facebookUrl && (
                <IconButton 
                    onClick={() => openLink(restaurant.facebookUrl)} 
                    sx={{ color: 'white', border: '1px solid white', '&:hover': { backgroundColor: 'white', color: '#222' } }}
                    aria-label="Facebook"
                >
                    <FacebookIcon />
                </IconButton>
            )}

            {restaurant.twitterUrl && (
                <IconButton 
                    onClick={() => openLink(restaurant.twitterUrl)} 
                    sx={{ color: 'white', border: '1px solid white', '&:hover': { backgroundColor: 'white', color: '#222' } }}
                    aria-label="Twitter"
                >
                    <TwitterIcon />
                </IconButton>
            )}
        </Stack>
      </Container>
    </Box>
  );
};

export default SocialMediaBlock;