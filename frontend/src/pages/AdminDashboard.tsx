import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Paper,
  Typography,
  Tooltip,
  Alert,
  AlertTitle,
  CircularProgress,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Box,
  Select,
  MenuItem,
  SelectChangeEvent,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  useTheme,
  useMediaQuery,
  Card,
  Pagination,
  TableSortLabel,
  Chip,
  Avatar,
  Skeleton
} from '@mui/material';
import {
  LocationOn as LocationOnIcon,
  Assignment as AssignmentIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  CalendarToday as CalendarTodayIcon,
  InfoOutlined as InfoOutlinedIcon
} from '@mui/icons-material';
import {
  AdapterDateFns
} from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker as MuiDatePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
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
  status: 'completed' | 'pending' | 'active' | 'inactive';
  priority: 'high' | 'medium' | 'low';
  date_debut: string;
  date_fin: string;
  user?: {
    id: number;
    name: string;
  };
  region?: {
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

  // Table state
  const [sortBy, setSortBy] = useState<keyof Reclam>('date_debut');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedReclam, setSelectedReclam] = useState<Reclam | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Status color mapping
  const statusColorMap: Record<Reclam['status'], 'error' | 'success' | 'warning' | 'primary'> = {
    completed: 'success',
    pending: 'warning',
    active: 'primary',
    inactive: 'error'
  };

  // Priority color mapping
  const priorityColorMap: Record<Reclam['priority'], 'error' | 'warning' | 'success'> = {
    high: 'error',
    medium: 'warning',
    low: 'success'
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login', { replace: true });
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
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

  const handleOpen = (item: Region | Reclam) => {
    if ('title' in item) {
      setSelectedReclam(item as Reclam);
    } else {
      setOpen(true);
      setError(null);
      if (item) {
        setEditingId(item.id);
        setFormData({
          name: item.name,
          date_debut: item.date_debut,
          date_fin: item.date_fin
        });
      } else {
        setEditingId(null);
        setFormData({ name: '', date_debut: '', date_fin: '' });
      }
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
            <Paper
              elevation={3}
              sx={{
                p: 3,
                mb: 4,
                borderRadius: 2,
                bgcolor: 'background.paper',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              }}
            >
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h5"
                  component="h2"
                  sx={{
                    fontWeight: 600,
                    color: 'primary.main',
                    mb: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <LocationOnIcon sx={{ fontSize: 24 }} />
                  Existing Regions
                </Typography>
                <Typography
                  variant="subtitle1"
                  color="text.secondary"
                  sx={{
                    opacity: 0.8,
                  }}
                >
                  Manage your regions and their associated reclamations
                </Typography>
              </Box>

              {/* Regions List */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOnIcon sx={{ color: 'primary.main' }} />
                  Regions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {regions.map((region) => (
                    <Card 
                      key={region.id}
                      elevation={2}
                      sx={{ 
                        borderLeft: selectedRegionId === region.id ? '4px solid' : 'none',
                        borderColor: 'primary.main',
                        transition: 'all 0.2s ease',
                        '&:hover': { 
                          boxShadow: 4,
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      <ListItem
                        button
                        onClick={() => handleRegionSelect(region.id)}
                        sx={{
                          p: 2,
                          bgcolor: selectedRegionId === region.id ? 'action.selected' : 'inherit'
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1" fontWeight="medium">
                              {region.name}
                            </Typography>
                          }
                          secondary={
                            <Box component="span" display="flex" alignItems="center" gap={1}>
                              <CalendarTodayIcon fontSize="small" />
                              {`${format(new Date(region.date_debut), 'dd MMM yyyy')} - 
                              ${format(new Date(region.date_fin), 'dd MMM yyyy')}`}
                            </Box>
                          }
                        />
                        <IconButton 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpen(region);
                          }}
                          size="small"
                          sx={{ color: 'primary.main' }}
                        >
                          <EditIcon />
                        </IconButton>
                      </ListItem>
                    </Card>
                  ))}
                </Box>
              </Box>

              {/* Reclamations for selected region */}
              {selectedRegionId && (
                <>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      mt: 3,
                      fontWeight: 600,
                      color: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <AssignmentIcon sx={{ fontSize: 20 }} />
                    Reclamations for {regions.find(r => r.id === selectedRegionId)?.name}
                  </Typography>

                  {reclamError && (
                    <Alert
                      severity="error"
                      sx={{
                        mb: 2,
                        borderRadius: 1,
                      }}
                    >
                      {reclamError}
                    </Alert>
                  )}

                  {loadingReclams && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress color="primary" />
                    </Box>
                  )}

                  {!loadingReclams && reclams.length > 0 && (
                    <Box sx={{ width: '100%' }}>
                      {/* Table Header */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AssignmentIcon sx={{ color: 'primary.main' }} />
                          Reclamations
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <FormControl size="small" sx={{ width: 120 }}>
                            <Select
                              value={rowsPerPage}
                              onChange={(e) => setRowsPerPage(Number(e.target.value))}
                              displayEmpty
                            >
                              {[10, 25, 50].map((size) => (
                                <MenuItem key={size} value={size}>
                                  {size} per page
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <Pagination
                            count={Math.ceil(reclams.length / rowsPerPage)}
                            page={currentPage}
                            onChange={(e, page) => setCurrentPage(page)}
                            size="small"
                            color="primary"
                          />
                        </Box>
                      </Box>

                      {/* Table */}
                      <TableContainer component={Paper}>
                        <Table>
                          <TableHead>
                            <TableRow>
                              {[
                                { id: 'title', label: 'Title' },
                                { id: 'status', label: 'Status' },
                                { id: 'priority', label: 'Priority' },
                                { id: 'date_debut', label: 'Start Date' },
                                { id: 'user', label: 'User' },
                                { id: 'actions', label: '' }
                              ].map((column) => (
                                <TableCell key={column.id}>
                                  {column.id !== 'actions' ? (
                                    <TableSortLabel
                                      active={sortBy === column.id}
                                      direction={order}
                                      onClick={() => {
                                        if (sortBy === column.id) {
                                          setOrder(order === 'asc' ? 'desc' : 'asc');
                                        } else {
                                          setSortBy(column.id as keyof Reclam);
                                          setOrder('asc');
                                        }
                                      }}
                                    >
                                      {column.label}
                                    </TableSortLabel>
                                  ) : column.label}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableHead>
                          
                          <TableBody>
                            {reclams
                              .slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
                              .sort((a, b) => {
                                if (sortBy === 'date_debut') {
                                  return order === 'asc'
                                    ? new Date(a.date_debut).getTime() - new Date(b.date_debut).getTime()
                                    : new Date(b.date_debut).getTime() - new Date(a.date_debut).getTime();
                                }
                                return 0;
                              })
                              .map((reclam) => (
                                <TableRow
                                  key={reclam.id}
                                  sx={{
                                    '&:hover': {
                                      bgcolor: 'action.hover',
                                    },
                                  }}
                                >
                                  <TableCell>{reclam.title}</TableCell>
                                  <TableCell>
                                    <Chip 
                                      label={reclam.status} 
                                      size="small"
                                      color={statusColorMap[reclam.status]}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Chip 
                                      label={reclam.priority} 
                                      size="small"
                                      color={priorityColorMap[reclam.priority]}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    {format(new Date(reclam.date_debut), 'dd MMM yyyy')}
                                  </TableCell>
                                  <TableCell>
                                    <Box display="flex" alignItems="center" gap={1}>
                                      <Avatar sx={{ width: 24, height: 24, fontSize: 14 }}>
                                        {reclam.user?.name?.charAt(0)}
                                      </Avatar>
                                      {reclam.user?.name}
                                    </Box>
                                  </TableCell>
                                  <TableCell>
                                    <IconButton size="small" onClick={() => handleOpen(reclam)}>
                                      <EditIcon />
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </TableContainer>

                      {/* Loading Skeleton */}
                      {loadingReclams && (
                        <Box sx={{ p: 2 }}>
                          {[...Array(3)].map((_, index) => (
                            <Skeleton 
                              key={index}
                              variant="rectangular" 
                              height={56} 
                              sx={{ mb: 1, borderRadius: 1 }}
                            />
                          ))}
                        </Box>
                      )}

                      {/* Error Message */}
                      {reclamError && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                          {reclamError}
                        </Alert>
                      )}
                    </Box>
                  )}
                </>
              )}
            </Paper>
          )}
{/* Reclamations by Priority Section */}
{activeSection === 'priority' && (
  <Paper sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: 3 }}>
    <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
      Priority-Based Reclamation Management
    </Typography>

    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel id="priority-select-label">Priority Level</InputLabel>
          <Select
            labelId="priority-select-label"
            value={selectedPriority}
            label="Priority Level"
            onChange={(e) => setSelectedPriority(e.target.value as string)}
            variant="outlined"
          >
            <MenuItem value="high">High Priority</MenuItem>
            <MenuItem value="medium">Medium Priority</MenuItem>
            <MenuItem value="low">Low Priority</MenuItem>
          </Select>
        </FormControl>

        {priorityError && (
          <Alert severity="error" sx={{ flex: '1 1 300px' }}>
            <AlertTitle>Data Retrieval Error</AlertTitle>
            {priorityError}
          </Alert>
        )}
      </Box>
    </Box>

    {loadingPriorityReclams ? (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
        <CircularProgress size={40} thickness={4} />
        <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
          Loading reclamation data...
        </Typography>
      </Box>
    ) : (
      <TableContainer sx={{ maxHeight: 600, overflow: 'auto' }}>
        <Table stickyHeader aria-label="priority reclamations table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Reclamation Title</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Detailed Description</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Resolution Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Initiation Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Completion Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredReclams.length > 0 ? (
              filteredReclams.map((reclam) => (
                <TableRow key={reclam.id} hover>
                  <TableCell>{reclam.title}</TableCell>
                  <TableCell sx={{ maxWidth: 300 }}>{reclam.description}</TableCell>
                  <TableCell>
                    <Chip 
                      label={reclam.status} 
                      color={
                        reclam.status.toLowerCase() === 'resolved' ? 'success' : 
                        reclam.status.toLowerCase() === 'pending' ? 'warning' : 'error'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(reclam.date_debut).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </TableCell>
                  <TableCell>
                    {reclam.date_fin ? 
                      new Date(reclam.date_fin).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }) : 
                      <Typography variant="body2" color="text.secondary">
                        Ongoing
                      </Typography>
                    }
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} sx={{ py: 4 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    color: 'text.secondary'
                  }}>
                    <InfoOutlinedIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="body1">
                      No reclamations found for selected priority level
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
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