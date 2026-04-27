import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { CartProvider } from './context/CartContext.jsx' // Import
import './index.css'
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { lightTheme } from './theme';
import './i18n';
import { HelmetProvider } from 'react-helmet-async';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <ThemeProvider theme={lightTheme}> {/* Apply the theme */}
        <CssBaseline /> {/* Normalizes CSS across browsers */}
        <BrowserRouter>
          <CartProvider>
            <App />
          </CartProvider>
        </BrowserRouter>
      </ThemeProvider>
    </HelmetProvider>
  </React.StrictMode>,
)