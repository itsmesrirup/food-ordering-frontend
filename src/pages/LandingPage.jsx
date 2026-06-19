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
import usePageTitle from '../hooks/usePageTitle';

export default function LandingPage() {
    const { t } = useTranslation();
    usePageTitle('Tablo | L\'OS de votre Restaurant'); 
    const { setCartContext } = useCart();
    const videoRef = useRef(null);
    
    useEffect(() => { setCartContext(null); }, [setCartContext]);

    // Force video play on mobile
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.play().catch(e => console.warn("Autoplay blocked", e));
        }
    }, []);

    const scrollToForm = () => document.getElementById('contact-form').scrollIntoView({ behavior: 'smooth' });

    // The demo video URL
    const DEMO_VIDEO_URL = "https://cdn.pixabay.com/video/2021/08/11/84687-587843813_tiny.mp4"; 

    // --- BRAND COLORS FOR TABLO SAAS ---
    const primary = "#E63946"; // Punchy SaaS Red
    const darkBg = "#0B0F19";  // Deep Navy/Black
    const cardBg = "#1A1F2C";  // Elevated Dark Card

    return (
        <Box sx={{ overflowX: 'hidden', backgroundColor: '#f8f9fa', fontFamily: '"Montserrat", sans-serif' }}>
            
            {/* --- 1. PREMIUM SAAS HERO SECTION --- */}
            <Box sx={{ 
                position: 'relative', height: { xs: '100svh', md: '95vh' }, display: 'flex', alignItems: 'center', 
                backgroundColor: darkBg, overflow: 'hidden', color: '#fff', transform: 'translateZ(0)'
            }}>
                {/* Glowing Background Orbs (Modern SaaS Trend) */}
                <Box sx={{ position: 'absolute', top: '-10%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(230,57,70,0.15) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(40px)', zIndex: 0 }} />
                <Box sx={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(67,97,238,0.15) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(60px)', zIndex: 0 }} />

                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
                    <Grid container spacing={6} alignItems="center">
                        <Grid item xs={12} md={7}>
                            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                                <Typography sx={{ color: primary, fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', mb: 2, fontSize: '0.9rem' }}>
                                    Pour les Restaurateurs Ambitieux
                                </Typography>
                                <Typography variant="h1" sx={{ fontWeight: 900, fontSize: { xs: '3rem', md: '4.5rem' }, lineHeight: 1.1, mb: 3, letterSpacing: '-2px' }}>
                                    Arrêtez de payer <br/>
                                    <span style={{ color: primary }}>30% de commission.</span>
                                </Typography>
                                <Typography variant="h6" sx={{ color: '#aaa', fontWeight: 400, lineHeight: 1.6, mb: 5, maxWidth: '90%' }}>
                                    Tablo est le système d'exploitation complet pour votre restaurant. Commande en ligne, Click & Collect, KDS en cuisine et création de site web. Le tout sur votre propre nom de domaine.
                                </Typography>
                                
                                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                    <Button onClick={scrollToForm} variant="contained" sx={{ backgroundColor: primary, color: '#fff', px: 4, py: 1.8, fontSize: '1.1rem', fontWeight: 800, borderRadius: '8px', textTransform: 'none', boxShadow: `0 10px 30px ${primary}40`, '&:hover': { backgroundColor: '#d92635', transform: 'translateY(-2px)' }, transition: 'all 0.3s' }}>
                                        {t('contactSales', 'Demander une Démo')}
                                    </Button>
                                    <Button href="/r/au-punjab" variant="outlined" sx={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff', px: 4, py: 1.8, fontSize: '1.1rem', fontWeight: 700, borderRadius: '8px', textTransform: 'none', '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: '#fff' } }}>
                                        Voir un site client
                                    </Button>
                                </Box>
                            </motion.div>
                        </Grid>
                        
                        {/* THE "SOFTWARE" PREVIEW VISUAL */}
                        <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }}>
                            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 0.2 }}>
                                <Box sx={{ position: 'relative', width: '100%', height: '500px', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
                                    {/* Fake Browser Header */}
                                    <Box sx={{ height: '30px', backgroundColor: '#222', display: 'flex', alignItems: 'center', px: 2, gap: 1 }}>
                                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ff5f56' }} />
                                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ffbd2e' }} />
                                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#27c93f' }} />
                                    </Box>
                                    {/* Video playing inside the fake browser */}
                                    <video ref={videoRef} autoPlay loop muted playsInline style={{ width: '100%', height: 'calc(100% - 30px)', objectFit: 'cover' }}>
                                        <source src={DEMO_VIDEO_URL} type="video/mp4" />
                                    </video>
                                </Box>
                            </motion.div>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* --- 2. BENTO BOX FEATURES SECTION (MODERN SAAS TREND) --- */}
            <Box sx={{ py: 15 }}>
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center', mb: 10 }}>
                        <Typography sx={{ color: primary, fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', mb: 2 }}>Une plateforme, Zéro tracas</Typography>
                        <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: '-1.5px', color: darkBg }}>Tout pour développer votre marge.</Typography>
                    </Box>

                    <Grid container spacing={3}>
                        {/* BIG BOX: Ordering */}
                        <Grid item xs={12} md={8}>
                            <BentoCard 
                                icon={<RestaurantIcon sx={{ fontSize: 40, color: primary }} />}
                                title="Commande 0% Commission"
                                desc="Votre propre système de Click & Collect. Gardez 100% de l'argent de vos clients. Paiements sécurisés via Stripe, directement sur votre compte bancaire."
                                bgColor="#fff" textColor={darkBg}
                                minHeight="350px"
                            />
                        </Grid>

                        {/* TALL BOX: QR Code */}
                        <Grid item xs={12} md={4}>
                            <BentoCard 
                                icon={<QrCode2Icon sx={{ fontSize: 40, color: '#fff' }} />}
                                title="QR Code sur Table"
                                desc="Vos clients scannent, commandent et paient depuis leur téléphone. Moins d'attente, plus de commandes, et vos serveurs se concentrent sur l'accueil."
                                bgColor={darkBg} textColor="#fff"
                                minHeight="350px"
                            />
                        </Grid>

                        {/* WIDE BOX: KDS */}
                        <Grid item xs={12} md={6}>
                            <BentoCard 
                                icon={<TrendingUpIcon sx={{ fontSize: 40, color: primary }} />}
                                title="Écran Cuisine (KDS) & POS"
                                desc="Fini les tickets papier perdus. Les commandes en ligne et celles de vos serveurs arrivent instantanément sur tablette en cuisine avec une alerte sonore."
                                bgColor="#fff" textColor={darkBg}
                                minHeight="300px"
                            />
                        </Grid>

                        {/* WIDE BOX: Website */}
                        <Grid item xs={12} md={6}>
                            <BentoCard 
                                icon={<DevicesIcon sx={{ fontSize: 40, color: primary }} />}
                                title="Créateur de Site Web Automatique"
                                desc="Vous n'avez pas de site web ? Tablo vous génère un site ultra-moderne, optimisé pour Google (SEO), lié à votre propre nom de domaine."
                                bgColor="#fff" textColor={darkBg}
                                minHeight="300px"
                            />
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* --- 3. THE "WHY US" BANNER --- */}
            <Box sx={{ backgroundColor: primary, py: 10, color: '#fff', textAlign: 'center' }}>
                <Container maxWidth="md">
                    <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-1px', mb: 3 }}>
                        Prêt à digitaliser votre établissement ?
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 400, opacity: 0.9, mb: 0 }}>
                        Rejoignez les restaurants qui ont repris leur indépendance face aux plateformes de livraison. Configuration en 48 heures.
                    </Typography>
                </Container>
            </Box>

            {/* --- 4. FAQ SECTION --- */}
            <Box sx={{ py: 15, backgroundColor: '#fff' }}>
                <Container maxWidth="md">
                    <Typography variant="h3" align="center" fontWeight="900" sx={{ mb: 8, letterSpacing: '-1px' }}>
                        Questions Fréquentes
                    </Typography>
                    
                    <Accordion sx={{ mb: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: 'none', '&:before': { display: 'none' }, borderRadius: '8px !important' }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ p: 3 }}><Typography variant="h6" fontWeight="bold">Dois-je avoir des compétences en informatique ?</Typography></AccordionSummary>
                        <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}><Typography color="text.secondary" sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>Pas du tout. Tablo est conçu pour les restaurateurs. Vous gérez votre menu sur une interface aussi simple qu'un réseau social. Nous gérons toute la technique.</Typography></AccordionDetails>
                    </Accordion>

                    <Accordion sx={{ mb: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: 'none', '&:before': { display: 'none' }, borderRadius: '8px !important' }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ p: 3 }}><Typography variant="h6" fontWeight="bold">Puis-je utiliser mon propre nom de domaine ?</Typography></AccordionSummary>
                        <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}><Typography color="text.secondary" sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>Oui absolument ! Nous pouvons connecter votre propre nom de domaine personnalisé (ex: www.monrestaurant.fr) pour que votre marque reste au premier plan. Nous nous occupons même du certificat SSL.</Typography></AccordionDetails>
                    </Accordion>

                    <Accordion sx={{ mb: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: 'none', '&:before': { display: 'none' }, borderRadius: '8px !important' }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ p: 3 }}><Typography variant="h6" fontWeight="bold">Comment fonctionnent les paiements en ligne ?</Typography></AccordionSummary>
                        <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}><Typography color="text.secondary" sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>Nous sommes intégrés avec Stripe, le leader mondial du paiement. L'argent de vos clients arrive directement sur votre compte bancaire. Tablo ne touche jamais à votre argent.</Typography></AccordionDetails>
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
                                    Discutons.
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{ mb: 6, fontSize: '1.1rem', lineHeight: 1.8 }}>
                                    Laissez-nous vos coordonnées et nous organiserons une démo vidéo rapide de 10 minutes.
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

