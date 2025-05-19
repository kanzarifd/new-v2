import React, { useState } from 'react';
import { registerUser } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
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
        Swal.fire({
          icon: 'success',
          title: 'Verification Successful',
          text: 'You may now complete your registration.',
          timer: 1500,
          showConfirmButton: false,
          customClass: {
            popup: 'swal2-popup-red'
          },
          background: '#ffffff'
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Verification Failed',
          text: 'CIN or Name not found.',
          customClass: {
            popup: 'swal2-popup-red'
          },
          background: '#ffffff',
          confirmButtonColor: '#d32f2f'
        });
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
    } = form;

    if (!name || !full_name || !number || !email || !password || !bank_account_number) {
      setError('Please fill in all required fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{8,15}$/;
    if (!number || !phoneRegex.test(number)) {
      setError('Phone number must be 8-15 digits long.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      await registerUser(form);

      Swal.fire({
        icon: 'success',
        title: 'Registration Successful!',
        text: 'Your account has been created. Please log in.',
        timer: 1500,
        showConfirmButton: false,
        customClass: {
          popup: 'swal2-popup-red'
        },
        background: '#ffffff'
      }).then(() => {
        navigate('/login');
      });
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: error.message || 'Registration failed. Please try again.',
        customClass: {
          popup: 'swal2-popup-red'
        },
        background: '#ffffff',
        confirmButtonColor: '#d32f2f'
      });
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
              sx={{
                mb: 3,
                borderRadius: 2,
                boxShadow: 2,
                background: 'linear-gradient(90deg, #ffebee 0%, #ffcdd2 100%)',
                color: '#b71c1c',
                fontWeight: 'bold',
                fontSize: '1rem',
                letterSpacing: 0.5
              }}
            >
              {error}
            </Alert>
          )}

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
                          size="large"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
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
                <Button
                  type="submit"
                  variant="contained"
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
                  Register
                </Button>
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Typography variant="body2">
                    Already have an account?{' '}
                    <Link href="/login" underline="hover" sx={{ fontWeight: 'bold', color: '#b71c1c' }}>
                      Log in
                    </Link>
                  </Typography>
                </Box>
              </Box>
            </Fade>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;
