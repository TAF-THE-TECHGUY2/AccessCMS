import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  AppBar,
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Divider,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Description as PagesIcon,
  HomeWork as PropertiesIcon,
  PhotoLibrary as MediaIcon,
  People as TeamIcon,
  HelpOutline as FaqIcon,
  Settings as SettingsIcon,
  AdminPanelSettings as UsersIcon,
  Menu as MenuIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { useAuth } from "../AuthContext.jsx";

const navItems = [
  { label: "Dashboard", to: "/", icon: <DashboardIcon /> },
  { label: "Pages", to: "/pages", icon: <PagesIcon /> },
  { label: "Properties", to: "/properties", icon: <PropertiesIcon /> },
  { label: "Media", to: "/media", icon: <MediaIcon /> },
  { label: "Team", to: "/team", icon: <TeamIcon /> },
  { label: "FAQ", to: "/faq", icon: <FaqIcon /> },
  { label: "Site Settings", to: "/settings", icon: <SettingsIcon /> },
  { label: "Users", to: "/users", icon: <UsersIcon /> },
];

export default function AdminLayout({ children }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const isDesktop = useMediaQuery("(min-width:900px)");
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const allowedItems = navItems.filter((item) => {
    if (item.to === "/users") return user?.role === "admin";
    if (item.to === "/settings") return user?.role === "admin";
    return true;
  });

  const drawerWidth = collapsed ? 76 : 240;

  const drawerContent = (
    <>
      <Toolbar sx={{ px: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, opacity: collapsed ? 0 : 1 }}>
          Admin
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ px: 1, py: 1 }}>
        {allowedItems.map((item) => (
          <Tooltip
            key={item.to}
            title={collapsed ? item.label : ""}
            placement="right"
            disableHoverListener={!collapsed}
          >
            <ListItemButton
              component={Link}
              to={item.to}
              selected={location.pathname === item.to}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                "&.Mui-selected": {
                  bgcolor: "rgba(31, 41, 55, 0.12)",
                  "&:hover": { bgcolor: "rgba(31, 41, 55, 0.2)" },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              {!collapsed ? <ListItemText primary={item.label} /> : null}
            </ListItemButton>
          </Tooltip>
        ))}
      </List>
      <Box sx={{ flexGrow: 1 }} />
    </>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar position="fixed" color="default" elevation={0}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={() => (isDesktop ? setCollapsed((v) => !v) : setMobileOpen(true))}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Access Properties Admin
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.email}
          </Typography>
          <Button variant="outlined" color="inherit" onClick={logout} startIcon={<LogoutIcon />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      {isDesktop ? (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: "border-box",
              transition: "width 0.2s ease",
              overflowX: "hidden",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sx={{ [`& .MuiDrawer-paper`]: { width: 240 } }}
        >
          {drawerContent}
        </Drawer>
      )}
      <Box component="main" sx={{ flexGrow: 1, p: 3, ml: isDesktop ? 0 : 0 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
