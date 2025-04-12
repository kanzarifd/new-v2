import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MapIcon from '@mui/icons-material/Map';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import PeopleIcon from '@mui/icons-material/People';

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
  setDrawerOpen
}) => {
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, section: 'dashboard' },
    { text: 'Existing Regions', icon: <MapIcon />, section: 'regions' },
    { text: 'Reclamations by Priority', icon: <PriorityHighIcon />, section: 'priority' },
    { text: 'Users by Role', icon: <PeopleIcon />, section: 'users' },
  ];

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          marginTop: isMobile ? 0 : '64px', // Adjust based on your header height
        },
      }}
    >
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.section}
            selected={activeSection === item.section}
            onClick={() => {
              setActiveSection(item.section);
              if (isMobile) setDrawerOpen(false);
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default AdminSidebar;