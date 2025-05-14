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
  Fade,
  IconButton
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

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

  // State for password visibility
  const [showPassword, setShowPassword] = useState(false);

  const [verificationData, setVerificationData] = useState({ cin: '', name: '' });
  const [isVerified, setIsVerified] = useState(false);
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
  const [successMessage, setSuccessMessage] = useState('');

  const handleVerificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVerificationData({ ...verificationData, [e.target.name]: e.target.value });
  };

  const handleVerify = async () => {
    setError('');
    setSuccessMessage('');
    try {
      const res = await axios.post('http://localhost:8000/api/banc/verify', verificationData);
      if (res.data.exists) {
        setIsVerified(true);
        setForm((prev) => ({ ...prev, name: verificationData.name }));
        setSuccessMessage('Verification successful! Please complete your registration.');
      } else {
        setError('Verification failed. CIN or Name not found.');
      }
    } catch (err) {
      setError('Server error during verification.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const {
      name,
      full_name,
      number,
      email,
      password,
      bank_account_number,
      bank_account_balance,
    } = form;

    if (!name || !full_name || !number || !email || !password || !bank_account_number || !bank_account_balance) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    const balance = parseFloat(bank_account_balance);
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
      <Box sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 6
      }}>
        <Paper elevation={6} sx={{
          p: { xs: 2, sm: 4 },
          width: '100%',
          maxWidth: 500,
          borderRadius: 4,
          position: 'relative',
          overflow: 'hidden',
          background: 'rgba(255,255,255,0.95)',
          transition: 'box-shadow 0.3s'
        }}>

          {/* Stepper for progress indication */}
          <Box sx={{ mb: 3 }}>
            <Grid container alignItems="center" justifyContent="center" spacing={2}>
              <Grid item>
                <Avatar sx={{ bgcolor: isVerified ? '#43a047' : '#e53935', width: 36, height: 36 }}>
                  <LockOutlinedIcon />
                </Avatar>
              </Grid>
              <Grid item>
                <Typography variant="subtitle1" fontWeight={isVerified ? 700 : 400} color={isVerified ? 'success.main' : 'error.main'}>
                  {isVerified ? 'Step 2: Registration' : 'Step 1: Verification'}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" fontWeight="bold" sx={{ color: '#b71c1c', mb: 1, letterSpacing: 1 }}>
              Bank Reclamation System
            </Typography>
            <Typography variant="subtitle1" sx={{ color: '#757575', fontWeight: 500, mb: 1 }}>
              {isVerified ? 'Complete your registration' : 'Secure client verification required'}
            </Typography>
          </Box>

          <Divider sx={{ my: 2, backgroundColor: '#e53935', borderRadius: 2 }} />

          {error && (
            <Alert
              severity="error"
              iconMapping={{ error: <LockOutlinedIcon fontSize="inherit" /> }}
              sx={{
                mb: 3,
                borderRadius: 2,
                boxShadow: 2,
                background: 'linear-gradient(90deg, #ffebee 0%, #ffcdd2 100%)',
                color: '#b71c1c',
                fontWeight: 'bold',
                alignItems: 'center',
                fontSize: '1rem',
                letterSpacing: 0.5
              }}
            >
              {error}
            </Alert>
          )}
          {successMessage && (
            <Alert
              severity="success"
              iconMapping={{ success: <LockOutlinedIcon fontSize="inherit" color="success" /> }}
              sx={{
                mb: 3,
                borderRadius: 2,
                boxShadow: 2,
                background: 'linear-gradient(90deg, #e8f5e9 0%, #b9f6ca 100%)',
                color: '#1b5e20',
                fontWeight: 'bold',
                alignItems: 'center',
                fontSize: '1rem',
                letterSpacing: 0.5
              }}
            >
              {successMessage}
            </Alert>
          )}

          {/* Verification Step with adornments and helper text */}
          {!isVerified && (
            <Fade in={!isVerified} timeout={500}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="CIN"
                  name="cin"
                  fullWidth
                  required
                  value={verificationData.cin}
                  onChange={handleVerificationChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><PersonIcon /></InputAdornment>,
                  }}
                  helperText="Enter your 8-digit CIN as provided by the bank."
                />
                <TextField
                  label="Name"
                  name="name"
                  fullWidth
                  required
                  value={verificationData.name}
                  onChange={handleVerificationChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><PersonIcon /></InputAdornment>,
                  }}
                  helperText="Enter your registered name."
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleVerify}
                  sx={{
                    fontWeight: 'bold',
                    py: 1.2,
                    background: 'linear-gradient(90deg, #e53935 0%, #b71c1c 100%)',
                    borderRadius: 2,
                    boxShadow: 2,
                    letterSpacing: 1,
                    fontSize: '1rem',
                    transition: 'background 0.3s',
                    '&:hover': { background: 'linear-gradient(90deg, #b71c1c 0%, #e53935 100%)', boxShadow: 4 }
                  }}
                >
                  Verification System
                </Button>
              </Box>
            </Fade>
          )}

          {/* Registration Step with password visibility toggle, adornments, tooltips, animation */}
          {isVerified && (
            <Fade in={isVerified} timeout={500}>
              <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  required
                  InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon /></InputAdornment> }}
                  helperText="Enter your complete legal name."
                />
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="number"
                  value={form.number}
                  onChange={handleChange}
                  required
                  InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon /></InputAdornment> }}
                  helperText="Enter a valid phone number."
                />
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon /></InputAdornment> }}
                  helperText="We'll never share your email."
                />
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><LockOutlinedIcon /></InputAdornment>,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword((show) => !show)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  helperText="Password must be at least 6 characters."
                />
                <TextField
                  fullWidth
                  label="Bank Account Number"
                  name="bank_account_number"
                  value={form.bank_account_number}
                  onChange={handleChange}
                  required
                  InputProps={{ startAdornment: <InputAdornment position="start"><AccountBalanceIcon /></InputAdornment> }}
                  helperText="Enter your bank account number."
                />
                <TextField
                  fullWidth
                  label="Bank Account Balance"
                  name="bank_account_balance"
                  value={form.bank_account_balance}
                  onChange={handleChange}
                  required
                  InputProps={{ startAdornment: <InputAdornment position="start"><MonetizationOnIcon /></InputAdornment> }}
                  helperText="Enter your current balance."
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
                    boxShadow: 2,
                    fontSize: '1.1rem',
                    letterSpacing: 1,
                    '&:hover': { background: 'linear-gradient(90deg, #b71c1c 0%, #e53935 100%)', boxShadow: 4 }
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
            </Fade>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;
