import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Box,
  Divider,
  ListItemIcon,
  useMediaQuery,
  useTheme,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Paper,
  Badge,
} from '@mui/material';
import {
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  AccountCircle as AccountIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  AccountBalance,
  CalendarToday,
  Email,
  MonetizationOn,
  Person,
  Phone
} from '@mui/icons-material';
import { useThemeContext } from '../contexts/ThemeContext';
import api from '../config/api';
import { format, parseISO, isValid } from 'date-fns';
import { User } from '../components/types';
import ReclamSearchBar from '../components/ReclamSearchBar';

interface AdminHeaderProps {
  toggleDrawer: () => void;
  onLogout: () => void;
  isMobile: boolean;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({
  toggleDrawer,
  onLogout,
  isMobile
}) => {
  const { mode, toggleColorMode } = useThemeContext();
  const theme = useTheme();
  const isMobileScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  // Profile dialog state
  const [profile, setProfile] = useState<User | null>(null);
  const [adminInfo, setAdminInfo] = useState<any>(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Fetch current user by ID stored in localStorage
  useEffect(() => {
    const stored = localStorage.getItem('user');
    const userId = stored ? JSON.parse(stored).id : null;
    if (userId) {
      api.get<User>(`/api/users/${userId}`).then(res => setProfile(res.data)).catch(console.error);
    }
  }, []);

  useEffect(() => {
    if (profile?.role === 'admin') {
      api.get<any>(`/api/admins/${profile.id}`).then(res => setAdminInfo(res.data)).catch(console.error);
    }
  }, [profile]);

  return (
    <Box>
      <AppBar
        position="fixed"
        elevation={1}
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 } }}>
          {/* Left Side */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isMobile && (
              <IconButton
                edge="start"
                color="inherit"
                onClick={toggleDrawer}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                fontWeight: 700,
                color: theme.palette.error.main,
                textTransform: 'uppercase',
                fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
                letterSpacing: 1,
              }}
            >
              Admin Dashboard
            </Typography>
          </Box>

