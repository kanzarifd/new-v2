import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/authService';
import { useAuth } from '../components/context/AuthContext';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Link,
  Grid,
  Paper,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  Divider,
  IconButton,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EmailIcon from '@mui/icons-material/Email';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';

interface LoginCredentials {
  email: string;
  password: string;
}

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('token')) {
      const role = localStorage.getItem('role');
      navigate(role === 'admin' ? '/admin' : '/user');
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const credentials: LoginCredentials = { email, password };
      const { token, user } = await loginUser(credentials);
      // Fetch full user profile (with image)
      const profileRes = await fetch(`http://localhost:8000/api/users/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const fullProfile = await profileRes.json();
      login(fullProfile, token);
      navigate(user.role === 'admin' ? '/admin' : '/user', { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid credentials. Please try again.');
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

          

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

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
              <Link href="/forgot-password" underline="hover" variant="body2">
                Forgot Password?
              </Link>
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
              }}
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Sign In'}
            </Button>
          </Box>
        </Box>

        {/* Right: Welcome */}
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