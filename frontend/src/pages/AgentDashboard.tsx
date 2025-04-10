import React, { useState, useEffect } from 'react';
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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Snackbar as MuiSnackbar,
  Alert as MuiAlert
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import LogoutIcon from '@mui/icons-material/Logout';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

const AgentDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [reclams, setReclams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const fetchReclams = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/reclams', {
        params: {
          assignedTo: user?.id,
        },
      });
      setReclams(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch reclamations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReclams();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`http://localhost:8000/api/reclams/${editingId}`, formData);
        showSnackbar('Reclamation updated successfully', 'success');
      } else {
        await axios.post('http://localhost:8000/api/reclams', {
          ...formData,
          assignedTo: user?.id,
        });
        showSnackbar('Reclamation created successfully', 'success');
      }
      setFormData({ title: '', description: '', status: 'pending', priority: 'medium' });
      setEditingId(null);
      setOpen(false);
      fetchReclams();
    } catch (err: any) {
      showSnackbar(err.response?.data?.message || 'Failed to save reclamation', 'error');
    }
  };

  const handleEdit = (reclam: any) => {
    setFormData({
      title: reclam.title,
      description: reclam.description,
      status: reclam.status,
      priority: reclam.priority,
    });
    setEditingId(reclam.id);
    setOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://localhost:8000/api/reclams/${id}`);
      showSnackbar('Reclamation deleted successfully', 'success');
      fetchReclams();
    } catch (err: any) {
      showSnackbar(err.response?.data?.message || 'Failed to delete reclamation', 'error');
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await axios.put(`http://localhost:8000/api/reclams/status/${id}`, 
        { status: status }
      );
      showSnackbar('Status updated successfully', 'success');
      fetchReclams();
    } catch (err: any) {
      showSnackbar(err.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>My Reclamations</Typography>
        
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
          <Button variant="contained" onClick={() => setOpen(true)}>
            New Reclamation
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reclams.map((reclam) => (
                <TableRow key={reclam.id}>
                  <TableCell>{reclam.title}</TableCell>
                  <TableCell>{reclam.description}</TableCell>
                  <TableCell>
                    <FormControl size="small">
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={reclam.status}
                        onChange={(e) => handleStatusChange(reclam.id, e.target.value)}
                      >
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="in_progress">In Progress</MenuItem>
                        <MenuItem value="resolved">Resolved</MenuItem>
                        <MenuItem value="closed">Closed</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>{reclam.priority}</TableCell>
                  <TableCell>{new Date(reclam.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(reclam)} color="primary" size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(reclam.id)} color="error" size="small">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Reclamation' : 'New Reclamation'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                required
                fullWidth
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
              />
              <TextField
                required
                fullWidth
                multiline
                rows={4}
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleSelectChange}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="resolved">Resolved</MenuItem>
                  <MenuItem value="closed">Closed</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleSelectChange}
                >
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingId ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <MuiSnackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <MuiAlert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </MuiAlert>
      </MuiSnackbar>
    </Box>
  );
};

export default AgentDashboard;