// 🚀 THE BENTO CARD COMPONENT
const BentoCard = ({ icon, title, desc, bgColor, textColor, minHeight }) => (
    <motion.div 
        initial={{ opacity: 0, y: 40 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true }} 
        transition={{ duration: 0.6 }}
        style={{ height: '100%' }}
    >
        <Paper elevation={0} sx={{ 
            p: { xs: 4, md: 5 }, 
            height: '100%', 
            minHeight: minHeight,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            backgroundColor: bgColor,
            color: textColor,
            borderRadius: '24px',
            border: bgColor === '#fff' ? '1px solid #eaeaea' : 'none',
            boxShadow: bgColor === '#fff' ? '0 15px 35px rgba(0,0,0,0.03)' : '0 20px 40px rgba(0,0,0,0.2)',
            transition: 'transform 0.3s ease',
            '&:hover': { transform: 'translateY(-5px)' }
        }}>
            <Box sx={{ mb: 4, display: 'inline-flex', p: 2, borderRadius: '16px', backgroundColor: bgColor === '#fff' ? 'rgba(230,57,70,0.1)' : 'rgba(255,255,255,0.1)' }}>
                {icon}
            </Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1.2 }}>{title}</Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.7, opacity: bgColor === '#fff' ? 0.7 : 0.9, fontSize: '1.1rem' }}>{desc}</Typography>
        </Paper>
    </motion.div>
);