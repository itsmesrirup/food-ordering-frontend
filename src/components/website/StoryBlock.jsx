import React, { useState } from 'react';
import { Box, Container, Typography, Modal, IconButton, Fade, Backdrop } from '@mui/material';
import { motion } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';

// Define the keyframes for the scrolling animation
const scrollAnimation = {
  '@keyframes scroll': {
    '0%': { transform: 'translateX(0)' },
    '100%': { transform: 'translateX(-50%)' }, // Move half the width (because we duplicate the list)
  },
};

const StoryBlock = ({ title, text, galleryImages }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  // If we have images, duplicate them to create a seamless infinite loop
  // e.g. [A, B, C] becomes [A, B, C, A, B, C]
  const rawImages = galleryImages || [];
  // Only scroll if we have enough images, otherwise just center them
  const shouldScroll = rawImages.length > 3; 
  const displayImages = shouldScroll ? [...rawImages, ...rawImages] : rawImages;

  const handleOpen = (img) => setSelectedImage(img);
  const handleClose = () => setSelectedImage(null);

  return (
    <Box id="about" sx={{ py: 10, backgroundColor: '#fafafa', overflow: 'hidden' }}>
      
      {/* 1. Text Section */}
      <Container maxWidth="md" sx={{ mb: 6, textAlign: 'center' }}>
        <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
         >
            <Typography variant="h3" sx={{ fontFamily: '"Playfair Display", serif', mb: 3, color: '#333' }}>
                {title}
            </Typography>
            <Typography variant="body1" sx={{ fontFamily: '"Lato", sans-serif', fontSize: '1.2rem', lineHeight: 1.8, color: '#555', whiteSpace: 'pre-wrap' }}>
                {text}
            </Typography>
         </motion.div>
      </Container>

      {/* 2. Infinite Scroll Gallery */}
      {rawImages.length > 0 && (
          <Box sx={{ 
              width: '100%', 
              overflow: 'hidden', // Hide the overflow
              position: 'relative',
              // Add a subtle gradient fade on the edges
              '&::before, &::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  width: '100px',
                  height: '100%',
                  zIndex: 2,
                  pointerEvents: 'none' // Let clicks pass through
              },
              '&::before': { left: 0, background: 'linear-gradient(to right, #fafafa, transparent)' },
              '&::after': { right: 0, background: 'linear-gradient(to left, #fafafa, transparent)' }
          }}>
            <Box 
                sx={{
                    display: 'flex',
                    gap: 3,
                    width: 'fit-content',
                    ...scrollAnimation,
                    // Apply the animation ONLY if we have enough images
                    animation: shouldScroll ? 'scroll 40s linear infinite' : 'none',
                    // PAUSE ON HOVER
                    '&:hover': {
                        animationPlayState: 'paused',
                        cursor: 'pointer'
                    },
                    // Center items if not scrolling
                    ...( !shouldScroll && { margin: '0 auto' } )
                }}
            >
                {displayImages.map((imgUrl, index) => (
                    <Box 
                      key={index}
                      component="img"
                      src={imgUrl}
                      alt={`Gallery ${index}`}
                      onClick={() => handleOpen(imgUrl)}
                      sx={{
                          width: { xs: '250px', md: '350px' },
                          height: { xs: '200px', md: '250px' },
                          objectFit: 'cover',
                          borderRadius: 2,
                          flexShrink: 0,
                          transition: 'transform 0.3s, filter 0.3s',
                          '&:hover': { 
                              transform: 'scale(1.05)',
                              filter: 'brightness(1.1)'
                          }
                      }}
                    />
                ))}
            </Box>
          </Box>
      )}

      {/* 3. Lightbox Modal */}
      <Modal
        open={!!selectedImage}
        onClose={handleClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
            sx: { backgroundColor: 'rgba(0, 0, 0, 0.9)' } // Dark backdrop
          },
        }}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Fade in={!!selectedImage}>
          <Box sx={{ position: 'relative', outline: 'none', maxWidth: '90vw', maxHeight: '90vh' }}>
             {/* Close Button */}
             <IconButton 
                onClick={handleClose}
                sx={{ 
                    position: 'absolute', 
                    top: -50, 
                    right: 0, 
                    color: 'white',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
                }}
             >
                 <CloseIcon />
             </IconButton>
             
             {/* Full Size Image */}
             <Box 
                component="img" 
                src={selectedImage} 
                sx={{ 
                    maxWidth: '100%', 
                    maxHeight: '90vh', 
                    borderRadius: 1,
                    boxShadow: 24 
                }} 
            />
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default StoryBlock;