import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard,
  Storage,
  Settings,
  AccountCircle,
} from "@mui/icons-material";

const drawerWidth = 224;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

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
    <Box>
      <Toolbar>
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ fontWeight: "bold" }}
        >
          S3 Web Client
        </Typography>
      </Toolbar>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => handleMenuClick(item.path)}
              selected={location.pathname === item.path}
              sx={{
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                },
                "&.Mui-selected": {
                  backgroundColor: theme.palette.primary.light + "20",
                  borderRight: `3px solid ${theme.palette.primary.main}`,
                },
                borderRadius: 1,
                mx: 1,
                mb: 0.5,
              }}
            >
              <ListItemIcon sx={{ color: theme.palette.primary.main }}>
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
        width: "100vw",
        minWidth: "100vw",
        maxWidth: "100vw",
        overflow: "hidden",
      }}
    >
      <CssBaseline />

      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100vw - ${drawerWidth}px)` },
          minWidth: { sm: `calc(100vw - ${drawerWidth}px)` },
          maxWidth: { sm: `calc(100vw - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
          zIndex: theme.zIndex.drawer + 1,
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
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            S3 Web Client
          </Typography>
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
              backgroundColor: theme.palette.background.paper,
              borderRight: `1px solid ${theme.palette.divider}`,
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
              backgroundColor: theme.palette.background.paper,
              borderRight: `1px solid ${theme.palette.divider}`,
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
          width: { sm: `calc(100vw - ${drawerWidth}px)` },
          minWidth: { sm: `calc(100vw - ${drawerWidth}px)` },
          maxWidth: { sm: `calc(100vw - ${drawerWidth}px)` },
          minHeight: "100vh",
          backgroundColor: theme.palette.grey[50],
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
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
            overflow: "auto",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
