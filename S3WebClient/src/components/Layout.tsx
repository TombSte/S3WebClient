import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  Tooltip,
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
  Breadcrumbs,
  Link as MUILink,
} from "@mui/material";
import {
  Menu as MenuIcon,
  ChevronLeft,
  ChevronRight,
  Dashboard,
  Storage,
  Settings,
  AccountCircle,
  CloudQueue,
  NotificationsNone,
} from "@mui/icons-material";
import { useNotifications } from "../contexts/NotificationsContext";
import { connectionRepository } from "../repositories";

const expandedWidth = 252;
const collapsedWidth = 72;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [notifOpen, setNotifOpen] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);
  const [bucketLabel, setBucketLabel] = React.useState<string | null>(null);

  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  React.useEffect(() => {
    const match = location.pathname.match(/^\/bucket\/(\d+)/);
    if (match) {
      const id = match[1];
      setBucketLabel(null); // avoid placeholder flicker
      (async () => {
        try {
          const conn = await connectionRepository.get(id);
          setBucketLabel(conn?.displayName || conn?.bucketName || id);
        } catch {
          setBucketLabel(id);
        }
      })();
    } else {
      setBucketLabel(null);
    }
  }, [location.pathname]);
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
    <Box height="100%" sx={{ display: 'flex', flexDirection: 'column' }}>
      <Toolbar
        sx={{
          bgcolor: theme.palette.background.default,
          color: theme.palette.text.primary,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", width: "100%", justifyContent: collapsed ? "center" : "flex-start" }}>
          <CloudQueue sx={{ mr: collapsed ? 0 : 1, color: theme.palette.primary.main }} />
          {!collapsed && (
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ fontWeight: 700, letterSpacing: 0.2, color: theme.palette.primary.main }}
            >
              S3 Web Client
            </Typography>
          )}
        </Box>
      </Toolbar>
      <List sx={{ mt: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <Tooltip title={item.text} placement="right" disableHoverListener={!collapsed}>
            <ListItemButton
              onClick={() => handleMenuClick(item.path)}
              selected={location.pathname === item.path}
              sx={{
                position: "relative",
                mx: collapsed ? 0.5 : 1,
                mb: 0.25,
                borderRadius: 1.5,
                transition: "background-color 120ms ease",
                justifyContent: collapsed ? "center" : "flex-start",
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.06),
                },
                "&.Mui-selected": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.12),
                  "& .MuiListItemIcon-root": {
                    color: theme.palette.primary.main,
                  },
                  "&:before": {
                    content: '""',
                    position: "absolute",
                    left: collapsed ? -9999 : 0,
                    top: 0,
                    bottom: 0,
                    width: 3,
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
                  minWidth: collapsed ? 0 : 32,
                  mr: collapsed ? 0 : 1,
                }}
              >
                {item.icon}
              </ListItemIcon>
              {!collapsed && (
                <ListItemText
                  primary={item.text}
                  sx={{
                    "& .MuiTypography-root": {
                      fontWeight: 600,
                      fontSize: "0.95rem",
                      letterSpacing: 0.2,
                    },
                  }}
                />
              )}
            </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>
      <Box sx={{ flexGrow: 1 }} />
      {/* Collapse/Expand toggle at bottom (desktop only) */}
      <Box sx={{ p: 1, display: { xs: 'none', sm: 'flex' }, justifyContent: collapsed ? 'center' : 'flex-end' }}>
        <Tooltip title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} placement="right">
          <IconButton aria-label="toggle sidebar" onClick={() => setCollapsed((v) => !v)} size="small">
            {collapsed ? <ChevronRight /> : <ChevronLeft />}
          </IconButton>
        </Tooltip>
      </Box>
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
          width: { sm: `calc(100% - ${collapsed ? collapsedWidth : expandedWidth}px)` },
          minWidth: { sm: `calc(100% - ${collapsed ? collapsedWidth : expandedWidth}px)` },
          maxWidth: { sm: `calc(100% - ${collapsed ? collapsedWidth : expandedWidth}px)` },
          ml: { sm: `${collapsed ? collapsedWidth : expandedWidth}px` },
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary,
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
          {/* Toggle moved to sidebar bottom on desktop */}
          <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1, minWidth: 0 }}>
            {location.pathname !== "/" && (() => {
              const items: JSX.Element[] = [];
              if (location.pathname.startsWith("/buckets")) {
                items.push(<Typography key="buckets" color="text.primary">Buckets</Typography>);
              }
              if (location.pathname.startsWith("/bucket/")) {
                items.push(
                  <MUILink key="buckets-link" underline="hover" color="inherit" onClick={() => navigate("/buckets")} sx={{ cursor: "pointer" }}>
                    Buckets
                  </MUILink>
                );
                if (bucketLabel !== null) {
                  items.push(
                    <Typography key="bucket-name" color="text.primary" sx={{ display: "inline-flex", alignItems: "center", maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: 'nowrap' }}>
                      {bucketLabel}
                    </Typography>
                  );
                }
              }
              if (location.pathname === "/settings") items.push(<Typography key="settings" color="text.primary">Settings</Typography>);
              if (location.pathname === "/profile") items.push(<Typography key="profile" color="text.primary">Profile</Typography>);
              if (location.pathname === "/notifications") items.push(<Typography key="notifications" color="text.primary">Notifications</Typography>);
              if (items.length === 0) return null;
              return (
                <Breadcrumbs aria-label="breadcrumb" sx={{ color: theme.palette.text.secondary, whiteSpace: 'nowrap', overflow: 'hidden', '& .MuiBreadcrumbs-ol': { flexWrap: 'nowrap' } }}>
                  {items}
                </Breadcrumbs>
              );
            })()}
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
        sx={{ width: { sm: collapsed ? collapsedWidth : expandedWidth }, flexShrink: { sm: 0 } }}
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
              width: collapsed ? collapsedWidth : expandedWidth,
              background: theme.palette.background.paper,
              borderRight: `1px solid ${theme.palette.divider}`,
              boxShadow: "2px 0 8px rgba(0,0,0,0.04)",
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
              width: collapsed ? collapsedWidth : expandedWidth,
              background: theme.palette.background.paper,
              borderRight: `1px solid ${theme.palette.divider}`,
              boxShadow: "none",
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
          width: { sm: `calc(100% - ${collapsed ? collapsedWidth : expandedWidth}px)` },
          minWidth: { sm: `calc(100% - ${collapsed ? collapsedWidth : expandedWidth}px)` },
          maxWidth: { sm: `calc(100% - ${collapsed ? collapsedWidth : expandedWidth}px)` },
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
