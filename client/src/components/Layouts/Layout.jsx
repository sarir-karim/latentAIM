import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import Sidebar from "../_organisms/Sidebar";

const DRAWER_WIDTH = 240;
const MAIN_CONTENT_MAX_WIDTH = 1200;
const MINI_SIDEBAR_WIDTH = 250;

const Layout = ({ children, toggleTheme, mode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const theme = useTheme();
  const location = useLocation();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const isDocPage =
    location.pathname === "/documentation" ||
    location.pathname === "/doc-builder";

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          width: "100%",
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            edge="start"
            onClick={toggleSidebar}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Latent Knowledge
          </Typography>
          <IconButton sx={{ ml: 1 }} onClick={toggleTheme} color="inherit">
            {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Toolbar>
      </AppBar>
      <Sidebar
        open={sidebarOpen}
        activeItem={location.pathname}
        drawerWidth={DRAWER_WIDTH}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: "100%",
          mt: ["48px", "56px", "64px"],
          // ml: sidebarOpen ? `${DRAWER_WIDTH}px` : 0,
          transition: theme.transitions.create("margin", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {isDocPage ? (
          <Box sx={{ display: "flex" }}>{children}</Box>
        ) : (
          <Box
            sx={{
              maxWidth: `${MAIN_CONTENT_MAX_WIDTH}px`,
              width: "100%",
              mx: "auto",
            }}
          >
            {children}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Layout;
