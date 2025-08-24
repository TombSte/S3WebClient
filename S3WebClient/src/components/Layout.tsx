import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  alpha,
  useTheme,
  Badge,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard,
  Storage,
  Settings,
  AccountCircle,
  CloudQueue,
  NotificationsNone,
} from "@mui/icons-material";
import { useNotifications } from "../contexts/NotificationsContext";

const drawerWidth = 252;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [notifOpen, setNotifOpen] = React.useState(false);
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { notifications } = useNotifications();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: "Dashboard", icon: <Dashboard />, path: "/" },
    { text: "Buckets", icon: <Storage />, path: "/buckets" },
    { text: "Settings", icon: <Settings />, path: "/settings" },
    { text: "Profile", icon: <AccountCircle />, path: "/profile" },
  ];

  const handleMenuClick = (path: string) => {
    navigate(path);
    setMobileOpen(false); // Close mobile drawer when navigating
  };

  const drawer = (
    <Box height="100%">
      <Toolbar
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          color: theme.palette.primary.contrastText,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <CloudQueue sx={{ mr: 1 }} />
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: "bold" }}>
            S3 Web Client
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List sx={{ mt: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => handleMenuClick(item.path)}
              selected={location.pathname === item.path}
              sx={{
                position: "relative",
                mx: 1,
                mb: 0.5,
                borderRadius: 2,
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                },
                "&.Mui-selected": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.15),
                  "& .MuiListItemIcon-root": {
                    color: theme.palette.primary.main,
                  },
                  "&:before": {
                    content: '""',
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 4,
                    borderTopLeftRadius: 2,
                    borderBottomLeftRadius: 2,
                    backgroundColor: theme.palette.primary.main,
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color:
                    location.pathname === item.path
                      ? theme.palette.primary.main
                      : theme.palette.text.secondary,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  "& .MuiTypography-root": {
                    fontWeight: 500,
                    fontSize: "0.95rem",
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        minWidth: "100%",
        maxWidth: "100%",
        overflow: "hidden",
      }}
    >
      <CssBaseline />

      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minWidth: { sm: `calc(100% - ${drawerWidth}px)` },
          maxWidth: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary,
          boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
          zIndex: theme.zIndex.appBar,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
            <CloudQueue sx={{ mr: 1 }} />
            <Typography variant="h6" noWrap component="div">
              S3 Web Client
            </Typography>
          </Box>
          <IconButton
            color="inherit"
            aria-label="notifications"
            onClick={() => setNotifOpen(true)}
          >
            <Badge badgeContent={notifications.length} color="primary">
              <NotificationsNone />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Right Sidebar Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              background: theme.palette.background.paper,
              backgroundImage: `linear-gradient(to bottom, ${theme.palette.background.paper}, ${alpha(theme.palette.primary.light, 0.05)})`,
              borderRight: "none",
              boxShadow: "2px 0 8px rgba(0,0,0,0.05)",
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              background: theme.palette.background.paper,
              backgroundImage: `linear-gradient(to bottom, ${theme.palette.background.paper}, ${alpha(theme.palette.primary.light, 0.05)})`,
              borderRight: "none",
              boxShadow: "2px 0 8px rgba(0,0,0,0.05)",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minWidth: { sm: `calc(100% - ${drawerWidth}px)` },
          maxWidth: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: "100vh",
          backgroundColor: theme.palette.background.default,
          display: "flex",
          flexDirection: "column",
          overflow: "visible",
        }}
      >
        <Toolbar />
        <Box
          sx={{
            flex: 1,
            width: "100%",
            minWidth: "100%",
            maxWidth: "100%",
            p: 3,
            boxSizing: "border-box",
            textAlign: "left",
            alignItems: "flex-start",
            overflow: "visible",
          }}
        >
          {children}
        </Box>
      </Box>
      <Drawer
        anchor="right"
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        sx={{ "& .MuiDrawer-paper": { width: 320 } }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Notifications
          </Typography>
        </Toolbar>
        <Divider />
        <List>
          {notifications.slice(0, 10).map((n) => (
            <ListItem key={n.id}>
              <ListItemText
                primary={n.message}
                secondary={n.date.toLocaleString()}
              />
            </ListItem>
          ))}
        </List>
        <Divider />
        <List>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => {
                navigate("/notifications");
                setNotifOpen(false);
              }}
            >
              <ListItemText primary="View all" />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
    </Box>
  );
};

export default Layout;
