import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-hot-toast';

// Create a separate API client for public/customer-facing calls
export const customerApiClient = {
    // We can define methods here as needed
};

const CustomerAuthContext = createContext(null);

export const CustomerAuthProvider = ({ children }) => {
    // Use a different localStorage key to avoid conflicts with the admin token
    const [token, setToken] = useState(localStorage.getItem('customerToken'));
    const [customer, setCustomer] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    // Effect to fetch the customer's profile if a token exists
    useEffect(() => {
        const fetchCustomerProfile = async () => {
            const currentToken = localStorage.getItem('customerToken');
            if (currentToken) {
                try {
                    const response = await fetch(`${API_BASE_URL}/api/customers/me`, {
                        headers: { 'Authorization': `Bearer ${currentToken}` }
                    });
                    if (!response.ok) throw new Error('Session expired');
                    const data = await response.json();
                    setCustomer(data);
                } catch (error) {
                    console.error("Failed to fetch customer profile:", error);
                    logout(); // Log out if token is bad
                }
            }
            setIsLoading(false);
        };
        fetchCustomerProfile();
    }, [token, API_BASE_URL]);

    const login = async (email, password) => {
        const response = await fetch(`${API_BASE_URL}/api/customer/auth/authenticate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (!response.ok) throw new Error('Login failed. Please check your credentials.');
        const data = await response.json();
        if (data.token) {
            localStorage.setItem('customerToken', data.token);
            setToken(data.token); // This will trigger the useEffect to fetch profile
            toast.success('Login successful!');
        }
    };
    
    const register = async (name, email, password) => {
        const response = await fetch(`${API_BASE_URL}/api/customer/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        if (!response.ok) throw new Error('Registration failed. Please try again.');
        const data = await response.json();
        if (data.token) {
            localStorage.setItem('customerToken', data.token);
            setToken(data.token);
            toast.success('Account created successfully!');
        }
    };

    const logout = () => {
        localStorage.removeItem('customerToken');
        setToken(null);
        setCustomer(null);
    };

    const value = { token, customer, isLoading, login, register, logout };

    return (
        <CustomerAuthContext.Provider value={value}>
            {children}
        </CustomerAuthContext.Provider>
    );
};

export const useCustomerAuth = () => {
    return useContext(CustomerAuthContext);
};