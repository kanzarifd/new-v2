import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  LocationCity as LocationCityIcon,
  PriorityHigh as PriorityHighIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme as useCustomTheme } from './context/ThemeContext';

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
  { text: 'Regions', icon: <LocationCityIcon />, path: '/admin/regions' },
  { text: 'Reclamations', icon: <PriorityHighIcon />, path: '/admin/reclamations' },
  { text: 'Users', icon: <PeopleIcon />, path: '/admin/users' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/admin/settings' },
];

const Sidebar: React.FC<SidebarProps> = ({ open, onToggle }) => {
  const theme = useTheme();
  const customTheme = useCustomTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      onToggle();
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <IconButton
        color="inherit"
        aria-label="open drawer"
        onClick={onToggle}
        edge="start"
        sx={{
          ...(open && { display: 'none' }),
          color: customTheme.mode === 'dark' ? '#ffffff' : theme.palette.text.primary,
        }}
      >
        <MenuIcon />
      </IconButton>

      <Drawer
        variant="permanent"
        anchor="left"
        open={open}
        onClose={onToggle}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: open ? drawerWidth : 72,
            boxSizing: 'border-box',
            backgroundColor: customTheme.mode === 'dark' ? '#1a1a1a' : theme.palette.background.default,
            color: customTheme.mode === 'dark' ? '#ffffff' : theme.palette.text.primary,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
            display: { xs: 'none', sm: 'block' },
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: open ? 'space-between' : 'center',
            padding: '16px',
            color: customTheme.mode === 'dark' ? '#ffffff' : theme.palette.text.primary,
          }}
        >
          <Typography variant="h6" noWrap>
            Admin Panel
          </Typography>
          <IconButton onClick={onToggle} sx={{ ml: 1 }}>
            {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </Box>
        <Divider />

        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
                '&:hover': {
                  backgroundColor: customTheme.mode === 'dark' ? '#2d2d2d' : theme.palette.action.hover,
                },
                color: customTheme.mode === 'dark' ? '#ffffff' : theme.palette.text.primary,
              }}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  opacity: open ? 1 : 0,
                  transition: theme.transitions.create('opacity', {
                    duration: theme.transitions.duration.shortest,
                  }),
                }}
              />
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        anchor="left"
        open={open && isMobile}
        onClose={onToggle}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            backgroundColor: customTheme.mode === 'dark' ? '#1a1a1a' : theme.palette.background.default,
            color: customTheme.mode === 'dark' ? '#ffffff' : theme.palette.text.primary,
          },
        }}
      >
        <Box sx={{ width: drawerWidth }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              color: customTheme.mode === 'dark' ? '#ffffff' : theme.palette.text.primary,
            }}
          >
            <Typography variant="h6" noWrap>
              Menu
            </Typography>
            <IconButton onClick={onToggle}>
              <ChevronLeftIcon />
            </IconButton>
          </Box>
          <Divider />
          <List>
            {menuItems.map((item) => (
              <ListItem
                button
                key={item.text}
                selected={location.pathname === item.path}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  '&:hover': {
                    backgroundColor: customTheme.mode === 'dark' ? '#2d2d2d' : theme.palette.action.hover,
                  },
                  color: customTheme.mode === 'dark' ? '#ffffff' : theme.palette.text.primary,
                }}
              >
                <ListItemIcon sx={{ color: 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </Box>
  );
};

export default Sidebar;
