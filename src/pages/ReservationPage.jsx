import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Container, Paper, Typography, TextField, Button, Box, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function ReservationPage() {
    const { restaurantId } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        partySize: 2,
        reservationTime: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        const payload = { ...formData, restaurantId: parseInt(restaurantId) };
        
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reservations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error('Could not submit reservation. Please try again.');
            
            toast.success('Your reservation request has been sent!');
            navigate(`/restaurants/${restaurantId}`); // Go back to the menu page
            
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <Button component={Link} to={`/restaurants/${restaurantId}`} startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
                Back to Menu
            </Button>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h4" align="center" gutterBottom>Book a Table</Typography>
                <Box component="form" onSubmit={handleSubmit}>
                    <TextField label="Full Name" name="customerName" onChange={handleInputChange} required fullWidth margin="normal" />
                    <TextField label="Email" name="customerEmail" type="email" onChange={handleInputChange} required fullWidth margin="normal" />
                    <TextField label="Phone Number" name="customerPhone" onChange={handleInputChange} required fullWidth margin="normal" />
                    <TextField label="Party Size" name="partySize" type="number" value={formData.partySize} onChange={handleInputChange} required fullWidth margin="normal" />
                    <TextField 
                        label="Date and Time" 
                        name="reservationTime" 
                        type="datetime-local" // Simple date time picker
                        onChange={handleInputChange} 
                        required 
                        fullWidth 
                        margin="normal"
                        InputLabelProps={{ shrink: true }} // Important for datetime-local
                    />
                    <Box sx={{ mt: 3, position: 'relative' }}>
                        <Button type="submit" variant="contained" fullWidth disabled={isSubmitting}>
                            {isSubmitting ? 'Sending Request...' : 'Request Reservation'}
                        </Button>
                        {isSubmitting && <CircularProgress size={24} sx={{ position: 'absolute', top: '50%', left: '50%', mt: '-12px', ml: '-12px' }} />}
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
}

export default ReservationPage;