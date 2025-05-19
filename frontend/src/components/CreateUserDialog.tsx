import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Alert,
  InputAdornment,
  MenuItem,
  Avatar,
  Typography,
  Divider,
  Box
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { registerUser } from '../services/authService';

interface CreateUserDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const roles = [
  { value: 'user', label: 'User' },
  { value: 'admin', label: 'Admin' },
  { value: 'agent', label: 'Agent' },
];

interface RegisterForm {
  name: string;
  full_name: string;
  number: string;
  email: string;
  password: string;
  bank_account_number: string;
  role: string;
}

const CreateUserDialog: React.FC<CreateUserDialogProps> = ({ open, onClose, onSuccess }) => {
  const [form, setForm] = useState<RegisterForm>({
    name: '',
    full_name: '',
    number: '',
    email: '',
    password: '',
    bank_account_number: '',
    role: 'user',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, role: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (
      !form.name ||
      !form.full_name ||
      !form.number ||
      !form.email ||
      !form.password ||
      !form.bank_account_number
    ) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    if (!form.email.includes('@')) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

  

    try {
      await registerUser(form);
      setLoading(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setLoading(false);
      if (err.response?.data?.errors) {
        const errorMessages = Object.entries(err.response.data.errors)
          .map(([field, message]) => `${field.replace('_', ' ').toUpperCase()}: ${message}`)
          .join('\n');
        setError(errorMessages);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Registration failed. Please try again.');
      }
    }
  };

  const handleDialogClose = () => {
    setForm({
      name: '',
      full_name: '',
      number: '',
      email: '',
      password: '',
      bank_account_number: '',
      role: 'user',
    });
    setError('');
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleDialogClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar sx={{ m: 1, bgcolor: '#b71c1c', width: 48, height: 48 }}>
            <LockOutlinedIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Typography 
            variant="h5" 
            fontWeight="bold" 
            sx={{ color: '#b71c1c', textShadow: '0 2px 8px rgba(183,28,28,0.18)' }}
          >
            Create New User
          </Typography>
        </Box>
      </DialogTitle>
      <Divider sx={{ my: 1, backgroundColor: '#b71c1c' }} />
      <form onSubmit={handleSubmit} noValidate>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Username"
                name="name"
                value={form.name}
                onChange={handleChange}
                InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: '#b71c1c' }} /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Full Name"
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: '#b71c1c' }} /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Phone Number"
                name="number"
                type="tel"
                value={form.number}
                onChange={handleChange}
                InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ color: '#b71c1c' }} /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: '#b71c1c' }} /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                InputProps={{ startAdornment: <InputAdornment position="start"><LockOutlinedIcon sx={{ color: '#b71c1c' }} /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Role"
                name="role"
                select
                value={form.role}
                onChange={handleRoleChange}
              >
                {roles.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Bank Account Number"
                name="bank_account_number"
                value={form.bank_account_number}
                onChange={handleChange}
                InputProps={{ startAdornment: <InputAdornment position="start"><AccountBalanceIcon sx={{ color: '#b71c1c' }} /></InputAdornment> }}
              />
            </Grid>
           
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} sx={{ bgcolor: '#b71c1c', color: '#fff', '&:hover': { bgcolor: '#7f1010' } }} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" sx={{ bgcolor: '#b71c1c', color: '#fff', '&:hover': { bgcolor: '#7f1010' } }} disabled={loading}>
            {loading ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateUserDialog;