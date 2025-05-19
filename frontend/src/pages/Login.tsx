import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/authService';
import { useAuth } from '../components/context/AuthContext';
import {
  Box,
  Button,
  TextField,
  Typography,
  Link,
  Grid,
  Paper,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EmailIcon from '@mui/icons-material/Email';
import Swal from 'sweetalert2';

interface LoginCredentials {
  email: string;
  password: string;
}

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('token')) {
      const role = localStorage.getItem('role');
      navigate(role === 'admin' ? '/admin' : '/user');
    }
  }, [navigate]);



  // loding carte
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
  
    try {
      const credentials: LoginCredentials = { email, password };
      const { token, user } = await loginUser(credentials);
  
      const profileRes = await fetch(`http://localhost:8000/api/users/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      const fullProfile = await profileRes.json();
      login(fullProfile, token);
  
      Swal.fire({
        icon: 'success',
        title: 'Login Successful',
        text: 'Redirecting...',
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        navigate(user.role === 'admin' ? '/admin' : '/user', { replace: true });
      });
  
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: err.message || 'Please check your internet connection and try again.',
        customClass: {
          popup: 'swal2-popup-red'
        },
        background: '#fffff',
        confirmButtonColor: '#d32f2f'
      });
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#f4f6f8',
      }}
    >
      <Paper elevation={3} sx={{ display: 'flex', width: '900px', minHeight: '500px', borderRadius: 4, overflow: 'hidden' }}>
        {/* Left: Login Form */}
        <Box sx={{ flex: 1, p: 5, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
            Sign In
          </Typography>

          <Box component="form" onSubmit={handleLogin}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Grid container alignItems="center" justifyContent="space-between" sx={{ mt: 1 }}>
              <FormControlLabel
                control={<Checkbox color="primary" />}
                label="Remember Me"
              />
              <Grid container justifyContent="flex-end" sx={{ mt: 1 }}>
                <Grid item>
                  <Link
                    href="/forgot-password"
                    underline="hover"
                    variant="body2"
                    sx={{
                      color: 'error.main',
                      fontWeight: 500,
                      transition: '0.3s',
                      '&:hover': {
                        color: 'error.dark',
                      },
                    }}
                  >
                    Forgot password?
                  </Link>
                </Grid>
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                background: 'linear-gradient(90deg, #e53935 0%, #b71c1c 100%)',
                color: '#fff',
                fontWeight: 'bold',
                borderRadius: '30px',
                textTransform: 'none',
                fontSize: '16px',
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <CircularProgress size={20} sx={{ color: 'white', mr: 1 }} />
                  Logging in...
                </>
              ) : 'Sign In'}
            </Button>
          </Box>
        </Box>

        {/* Right: Welcome Panel */}
        <Box
          sx={{
            flex: 1,
            background: 'linear-gradient(135deg, #e53935 0%, #b71c1c 100%)',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            p: 5,
          }}
        >
          <Box component="img" src="/ATB-logo.png" alt="ATB Logo" sx={{ width: 200, mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
            Welcome To ATB
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Don’t have an account?
          </Typography>
          <Button
            href="/register"
            variant="outlined"
            sx={{
              color: '#fff',
              borderColor: '#fff',
              borderRadius: '30px',
              px: 4,
              py: 1,
              fontWeight: 'bold',
              '&:hover': {
                borderColor: '#fff',
                backgroundColor: 'rgba(255,255,255,0.1)',
              },
            }}
          >
            Sign Up
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
