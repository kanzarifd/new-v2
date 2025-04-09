import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  useTheme,
  useMediaQuery,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import LogoutIcon from '@mui/icons-material/Logout';

const AgentDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>Agent Dashboard</Typography>
        <IconButton onClick={handleLogout} color="error">
          <LogoutIcon />
        </IconButton>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button variant="contained" color="primary" onClick={() => navigate('/')}>
          Back to Login
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Agent Information</Typography>
        <Box sx={{ p: 2 }}>
          <Typography variant="body1">Name: {user?.name}</Typography>
          <Typography variant="body1">Email: {user?.email}</Typography>
          <Typography variant="body1">Role: Agent</Typography>
        </Box>
      </Paper>

      {/* Add agent-specific components here */}
    </Box>
  );
};

export default AgentDashboard;
