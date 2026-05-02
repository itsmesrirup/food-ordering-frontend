import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Button, Box, Container, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';

// ✅ ADDED logoUrl to the props
const WebsiteNavigation = ({ restaurantName, logoUrl, textColor = 'white', scrolledBgColor = 'rgba(255, 255, 255, 0.95)', scrolledTextColor = '#333' }) => {
  const { t, i18n } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  },[]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 70;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      setMobileOpen(false); 
    }
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const navItems =[
    { id: 'about', label: t('aboutUs') },
    { id: 'menu', label: t('menu') },
    { id: 'reservation', label: t('reservations') }, 
    { id: 'contact', label: t('contactAndHours') }
  ];

  const currentTextColor = isScrolled ? scrolledTextColor : textColor;
  const currentBgColor = isScrolled ? scrolledBgColor : 'transparent';

  return (
    <>
      <AppBar 
        position="fixed" 
        elevation={isScrolled ? 4 : 0}
        sx={{ 
          backgroundColor: currentBgColor, 
          color: currentTextColor,
          transition: 'all 0.3s ease',
          borderBottom: isScrolled ? '1px solid #eee' : 'none',
          zIndex: 1200,
          width: '100%',         
          maxWidth: '100vw',     
          left: 0,               
          right: 0               
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between', minHeight: { md: '80px' } }}>
            
            {/* ✅ UPDATED BRAND SECTION (LOGO OR TEXT) */}
            <Box 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              {logoUrl ? (
                <Box 
                  component="img"
                  src={logoUrl}
                  alt={`${restaurantName} logo`}
                  sx={{
                    // Responsive Logo sizing!
                    height: { xs: '45px', md: '65px' }, 
                    objectFit: 'contain',
                    // Apply dark shadow only when text is white and not scrolled
                    filter: (currentTextColor === 'white' && !isScrolled) ? 'drop-shadow(0px 4px 8px rgba(0,0,0,0.8))' : 'none',
                    transition: 'all 0.3s ease'
                  }}
                />
              ) : (
                <Typography sx={{ 
                  fontFamily: '"Playfair Display", serif', 
                  fontWeight: 'bold', 
                  fontSize: '1.5rem',
                  textShadow: (currentTextColor === 'white' && !isScrolled) ? '0px 2px 4px rgba(0,0,0,0.5)' : 'none'
                }}>
                  {restaurantName}
                </Typography>
              )}
            </Box>
            
            {/* Desktop Links (Hidden on Mobile) */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
              {navItems.map((item) => (
                <Button 
                  key={item.id} 
                  color="inherit" 
                  onClick={() => scrollToSection(item.id)}
                  sx={{ 
                      fontFamily: '"Lato", sans-serif', 
                      fontWeight: 600,
                      textShadow: (currentTextColor === 'white' && !isScrolled) ? '0px 1px 3px rgba(0,0,0,0.5)' : 'none'
                  }}
                >
                  {item.label}
                </Button>
              ))}
              
              {/* Language Switcher */}
              <Box sx={{ ml: 2, borderLeft: '1px solid rgba(255,255,255,0.3)', pl: 2, display: 'flex', gap: 1 }}>
                  <Button onClick={() => changeLanguage('fr')} sx={{ color: 'inherit', minWidth: 0, fontWeight: i18n.language.startsWith('fr') ? 'bold' : 'normal' }}>FR</Button>
                  <Button onClick={() => changeLanguage('en')} sx={{ color: 'inherit', minWidth: 0, fontWeight: i18n.language.startsWith('en') ? 'bold' : 'normal' }}>EN</Button>
                  <Button onClick={() => changeLanguage('de')} sx={{ color: 'inherit', minWidth: 0, fontWeight: i18n.language.startsWith('de') ? 'bold' : 'normal' }}>DE</Button>
              </Box>
            </Box>

            {/* Mobile Menu Button (Visible only on Mobile) */}
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{ '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 } }}
      >
        <Box sx={{ textAlign: 'right', p: 2 }}>
            <IconButton onClick={handleDrawerToggle}>
                <CloseIcon />
            </IconButton>
        </Box>
        <List>
            {navItems.map((item) => (
                <ListItem key={item.id} disablePadding>
                    <ListItemButton onClick={() => scrollToSection(item.id)}>
                        <ListItemText primary={item.label} />
                    </ListItemButton>
                </ListItem>
            ))}
            {/* Mobile Language Switcher */}
            <ListItem sx={{ justifyContent: 'center', gap: 2, mt: 2 }}>
                 <Button variant={i18n.language.startsWith('fr') ? "contained" : "outlined"} onClick={() => changeLanguage('fr')}>FR</Button>
                 <Button variant={i18n.language.startsWith('en') ? "contained" : "outlined"} onClick={() => changeLanguage('en')}>EN</Button>
                 <Button variant={i18n.language.startsWith('de') ? "contained" : "outlined"} onClick={() => changeLanguage('de')}>DE</Button>
            </ListItem>
        </List>
      </Drawer>
    </>
  );
};

export default WebsiteNavigation;