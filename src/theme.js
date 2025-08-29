import { createTheme } from '@mui/material/styles';

// Let's define a Strasbourg-inspired color palette
// Warm stone of the cathedral, deep blue of the Alsatian flag, vibrant red geraniums
const theme = createTheme({
  palette: {
    primary: {
      main: '#2C3E50', // A deep, elegant slate blue
    },
    secondary: {
      main: '#E74C3C', // A vibrant, confident red
    },
    background: {
      default: '#F7F9FC', // A very light, clean grey
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none', // More modern than all-caps
          fontWeight: 'bold',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16, // Softer, more modern corners
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-5px)', // Subtle lift effect on hover
            boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
          },
        },
      },
    },
  },
});

export default theme;