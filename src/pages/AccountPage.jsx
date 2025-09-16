import React, { useState, useEffect } from 'react';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, Typography, Button, Box, CircularProgress, Divider, List, ListItem, ListItemText } from '@mui/material';
import { toast } from 'react-hot-toast';

function AccountPage() {
    const { customer, token, logout } = useCustomerAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!token) return;
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/customers/me/orders`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Could not fetch order history.');
                const data = await response.json();
                setOrders(data);
            } catch (error) {
                toast.error(error.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrders();
    }, [token]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (!customer) {
        return <p>Loading profile...</p>;
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h4" gutterBottom>My Account</Typography>
                <Typography variant="h6">Welcome, {customer.name}!</Typography>
                <Typography color="text.secondary">{customer.email}</Typography>
                <Button onClick={handleLogout} variant="outlined" sx={{ mt: 2 }}>Logout</Button>
                
                <Divider sx={{ my: 4 }} />

                <Typography variant="h5" gutterBottom>Order History</Typography>
                {isLoading ? <CircularProgress /> : (
                    <List>
                        {orders.length > 0 ? orders.map(order => (
                            <ListItem key={order.id} divider>
                                <ListItemText 
                                    primary={`Order #${order.id} - Status: ${order.status}`}
                                    secondary={`Placed on ${new Date(order.orderTime).toLocaleDateString()} - Total: $${order.totalPrice.toFixed(2)}`}
                                />
                                {/* Add a "Re-order" button here in the future */}
                            </ListItem>
                        )) : (
                            <Typography>You have no past orders.</Typography>
                        )}
                    </List>
                )}
            </Paper>
        </Container>
    );
}

export default AccountPage;