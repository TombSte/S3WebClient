import { Box, List, ListItem, ListItemText, Typography, Card, CardContent, Divider, Avatar, Button } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useNotifications } from "../contexts/NotificationsContext";

const Notifications = () => {
  const { notifications, clearAll, markAllRead } = useNotifications();

  return (
    <Box sx={{ p: 3, width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <NotificationsIcon color="primary" />
        <Typography variant="h5" sx={{ fontWeight: 'bold', flexGrow: 1 }}>Notifications</Typography>
        {notifications.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button size="small" variant="outlined" onClick={() => markAllRead()}>Mark all read</Button>
            <Button size="small" color="error" variant="outlined" onClick={() => clearAll()}>Clear all</Button>
          </Box>
        )}
      </Box>
      {notifications.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Avatar sx={{ bgcolor: 'action.hover', color: 'text.secondary', width: 56, height: 56, m: '0 auto', mb: 1 }}>
              <NotificationsIcon />
            </Avatar>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>No notifications yet</Typography>
            <Typography variant="body2" color="text.secondary">Your recent actions’ updates will appear here.</Typography>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent sx={{ p: 0 }}>
            <List sx={{ py: 0 }}>
              {notifications.map((n, idx) => (
                <Box key={n.id}>
                  <ListItem sx={{ px: 2, py: 1.5, '&:hover': { bgcolor: 'action.hover' } }}>
                    <Avatar sx={{ bgcolor: 'success.main', color: 'common.white', mr: 2, width: 32, height: 32 }}>
                      <CheckCircleIcon fontSize="small" />
                    </Avatar>
                    <ListItemText
                      primary={<Typography sx={{ fontWeight: 600, fontSize: '0.95rem' }}>{n.message}</Typography>}
                      secondary={<Typography variant="caption" color="text.secondary">{n.date.toLocaleString()}</Typography>}
                    />
                  </ListItem>
                  {idx < notifications.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default Notifications;
