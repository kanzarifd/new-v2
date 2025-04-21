import React, { useState } from 'react';
import { registerUser } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
  Avatar,
  InputAdornment,
  Divider,
  Grid,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

interface RegisterForm {
  name: string;
  full_name: string;
  number: string;
  email: string;
  password: string;
  bank_account_number: string;
  bank_account_balance: string;
}

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterForm>({
    name: '',
    full_name: '',
    number: '',
    email: '',
    password: '',
    bank_account_number: '',
    bank_account_balance: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (
      !form.name ||
      !form.full_name ||
      !form.number ||
      !form.email ||
      !form.password ||
      !form.bank_account_number ||
      !form.bank_account_balance
    ) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!form.email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    const balance = parseFloat(form.bank_account_balance);
    if (isNaN(balance) || balance < 0) {
      setError('Please enter a valid number for bank account balance.');
      return;
    }

    try {
      const response = await registerUser(form);
      if (response) {
        navigate('/login');
      } else {
        throw new Error('No response received from server');
      }
    } catch (err: any) {
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

  return (
    <Container component="main" maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 500 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ m: 1, bgcolor: '#e53935' }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography variant="h5" fontWeight="bold" sx={{ color: '#b71c1c' }}>
              Bank Reclamation System
            </Typography>
            <Typography variant="subtitle1">Create your account</Typography>
          </Box>

          <Divider sx={{ my: 2, backgroundColor: '#e53935' }} />

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              required
              fullWidth
              label="Username"
              name="name"
              value={form.name}
              onChange={handleChange}
              InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon /></InputAdornment> }}
            />
            <TextField
              required
              fullWidth
              label="Full Name"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon /></InputAdornment> }}
            />
            <TextField
              required
              fullWidth
              label="Phone Number"
              name="number"
              type="tel"
              value={form.number}
              onChange={handleChange}
              InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon /></InputAdornment> }}
            />
            <TextField
              required
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon /></InputAdornment> }}
            />
            <TextField
              required
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              InputProps={{ startAdornment: <InputAdornment position="start"><LockOutlinedIcon /></InputAdornment> }}
            />
            <TextField
              required
              fullWidth
              label="Bank Account Number"
              name="bank_account_number"
              value={form.bank_account_number}
              onChange={handleChange}
              InputProps={{ startAdornment: <InputAdornment position="start"><AccountBalanceIcon /></InputAdornment> }}
            />
            <TextField
              required
              fullWidth
              label="Bank Account Balance"
              name="bank_account_balance"
              value={form.bank_account_balance}
              onChange={handleChange}
              InputProps={{ startAdornment: <InputAdornment position="start"><MonetizationOnIcon /></InputAdornment> }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                py: 1.5,
                background: 'linear-gradient(90deg, #e53935 0%, #b71c1c 100%)',
                color: '#fff',
                fontWeight: 'bold',
                borderRadius: 2,
                '&:hover': { background: 'linear-gradient(90deg, #b71c1c 0%, #e53935 100%)' }
              }}
            >
              Register
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link href="/login" variant="body2">
                  Already have an account? Sign in
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;
