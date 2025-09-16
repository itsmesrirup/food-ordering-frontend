import React, { useState } from 'react';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Container, Paper, Typography, TextField, Button, Box, CircularProgress, Link } from '@mui/material';
import { toast } from 'react-hot-toast';

function LoginPage() {
    const { login } = useCustomerAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await login(formData.email, formData.password);
            navigate('/account'); // Redirect to account page on success
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Container maxWidth="xs" sx={{ mt: 4 }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h4" align="center" gutterBottom>Login</Typography>
                <Box component="form" onSubmit={handleSubmit}>
                    <TextField label="Email" name="email" type="email" onChange={handleInputChange} required fullWidth margin="normal" />
                    <TextField label="Password" name="password" type="password" onChange={handleInputChange} required fullWidth margin="normal" />
                    <Box sx={{ mt: 2, position: 'relative' }}>
                        <Button type="submit" variant="contained" fullWidth disabled={isSubmitting}>
                            {isSubmitting ? 'Logging in...' : 'Log In'}
                        </Button>
                        {isSubmitting && <CircularProgress size={24} />}
                    </Box>
                     <Typography align="center" sx={{ mt: 2 }}>
                        Don't have an account? <Link component={RouterLink} to="/signup">Sign Up</Link>
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
}

export default LoginPage;