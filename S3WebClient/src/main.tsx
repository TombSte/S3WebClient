/* eslint-disable react-refresh/only-export-components */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import "./index.scss";
import App from "./App.tsx";
import { SettingsProvider, useSettings } from "./contexts/SettingsContext";
import { NotificationsProvider } from "./contexts/NotificationsContext";

function ThemedApp() {
  const { settings } = useSettings();
  const theme = createTheme({
    palette: {
      mode: settings.darkMode ? "dark" : "light",
      primary: {
        main: "#1976d2",
      },
      secondary: {
        main: "#dc004e",
      },
      ...(settings.darkMode && {
        background: {
          default: "#1a1a1a",
          paper: "#1c1c1c",
        },
        divider: "#333",
        text: {
          primary: "#e0e0e0",
          secondary: "#b0b0b0",
        },
      }),
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: 13,
      htmlFontSize: 14,
    },
    spacing: 7,
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <SettingsProvider>
        <NotificationsProvider>
          <ThemedApp />
        </NotificationsProvider>
      </SettingsProvider>
    </BrowserRouter>
  </StrictMode>
);
