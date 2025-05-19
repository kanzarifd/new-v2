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
  TextField,
  InputAdornment,
  Alert,
} from '@mui/material';
import {
  AccountCircle as AccountIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Home as HomeIcon,
  Support as SupportIcon,
  Dashboard as DashboardIcon,
  Person,
  Email,
  Phone,
  AccountBalance,
  MonetizationOn,
  LockOutlined,
  VpnKey,
  CheckCircleOutline,
} from '@mui/icons-material';
import { useThemeContext } from '../contexts/ThemeContext';
import { useAuth } from '../components/context/AuthContext';
import axios from 'axios';

interface UserHeaderProps {
  toggleDrawer: () => void;
  onLogout: () => void;
  isMobile: boolean;
  onOpenChat?: () => void;
}

const UserHeader: React.FC<UserHeaderProps> = ({
  toggleDrawer,
  onLogout,
  isMobile,
  onOpenChat,
}) => {
  // ...existing state
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [updateForm, setUpdateForm] = useState({ email: '', name: '', full_name: '', number: '' });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState<string|null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string|null>(null);

  const { mode, toggleColorMode } = useThemeContext();
  const { user, token } = useAuth();
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [changePasswordDialogOpen, setChangePasswordDialogOpen] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState('');
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const theme = useTheme();
  const isMobileScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Add state for image upload
  const [selectedImg, setSelectedImg] = useState<File | null>(null);
  const [imgPreview, setImgPreview] = useState<string | null>(null);
  const [imgUploadLoading, setImgUploadLoading] = useState(false);
  const [imgUploadError, setImgUploadError] = useState<string | null>(null);

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
          setProfileError('Could not fetch user profile');
        })
        .finally(() => setLoadingProfile(false));
    }
  }, [profileDialogOpen, user?.id, token]);

  // Pre-fill update form when opening update dialog
  useEffect(() => {
    if (updateDialogOpen && profile) {
      setUpdateForm({
        email: profile.email || '',
        name: profile.name || '',
        full_name: profile.full_name || '',
        number: profile.number || ''
      });
      setUpdateError(null);
      setUpdateSuccess(null);
    }
  }, [updateDialogOpen, profile]);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

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
    if (!document.head.querySelector('#user-header-anim')) {
      style.id = 'user-header-anim';
      document.head.appendChild(style);
    }
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
      await axios.patch(`http://localhost:8000/api/users/${userId}/change-password`, {
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

  // Handle image selection
  const handleImgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImg(e.target.files[0]);
      setImgPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  // Handle image upload
  const handleImgUpload = async () => {
    if (!selectedImg || !user?.id || !token) return;
    setImgUploadLoading(true);
    setImgUploadError(null);
    try {
      const formData = new FormData();
      formData.append('attachment', selectedImg);
      // Upload image
      const uploadRes = await axios.post('http://localhost:8000/api/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
      });
      const filename = uploadRes.data.filename;
      // Update user profile with image filename
      await axios.put(`http://localhost:8000/api/users/${user.id}`, { img: filename }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refresh profile
      setProfileDialogOpen(false);
      setProfileDialogOpen(true);
      setSelectedImg(null);
      setImgPreview(null);
    } catch (err: any) {
      setImgUploadError(err.response?.data?.error || 'Failed to upload image');
    } finally {
      setImgUploadLoading(false);
    }
  };

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
              User Dashboard
            </Typography>
          </Box>

          {/* Right Side */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Chat Icon with Message Bubble and Animation */}
            <Tooltip title="Support Chat">
              <IconButton onClick={onOpenChat} sx={{
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(220,20,60,0.10)',
                color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.error.main,
                borderRadius: 2,
                mx: 0.5,
                position: 'relative',
                '&:hover': {
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(220,20,60,0.18)',
                  transform: 'scale(1.1)',
                  transition: 'all 0.2s',
                }
              }}>
                <span style={{
                  display: 'inline-block',
                  animation: 'bubble-pop 1s infinite alternate',
                }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 6.5C21 4.01472 17.4183 2 12 2C6.58172 2 3 4.01472 3 6.5V14.5C3 16.9853 6.58172 19 12 19C13.2074 19 14.3527 18.9002 15.4061 18.7228C15.6682 18.6791 15.9526 18.7653 16.1369 18.9631L19.1297 22.1667C19.6735 22.783 20.75 22.4038 20.75 21.5833V18.5C20.75 18.2239 20.9739 18 21.25 18C21.6642 18 22 17.6642 22 17.25V6.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
                    <circle cx="8.5" cy="10.5" r="1.5" fill="currentColor"/>
                    <circle cx="12" cy="10.5" r="1.5" fill="currentColor"/>
                    <circle cx="15.5" cy="10.5" r="1.5" fill="currentColor"/>
                  </svg>
                </span>
              </IconButton>
            </Tooltip>

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
                <Avatar sx={{ width: 26, height: 26, bgcolor: theme.palette.primary.main, fontWeight: 'bold', fontSize: 16 }}
                  src={profile?.img ? `http://localhost:8000/uploads/${profile.img}` : undefined}
                >
                  {!(profile?.img) && (profile?.name || profile?.full_name || profile?.email || '').charAt(0).toUpperCase()}
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
                <Avatar sx={{ width: 44, height: 44, bgcolor: 'white', color: theme.palette.error.main, fontWeight: 'bold', fontSize: 22, border: `2px solid ${theme.palette.error.main}` }}
                  src={profile?.img ? `http://localhost:8000/uploads/${profile.img}` : undefined}
                >
                  {!(profile?.img) && (profile?.name || profile?.full_name || profile?.email || '').charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'white', lineHeight: 1.1, letterSpacing: 0.5 }}>
                    {profile?.name || profile?.full_name || profile?.email}
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
                  {profile?.name || profile?.full_name || profile?.email}
                </Typography>
              </MenuItem>
              <MenuItem onClick={() => setChangePasswordDialogOpen(true)} sx={{
                borderRadius: 1,
                px: 2,
                py: 1,
              }}>
                <ListItemIcon sx={{ color: '#b71c1c', minWidth: 32 }}>
                  <LockOutlined fontSize="small" />
                </ListItemIcon>
                <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Change Password</Typography>
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
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
            {/* Avatar with uploaded or profile image */}
            <Avatar
              src={imgPreview || (profile?.img ? `http://localhost:8000/uploads/${profile.img}` : undefined)}
              sx={{ width: 80, height: 80, mb: 1, bgcolor: theme.palette.error.main }}
            >
              {profile?.name?.charAt(0)?.toUpperCase()}
            </Avatar>
            {/* Image upload input */}
            <Button
              variant="outlined"
              component="label"
              sx={{ mb: 1 }}
              disabled={imgUploadLoading}
            >
              {selectedImg ? 'Change Photo' : 'Upload Photo'}
              <input type="file" accept="image/*" hidden onChange={handleImgChange} />
            </Button>
            {selectedImg && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleImgUpload}
                disabled={imgUploadLoading}
                sx={{ mb: 1 }}
              >
                {imgUploadLoading ? 'Uploading...' : 'Save Photo'}
              </Button>
            )}
            {imgUploadError && <Alert severity="error">{imgUploadError}</Alert>}
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
                  ['Bank Account', profile ? (profile.bank_account_number || '-') : 'Loading...', <AccountBalance fontSize="small" />],
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
          <Button onClick={() => setUpdateDialogOpen(true)} color="error" variant="contained" sx={{ ml: 2, fontWeight: 700 }}>
            Update 
          </Button>
        </DialogActions>
      </Dialog>
      {/* Update User Information Dialog */}
      <Dialog open={updateDialogOpen} onClose={() => setUpdateDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 'bold', color: 'red', textAlign: 'center', letterSpacing: 1, fontSize: 20 }}>
          Update 
        </DialogTitle>
        <DialogContent dividers>
          {updateError && <Alert severity="error" sx={{ mb: 2 }}>{updateError}</Alert>}
          {updateSuccess && <Alert severity="success" sx={{ mb: 2 }}>{updateSuccess}</Alert>}
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
          <Button onClick={() => setUpdateDialogOpen(false)} color="inherit" sx={{ fontWeight: 700 }}>Cancel</Button>
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
            color="primary"
            variant="contained"
            disabled={updateLoading}
            sx={{ fontWeight: 700 }}
          >
            {updateLoading ? 'Saving...' : 'Save Changes'}
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
              InputProps={{ startAdornment: <InputAdornment position="start"><LockOutlined sx={{ color: '#b71c1c' }} /></InputAdornment> }}
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
              InputProps={{ startAdornment: <InputAdornment position="start"><VpnKey sx={{ color: '#b71c1c' }} /></InputAdornment> }}
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
              InputProps={{ startAdornment: <InputAdornment position="start"><CheckCircleOutline sx={{ color: '#b71c1c' }} /></InputAdornment> }}
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
    </>
  );
};

export default UserHeader;