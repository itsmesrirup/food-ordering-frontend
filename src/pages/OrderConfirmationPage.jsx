import React from 'react';
import { useParams, Link } from 'react-router-dom';

function OrderConfirmationPage() {
    const { orderId } = useParams();

    return (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
            <h2>Thank you for your order!</h2>
            <p>Your order has been placed successfully.</p>
            <p>Your order number is: <strong>#{orderId}</strong></p>
            <p>The restaurant will start preparing it shortly.</p>
            <Link to="/"><button>Back to Home</button></Link>
        </div>
    );
}

export default OrderConfirmationPage;