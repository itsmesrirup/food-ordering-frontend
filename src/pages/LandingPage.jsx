import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { Container, Box, Typography, Button, Grid, Paper, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { motion } from 'framer-motion';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import DevicesIcon from '@mui/icons-material/Devices';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ContactForm from '../components/landing/ContactForm'; 
import LanguageSwitcher from '../components/LanguageSwitcher'; // ✅ IMPORTED LANGUAGE SWITCHER
import usePageTitle from '../hooks/usePageTitle';

export default function LandingPage() {
    const { t } = useTranslation();
    usePageTitle('Tablo | L\'OS de votre Restaurant'); 
    const { setCartContext } = useCart();
    const videoRef = useRef(null);
    const bgVideoRef = useRef(null);
    const browserVideoRef = useRef(null);
    
    useEffect(() => { setCartContext(null); }, [setCartContext]);

    useEffect(() => {
        if (bgVideoRef.current) bgVideoRef.current.play().catch(e => console.warn(e));
        if (browserVideoRef.current) browserVideoRef.current.play().catch(e => console.warn(e));
    }, []);

    const scrollToForm = () => document.getElementById('contact-form').scrollIntoView({ behavior: 'smooth' });

    const DEMO_VIDEO_URL = "https://res.cloudinary.com/dazkwhmox/video/upload/v1781913345/227128_tiny_xcs4lu.mp4"; 
    // ✅ ADDED: A high-quality fallback image in case the video buffers or fails
    const FALLBACK_POSTER = "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1000&q=80";

    const primary = "#E63946"; 
    const darkBg = "#0B0F19";  

    return (
        <Box sx={{ overflowX: 'hidden', backgroundColor: '#f8f9fa', fontFamily: '"Montserrat", sans-serif' }}>
            
            {/* ✅ ADDED: Sleek Top Navigation Bar for Landing Page */}
            <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 10, p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ color: 'white', fontWeight: 900, letterSpacing: '1px' }}>
                    TABLO
                </Typography>
                <Box sx={{ color: 'white' }}>
                    <LanguageSwitcher />
                </Box>
            </Box>

            {/* --- 1. PREMIUM SAAS HERO SECTION --- */}
            {/* ✅ FIXED LAYOUT: Changed height to minHeight, added pt: 15 to prevent cut-offs */}
            <Box sx={{ 
                position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', 
                backgroundColor: darkBg, overflow: 'hidden', color: '#fff', transform: 'translateZ(0)',
                pt: { xs: 15, md: 12 }, pb: { xs: 10, md: 8 }
            }}>
                <Box sx={{ position: 'absolute', top: '-10%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(230,57,70,0.15) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(40px)', zIndex: 0 }} />
                <Box sx={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(67,97,238,0.15) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(60px)', zIndex: 0 }} />

                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
                    <Grid container spacing={6} alignItems="center">
                        <Grid item xs={12} lg={7}>
                            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                                <Typography sx={{ color: primary, fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', mb: 2, fontSize: '0.9rem' }}>
                                    {t('heroTagline', 'Pour les Restaurateurs Ambitieux')}
                                </Typography>
                                <Typography variant="h1" sx={{ fontWeight: 900, fontSize: { xs: '3rem', md: '4.5rem' }, lineHeight: 1.1, mb: 3, letterSpacing: '-2px' }}>
                                    {t('heroTitle1', 'Arrêtez de payer')} <br/>
                                    <span style={{ color: primary }}>{t('heroTitle2', '30% de commission.')}</span>
                                </Typography>
                                <Typography variant="h6" sx={{ color: '#aaa', fontWeight: 400, lineHeight: 1.6, mb: 5, maxWidth: '90%' }}>
                                    {t('heroDesc', 'Tablo est le système d\'exploitation complet pour votre restaurant. Commande en ligne, Click & Collect, KDS en cuisine et création de site web. Le tout sur votre propre nom de domaine.')}
                                </Typography>
                                
                                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                    <Button onClick={scrollToForm} variant="contained" sx={{ backgroundColor: primary, color: '#fff', px: 4, py: 1.8, fontSize: '1.1rem', fontWeight: 800, borderRadius: '8px', textTransform: 'none', boxShadow: `0 10px 30px ${primary}40`, '&:hover': { backgroundColor: '#d92635', transform: 'translateY(-2px)' }, transition: 'all 0.3s' }}>
                                        {t('contactSales', 'Nous Contacter')}
                                    </Button>
                                    <Button href="/r/au-punjab" variant="outlined" sx={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff', px: 4, py: 1.8, fontSize: '1.1rem', fontWeight: 700, borderRadius: '8px', textTransform: 'none', '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: '#fff' } }}>
                                        {t('viewClientSite', 'Voir un site client')}
                                    </Button>
                                </Box>
                            </motion.div>
                        </Grid>
                        
                        {/* ✅ FIXED GRID: Swapped md to lg to prevent wrapping on medium screens */}
                        <Grid item xs={12} lg={5} sx={{ display: 'block', mt: { xs: 6, lg: 0 } }}>
                        {/*</Grid><Grid item xs={12} lg={5} sx={{ display: { xs: 'none', lg: 'block' } }}>*/}
                            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 0.2 }}>
                                <Box sx={{ position: 'relative', width: '100%', maxWidth: '450px', margin: '0 auto', height: '500px', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
                                    <Box sx={{ height: '30px', backgroundColor: '#222', display: 'flex', alignItems: 'center', px: 2, gap: 1 }}>
                                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ff5f56' }} />
                                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ffbd2e' }} />
                                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#27c93f' }} />
                                    </Box>
                                    <video ref={browserVideoRef} autoPlay loop muted playsInline poster={FALLBACK_POSTER} style={{ width: '100%', height: 'calc(100% - 30px)', objectFit: 'cover' }}>
                                        <source src={DEMO_VIDEO_URL} type="video/mp4" />
                                    </video>
                                </Box>
                            </motion.div>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* --- 2. BENTO BOX FEATURES SECTION --- */}
            <Box sx={{ py: 15 }}>
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center', mb: 10 }}>
                        <Typography sx={{ color: primary, fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', mb: 2 }}>{t('bentoSubtitle', 'Une plateforme, Zéro tracas')}</Typography>
                        <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: '-1.5px', color: darkBg }}>{t('bentoTitle', 'Tout pour développer votre marge.')}</Typography>
                    </Box>

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={8}>
                            <BentoCard 
                                icon={<RestaurantIcon sx={{ fontSize: 40, color: primary }} />}
                                title={t('bento1Title')} desc={t('bento1Desc')} bgColor="#fff" textColor={darkBg} minHeight="350px"
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <BentoCard 
                                icon={<QrCode2Icon sx={{ fontSize: 40, color: '#fff' }} />}
                                title={t('bento2Title')} desc={t('bento2Desc')} bgColor={darkBg} textColor="#fff" minHeight="350px"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <BentoCard 
                                icon={<TrendingUpIcon sx={{ fontSize: 40, color: primary }} />}
                                title={t('bento3Title')} desc={t('bento3Desc')} bgColor="#fff" textColor={darkBg} minHeight="300px"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <BentoCard 
                                icon={<DevicesIcon sx={{ fontSize: 40, color: primary }} />}
                                title={t('bento4Title')} desc={t('bento4Desc')} bgColor="#fff" textColor={darkBg} minHeight="300px"
                            />
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* --- 3. THE "WHY US" BANNER --- */}
            <Box sx={{ backgroundColor: primary, py: 10, color: '#fff', textAlign: 'center' }}>
                <Container maxWidth="md">
                    <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-1px', mb: 3 }}>
                        {t('readyToDigitize', 'Prêt à digitaliser votre établissement ?')}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 400, opacity: 0.9, mb: 0 }}>
                        {t('joinRestaurants', 'Rejoignez les restaurants qui ont repris leur indépendance face aux plateformes de livraison. Configuration en 48 heures.')}
                    </Typography>
                </Container>
            </Box>

            {/* --- 4. FAQ SECTION --- */}
            <Box sx={{ py: 15, backgroundColor: '#fff' }}>
                <Container maxWidth="md">
                    <Typography variant="h3" align="center" fontWeight="900" sx={{ mb: 8, letterSpacing: '-1px' }}>
                        {t('faqTitle', 'Questions Fréquentes')}
                    </Typography>
                    
                    <Accordion sx={{ mb: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: 'none', '&:before': { display: 'none' }, borderRadius: '8px !important' }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ p: 3 }}><Typography variant="h6" fontWeight="bold">{t('faq1Q')}</Typography></AccordionSummary>
                        <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}><Typography color="text.secondary" sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>{t('faq1A')}</Typography></AccordionDetails>
                    </Accordion>

                    <Accordion sx={{ mb: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: 'none', '&:before': { display: 'none' }, borderRadius: '8px !important' }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ p: 3 }}><Typography variant="h6" fontWeight="bold">{t('faq2Q')}</Typography></AccordionSummary>
                        <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}><Typography color="text.secondary" sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>{t('faq2A')}</Typography></AccordionDetails>
                    </Accordion>

                    <Accordion sx={{ mb: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: 'none', '&:before': { display: 'none' }, borderRadius: '8px !important' }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ p: 3 }}><Typography variant="h6" fontWeight="bold">{t('faq3Q')}</Typography></AccordionSummary>
                        <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}><Typography color="text.secondary" sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>{t('faq3A')}</Typography></AccordionDetails>
                    </Accordion>
                </Container>
            </Box>

            {/* --- 5. CONTACT FORM --- */}
            <Box id="contact-form" sx={{ py: 15, backgroundColor: '#f8f9fa' }}>
                <Container maxWidth="md">
                    <Paper elevation={0} sx={{ p: { xs: 4, md: 8 }, borderRadius: '24px', boxShadow: '0 30px 60px rgba(0,0,0,0.08)' }}>
                        <Grid container spacing={8}>
                            <Grid item xs={12} md={5}>
                                <Typography variant="h3" fontWeight="900" gutterBottom sx={{ letterSpacing: '-1px' }}>
                                    {t('letUsTalk', 'Discutons.')}
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{ mb: 6, fontSize: '1.1rem', lineHeight: 1.8 }}>
                                    {t('contactFormDesc')}
                                </Typography>
                                <Box sx={{ mt: 4 }}>
                                    <Typography variant="body2" fontWeight="800" color="primary" sx={{ letterSpacing: '1px' }}>EMAIL DIRECT</Typography>
                                    <Typography variant="body1" sx={{ mb: 4, fontWeight: 600 }}>srirup@tabloapp.fr</Typography>
                                    
                                    <Typography variant="body2" fontWeight="800" color="primary" sx={{ letterSpacing: '1px' }}>TÉLÉPHONE</Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>07 53 30 85 26</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={7}>
                                <ContactForm />
                            </Grid>
                        </Grid>
                    </Paper>
                </Container>
            </Box>
        </Box>
    );
}

const BentoCard = ({ icon, title, desc, bgColor, textColor, minHeight }) => (
    <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} style={{ height: '100%' }}>
        <Paper elevation={0} sx={{ p: { xs: 4, md: 5 }, height: '100%', minHeight: minHeight, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', backgroundColor: bgColor, color: textColor, borderRadius: '24px', border: bgColor === '#fff' ? '1px solid #eaeaea' : 'none', boxShadow: bgColor === '#fff' ? '0 15px 35px rgba(0,0,0,0.03)' : '0 20px 40px rgba(0,0,0,0.2)', transition: 'transform 0.3s ease', '&:hover': { transform: 'translateY(-5px)' } }}>
            <Box sx={{ mb: 4, display: 'inline-flex', p: 2, borderRadius: '16px', backgroundColor: bgColor === '#fff' ? 'rgba(230,57,70,0.1)' : 'rgba(255,255,255,0.1)' }}>
                {icon}
            </Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1.2 }}>{title}</Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.7, opacity: bgColor === '#fff' ? 0.7 : 0.9, fontSize: '1.1rem' }}>{desc}</Typography>
        </Paper>
    </motion.div>
);