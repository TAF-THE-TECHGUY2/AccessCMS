import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  AppBar,
  Avatar,
  Box,
  Chip,
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
  MailOutline as MessagesIcon,
  Settings as SettingsIcon,
  AdminPanelSettings as UsersIcon,
  Menu as MenuIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { useAuth } from "../AuthContext.jsx";
import logo from "../assets/Logo.png";

const navItems = [
  { label: "Dashboard", to: "/", icon: <DashboardIcon /> },
  { label: "Pages", to: "/pages", icon: <PagesIcon /> },
  { label: "Properties", to: "/properties", icon: <PropertiesIcon /> },
  { label: "Media", to: "/media", icon: <MediaIcon /> },
  { label: "Team", to: "/team", icon: <TeamIcon /> },
  { label: "FAQ", to: "/faq", icon: <FaqIcon /> },
  { label: "Messages", to: "/messages", icon: <MessagesIcon /> },
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

  // Highlight the section for nested routes too (/pages/123 -> Pages)
  const isItemActive = (to) =>
    to === "/" ? location.pathname === "/" : location.pathname === to || location.pathname.startsWith(to + "/");

  const drawerWidth = collapsed ? 76 : 240;

  const drawerContent = (
    <>
      {/* Spacer so the nav starts below the fixed AppBar */}
      <Toolbar />
      <List sx={{ px: 1, py: 1.5 }}>
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
              selected={isItemActive(item.to)}
              onClick={() => setMobileOpen(false)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                "&.Mui-selected": {
                  bgcolor: "primary.main",
                  color: "#fff",
                  "& .MuiListItemIcon-root": { color: "#fff" },
                  "&:hover": { bgcolor: "primary.dark" },
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
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: "background.paper",
          color: "text.primary",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flexGrow: 1 }}>
            <Box component="img" src={logo} alt="Access Properties" sx={{ height: 40, width: "auto" }} />
            <Chip label="CMS" size="small" color="secondary" sx={{ fontWeight: 700 }} />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main", fontSize: 14 }}>
              {(user?.email || "?").charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="body2" sx={{ display: { xs: "none", sm: "block" } }}>
              {user?.email}
            </Typography>
            <Button variant="outlined" color="inherit" size="small" onClick={logout} startIcon={<LogoutIcon />}>
              Logout
            </Button>
          </Box>
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
              border: "none",
              borderRight: "1px solid",
              borderColor: "divider",
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
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, minHeight: "100vh", bgcolor: "background.default" }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
