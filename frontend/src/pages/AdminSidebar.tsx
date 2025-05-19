import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  IconButton,
  useTheme,
  useMediaQuery,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Map as MapIcon,
  PriorityHigh as PriorityHighIcon,
  People as PeopleIcon,
  Menu as MenuIcon,
  MenuOpen as MenuOpenIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';

interface AdminSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  isMobile: boolean;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeSection,
  setActiveSection,
  isMobile,
  drawerOpen,
  setDrawerOpen,
}) => {
  const theme = useTheme();
  const isMobileScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [isCollapsed, setIsCollapsed] = useState(false);

  const drawerWidth = isCollapsed ? 72 : 240;

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, section: 'dashboard' },
    { text: 'Existing Regions', icon: <MapIcon />, section: 'regions' },
    { text: 'Reclamations by Priority', icon: <PriorityHighIcon />, section: 'priority' },
    { text: 'Users by Role', icon: <PeopleIcon />, section: 'users' },
    { text: 'Agents', icon: <AssignmentIcon />, section: 'agents' },
  ];

  const toggleDrawer = () => {
    if (isMobileScreen) {
      setDrawerOpen(!drawerOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <Drawer
      variant={isMobileScreen ? 'temporary' : 'permanent'}
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          mt: isMobileScreen ? 0 : '64px',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          backgroundColor: theme.palette.background.default,
          borderRight: `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      {/* Logo Section */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          px: 2,
          py: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        {!isCollapsed && (
          <Box
            component="img"
            src="/ATB-logo.png"
            alt="ATB Logo"
            sx={{ width: 100, height: 'auto' }}
          />
        )}

        <Tooltip title={isCollapsed ? 'Expand' : 'Collapse'}>
          <IconButton
            size="small"
            onClick={toggleDrawer}
            sx={{
              ml: isCollapsed ? 0 : 'auto',
              transition: theme.transitions.create(['transform'], {
                duration: theme.transitions.duration.shortest,
              }),
              transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >
            {isCollapsed ? <MenuOpenIcon /> : <MenuIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Menu Items */}
      <List
        sx={{
          mt: 1,
          px: 0.5,
          '& .MuiListItemButton-root': {
            borderRadius: 2,
          },
        }}
      >
        {menuItems.map((item) => (
          <Tooltip
            key={item.section}
            title={isCollapsed ? item.text : ''}
            placement="right"
            arrow
          >
            <ListItem
              button
              selected={activeSection === item.section}
              onClick={() => {
                setActiveSection(item.section);
                if (isMobileScreen) setDrawerOpen(false);
              }}
              sx={{
                px: isCollapsed ? 1 : 2.5,
                py: 1.5,
                my: 0.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                bgcolor: activeSection === item.section ? theme.palette.action.selected : 'transparent',
                '&:hover': {
                  backgroundColor: '#8B0000', // darkred
                  color: '#fff',
                  '& .MuiListItemIcon-root': {
                    color: '#fff',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: '#e53935',
                  minWidth: isCollapsed ? 0 : 40,
                  mr: isCollapsed ? 0 : 2,
                  justifyContent: 'center',
                  transition: 'color 0.2s',
                }}
              >
                {item.icon}
              </ListItemIcon>
              {!isCollapsed && <ListItemText primary={item.text} />}
            </ListItem>
          </Tooltip>
        ))}
      </List>

      <Box flexGrow={1} />
      {!isMobileScreen && <Divider sx={{ mt: 2, mb: 1 }} />}
    </Drawer>
  );
};

export default AdminSidebar;
