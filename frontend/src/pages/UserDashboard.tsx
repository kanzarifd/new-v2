import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
  Chip, 
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Logout } from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';

interface Reclam {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  date_debut: string;
  date_fin: string;
  region_id: number;
  user_id: number;
}

interface Region {
  id: number;
  name: string;
}

const UserDashboard = () => {
  const { user, token, logout } = useAuth();
  const [reclams, setReclams] = useState<Reclam[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingReclam, setEditingReclam] = useState<Reclam | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    date_debut: '',
    date_fin: '',
    region_id: '',
    user_id: user?.id || '',
  });

  const fetchReclams = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/reclams', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReclams(response.data);
    } catch (err) {
      setError('Failed to fetch reclamations');
      console.error('Error fetching reclams:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegions = async () => {
    try {
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await axios.get('http://localhost:8000/api/regions', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRegions(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch regions');
      console.error('Error fetching regions:', err);
    }
  };

  useEffect(() => {
    fetchReclams();
    fetchRegions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      if (!formData.region_id) {
        throw new Error('Please select a region');
      }

      const data = {
        ...formData,
        region_id: Number(formData.region_id),
        user_id: Number(user?.id),
      };

      const response = editingReclam
        ? await axios.put(`http://localhost:8000/api/reclams/${editingReclam.id}`, data, {
            headers: { Authorization: `Bearer ${token}` },
          })
        : await axios.post('http://localhost:8000/api/reclams', data, {
            headers: { Authorization: `Bearer ${token}` },
          });

      setSuccessMessage(
        editingReclam ? 'Reclamation updated successfully' : 'Reclamation added successfully'
      );
      fetchReclams();
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to process reclamation');
      console.error('Error processing reclamation:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this reclamation?')) return;

    try {
      setLoading(true);
      setError(null);
      await axios.delete(`http://localhost:8000/api/reclams/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccessMessage('Reclamation deleted successfully');
      fetchReclams();
    } catch (err) {
      setError('Failed to delete reclamation');
      console.error('Error deleting reclamation:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (reclam?: Reclam) => {
    setOpen(true);
    setEditingReclam(reclam || null);
    if (reclam) {
      setFormData({
        ...reclam,
        region_id: reclam.region_id?.toString() || '',
        user_id: user?.id || '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        date_debut: '',
        date_fin: '',
        region_id: '',
        user_id: user?.id || '',
      });
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditingReclam(null);
    setFormData({
      title: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      date_debut: '',
      date_fin: '',
      region_id: '',
      user_id: user?.id || '',
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">User Dashboard</Typography>
        <Button
          variant="outlined"
          color="error"
          startIcon={<Logout />}
          onClick={() => {
            logout();
          }}
        >
          Logout
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Button
        variant="contained"
        color="primary"
        onClick={() => handleOpen()}
        startIcon={<AddIcon />}
        sx={{ mb: 2 }}
      >
        Add Reclamation
      </Button>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Reclamations
        </Typography>

        {loading ? (
          <CircularProgress />
        ) : reclams.length === 0 ? (
          <Typography>No reclamations found</Typography>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Region</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reclams.map((reclam) => (
                <TableRow key={reclam.id}>
                  <TableCell>{reclam.title}</TableCell>
                  <TableCell>
                    <Chip
                      label={reclam.status}
                      size="small"
                      sx={{
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        bgcolor: reclam.status === 'pending' ? 'success.light' : 'error.light',
                      }}
                    />
                  </TableCell>
                  <TableCell>{reclam.priority}</TableCell>
                  <TableCell>{reclam.date_debut}</TableCell>
                  <TableCell>{reclam.date_fin}</TableCell>
                  <TableCell>
                    {regions.find((r) => r.id === reclam.region_id)?.name || 'Unknown Region'}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleOpen(reclam)}
                      color="primary"
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(reclam.id)}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>{editingReclam ? 'Edit Reclamation' : 'Add New Reclamation'}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                error={!formData.title}
              />

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />

              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  label="Status"
                  required
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
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  label="Priority"
                  required
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Region</InputLabel>
                <Select
                  value={formData.region_id}
                  onChange={(e) => setFormData({ ...formData, region_id: e.target.value })}
                  label="Region"
                  required
                >
                  {regions.map((region) => (
                    <MenuItem key={region.id} value={region.id.toString()}>
                      {region.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={formData.date_debut ? new Date(formData.date_debut) : null}
                  onChange={(date) => {
                    if (date instanceof Date) {
                      setFormData((prev) => ({ ...prev, date_debut: format(date, 'yyyy-MM-dd') }));
                    }
                  }}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth required />
                  )}
                />
              </LocalizationProvider>

              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date"
                  value={formData.date_fin ? new Date(formData.date_fin) : null}
                  onChange={(date) => {
                    if (date instanceof Date) {
                      setFormData((prev) => ({ ...prev, date_fin: format(date, 'yyyy-MM-dd') }));
                    }
                  }}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth required />
                  )}
                />
              </LocalizationProvider>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : editingReclam ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage(null)}
      >
        <Alert onClose={() => setSuccessMessage(null)} severity="success">
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserDashboard;
