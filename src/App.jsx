import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import { Toaster } from 'react-hot-toast'; // 1. Import Toaster

function App() {
  return (
    <div>
      {/* 2. Add the Toaster component here */}
      <Toaster position="top-center" />

      <header>
        <h1>Welcome to Food Order</h1>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/restaurants/:restaurantId" element={<MenuPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App