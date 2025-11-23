import { createTheme } from "@mui/material/styles";
import { COLORS } from "./objects/Shape";

// Create a custom Material Design theme
export const theme = createTheme({
  palette: {
    primary: {
      main: "#000000", // Black
      light: "#333333", // Slightly lighter black
      dark: "#000000", // Black
      contrastText: "#ffffff", // White text
    },
    secondary: {
      main: COLORS[4], // Cyan
      light: COLORS[2], // Green
      dark: COLORS[5], // Blue
    },
    error: {
      main: COLORS[6], // Red
    },
    warning: {
      main: COLORS[0], // Orange
    },
    info: {
      main: COLORS[4], // Cyan
    },
    success: {
      main: COLORS[2], // Green
    },
    background: {
      default: "#d0d0d0",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: '"Courier Prime", "Courier New", "Roboto Mono", monospace',
    button: {
      textTransform: "none", // Normal casing for buttons
      fontWeight: 600,
    },
    h1: {
      fontFamily: '"Courier Prime", "Courier New", "Roboto Mono", monospace',
    },
    h2: {
      fontFamily: '"Courier Prime", "Courier New", "Roboto Mono", monospace',
    },
    h3: {
      fontFamily: '"Courier Prime", "Courier New", "Roboto Mono", monospace',
    },
    h4: {
      fontFamily: '"Courier Prime", "Courier New", "Roboto Mono", monospace',
    },
    h5: {
      fontFamily: '"Courier Prime", "Courier New", "Roboto Mono", monospace',
    },
    h6: {
      fontFamily: '"Courier Prime", "Courier New", "Roboto Mono", monospace',
    },
    body1: {
      fontFamily: '"Courier Prime", "Courier New", "Roboto Mono", monospace',
    },
    body2: {
      fontFamily: '"Courier Prime", "Courier New", "Roboto Mono", monospace',
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableRipple: true, // Disable ripple effect globally
      },
      styleOverrides: {
        root: {
          textTransform: "none", // Ensure normal casing
          borderRadius: 8,
          fontWeight: 600,
          transition: "none", // Disable all transitions for instant hover
          "&:hover": {
            filter: "brightness(0.95)", // Slightly darker on hover
          },
        },
        contained: {
          "&:hover": {
            backgroundColor: "#222", // Lighter gray on hover
          },
          "&.Mui-disabled": {
            backgroundColor: "#999", // Light gray background when disabled
            color: "#ffffff", // White text when disabled
          },
        },
        outlined: {
          backgroundColor: "#ffffff",
          borderColor: "#000000",
          color: "#000000",
          "&:hover": {
            filter: "brightness(0.95)",
            backgroundColor: "#ffffff",
            borderColor: "#000000",
          },
        },
      },
    },
    MuiIconButton: {
      defaultProps: {
        disableRipple: true, // Disable ripple effect for icon buttons
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontFamily:
            '"Courier Prime", "Courier New", "Roboto Mono", monospace',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          fontFamily:
            '"Courier Prime", "Courier New", "Roboto Mono", monospace',
          backgroundColor: "#ffffff",
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          fontFamily:
            '"Courier Prime", "Courier New", "Roboto Mono", monospace',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontFamily:
            '"Courier Prime", "Courier New", "Roboto Mono", monospace',
        },
      },
    },
  },
});
