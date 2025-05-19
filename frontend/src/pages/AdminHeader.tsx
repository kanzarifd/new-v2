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
  TextField,
  Alert,
  InputAdornment
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
  Phone,
  Notifications as NotificationsIcon,
  Edit as EditIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import axios from 'axios';
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
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
const [updateForm, setUpdateForm] = useState({
  email: '',
  name: '',
  full_name: '',
  number: '',
});
const [updateLoading, setUpdateLoading] = useState(false);
const [updateError, setUpdateError] = useState<string | null>(null);
const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  const [profile, setProfile] = useState<User | null>(null);
  const [adminInfo, setAdminInfo] = useState<any>(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [changePasswordDialogOpen, setChangePasswordDialogOpen] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState('');
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);

  // Notification system state
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<{ id: number; title: string; user: any; user_id: number }[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userMap, setUserMap] = useState<{ [id: number]: string }>({});

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


  const handleUpdateUser = async () => {
    if (!user?.id || !token) return;
    setUpdateLoading(true);
    setUpdateError(null);
    setUpdateSuccess(null);
  
    try {
      await axios.put(`http://localhost:8000/api/users/${user.id}`, updateForm, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUpdateSuccess('Profile updated successfully!');
      setTimeout(() => {
        setUpdateDialogOpen(false);
        window.location.reload(); // Or refetch the profile
      }, 1500);
    } catch (err: any) {
      setUpdateError(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setUpdateLoading(false);
    }
  };
  



  const handleNotificationClose = () => setNotificationAnchorEl(null);



  useEffect(() => {
    if (updateDialogOpen && profile) {
      setUpdateForm({
        email: profile.email || '',
        name: profile.name || '',
        full_name: profile.full_name || '',
        number: profile.number || '',
      });
      setUpdateError(null);
      setUpdateSuccess(null);
    }
  }, [updateDialogOpen, profile]);
  

  // Fetch current user by ID stored in localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      if (userData.id) {
        api.get<User>(`/api/users/${userData.id}`).then(res => setProfile(res.data)).catch(console.error);
      }
    }
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  useEffect(() => {
    if (profile?.role === 'admin') {
      api.get<any>(`/api/admins/${profile.id}`).then(res => setAdminInfo(res.data)).catch(console.error);
    }
  }, [profile]);

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

  // Poll for notifications (reclams)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/reclams?unreadForAgent=1');
        if (Array.isArray(res.data)) {
          // Filter for today's date
          const todayStr = new Date().toISOString().slice(0, 10);
          const todaysReclams = res.data.filter((r: any) => {
            const createdAt = r.createdAt || r.date_debut || r.created_at;
            return createdAt && createdAt.slice(0, 10) === todayStr;
          });
          setNotifications(todaysReclams.map((r: any) => ({
            id: r.id,
            title: r.title,
            user: r.user && (r.user.name || r.user.email) ? r.user : null,
            user_id: r.user_id
          })));
          setUnreadCount(todaysReclams.length);
        } else {
          setNotifications([]);
          setUnreadCount(0);
        }
      } catch (err) {
        // fallback: don't update
      }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Handler for password change submission
  const handleChangePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setChangePasswordError('');
    setChangePasswordLoading(true);
    const formData = new FormData(event.currentTarget);
    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    if (!currentPassword || !newPassword || !confirmPassword) {
      setChangePasswordError('Please fill in all fields.');
      setChangePasswordLoading(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setChangePasswordError('New passwords do not match.');
      setChangePasswordLoading(false);
      return;
    }
    try {
      const stored = localStorage.getItem('user');
      const userId = stored ? JSON.parse(stored).id : null;
      if (!userId) throw new Error('User not found');
      await api.patch(`/api/users/${userId}/change-password`, {
        currentPassword,
        newPassword
      });
      setChangePasswordDialogOpen(false);
    } catch (err: any) {
      setChangePasswordError(err.response?.data?.message || err.message || 'Failed to change password.');
    } finally {
      setChangePasswordLoading(false);
    }
  };

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
            <Dialog open={updateDialogOpen} onClose={() => setUpdateDialogOpen(false)} maxWidth="sm" fullWidth>
  <DialogTitle sx={{
    color: '#b71c1c',
    textAlign: 'center',
    fontWeight: 700,
    fontSize: '1.25rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    py: 2,
  }}>
    Update Profile
  </DialogTitle>

  
  <DialogContent sx={{ pt: 4, pb: 3 }}>
        <Box component="form" noValidate sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Name"
                  value={updateForm.name}
                  onChange={e => setUpdateForm(f => ({ ...f, name: e.target.value }))}
                  fullWidth
                  required
                />
                <TextField
                  label="Full Name"
                  value={updateForm.full_name}
                  onChange={e => setUpdateForm(f => ({ ...f, full_name: e.target.value }))}
                  fullWidth
                />
                <TextField
                  label="Phone Number"
                  value={updateForm.number}
                  onChange={e => setUpdateForm(f => ({ ...f, number: e.target.value }))}
                  fullWidth
                />
                <TextField
                  label="Email"
                  value={updateForm.email}
                  onChange={e => setUpdateForm(f => ({ ...f, email: e.target.value }))}
                  fullWidth
                  required
                  type="email"
                />
              </Box>
  </DialogContent>





  <DialogActions>


    <Button 
      onClick={() => setUpdateDialogOpen(false)} 
      disabled={updateLoading}
      sx={{
        color: '#b71c1c',
        '&:hover': {
          backgroundColor: '#ffebee',
          color: '#b71c1c',
        },
        '&:disabled': {
          color: '#b71c1c',
          opacity: 0.7,
        }
      }}
    >
      Cancel
    </Button>
    <Button
            onClick={async () => {
              setUpdateLoading(true);
              setUpdateError(null);
              setUpdateSuccess(null);
              try {
                if (!user?.id) {
                  setUpdateError('User not found. Please log in again.');
                  setUpdateLoading(false);
                  return;
                }
                const res = await axios.put(
                  `http://localhost:8000/api/users/${user.id}`,
                  updateForm,
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                setUpdateSuccess('User updated successfully!');
                setProfile(res.data.user);
                setTimeout(() => {
                  setUpdateDialogOpen(false);
                }, 1000);
              } catch (err: any) {
                setUpdateError(err?.response?.data?.message || 'Update failed');
              } finally {
                setUpdateLoading(false);
              }
            }}
            color="error"
            variant="contained"
            disabled={updateLoading}
            sx={{ fontWeight: 700 }}
          >
            {updateLoading ? 'Saving...' : 'Save Changes'}
    </Button>
  </DialogActions>
</Dialog>

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
                  You have {notifications.length} new reclamations today
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
              <MenuItem onClick={() => setChangePasswordDialogOpen(true)} sx={{
                borderRadius: 1,
                px: 2,
                py: 1,
              }}>
                <ListItemIcon sx={{ color: '#b71c1c', minWidth: 32 }}>
                  <LockOutlinedIcon fontSize="small" />
                </ListItemIcon>
                <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Change Password</Typography>
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
     


        <DialogActions sx={{ justifyContent: 'space-between', p: 2, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: mode === 'dark' ? '#2d2d2d' : '#e53935' }}>
          <Button
            onClick={() => setProfileDialogOpen(false)}
            variant="outlined"
            color="error"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
              minWidth: 120,
              '&:hover': {
                transform: 'scale(1.02)',
                bgcolor: mode === 'dark' ? '#222' : '#ffebee',
                color: mode === 'dark' ? '#e53935' : '#b71c1c',
              },
            }}
          >
            <CloseIcon sx={{ mr: 1 }} />
            Close
          </Button>
          <Button
            onClick={() => setUpdateDialogOpen(true)}
            variant="contained"
            color="error"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
              minWidth: 120,
              '&:hover': {
                transform: 'scale(1.02)',
                bgcolor: '#e53935',
                color: '#fff',
              },
            }}
          >
            <EditIcon sx={{ mr: 1 }} />
            Update Profile
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={changePasswordDialogOpen} onClose={() => setChangePasswordDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 'bold', color: '#b71c1c', textAlign: 'center', letterSpacing: 1, fontSize: 22, textShadow: '0 2px 8px rgba(183,28,28,0.15)' }}>
          Change Password
        </DialogTitle>
        <DialogContent dividers sx={{ bgcolor: '#ffffff', borderColor: '#b71c1c' }}>
          <Box component="form" onSubmit={handleChangePassword} sx={{ mt: 1 }}>
            {changePasswordError && (
              <Alert severity="error" sx={{ mb: 2, bgcolor: '#ffcdd2', color: '#b71c1c', border: '1px solid #b71c1c' }}>{changePasswordError}</Alert>
            )}
            <TextField
              margin="normal"
              required
              fullWidth
              name="currentPassword"
              label="Current Password"
              type="password"
              autoComplete="current-password"
              sx={{ mb: 2, '& label': { color: '#b71c1c' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#b71c1c' }, '&:hover fieldset': { borderColor: '#7f1010' }, '&.Mui-focused fieldset': { borderColor: '#b71c1c' }, '& .MuiInputAdornment-root .MuiSvgIcon-root': { color: '#b71c1c' } } }}
              InputProps={{ startAdornment: <InputAdornment position="start"><LockOutlinedIcon sx={{ color: '#b71c1c' }} /></InputAdornment> }}
              disabled={changePasswordLoading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="newPassword"
              label="New Password"
              type="password"
              autoComplete="new-password"
              sx={{ mb: 2, '& label': { color: '#b71c1c' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#b71c1c' }, '&:hover fieldset': { borderColor: '#7f1010' }, '&.Mui-focused fieldset': { borderColor: '#b71c1c' }, '& .MuiInputAdornment-root .MuiSvgIcon-root': { color: '#b71c1c' } } }}
              InputProps={{ startAdornment: <InputAdornment position="start"><VpnKeyIcon sx={{ color: '#b71c1c' }} /></InputAdornment> }}
              disabled={changePasswordLoading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm New Password"
              type="password"
              autoComplete="new-password"
              sx={{ mb: 2, '& label': { color: '#b71c1c' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#b71c1c' }, '&:hover fieldset': { borderColor: '#7f1010' }, '&.Mui-focused fieldset': { borderColor: '#b71c1c' }, '& .MuiInputAdornment-root .MuiSvgIcon-root': { color: '#b71c1c' } } }}
              InputProps={{ startAdornment: <InputAdornment position="start"><CheckCircleOutlineIcon sx={{ color: '#b71c1c' }} /></InputAdornment> }}
              disabled={changePasswordLoading}
            />
            <DialogActions>
              <Button onClick={() => setChangePasswordDialogOpen(false)} sx={{ bgcolor: '#fff', color: '#b71c1c', border: '1px solid #b71c1c', '&:hover': { bgcolor: '#ffcdd2' } }} disabled={changePasswordLoading}>Cancel</Button>
              <Button type="submit" variant="contained" sx={{ bgcolor: '#b71c1c', color: '#fff', '&:hover': { bgcolor: '#7f1010' } }} disabled={changePasswordLoading}>
                {changePasswordLoading ? 'Changing...' : 'Change Password'}
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default AdminHeader;