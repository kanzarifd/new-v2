import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Typography,
  Box,
  Button,
  useTheme,
  useMediaQuery,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import {
  AdapterDateFns
} from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker as MuiDatePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

interface RegionFormData {
  name: string;
  date_debut: string;
  date_fin: string;
}

interface Region extends RegionFormData {
  id: number;
}

interface Reclam {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  date_debut: string;
  date_fin: string;
  user: {
    id: number;
    name: string;
  };
  region: {
    id: number;
    name: string;
  };
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Existing state
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<RegionFormData>({ name: '', date_debut: '', date_fin: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [regions, setRegions] = useState<Region[]>([]);
  const [error, setError] = useState<string | null>(null);

  // New state for reclamations
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [reclams, setReclams] = useState<Reclam[]>([]);
  const [reclamError, setReclamError] = useState<string | null>(null);
  const [loadingReclams, setLoadingReclams] = useState(false);

  // New state for priority filter
  const [priorityFilter, setPriorityFilter] = useState<string>('');

  // New state for priority reclams
  const [priorityReclams, setPriorityReclams] = useState<Reclam[]>([]);
  const [selectedPriority, setSelectedPriority] = useState<string>('high');
  const [loadingPriorityReclams, setLoadingPriorityReclams] = useState(false);
  const [priorityError, setPriorityError] = useState<string | null>(null);

  const fetchRegions = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/regions');
      const data = await response.json();
      setRegions(data);
    } catch (error) {
      console.error('Error fetching regions:', error);
    }
  };

