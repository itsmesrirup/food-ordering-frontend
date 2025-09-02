import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { CartProvider } from './context/CartContext.jsx' // Import
import './index.css'
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme'; // Import our custom theme
import './i18n';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}> {/* Apply the theme */}
      <CssBaseline /> {/* Normalizes CSS across browsers */}
      <BrowserRouter>
        <CartProvider>
          <App />
        </CartProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
)