import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
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
  SelectChangeEvent,
  Typography
} from '@mui/material';
import {
  AdapterDateFns
} from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker as MuiDatePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import axios from 'axios';
import { useSnackbar } from '../components/SnackbarProvider';
import AdminDashboardStats from '../components/AdminDashboardStats';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

interface RegionFormData {
  name: string;
  date_debut: string;
  date_fin: string
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
  const { enqueueSnackbar } = useSnackbar();

  // State for sidebar and navigation
  const [activeSection, setActiveSection] = useState('dashboard');
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  // Existing state
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<RegionFormData>({ name: '', date_debut: '', date_fin: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [regions, setRegions] = useState<Region[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [reclams, setReclams] = useState<Reclam[]>([]);
  const [reclamError, setReclamError] = useState<string | null>(null);
  const [loadingReclams, setLoadingReclams] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [priorityReclams, setPriorityReclams] = useState<Reclam[]>([]);
  const [selectedPriority, setSelectedPriority] = useState<string>('high');
  const [loadingPriorityReclams, setLoadingPriorityReclams] = useState(false);
  const [priorityError, setPriorityError] = useState<string | null>(null);
  const [usersByRole, setUsersByRole] = useState<any[]>([]);
  const [selectedUserRole, setSelectedUserRole] = useState<string>('user');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [reclamations, setReclamations] = useState([]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login', { replace: true });
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const toggleColorMode = () => {
    setMode(mode === 'light' ? 'dark' : 'light');
  };

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
      enqueueSnackbar(editingId ? 'Region updated successfully!' : 'Region added successfully!', { variant: 'success' });
    } catch (error: any) {
      setError(error.message);
    }
  };

  const fetchReclams = async (regionId: number) => {
    setLoadingReclams(true);
    setReclamError(null);

    try {
      const response = await axios.get(`http://localhost:8000/api/reclams/region/${regionId}`, {
        params: {
          priority: priorityFilter || undefined,
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
    setActiveSection('regions');
  };

  const fetchAllReclams = async () => {
    setLoadingPriorityReclams(true);
    setPriorityError(null);

    try {
      const response = await axios.get('http://localhost:8000/api/reclams');
      setPriorityReclams(response.data);
    } catch (error: any) {
      setPriorityError('Failed to load reclamations.');
    } finally {
      setLoadingPriorityReclams(false);
    }
  };

  useEffect(() => {
    fetchAllReclams();
  }, []);

  useEffect(() => {
    const fetchReclamations = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/reclams');
        setReclamations(response.data);
      } catch (error) {
        console.error('Error fetching reclamations:', error);
        enqueueSnackbar('Error loading reclamations', { variant: 'error' });
      }
    };
    fetchReclamations();
  }, []);

  const fetchUsersByRole = async (role: string) => {
    setLoadingUsers(true);
    setUsersError(null);

    try {
      const response = await axios.get(`http://localhost:8000/api/users/role/${role}`);
      setUsersByRole(response.data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setUsersError(`No users found with role: ${role}`);
      } else {
        setUsersError('Failed to load users.');
      }
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (activeSection === 'users') {
      fetchUsersByRole(selectedUserRole);
    }
  }, [selectedUserRole, activeSection]);

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:8000/api/users/${userId}`);
      fetchUsersByRole(selectedUserRole);
      enqueueSnackbar('User deleted successfully', { variant: 'success' });
    } catch (error: any) {
      console.error('Error deleting user:', error);
      enqueueSnackbar(error.response?.data?.message || 'Error deleting user', { variant: 'error' });
    }
  };

  const filteredReclams = priorityReclams.filter(reclam => 
    reclam.priority === selectedPriority
  );

  function handleEditUser(id: any): void {
    throw new Error('Function not implemented.');
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        isMobile={isMobile}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <AdminHeader
          toggleDrawer={toggleDrawer}
          toggleColorMode={toggleColorMode}
          onLogout={handleLogout}
          isMobile={isMobile}
        />

        {/* Main Content */}
        <Box sx={{ mt: '64px' }}>
          {/* Statistics and Charts */}
          {activeSection === 'dashboard' && (
            <AdminDashboardStats reclamations={reclamations} />
          )}

          {/* Regions list */}
          {activeSection === 'regions' && (
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
                      </Box>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>

              {/* Reclamations for selected region */}
              {selectedRegionId && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
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
                </>
              )}
            </Paper>
          )}

          {/* Reclamations by Priority section */}
          {activeSection === 'priority' && (
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
                        <TableCell>Status</TableCell>
                        <TableCell>Start Date</TableCell>
                        <TableCell>End Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredReclams.map(reclam => (
                        <TableRow key={reclam.id}>
                          <TableCell>{reclam.title}</TableCell>
                          <TableCell>{reclam.description}</TableCell>
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
          )}

          {/* Users by Role section */}
          {activeSection === 'users' && (
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Users by Role
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={selectedUserRole}
                    label="Role"
                    onChange={(e) => setSelectedUserRole(e.target.value as string)}
                  >
                    <MenuItem value="user">Users</MenuItem>
                    <MenuItem value="admin">Admins</MenuItem>
                    <MenuItem value="agent">Agents</MenuItem>
                  </Select>
                </FormControl>

                {usersError && (
                  <Alert severity="error" sx={{ flex: 1 }}>
                    {usersError}
                  </Alert>
                )}
              </Box>

              {loadingUsers && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress />
                </Box>
              )}

              {!loadingUsers && (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Full Name</TableCell>
                        <TableCell>Phone Number</TableCell>
                        <TableCell>Bank Account</TableCell>
                        <TableCell>Balance</TableCell>
                        <TableCell>Created At</TableCell>
                        <TableCell>Updated At</TableCell>
                        <TableCell />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {usersByRole.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.full_name}</TableCell>
                          <TableCell>{user.number}</TableCell>
                          <TableCell>{user.bank_account_number}</TableCell>
                          <TableCell>{user.bank_account_balance}</TableCell>
                          <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(user.updatedAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <IconButton
                              color="primary"
                              onClick={() => handleEditUser(user.id)}
                              size="small"
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteUser(user.id)}
                              size="small"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          )}
        </Box>

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
      </Box>
    </Box>
  );
};

export default AdminDashboard;