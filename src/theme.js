import { createTheme } from '@mui/material/styles';

// --- 1. Default "Tablo" Light Theme ---
// This is your brand's default look and feel. It will be used for your
// landing page and for any restaurant that hasn't set a custom theme.
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2C3E50', // Tablo's primary color (deep slate blue)
    },
    secondary: {
      main: '#E74C3C', // Tablo's secondary color (vibrant red)
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
          textTransform: 'none',
          fontWeight: 'bold',
          padding: '10px 20px',
        },
      },
    },
    MuiPaper: {
        styleOverrides: {
            root: {
                backgroundImage: 'none', // A fix for some MUI versions
            }
        }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
          },
        },
      },
    },
  },
});

// --- 2. "Au Punjab" Inspired Dark Theme Template ---
// This is the beautiful dark theme that will be applied when a restaurant
// has the `useDarkTheme` flag enabled.
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#FFFFFF', // On a dark background, the "primary" color for text is white
    },
    secondary: {
      main: '#AF8329', // The gold accent color from Au Punjab's site
    },
    background: {
      default: '#2F2E2E', // The dark charcoal background from their site
      paper: '#424242',   // A slightly lighter grey for cards and paper elements
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#BDBDBD', // A light grey for less important text
    },
  },
  typography: {
    // We use Montserrat for a more elegant, sharp heading font in the dark theme
    fontFamily: '"Montserrat", "Roboto", "Helvetica", "Arial", sans-serif',
    allVariants: {
      color: '#FFFFFF' // Ensure all text variants default to white
    },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 500 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 'bold',
          padding: '10px 20px',
        },
        outlined: {
            borderColor: 'rgba(255, 255, 255, 0.5)', // A semi-transparent white border
        },
        outlinedSecondary: {
            borderColor: '#AF8329', // The gold accent color for special buttons
        }
      }
    },
     MuiPaper: {
        styleOverrides: {
            root: {
                backgroundImage: 'none',
                borderRadius: 16,
            }
        }
    },
  }
});