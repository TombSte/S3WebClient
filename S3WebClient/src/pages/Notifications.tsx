import { Box, Typography } from "@mui/material";

const Notifications = () => {
  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Notifications
      </Typography>
      <Typography variant="body1">No notifications yet.</Typography>
    </Box>
  );
};

export default Notifications;
