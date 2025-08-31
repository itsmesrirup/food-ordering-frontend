import React from "react";
import { Routes, Route } from "react-router-dom";
//import HomePage from './pages/HomePage';
import LandingPage from "./pages/LandingPage";
import MenuPage from "./pages/MenuPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import { Toaster } from "react-hot-toast"; // 1. Import Toaster
import ReservationPage from "./pages/ReservationPage";
import { Box, Typography, Link } from "@mui/material";

function App() {
  return (
    <div>
      <Box
        sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <Toaster position="top-center" />

        <header>
          <h1>Welcome to Food Order</h1>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/restaurants" element={<HomePage />} />
            <Route path="/restaurants/:restaurantId" element={<MenuPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route
              path="/order-confirmation/:orderId"
              element={<OrderConfirmationPage />}
            />
            <Route
              path="/restaurants/:restaurantId/reserve"
              element={<ReservationPage />}
            />
          </Routes>
        </main>
        <Box
          component="footer"
          sx={{
            py: 2, // Vertical padding
            px: 2, // Horizontal padding
            mt: "auto", // Pushes footer to the bottom
            backgroundColor: "#f5f5f5",
            textAlign: "center",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            This online ordering system is proudly powered by{" "}
            <Link color="inherit" href="https://your-future-website.com">
              <strong>Tablo</strong>
            </Link>
          </Typography>
        </Box>
      </Box>
    </div>
  );
}

export default App;
