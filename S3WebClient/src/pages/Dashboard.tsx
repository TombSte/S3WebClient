import React from "react";
import { Typography, Box, Paper } from "@mui/material";

const Dashboard: React.FC = () => {
  return (
    <Box
      sx={{
        width: "100%",
        minWidth: "100%",
        display: "flex",
        flexDirection: "column",
        flex: 1,
        textAlign: "left",
        alignItems: "flex-start",
      }}
    >
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      <Paper
        sx={{
          p: 3,
          mt: 2,
          width: "100%",
          minWidth: "100%",
          flex: 1,
        }}
      >
        <Typography variant="body1" paragraph>
          Welcome to the S3 Web Client Dashboard. This is your central hub for
          managing AWS S3 resources.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Use the menu on the right to navigate between different sections.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Dashboard;
