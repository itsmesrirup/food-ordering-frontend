import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Button, Box, Container, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';

const WebsiteNavigation = ({ restaurantName }) => {
  const { t, i18n } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      setMobileOpen(false); // Close mobile menu after clicking
    }
  };

  // --- Helper to switch language ---
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const navItems = [
    { id: 'about', label: t('aboutUs') },
    { id: 'menu', label: t('menu') },
    { id: 'reservation', label: t('reservations') }, // "Reservations" key might need adding or use 'bookTable'
    { id: 'contact', label: t('contactAndHours') }
];

  return (
    <>
      <AppBar 
        position="fixed" 
        elevation={isScrolled ? 4 : 0}
        sx={{ 
          backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.95)' : 'transparent', 
          color: isScrolled ? '#333' : 'white',
          transition: 'all 0.3s ease',
          borderBottom: isScrolled ? '1px solid #eee' : 'none',
          zIndex: 1200,
          width: '100%',         // Ensure it doesn't exceed container
          maxWidth: '100vw',     // Hard cap at viewport width
          left: 0,               // Force anchor to left edge
          right: 0               // Force anchor to right edge
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            {/* Brand Name */}
            <Box 
              sx={{ 
                  fontFamily: '"Playfair Display", serif', 
                  fontWeight: 'bold', 
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  textShadow: isScrolled ? 'none' : '0px 2px 4px rgba(0,0,0,0.5)'
              }}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              {restaurantName}
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
                      textShadow: isScrolled ? 'none' : '0px 1px 3px rgba(0,0,0,0.5)'
                  }}
                >
                  {item.label}
                </Button>
              ))}
              {/* --- ADDED: Language Switcher --- */}
              <Box sx={{ ml: 2, borderLeft: '1px solid rgba(255,255,255,0.3)', pl: 2, display: 'flex', gap: 1 }}>
                  <Button 
                    onClick={() => changeLanguage('fr')} 
                    sx={{ color: 'inherit', minWidth: 0, fontWeight: i18n.language === 'fr' ? 'bold' : 'normal' }}
                  >
                    FR
                  </Button>
                  <Button 
                    onClick={() => changeLanguage('en')} 
                    sx={{ color: 'inherit', minWidth: 0, fontWeight: i18n.language === 'en' ? 'bold' : 'normal' }}
                  >
                    EN
                  </Button>
                  <Button 
                    onClick={() => changeLanguage('de')} 
                    sx={{ color: 'inherit', minWidth: 0, fontWeight: i18n.language === 'de' ? 'bold' : 'normal' }}
                  >
                    DE
                  </Button>
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
        sx={{
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
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
            {/* --- ADDED: Mobile Language Switcher --- */}
            <ListItem sx={{ justifyContent: 'center', gap: 2, mt: 2 }}>
                 <Button variant={i18n.language === 'fr' ? "contained" : "outlined"} onClick={() => changeLanguage('fr')}>FR</Button>
                 <Button variant={i18n.language === 'en' ? "contained" : "outlined"} onClick={() => changeLanguage('en')}>EN</Button>
                 <Button variant={i18n.language === 'de' ? "contained" : "outlined"} onClick={() => changeLanguage('de')}>DE</Button>
            </ListItem>
        </List>
      </Drawer>
    </>
  );
};

export default WebsiteNavigation;