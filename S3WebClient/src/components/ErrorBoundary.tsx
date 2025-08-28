import React from "react";
import { Box, Button, Typography, Paper } from "@mui/material";

type ErrorBoundaryState = { hasError: boolean; error?: unknown };

export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: unknown, errorInfo: unknown) {
    // eslint-disable-next-line no-console
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined });
    // optional: full reload to recover app state
    if (typeof window !== "undefined") window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children as React.ReactElement;
    return (
      <Box sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}>
        <Paper sx={{ p: 3, maxWidth: 640, width: "100%", textAlign: "left" }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            Something went wrong
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            The application encountered an unexpected error. Try reloading.
          </Typography>
          {process.env.NODE_ENV !== "production" && this.state.error && (
            <Box sx={{
              p: 1.5,
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100'),
              borderRadius: 1,
              fontFamily: "monospace",
              fontSize: 12,
              mb: 2,
              whiteSpace: 'pre-wrap',
            }}>
              {String((this.state.error as { message?: string }).message ?? this.state.error)}
            </Box>
          )}
          <Button variant="contained" onClick={this.reset}>Reload</Button>
        </Paper>
      </Box>
    );
  }
}

