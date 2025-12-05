import React from 'react';
import { Box, Typography } from '@mui/material';
import { formatPrice } from '../../utils/formatPrice';

const PublicMenuItemCard = ({ item, currency }) => {
    return (
        <Box sx={{ mb: 4, display: 'flex', gap: 3, alignItems: 'flex-start' }}>
            
            {/* Optional Image (Small & Elegant) */}
            {item.imageUrl && (
                <Box 
                    component="img"
                    src={item.imageUrl}
                    alt={item.name}
                    sx={{ 
                        width: 80, 
                        height: 80, 
                        borderRadius: 1, 
                        objectFit: 'cover',
                        flexShrink: 0
                    }}
                />
            )}

            <Box sx={{ flexGrow: 1 }}>
                {/* Top Row: Name ..... Price */}
                <Box sx={{ display: 'flex', alignItems: 'baseline', width: '100%', mb: 0.5 }}>
                    <Typography variant="h6" sx={{ 
                        fontFamily: '"Playfair Display", serif', 
                        fontWeight: 700, 
                        fontSize: '1.1rem',
                        color: '#222',
                        textTransform: 'uppercase',
                        whiteSpace: 'nowrap' // Keep name on one line if possible
                    }}>
                        {item.name}
                    </Typography>

                    {/* Robust Dotted Leader */}
                    <Box sx={{ 
                        flexGrow: 1, 
                        mx: 1, 
                        borderBottom: '2px dotted #ccc', 
                        position: 'relative', 
                        top: '-5px',
                        minWidth: '20px' // Ensure dots always show at least a bit
                    }} />

                    <Typography variant="h6" sx={{ 
                        fontFamily: '"Lato", sans-serif', 
                        fontWeight: 700, 
                        color: '#d32f2f',
                        whiteSpace: 'nowrap'
                    }}>
                        {formatPrice(item.price, currency)}
                    </Typography>
                </Box>

                {/* Description */}
                <Typography variant="body2" sx={{ 
                    fontFamily: '"Lato", sans-serif', 
                    color: '#666', 
                    fontStyle: 'italic',
                    fontSize: '0.95rem',
                    lineHeight: 1.5,
                    maxWidth: '90%' // Keep description from hitting the right edge too hard
                }}>
                    {item.description}
                </Typography>
            </Box>
        </Box>
    );
};

export default PublicMenuItemCard;