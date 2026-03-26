import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useSelector } from "react-redux";
import {
  LayoutDashboard,
  BookOpen,
  Settings,
  GraduationCap,
  School,
  LogOut,
  User,
  Moon,
  Sun,
  UserPlus,
  CreditCard,
  Presentation,
  CheckCircle,
  Clock,
  Home,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Toolbar,
  Typography,
  Box,
  Divider,
  useTheme as useMuiTheme,
} from "@mui/material";

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/admin/dashboard",
    roles: ["SUPER_ADMIN"],
  },
  { title: "Dashboard", icon: GraduationCap, path: "/hr", roles: ["MANAGER"] },
  {
    title: "Manage Users",
    icon: UserPlus,
    path: "/hr/user-management",
    roles: ["MANAGER"],
  },
  {
    title: "Upgrade Credits",
    icon: CreditCard,
    path: "/signup",
    roles: ["MANAGER"],
  },
  {
    title: "Instructor",
    icon: School,
    path: "/instructor",
    roles: ["INSTRUCTOR"],
  },
  { title: "Home", icon: Home, path: "/employee", roles: ["EMPLOYEE"] },
  {
    title: "Completed Courses",
    icon: CheckCircle,
    path: "/completed-courses",
    roles: ["EMPLOYEE"],
  },
  {
    title: "Pending Courses",
    icon: Clock,
    path: "/pending-courses",
    roles: ["EMPLOYEE"],
  },
  {
    title: "Create Courses",
    icon: BookOpen,
    path: "/courses/create",
    roles: ["SUPER_ADMIN", "INSTRUCTOR"],
  },
  // {
  //   title: "Create Presentation",
  //   icon: Presentation,
  //   path: "/presentation/create",
  //   roles: ["SUPER_ADMIN", "INSTRUCTOR"],
  // },
  {
    title: "Settings",
    icon: Settings,
    path: "/admin/settings",
    roles: ["SUPER_ADMIN"],
  },
];

const AdminLayout = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const navigate = useNavigate();
  const signout = useAuthStore((state) => state.signout);
  const { theme, toggleTheme } = useTheme();
  const muiTheme = useMuiTheme();
  const user = useSelector((state: any) => state.auth.user);
  const userRole = user?.role || "GUEST";

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  const handleMouseEnter = () => {
    if (!sidebarExpanded) {
      setSidebarHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (!sidebarExpanded) {
      setSidebarHovered(false);
    }
  };

  const handleLogout = () => {
    signout();
    navigate("/");
  };

  // Dark mode colors
  const darkMode = theme === "dark";
  const drawerBgColor = darkMode ? "#1E293B" : "#ffffff";
  const textColor = darkMode ? "#ffffff" : "#1F2937";
  const hoverBgColor = darkMode ? "#334155" : "#F3F4F6";
  const activeBgColor = darkMode ? "#3B82F6" : "#EFF6FF";
  const activeTextColor = darkMode ? "#93C5FD" : "#3B82F6";
  const dividerColor = darkMode ? "#374151" : "#E5E7EB";

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: darkMode ? "#0F172A" : "#F9FAFB",
      }}
    >
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        open={sidebarExpanded || sidebarHovered}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        sx={{
          width: sidebarExpanded || sidebarHovered ? "20%" : 80,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: sidebarExpanded || sidebarHovered ? "20%" : 80,
            boxSizing: "border-box",
            overflowX: "hidden",
            display: "flex",
            flexDirection: "column",
            bgcolor: drawerBgColor,
            color: textColor,
            borderRight: `1px solid ${dividerColor}`,
          },
        }}
      >
        <Toolbar>
          {(sidebarExpanded || sidebarHovered) && (
            <Typography variant="h6" noWrap component="div">
              Elevatics360
            </Typography>
          )}
        </Toolbar>
        <Divider sx={{ borderColor: dividerColor }} />
        <List sx={{ flexGrow: 1 }}>
          {menuItems
            .filter((item) => item.roles.includes(userRole))
            .map((item) => {
              const Icon = item.icon;
              return (
                <ListItem
                  button
                  key={item.path}
                  component={NavLink}
                  to={item.path}
                  sx={{
                    px: 2.5,
                    py: 1.5,
                    borderRadius: 2,
                    "&.active": {
                      bgcolor: activeBgColor,
                      color: activeTextColor,
                      "& .MuiListItemIcon-root": {
                        color: activeTextColor,
                      },
                    },
                    "&:hover": {
                      bgcolor: hoverBgColor,
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, py: 1 }}>
                    <Icon size={20} color={muiTheme.palette.text.primary} />
                  </ListItemIcon>
                  {(sidebarExpanded || sidebarHovered) && (
                    <ListItemText primary={item.title} />
                  )}
                </ListItem>
              );
            })}
        </List>
        <Box sx={{ mt: "auto" }}>
          <Divider sx={{ borderColor: dividerColor }} />
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  bgcolor: darkMode ? "#334155" : "#E5E7EB",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <User size={20} color={muiTheme.palette.text.primary} />
              </Box>
              {(sidebarExpanded || sidebarHovered) && (
                <Box
                  sx={{
                    flexGrow: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                    {user?.username || "Guest User"}
                  </Typography>
                  <IconButton onClick={toggleTheme} sx={{ color: textColor }}>
                    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                  </IconButton>
                </Box>
              )}
            </Box>
            {!(sidebarExpanded || sidebarHovered) && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  mt: 1,
                }}
              >
                <IconButton onClick={toggleTheme} sx={{ color: textColor }}>
                  {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </IconButton>
                <IconButton onClick={handleLogout} sx={{ color: textColor }}>
                  <LogOut size={20} />
                </IconButton>
              </Box>
            )}
            {(sidebarExpanded || sidebarHovered) && (
              <Box sx={{ mt: 2 }}>
                <IconButton
                  onClick={handleLogout}
                  sx={{
                    color: textColor,
                    "&:hover": {
                      bgcolor: hoverBgColor,
                    },
                  }}
                >
                  <LogOut size={20} />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    Sign out
                  </Typography>
                </IconButton>
              </Box>
            )}
          </Box>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          px: 3,
          bgcolor: darkMode ? "#0F172A" : "#F9FAFB",
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;