          {/* Search */}
          <Box sx={{ flex: 1, mx: 3, maxWidth: 300 }}>
            <ReclamSearchBar />
          </Box>
          {/* Right Side */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Tooltip title={mode === 'dark' ? 'Light mode' : 'Dark mode'}>
              <IconButton
                onClick={toggleColorMode}
                sx={{
                  p: 1.2,
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(220,20,60,0.10)',
                  color: theme.palette.mode === 'dark' ? '#FFD700' : theme.palette.error.main,
                  borderRadius: 2,
                  transition: 'all 0.23s cubic-bezier(.4,2,.6,1)',
                  fontSize: 24,
                  boxShadow: '0 2px 8px 0 rgba(220,20,60,0.08)',
                  '&:hover': {
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(220,20,60,0.18)',
                    color: theme.palette.mode === 'dark' ? '#FFC300' : theme.palette.primary.main,
                    transform: 'scale(1.08) rotate(-8deg)',
                  },
                }}
              >
                {mode === 'dark' ? (
                  <LightModeIcon fontSize="medium" sx={{ filter: 'drop-shadow(0 0 4px #FFD700)' }} />
                ) : (
                  <DarkModeIcon fontSize="medium" sx={{ filter: 'drop-shadow(0 0 4px #e53935)' }} />
                )}
              </IconButton>
            </Tooltip>

            <Tooltip title="Account settings">
              <IconButton
                onClick={handleMenu}
                sx={{
                  p: 0,
                  ml: 1,
                  borderRadius: 2,
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(220,20,60,0.09)',
                  boxShadow: '0 2px 8px 0 rgba(220,20,60,0.10)',
                  transition: 'all 0.22s cubic-bezier(.4,2,.6,1)',
                  '&:hover': {
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(220,20,60,0.17)',
                    transform: 'scale(1.07)',
                  }
                }}
              >
                <Avatar sx={{ width: 40, height: 40, bgcolor: 'white', color: theme.palette.error.main, fontWeight: 'bold', fontSize: 20, border: `2px solid ${theme.palette.error.main}` }}>
                  {profile?.username?.charAt(0)?.toUpperCase()}
                </Avatar>
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              PaperProps={{
                elevation: 3,
                sx: {
                  mt: 1.2,
                  minWidth: 260,
                  borderRadius: 2,
                  boxShadow: '0 2px 16px 0 rgba(220,20,60,0.13)',
                  p: 0.5,
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <Box sx={{
                px: 2,
                pt: 2,
                pb: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                background: `linear-gradient(90deg, ${theme.palette.error.main} 0%, ${theme.palette.primary.main} 100%)`,
                borderRadius: 2,
                boxShadow: '0 2px 8px 0 rgba(220,20,60,0.10)',
                mb: 1.5
              }}>
                <Avatar sx={{ width: 44, height: 44, bgcolor: 'white', color: theme.palette.error.main, fontWeight: 'bold', fontSize: 22, border: `2px solid ${theme.palette.error.main}` }}>
                  {profile?.username?.charAt(0)?.toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'white', lineHeight: 1.1, letterSpacing: 0.5 }}>
                    {profile?.username || profile?.name || profile?.email}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
                    {profile?.email}
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 1, bgcolor: 'rgba(220,20,60,0.18)' }} />
              <MenuItem onClick={() => { handleClose(); setProfileDialogOpen(true); }} sx={{
                borderRadius: 1,
                mb: 0.5,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 0.25,
                px: 2,
                py: 1,
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(220,20,60,0.06)',
                '&:hover': {
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.10)' : 'rgba(220,20,60,0.12)',
                }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <ListItemIcon sx={{ color: theme.palette.error.main, minWidth: 32 }}>
                    <AccountIcon fontSize="small" />
                  </ListItemIcon>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>View Profile</Typography>
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', pl: 4, fontWeight: 600 }}>
                  {profile?.username || profile?.name || profile?.email}
                </Typography>
              </MenuItem>
              <MenuItem sx={{ borderRadius: 1, px: 2, py: 1 }}>
                <ListItemIcon sx={{ color: theme.palette.info.main, minWidth: 32 }}>
                  <SettingsIcon fontSize="small" />
                </ListItemIcon>
                <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Settings</Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={onLogout} sx={{ borderRadius: 1, color: theme.palette.error.main, px: 2, py: 1 }}>
                <ListItemIcon sx={{ color: theme.palette.error.main, minWidth: 32 }}>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Logout</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      {/* Profile Info Dialog */}
      <Dialog open={profileDialogOpen} onClose={() => setProfileDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontWeight: 'bold',
            color: theme.palette.primary.main,
          }}
        >
          Account Overview

        </DialogTitle>

        <DialogContent dividers>
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <Avatar
              sx={{
                bgcolor: theme.palette.primary.main,
                width: 64,
                height: 64,
                fontSize: 28,
                fontWeight: 'bold',
              }}
            >
              {profile?.username?.charAt(0)?.toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h6">{profile?.username}</Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: theme.palette.success.main,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                Role: {profile?.role}
              </Typography>
            </Box>
          </Box>

          <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
            <Grid container spacing={2}>
              {[
                ['Name', profile ? (profile.name || profile.username) : 'Loading...', <Person fontSize="small" />],
                ['Email', profile ? profile.email : 'Loading...', <Email fontSize="small" />],
                ['Full Name', profile ? profile.full_name : 'Loading...', <Person fontSize="small" />],
                ['Phone Number', profile ? profile.number : 'Loading...', <Phone fontSize="small" />],
                ['Bank Account', profile ? profile.bank_account_number : 'Loading...', <AccountBalance fontSize="small" />],
                ['Balance', profile ? profile.bank_account_balance?.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : 'Loading...', <MonetizationOn fontSize="small" />],

              ].map(([label, value, icon]) => (
                <Grid item xs={12} sm={6} key={String(label)}>
                  <Box display="flex" alignItems="center" gap={1}>
                    {icon}
                    <Typography variant="subtitle2" color="text.secondary">
                      {label}
                    </Typography>
                  </Box>
                  <Typography variant="body2">{value}</Typography>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {adminInfo && (
            <Paper elevation={1} sx={{ p: 2, mt: 3, borderRadius: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Admin Details
              </Typography>
              <Grid container spacing={1}>
                {Object.entries(adminInfo).map(([key, value]) => (
                  <Grid item xs={12} key={key}>
                    <Typography variant="body2">
                      <strong>{key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}:</strong> {String(value)}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'flex-end' }}>
          <Button onClick={() => setProfileDialogOpen(false)} color="primary" variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>


    </Box>
  );
};

export default AdminHeader;