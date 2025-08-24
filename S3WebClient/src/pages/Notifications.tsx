import { Box, List, ListItem, ListItemText, Typography } from "@mui/material";
import { useNotifications } from "../contexts/NotificationsContext";

const Notifications = () => {
  const { notifications } = useNotifications();

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Notifications
      </Typography>
      {notifications.length === 0 ? (
        <Typography variant="body1">No notifications yet.</Typography>
      ) : (
        <List>
          {notifications.map((n) => (
            <ListItem key={n.id}>
              <ListItemText
                primary={n.message}
                secondary={n.date.toLocaleString()}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default Notifications;