  useEffect(() => {
    fetchRegions();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login', { replace: true });
  };

  const handleBack = () => {
    if (location.state?.from) {
      navigate(location.state.from, { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  };

  const handleOpen = (region?: Region) => {
    setOpen(true);
    setError(null);
    if (region) {
      setEditingId(region.id);
      setFormData({
        name: region.name,
        date_debut: region.date_debut,
        date_fin: region.date_fin
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', date_debut: '', date_fin: '' });
    }
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({ name: '', date_debut: '', date_fin: '' });
    setError(null);
    setEditingId(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const debutDateISO = new Date(formData.date_debut).toISOString();
    const finDateISO = new Date(formData.date_fin).toISOString();

    try {
      const url = editingId
        ? `http://localhost:8000/api/regions/${editingId}`
        : 'http://localhost:8000/api/regions';

      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          name: formData.name,
          date_debut: debutDateISO,
          date_fin: finDateISO
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Operation failed');
      }

      await fetchRegions();
      handleClose();
      alert(editingId ? 'Region updated successfully!' : 'Region added successfully!');
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this region?')) return;

    try {
      await fetch(`http://localhost:8000/api/regions/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        }
      });
      await fetchRegions();
    } catch (error) {
      console.error('Failed to delete region:', error);
    }
  };

  // New function to handle priority change
  const handlePriorityChange = (event: SelectChangeEvent) => {
    setPriorityFilter(event.target.value as string);
    // If a region is selected, refresh reclams with new filter
    if (selectedRegionId) {
      fetchReclams(selectedRegionId);
    }
  };

  // New function to fetch reclams with priority filter
  const fetchReclams = async (regionId: number) => {
    setLoadingReclams(true);
    setReclamError(null);

    try {
      const response = await axios.get(`http://localhost:8000/api/reclams/region/${regionId}`, {
        params: {
          priority: priorityFilter || undefined,  // Send the selected priority as a query parameter
        }
      });
      setReclams(response.data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setReclamError('No reclamations found for this region.');
      } else {
        setReclamError('Failed to load reclamations.');
      }
    } finally {
      setLoadingReclams(false);
    }
  };

  const handleRegionSelect = (regionId: number) => {
    setSelectedRegionId(regionId);
    fetchReclams(regionId);
  };

  // New function to fetch reclams by priority
  const fetchPriorityReclams = async (priority: string) => {
    setLoadingPriorityReclams(true);
    setPriorityError(null);

    try {
      const response = await axios.get(`http://localhost:8000/api/reclams/priority/${priority}`);
      setPriorityReclams(response.data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setPriorityError('No reclamations found with this priority.');
      } else {
        setPriorityError('Failed to load reclamations by priority.');
      }
    } finally {
      setLoadingPriorityReclams(false);
    }
  };

  // Fetch reclams for selected priority
  useEffect(() => {
    fetchPriorityReclams(selectedPriority);
  }, [selectedPriority]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Admin Dashboard</Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button variant="contained" color="primary" onClick={() => handleOpen()}>
          New Project
        </Button>
        <Button variant="outlined" onClick={handleBack}>Back</Button>
      </Box>

      {/* Regions list */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6">Existing Regions</Typography>
        <List>
          {regions.map((region) => (
            <React.Fragment key={region.id}>
              <ListItem
                sx={{
                  '&:hover': {
                    bgcolor: 'action.hover',
                    cursor: 'pointer'
                  }
                }}
              >
                <ListItemText
                  primary={
                    <Box
                      component="span"
                      sx={{
                        display: 'inline-block',
                        cursor: 'pointer',
                        '&:hover': {
                          color: 'primary.main'
                        }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRegionSelect(region.id);
                      }}
                    >
                      {region.name}
                    </Box>
                  }
                  secondary={`From ${region.date_debut} to ${region.date_fin}`}
                />
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <IconButton onClick={(e) => {
                    e.stopPropagation();
                    handleOpen(region);
                  }}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(region.id);
                  }}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </Paper>

      {/* Reclamations section */}
      {selectedRegionId && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Reclamations for {regions.find(r => r.id === selectedRegionId)?.name}
          </Typography>
          

          {reclamError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {reclamError}
            </Alert>
          )}

          {loadingReclams && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress />
            </Box>
          )}

          {!loadingReclams && reclams.length > 0 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Start Date</TableCell>
                    <TableCell>End Date</TableCell>
                    <TableCell>User</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reclams.map(reclam => (
                    <TableRow key={reclam.id}>
                      <TableCell>{reclam.title}</TableCell>
                      <TableCell>{reclam.description}</TableCell>
                      <TableCell>{reclam.status}</TableCell>
                      <TableCell>{reclam.priority}</TableCell>
                      <TableCell>{new Date(reclam.date_debut).toLocaleDateString()}</TableCell>
                      <TableCell>{reclam.date_fin ? new Date(reclam.date_fin).toLocaleDateString() : '-'}</TableCell>
                      <TableCell>{reclam.user?.name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

      {/* Priority Reclamations section */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Reclamations by Priority
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              value={selectedPriority}
              label="Priority"
              onChange={(e) => setSelectedPriority(e.target.value as string)}
            >
              <MenuItem value="high">High Priority</MenuItem>
              <MenuItem value="medium">Medium Priority</MenuItem>
              <MenuItem value="low">Low Priority</MenuItem>
            </Select>
          </FormControl>

          {priorityError && (
            <Alert severity="error" sx={{ flex: 1 }}>
              {priorityError}
            </Alert>
          )}
        </Box>

        {loadingPriorityReclams && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {!loadingPriorityReclams && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Region</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {priorityReclams.map(reclam => (
                  <TableRow key={reclam.id}>
                    <TableCell>{reclam.title}</TableCell>
                    <TableCell>{reclam.description}</TableCell>
                    <TableCell>{reclam.region?.name}</TableCell>
                    <TableCell>{reclam.user?.name}</TableCell>
                    <TableCell>{reclam.status}</TableCell>
                    <TableCell>{new Date(reclam.date_debut).toLocaleDateString()}</TableCell>
                    <TableCell>{reclam.date_fin ? new Date(reclam.date_fin).toLocaleDateString() : '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Add/Edit Region Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Region' : 'Add New Region'}</DialogTitle>
        {error && (
          <DialogContent sx={{ color: 'error.main', mb: 2 }}>
            {error}
          </DialogContent>
        )}
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                required
                label="Region Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <MuiDatePicker
                  label="Start Date"
                  value={formData.date_debut ? new Date(formData.date_debut) : null}
                  onChange={(date) => {
                    const formatted = date ? format(date, 'yyyy-MM-dd') : '';
                    setFormData((prev) => ({ ...prev, date_debut: formatted }));
                  }}
                  renderInput={(params) => <TextField {...params} required />}
                />
                <MuiDatePicker
                  label="End Date"
                  value={formData.date_fin ? new Date(formData.date_fin) : null}
                  onChange={(date) => {
                    const formatted = date ? format(date, 'yyyy-MM-dd') : '';
                    setFormData((prev) => ({ ...prev, date_fin: formatted }));
                  }}
                  renderInput={(params) => <TextField {...params} required />}
                />
              </LocalizationProvider>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">{editingId ? 'Update' : 'Add'}</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Button onClick={handleLogout} color="error" sx={{ mt: 2 }}>
        Logout
      </Button>
    </Box>
  );
};

export default AdminDashboard;