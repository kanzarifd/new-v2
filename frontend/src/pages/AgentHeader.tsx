import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Divider,
  ListItemIcon,
  useMediaQuery,
  useTheme,
  Tooltip,
  Paper,
  Grid,
  Badge,
} from '@mui/material';
import {
  AccountCircle as AccountIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Person,
  Email,
  Phone,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { useThemeContext } from '../contexts/ThemeContext';
import { useAuth } from '../components/context/AuthContext';
import axios from 'axios';

interface AgentHeaderProps {
  toggleDrawer: () => void;
  onLogout: () => void;
  isMobile: boolean;
}

const AgentHeader: React.FC<AgentHeaderProps> = ({
  toggleDrawer,
  onLogout,
  isMobile,
}) => {
  const { mode, toggleColorMode } = useThemeContext();
  const { user, token } = useAuth();
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const theme = useTheme();
  const isMobileScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<{ id: number; title: string; user: any; user_id: number }[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Map of user_id to user name for fallback
  const [userMap, setUserMap] = useState<{ [id: number]: string }>({});

  useEffect(() => {
    if (profileDialogOpen && user?.id && token) {
      setLoadingProfile(true);
      axios.get(`http://localhost:8000/api/users/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          setProfile(res.data);
          setProfileError(null);
        })
        .catch(err => {
          setProfile(null);
          setProfileError('Could not fetch agent profile');
        })
        .finally(() => setLoadingProfile(false));
    }
  }, [profileDialogOpen, user?.id, token]);

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes bubble-pop {
        0% { transform: scale(1); }
        100% { transform: scale(1.08); }
      }
      @keyframes badge-pulse {
        0% { box-shadow: 0 0 6px 1px #e35d5b; opacity: 1; }
        70% { box-shadow: 0 0 12px 3px #e35d5b; opacity: 0.7; }
        100% { box-shadow: 0 0 6px 1px #e35d5b; opacity: 1; }
      }
    `;
    if (!document.head.querySelector('#agent-header-anim')) {
      style.id = 'agent-header-anim';
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/reclams?unreadForAgent=1', {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (Array.isArray(res.data) && res.data.length > 0) {
          setNotifications(res.data.map((r: any) => ({
            id: r.id,
            title: r.title,
            user: r.user && (r.user.name || r.user.email) ? r.user : null,
            user_id: r.user_id
          })));
          setUnreadCount(res.data.length);
        } else {
          setNotifications([]);
          setUnreadCount(0);
        }
      } catch (err) {
        // fallback: don't update
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [token]);

  // Fetch all users for fallback name resolution
  useEffect(() => {
    axios.get('http://localhost:8000/api/users').then(res => {
      if (Array.isArray(res.data)) {
        const map: { [id: number]: string } = {};
        res.data.forEach((u: any) => {
          map[u.id] = u.name || u.full_name || u.email || `User ${u.id}`;
        });
        setUserMap(map);
      }
    });
  }, []);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
    setUnreadCount(0);
  };

  const handleNotificationClose = () => setNotificationAnchorEl(null);

  return (
    <>
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
              Agent Dashboard
            </Typography>
          </Box>

          {/* Right Side */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Dark/Light Mode Icon with Sun/Moon */}
            <Tooltip title={mode === 'dark' ? 'Light Mode' : 'Dark Mode'}>
              <IconButton onClick={toggleColorMode} sx={{
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(220,20,60,0.10)',
                color: theme.palette.mode === 'dark' ? theme.palette.warning.light : theme.palette.grey[800],
                borderRadius: 2,
                mx: 0.5,
                '&:hover': {
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(220,20,60,0.18)',
                  transform: 'rotate(18deg) scale(1.1)',
                  transition: 'all 0.2s',
                }
              }}>
                {mode === 'dark' ? (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="5" fill="currentColor" />
                    <path d="M12 1.5V3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M12 20.5V22.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M4.22183 4.22183L5.63597 5.63597" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M18.364 18.364L19.7782 19.7782" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M1.5 12H3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M20.5 12H22.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M4.22183 19.7782L5.63597 18.364" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M18.364 5.63597L19.7782 4.22183" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                ) : (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 12.79C20.41 12.93 19.8 13 19.17 13C15.13 13 12 9.87 12 5.83C12 5.2 12.07 4.59 12.21 4C8.79 4.47 6 7.47 6 11C6 14.87 9.13 18 13 18C16.53 18 19.53 15.21 20 11.79Z" fill="currentColor"/>
                  </svg>
                )}
              </IconButton>
            </Tooltip>

            {/* Profile Icon with Animated Badge */}
            <Tooltip title="Account settings">
              <IconButton
                onClick={handleMenu}
                sx={{
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(220,20,60,0.10)',
                  color: theme.palette.mode === 'dark' ? theme.palette.info.light : theme.palette.grey[800],
                  borderRadius: 2,
                  mx: 0.5,
                  position: 'relative',
                  '&:hover': {
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(220,20,60,0.18)',
                    boxShadow: '0 0 0 4px rgba(220,20,60,0.08)',
                    transition: 'all 0.2s',
                  }
                }}
              >
                <Avatar sx={{ width: 26, height: 26, bgcolor: theme.palette.primary.main, fontWeight: 'bold', fontSize: 16 }}>
                  {(profile?.name || profile?.username || profile?.email || '').charAt(0).toUpperCase()}
                </Avatar>
                <span style={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #e53935, #e35d5b)',
                  boxShadow: '0 0 6px 1px #e35d5b',
                  animation: 'badge-pulse 1.2s infinite',
                  display: 'inline-block',
                }} />
              </IconButton>
            </Tooltip>

            {/* Notification Icon with Badge */}
            <Tooltip title="Notifications">
              <IconButton
                color="inherit"
                onClick={handleNotificationClick}
                sx={{
                  bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(220,20,60,0.07)',
                  borderRadius: 2,
                  p: 1,
                  transition: 'background 0.2s',
                  '&:hover': {
                    bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(220,20,60,0.17)',
                    transform: 'scale(1.07)',
                  }
                }}
              >
                <Badge badgeContent={unreadCount} color="error" overlap="circular">
                  <NotificationsIcon sx={{ fontSize: 28, color: mode === 'dark' ? '#fff' : '#b71c1c' }} />
                </Badge>
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={notificationAnchorEl}
              open={Boolean(notificationAnchorEl)}
              onClose={handleNotificationClose}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  minWidth: 340,
                  borderRadius: 3,
                  boxShadow: 10,
                  bgcolor: mode === 'dark' ? '#18181a' : '#fff',
                  px: 0,
                  py: 0,
                  border: mode === 'dark' ? '1.5px solid #2d2d2d' : '1.5px solid #e53935',
                  animation: 'bubble-pop 0.25s cubic-bezier(.4,2,.6,1)',
                  overflow: 'hidden',
                },
              }}
              MenuListProps={{ sx: { p: 0 } }}
            >
              {/* Header */}
              <Box px={3} py={2} borderBottom="1.5px solid" borderColor={mode === 'dark' ? '#292929' : '#e53935'} bgcolor={mode === 'dark' ? '#1e1e1e' : '#fbe9e7'}>
                <Typography variant="subtitle1" fontWeight={700} color={mode === 'dark' ? '#fff' : '#b71c1c'}>
                  Notifications
                </Typography>
                <Typography variant="caption" color={mode === 'dark' ? '#e0e0e0' : '#b71c1c'} fontWeight={600}>
                  You have {notifications.length} new updates
                </Typography>
              </Box>

              {notifications.length === 0 ? (
                <MenuItem disabled sx={{ py: 3, justifyContent: 'center', opacity: 0.7, bgcolor: mode === 'dark' ? '#18181a' : '#fff' }}>
                  No new notifications
                </MenuItem>
              ) : (
                notifications.map((reclam, idx) => (
                  <MenuItem
                    key={reclam.id}
                    onClick={handleNotificationClose}
                    sx={{
                      alignItems: 'flex-start',
                      px: 3,
                      py: 2,
                      borderBottom: idx !== notifications.length - 1 ? '1px solid' : 'none',
                      borderColor: mode === 'dark' ? '#232323' : '#fbe9e7',
                      bgcolor: mode === 'dark' ? '#18181a' : '#fff',
                      color: mode === 'dark' ? '#fff' : '#b71c1c',
                      fontWeight: 600,
                      fontSize: '1rem',
                      transition: 'background 0.18s, color 0.18s, transform 0.18s',
                      '&:hover': {
                        bgcolor: mode === 'dark' ? '#222' : '#ffebee',
                        color: mode === 'dark' ? '#e53935' : '#b71c1c',
                        transform: 'scale(1.02) translateX(3px)',
                        boxShadow: mode === 'dark' ? '0 2px 8px #e5393533' : '0 2px 12px #e5393522',
                      },
                      '& .notif-title': {
                        fontWeight: 700,
                        letterSpacing: 0.2,
                        fontSize: '1.04rem',
                        color: mode === 'dark' ? '#fff' : '#b71c1c',
                        mb: 0.3,
                        transition: 'color 0.18s',
                      },
                      '& .notif-user': {
                        fontWeight: 500,
                        fontSize: '0.97rem',
                        color: mode === 'dark' ? '#e0e0e0' : '#333',
                        mb: 0.2,
                        transition: 'color 0.18s',
                      },
                      '& .notif-id': {
                        fontWeight: 400,
                        fontSize: '0.86rem',
                        color: mode === 'dark' ? '#bdbdbd' : '#adadad',
                        transition: 'color 0.18s',
                      }
                    }}
                  >
                    <Box>
                      <Typography className="notif-title">
                        {reclam.title}
                      </Typography>
                      <Typography className="notif-user">
                        User: {reclam.user && (reclam.user.name || reclam.user.email)
                          ? (reclam.user.name || reclam.user.email)
                          : (userMap[reclam.user_id] || `User ID: ${reclam.user_id}`)}
                      </Typography>
                      <Typography className="notif-id">
                        ID: {reclam.id}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))
              )}
            </Menu>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              PaperProps={{
                elevation: 4,
                sx: {
                  borderRadius: 2,
                  minWidth: 200,
                  bgcolor: theme.palette.background.paper,
                  boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)',
                  p: 1,
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
                  {(profile?.name || profile?.username || profile?.email || '').charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'white', lineHeight: 1.1, letterSpacing: 0.5 }}>
                    {profile?.name || profile?.username || profile?.email}
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
                  {profile?.name || profile?.username || profile?.email}
                </Typography>
              </MenuItem>
              <MenuItem onClick={onLogout} sx={{ borderRadius: 1, color: theme.palette.error.main }}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" sx={{ color: theme.palette.error.main }} />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      {/* Profile Info Dialog */}
      <Dialog
        open={profileDialogOpen}
        onClose={() => setProfileDialogOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold', color: theme.palette.primary.main }}>
          Account Overview
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 64, height: 64, fontSize: 28, fontWeight: 'bold' }}>
              {(profile?.name || profile?.username || profile?.email || '').charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ color: theme.palette.text.primary }}>{profile?.full_name || profile?.name || profile?.email}</Typography>
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
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>{profile?.email}</Typography>
            </Box>
          </Box>
          {loadingProfile ? (
            <Typography sx={{ my: 2 }}>Loading profile...</Typography>
          ) : profileError ? (
            <Typography color="error" sx={{ my: 2 }}>{profileError}</Typography>
          ) : (
            <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
              <Grid container spacing={2}>
                {[
                  ['ID', profile ? profile.id : 'Loading...', <Person fontSize="small" />],
                  ['Name', profile ? (profile.name || '-') : 'Loading...', <Person fontSize="small" />],
                  ['Full Name', profile ? (profile.full_name || '-') : 'Loading...', <Person fontSize="small" />],
                  ['Phone Number', profile ? (profile.number || '-') : 'Loading...', <Phone fontSize="small" />],
                  ['Email', profile ? profile.email : 'Loading...', <Email fontSize="small" />],
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
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProfileDialogOpen(false)} sx={{ color: theme.palette.error.main }}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AgentHeader;
