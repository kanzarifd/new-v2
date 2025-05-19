import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Grid,
  InputAdornment,
  Avatar,
  Typography,
  Box,
  Alert
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

const roles = [
  { value: 'user', label: 'User' },
  { value: 'admin', label: 'Admin' },
  { value: 'agent', label: 'Agent' },
];

export interface EditUserForm {
  name: string;
  full_name: string;
  number: string;
  email: string;
  role: string;
  bank_account_number: string;
}

interface EditUserDialogProps {
  open: boolean;
  user: EditUserForm | null;
  onClose: () => void;
  onSave: (form: EditUserForm) => void;
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({ open, user, onClose, onSave }) => {
  const [form, setForm] = useState<EditUserForm>(user || {
    name: '',
    full_name: '',
    number: '',
    email: '',
    role: 'user',
    bank_account_number: '',
  });
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (user) setForm(user);
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, role: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (
      !form.name ||
      !form.full_name ||
      !form.number ||
      !form.email ||
      !form.role ||
      !form.bank_account_number
    ) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!form.email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    onSave(form);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar sx={{ m: 1, bgcolor: '#b71c1c', width: 48, height: 48 }}>
            <PersonIcon sx={{ fontSize: 32, color: '#ffffff' }} />
          </Avatar>
          <Typography variant="h6" fontWeight="bold" sx={{ color: '#b71c1c' }}>
            Edit User
          </Typography>
        </Box>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
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
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} sx={{ bgcolor: '#b71c1c', color: '#fff', '&:hover': { bgcolor: '#7f1010' } }}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" sx={{ bgcolor: '#b71c1c', color: '#fff', '&:hover': { bgcolor: '#7f1010' } }}>
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditUserDialog;
