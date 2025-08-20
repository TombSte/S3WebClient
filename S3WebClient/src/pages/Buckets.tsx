import React from "react";
import { Typography, Box } from "@mui/material";

const Buckets: React.FC = () => {
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
        Buckets
      </Typography>
    </Box>
  );
};

export default Buckets;
