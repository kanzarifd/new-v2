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
} from '@mui/material';

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
    bank_account_balance: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (!form.name || !form.full_name || !form.number || !form.email || !form.password || !form.bank_account_number || !form.bank_account_balance) {
      setError('Please fill in all required fields');
      return;
    }

    if (!form.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    const balance = parseFloat(form.bank_account_balance);
    if (isNaN(balance) || balance < 0) {
      setError('Please enter a valid number for bank account balance');
      return;
    }

    try {
      console.log('Form data being sent:', JSON.stringify(form, null, 2));
      console.log('API base URL:', axios.defaults.baseURL);
      
      const response = await registerUser(form);
      console.log('Registration response:', response);

      // If we got a response without errors, consider it successful
      if (response) {
        console.log('Registration successful');
        navigate('/login');
      } else {
        throw new Error('No response received from server');
      }
    } catch (err: any) {
      console.error('Registration error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        config: err.config,
        stack: err.stack
      });
      
      // Handle different types of errors
      if (err.response?.data?.errors) {
        const errorMessages = Object.entries(err.response.data.errors)
          .filter(([_, message]) => message)
          .map(([field, message]) => `${field.replace('_', ' ').toUpperCase()}: ${message}`)
          .join('\n');
        setError(errorMessages);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.error?.message) {
        setError(err.response.data.error.message);
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.response?.status === 404) {
        setError('API endpoint not found. Please check if the backend server is running.');
      } else if (err.response?.status === 500) {
        setError('Internal server error. Please try again later.');
      } else {
        setError('Registration failed. Please check your details and try again.');
      }
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 500 }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Bank Reclamation System
          </Typography>
          <Typography component="h2" variant="h6" align="center" gutterBottom>
            Create Account
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                required
                fullWidth
                id="name"
                label="Username"
                name="name"
                autoComplete="username"
                value={form.name}
                onChange={handleChange}
              />
              <TextField
                required
                fullWidth
                id="full_name"
                label="Full Name"
                name="full_name"
                autoComplete="name"
                value={form.full_name}
                onChange={handleChange}
              />
              <TextField
                required
                fullWidth
                id="number"
                label="Phone Number"
                name="number"
                type="tel"
                autoComplete="tel"
                value={form.number}
                onChange={handleChange}
              />
              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
              />
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
              />
              <TextField
                required
                fullWidth
                id="bank_account_number"
                label="Bank Account Number"
                name="bank_account_number"
                value={form.bank_account_number}
                onChange={handleChange}
              />
              <TextField
                required
                fullWidth
                id="bank_account_balance"
                label="Initial Balance"
                name="bank_account_balance"
                type="number"
                value={form.bank_account_balance}
                onChange={handleChange}
              />
            </Box>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Create Account
            </Button>
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Link href="/login" variant="body2">
                Already have an account? Sign In
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;
