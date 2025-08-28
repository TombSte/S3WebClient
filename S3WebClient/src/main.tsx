/* eslint-disable react-refresh/only-export-components */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import "./index.scss";
import App from "./App.tsx";
import ErrorBoundary from "./components/ErrorBoundary";
import { SettingsProvider, useSettings } from "./contexts/SettingsContext";
import { EnvironmentsProvider } from "./contexts/EnvironmentsContext";
import { NotificationsProvider } from "./contexts/NotificationsContext";

function ThemedApp() {
  const { settings } = useSettings();
  const base = createTheme({
    palette: {
      mode: settings.darkMode ? "dark" : "light",
      primary: { main: "#1E88E5" },
      secondary: { main: "#7E57C2" },
      ...(settings.darkMode
        ? {
            background: { default: "#13161A", paper: "#161A1F" },
            divider: "#2A2F36",
            text: { primary: "#E6E8EB", secondary: "#9AA4B2" },
          }
        : {
            background: { default: "#F6F7F9", paper: "#FFFFFF" },
            divider: "#E5E7EB",
            text: { primary: "#111827", secondary: "#6B7280" },
          }),
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: 13,
      htmlFontSize: 14,
      h6: { fontWeight: 700 },
      subtitle1: { fontWeight: 600 },
    },
    spacing: 7,
  });

  const theme = createTheme(base, {
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            border: `1px solid ${base.palette.divider}`,
            boxShadow: "none",
            borderRadius: 10,
          },
        },
      },
      MuiPaper: {
        defaultProps: { elevation: 0, variant: 'outlined' },
        styleOverrides: {
          outlined: { borderColor: base.palette.divider },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: base.palette.background.default,
            color: base.palette.text.primary,
            boxShadow: `0 1px 0 0 ${base.palette.divider}`,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: base.palette.background.paper,
            borderRight: `1px solid ${base.palette.divider}`,
          },
        },
      },
      MuiListItemButton: { styleOverrides: { root: { borderRadius: 12 } } },
      MuiButton: {
        styleOverrides: { root: { textTransform: "none", borderRadius: 8, fontWeight: 600 } },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            fontSize: 12,
            backgroundColor: settings.darkMode ? "#2B3139" : "#111827",
          },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </ThemeProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <SettingsProvider>
        <EnvironmentsProvider>
          <NotificationsProvider>
            <ThemedApp />
          </NotificationsProvider>
        </EnvironmentsProvider>
      </SettingsProvider>
    </BrowserRouter>
  </StrictMode>
);
