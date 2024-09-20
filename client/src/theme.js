// File: ./client/src/theme.js

import { createTheme } from "@mui/material/styles";

const getTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: {
      main: mode === 'light' ? "#1e3145" : "#4a5b72",
      light: mode === 'light' ? "#4a5b72" : "#6c7c93",
      dark: mode === 'light' ? "#162233" : "#344b61",
      contrastText: "#fff",
    },
    secondary: {
      main: mode === 'light' ? "#f5f5f5" : "#333333",
      light: mode === 'light' ? "#ffffff" : "#4d4d4d",
      dark: mode === 'light' ? "#e0e0e0" : "#1a1a1a",
      contrastText: mode === 'light' ? "#000" : "#fff",
    },
    background: {
      default: mode === 'light' ? "#ffffff" : "#121212",
      paper: mode === 'light' ? "#f5f5f5" : "#1e1e1e",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: "2.5rem",
      fontWeight: 500,
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 500,
    },
    h3: {
      fontSize: "1.75rem",
      fontWeight: 500,
    },
    h4: {
      fontSize: "1.5rem",
      fontWeight: 500,
    },
    h5: {
      fontSize: "1.25rem",
      fontWeight: 500,
    },
    h6: {
      fontSize: "1rem",
      fontWeight: 500,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: mode === 'light' ? "#1e3145" : "#2c3e50",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: mode === 'light' ? "#ffffff" : "#1e1e1e",
          borderRight: `1px solid ${mode === 'light' ? "#e0e0e0" : "#333333"}`,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          '&:hover': {
            boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          transition: 'box-shadow 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
          },
        },
      },
    },
  },
});

export default getTheme;