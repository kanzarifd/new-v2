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
  Add as AddIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  CalendarToday as CalendarTodayIcon,
  InfoOutlined as InfoOutlinedIcon,
  People as PeopleIcon,
  HighlightOff
} from '@mui/icons-material';
import {
  AdapterDateFns
} from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker as MuiDatePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import axios from 'axios';
import { useSnackbar } from '../components/SnackbarProvider';
import AdminDashboardStats from '../components/AdminDashboardStats';
import { Reclam } from '../components/types';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import AttachmentPreviewDialog from '../components/AttachmentPreviewDialog';
import CreateUserDialog from '../components/CreateUserDialog';
import EditUserDialog from '../components/EditUserDialog';

import { styled } from '@mui/material/styles';
import FooterHTML from '../components/FooterHTML';

interface RegionFormData {
  name: string;
  date_debut: string;
}

interface Region extends RegionFormData {
  id: number;
  attachment?: string;
}

const StyledCard = styled(Card)(({ theme }) => ({
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[8],
    transform: 'translateY(-2px)',
  },
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  '& .MuiTable-root': {
    minWidth: 700,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  '&:nth-of-type(even)': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
  '&:first-child': {
    fontWeight: 500,
    color: theme.palette.text.primary,
  },
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  backgroundColor: theme.palette.grey[100],
  color: theme.palette.text.primary,
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  '&.MuiChip-root': {
    margin: theme.spacing(0.5),
    backgroundColor: theme.palette.grey[100],
    color: theme.palette.text.primary,
  },
}));

const StyledSkeleton = styled(Skeleton)(({ theme }) => ({
  backgroundColor: theme.palette.grey[100],
  '&::after': {
    backgroundColor: theme.palette.grey[300],
  },
}));

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
  const [formData, setFormData] = useState<RegionFormData>({ name: '', date_debut: format(new Date(), 'yyyy-MM-dd') });
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




  const [isRegionDialogOpen, setIsRegionDialogOpen] = useState(false);
const [regionFormData, setRegionFormData] = useState<RegionFormData>({ name: '', date_debut: format(new Date(), 'yyyy-MM-dd'), });
const [regionError, setRegionError] = useState<string | null>(null);
const [loadingRegions, setLoadingRegions] = useState(false);
  // User Creation Dialog State
  const [createUserOpen, setCreateUserOpen] = useState(false);

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
  

  // Attachment preview dialog state for regions
  const [regionPreviewOpen, setRegionPreviewOpen] = useState(false);
  const [regionPreviewSrc, setRegionPreviewSrc] = useState<string | null>(null);
  const [regionPreviewIsImage, setRegionPreviewIsImage] = useState(true);

  // Attachment preview dialog state for reclamations in selected region
  const [attachmentPreviewOpen, setAttachmentPreviewOpen] = useState(false);
  const [attachmentPreviewSrc, setAttachmentPreviewSrc] = useState<string | null>(null);
  const [attachmentPreviewIsImage, setAttachmentPreviewIsImage] = useState(true);

  // Edit user dialog state
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<any>(null);

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetUser, setDeleteTargetUser] = useState<any>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Delete confirmation dialog state for regions
  const [deleteRegionDialogOpen, setDeleteRegionDialogOpen] = useState(false);
  const [deleteTargetRegion, setDeleteTargetRegion] = useState<any>(null);
  const [deleteRegionConfirmText, setDeleteRegionConfirmText] = useState('');


// Agents
const [updateAgentDialogOpen, setUpdateAgentDialogOpen] = useState(false);
const [selectedAgent, setSelectedAgent] = useState<any | null>(null);
const [selectedAgentRegion, setSelectedAgentRegion] = useState<number | null>(null);

  const [agents, setAgents] = useState<any[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [agentsError, setAgentsError] = useState<string | null>(null);


  const handleCreateRegion = async () => {
    if (!regionFormData.name || !regionFormData.date_debut) {
      enqueueSnackbar('Please fill in all region details', { variant: 'error' });
      return;
    }
    try {
      setLoadingRegions(true);
      const response = await axios.post('/api/regions', regionFormData);
      setRegions([...regions, response.data]);
      setIsRegionDialogOpen(false);
      setRegionFormData({ name: '', date_debut: '' });
      enqueueSnackbar('Region created successfully', { variant: 'success' });
    } catch (err: any) {
      setRegionError(err.response?.data?.message || 'Failed to create region');
      enqueueSnackbar(err.response?.data?.message || 'Failed to create region', { variant: 'error' });
    } finally {
      setLoadingRegions(false);
    }
  };




  const handleLogout = () => {
    localStorage.clear();
    navigate('/login', { replace: true });
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

// agents 
  const fetchAgents = async () => {
    setLoadingAgents(true);
    setAgentsError(null);
  
    try {
      const response = await axios.get('http://localhost:8000/api/users/role/agent');
      setAgents(response.data);
    } catch (error: any) {
      setAgentsError('Failed to load agents');
    } finally {
      setLoadingAgents(false);
    }
  };

  useEffect(() => {
    if (activeSection === 'agents') {
      fetchAgents();
    }
  }, [activeSection]);
  

  const handleOpenUpdateRegion = (agent: any) => {
    setSelectedAgent(agent);
    setSelectedAgentRegion(agent.region_id || null);
    setUpdateAgentDialogOpen(true);
  };
  

  const handleUpdateAgentRegion = async () => {
    if (!selectedAgent || selectedAgentRegion === null) return;
    try {
      await axios.put(`http://localhost:8000/api/users/agent/${selectedAgent.id}`, {
        region_id: selectedAgentRegion,
      });
      enqueueSnackbar('Agent region updated successfully', { variant: 'success' });
      fetchAgents(); // refresh agent list
      setUpdateAgentDialogOpen(false);
      setSelectedAgent(null);
      setSelectedAgentRegion(null);
    } catch (error) {
      enqueueSnackbar('Failed to update agent region', { variant: 'error' });
    }
  };
  
  

//regions 


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
        });
      } else {
        setEditingId(null);
        setFormData({ name: '', date_debut: '' });
      }
    }
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({ name: '', date_debut: '' });
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

  const handleDeleteUser = (userId: number) => {
    const user = usersByRole.find((u) => u.id === userId);
    setDeleteTargetUser(user);
    setDeleteDialogOpen(true);
    setDeleteConfirmText('');
  };

  const confirmDeleteUser = async () => {
    if (!deleteTargetUser) return;
    setDeleteDialogOpen(false);
    try {
      await axios.delete(`http://localhost:8000/api/users/${deleteTargetUser.id}`);
      enqueueSnackbar('User deleted successfully', { variant: 'success' });
      fetchUsersByRole(selectedUserRole);
    } catch (err) {
      enqueueSnackbar('Failed to delete user', { variant: 'error' });
    } finally {
      setDeleteTargetUser(null);
      setDeleteConfirmText('');
    }
  };

  const filteredReclams = priorityReclams.filter(reclam => 
    reclam.priority === selectedPriority
  );

  function openEditUserDialog(userId: number) {
    const user = usersByRole.find((u) => u.id === userId);
    if (!user) {
      enqueueSnackbar('User not found', { variant: 'error' });
      return;
    }
    setUserToEdit({
      name: user.name,
      full_name: user.full_name,
      number: user.number,
      email: user.email,
      role: user.role,
      bank_account_number: user.bank_account_number,
      bank_account_balance: user.bank_account_balance?.toString() || '',
    });
    setEditUserDialogOpen(true);
  }

  async function handleEditUser(userId: number) {
    openEditUserDialog(userId);
  }

  async function handleSaveEditedUser(form: any) {
    if (!userToEdit) return;
    try {
      await axios.put(`http://localhost:8000/api/users/${usersByRole.find((u) => u.email === userToEdit.email)?.id}`,
        {
          ...form,
          bank_account_balance: parseFloat(form.bank_account_balance)
        }
      );
      enqueueSnackbar('User updated successfully', { variant: 'success' });
      fetchUsersByRole(selectedUserRole);
      setEditUserDialogOpen(false);
      setUserToEdit(null);
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.message || 'Error updating user', { variant: 'error' });
    }
  }

  // Scroll to reclam from search hash
  React.useEffect(() => {
    if (location.hash.startsWith('#reclam-')) {
      const el = document.getElementById(location.hash.slice(1));
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location.hash]);

  const handlePreviewAttachment = (reclam: any) => {
    setAttachmentPreviewSrc(`http://localhost:8000/uploads/${reclam.attachment}`);
    setAttachmentPreviewIsImage(!!reclam.attachment && /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(reclam.attachment));
    setAttachmentPreviewOpen(true);
  };

  const handleDeleteRegion = (region: Region) => {
    setDeleteTargetRegion(region);
    setDeleteRegionDialogOpen(true);
    setDeleteRegionConfirmText('');
  };

  const confirmDeleteRegion = async () => {
    if (!deleteTargetRegion) return;
    setDeleteRegionDialogOpen(false);
    try {
      await axios.delete(`http://localhost:8000/api/regions/${deleteTargetRegion.id}`);
      enqueueSnackbar('Region deleted successfully', { variant: 'success' });
      fetchRegions();
    } catch (err) {
      enqueueSnackbar('Failed to delete region', { variant: 'error' });
    } finally {
      setDeleteTargetRegion(null);
      setDeleteRegionConfirmText('');
    }
  };

  return (
    
    <><Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: theme.palette.background.default, color: theme.palette.text.primary }}>
      <AdminSidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        isMobile={isMobile}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen} />

      <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: theme.palette.background.default, color: theme.palette.text.primary, minHeight: '100vh' }}>
        <AdminHeader
          toggleDrawer={toggleDrawer}
          onLogout={handleLogout}
          isMobile={isMobile} />

        {/* Main Content */}
        <Box sx={{ mt: '64px' }}>
          {/* Statistics and Charts */}
          {activeSection === 'dashboard' && (
            <AdminDashboardStats reclamations={reclamations} onEdit={(r: Reclam) => {
              // Scroll to corresponding reclam anchor
              window.location.hash = `#reclam-${r.id}`;
            } } />
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
                boxShadow: '0 4px 6px rgba(222, 8, 8, 0.1)',
              }}
            >
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography
                    variant="h5"
                    component="h2"
                    sx={{
                      fontWeight: 600,
                      color: '#e53935',
                      mb: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <LocationOnIcon sx={{ fontSize: 24, color: '#e53935' }} />
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
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => setIsRegionDialogOpen(true)}
                  startIcon={<AddIcon />}
                >
                  Create Region
                </Button>
                </Box>
               
              </Box>

              {/* Regions List */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: '#e53935', fontWeight: 700 }}>
                  <LocationOnIcon sx={{ color: '#e53935' }} />
                  Regions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {regions.map((region) => (
                    <Card
                      key={region.id}
                      elevation={2}
                      sx={{
                        borderLeft: selectedRegionId === region.id ? '4px solid' : 'none',
                        borderColor: '#e53935',
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
                          primary={<Typography variant="subtitle1" fontWeight="medium">
                            {region.name}
                          </Typography>}
                          secondary={<Box component="span" display="flex" alignItems="center" gap={1}>
                            <CalendarTodayIcon fontSize="small" />
                            {`${format(new Date(region.date_debut), 'dd MMM yyyy')} `}
                          </Box>} />
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpen(region);
                          } }
                          size="small"
                          sx={{
                            color: '#e53935',
                            backgroundColor: 'rgba(229,57,53,0.08)',
                            borderRadius: 1,
                            transition: 'background 0.2s, color 0.2s',
                            '&:hover': {
                              backgroundColor: '#e53935',
                              color: '#fff',
                            }
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        
                        {/* Delete Region Button */}
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRegion(region);
                          } }
                          size="small"
                          sx={{
                            color: theme.palette.error.main,
                            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(229,57,53,0.08)',
                            borderRadius: 1,
                            ml: 1,
                            transition: 'background 0.2s, color 0.2s',
                            '&:hover': {
                              backgroundColor: theme.palette.error.main,
                              color: theme.palette.error.contrastText,
                            }
                          }}
                        >
                          <DeleteIcon />
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
                      fontWeight: 700,
                      color: '#e53935',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <AssignmentIcon sx={{ fontSize: 20, color: '#e53935' }} />
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
                      <CircularProgress color="error" />
                    </Box>
                  )}

                  {!loadingReclams && reclams.length > 0 && (
                    <Box sx={{ width: '100%' }}>
                      {/* Table Header */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: '#e53935', fontWeight: 700 }}>

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
                            onChange={(_e, page) => setCurrentPage(page)}
                            size="small"
                            sx={{
                              '& .MuiPaginationItem-root': {
                                color: '#e53935',
                                borderColor: '#e53935',
                              },
                              '& .Mui-selected': {
                                backgroundColor: '#e53935',
                                color: '#fff',
                              },
                              '& .MuiPaginationItem-root.Mui-selected:hover': {
                                backgroundColor: '#e53935',
                              },
                              '& .MuiPaginationItem-root:hover': {
                                backgroundColor: 'rgba(229,57,53,0.08)',
                              }
                            }} />
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
                                { id: 'attachment', label: 'Attachment' },
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
                                      } }
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
                              .map((reclam) => {
                                const isImage = reclam.attachment && /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(reclam.attachment);
                                return (
                                  <StyledTableRow id={`reclam-${reclam.id}`} key={reclam.id}
                                    sx={{
                                      '&:hover': {
                                        bgcolor: 'action.hover',
                                      },
                                    }}
                                  >
                                    <StyledTableCell>{reclam.title}</StyledTableCell>
                                    <StyledTableCell>
                                      <Chip
                                        label={reclam.status}
                                        size="small"
                                        color={statusColorMap[reclam.status]} />
                                    </StyledTableCell>
                                    <StyledTableCell>
                                      <Chip
                                        label={reclam.priority}
                                        size="small"
                                        color={priorityColorMap[reclam.priority]} />
                                    </StyledTableCell>
                                    <StyledTableCell>
                                      {format(new Date(reclam.date_debut), 'dd MMM yyyy')}
                                    </StyledTableCell>
                                    <StyledTableCell>
                                      <Box display="flex" alignItems="center" gap={1}>
                                        <Avatar sx={{ width: 24, height: 24, fontSize: 14 }}>
                                          {reclam.user?.name?.charAt(0)}
                                        </Avatar>
                                        {reclam.user?.name}
                                      </Box>
                                    </StyledTableCell>
                                    <StyledTableCell>
                                      {reclam.attachment ? (
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 100 }}>
                                          <Button size="small" variant="outlined" color="error" onClick={() => handlePreviewAttachment(reclam)}>
                                            View
                                          </Button>
                                          {isImage && (
                                            <img
                                              src={`http://localhost:8000/uploads/${reclam.attachment}`}
                                              alt="attachment"
                                              style={{ maxWidth: 40, maxHeight: 40, borderRadius: 6, border: '1px solid #eee', marginLeft: 8 }}
                                              onError={e => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none'; } } />
                                          )}
                                        </Box>
                                      ) : (
                                        <span style={{ color: '#aaa' }}>No Attachment</span>
                                      )}
                                    </StyledTableCell>
                                    <StyledTableCell />
                                  </StyledTableRow>
                                );
                              })}
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
                              sx={{ mb: 1, borderRadius: 1 }} />
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
              <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 600, color: '#e53935' }}>
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
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Priority</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Created_At</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Attachment</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredReclams.length > 0 ? (
                        filteredReclams.map((reclam) => {
                          const isImage = reclam.attachment && /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(reclam.attachment);
                          return (
                            <TableRow key={reclam.id} hover>
                              <TableCell>{reclam.title}</TableCell>
                              <TableCell sx={{ maxWidth: 300 }}>{reclam.description}</TableCell>
                              <TableCell>
                                <Chip
                                  label={reclam.status}
                                  color={reclam.status.toLowerCase() === 'resolved' ? 'success' :
                                    reclam.status.toLowerCase() === 'pending' ? 'warning' : 'error'}
                                  size="small" />
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={reclam.priority}
                                  color={reclam.priority === 'high' ? 'error' :
                                    reclam.priority === 'medium' ? 'warning' : 'success'}
                                  size="small" />
                              </TableCell>
                              <TableCell>
                                {new Date(reclam.date_debut).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
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
                                {reclam.attachment ? (
                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 100 }}>
                                    <Button size="small" variant="outlined" color="error" onClick={() => handlePreviewAttachment(reclam)}>
                                      View
                                    </Button>
                                    {isImage && (
                                      <img
                                        src={`http://localhost:8000/uploads/${reclam.attachment}`}
                                        alt="attachment"
                                        style={{ maxWidth: 40, maxHeight: 40, borderRadius: 6, border: '1px solid #eee', marginLeft: 8 }}
                                        onError={e => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none'; } } />
                                    )}
                                  </Box>
                                ) : (
                                  <span style={{ color: '#aaa' }}>No Attachment</span>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} sx={{ py: 4 }}>
                            <Box sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              color: 'text.secondary'
                            }}>
                              <InfoOutlinedIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
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
              {/* Attachment Preview Dialog for priority-based reclamations */}
              <AttachmentPreviewDialog
                open={attachmentPreviewOpen}
                onClose={() => setAttachmentPreviewOpen(false)}
                src={attachmentPreviewSrc || ''}
                isImage={attachmentPreviewIsImage} />
            </Paper>
          )}

          {/* Users by Role section */}
          {activeSection === 'users' && (
            <StyledCard sx={{ p: 3, mb: 4 }}>
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h5"
                  component="h2"
                  sx={{
                    fontWeight: 600,
                    color: '#e53935',
                    mb: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <PeopleIcon sx={{ fontSize: 24 }} />
                  User Role Management
                </Typography>
                <Typography
                  variant="subtitle1"
                  color="text.secondary"
                  sx={{
                    opacity: 0.8,
                  }}
                >
                  Manage users and their roles in the system
                </Typography>
              </Box>

              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                  <FormControl sx={{ minWidth: 200 }} size="small">
                    <InputLabel id="role-select-label">Filter by Role</InputLabel>
                    <Select
                      labelId="role-select-label"
                      value={selectedUserRole}
                      label="Filter by Role"
                      onChange={(e) => setSelectedUserRole(e.target.value as string)}
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: 'rgba(0, 0, 0, 0.23)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(0, 0, 0, 0.38)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'primary.main',
                          },
                        },
                      }}
                    >
                      <MenuItem value="user">Standard Users</MenuItem>
                      <MenuItem value="admin">Administrators</MenuItem>
                      <MenuItem value="agent">Support Agents</MenuItem>
                    </Select>
                  </FormControl>

                  {usersError && (
                    <Alert severity="error" sx={{
                      flex: '1 1 300px',
                      borderRadius: 1,
                      '& .MuiAlert-message': {
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      },
                    }}>
                      <AlertTitle>Data Retrieval Error</AlertTitle>
                      {usersError}
                    </Alert>
                  )}
                </Box>
              </Box>

              <Button variant="contained" sx={{ bgcolor: '#b71c1c', color: '#fff', '&:hover': { bgcolor: '#7f1010' }, mb: 2 }} onClick={() => setCreateUserOpen(true)}>
                Create New User
              </Button>

              {loadingUsers ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                  <CircularProgress size={24} thickness={4} sx={{ color: 'primary.main' }} />
                  <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                    Loading user data...
                  </Typography>
                </Box>
              ) : (
                <StyledTableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: 'background.paper' }}>
                        <StyledTableCell sx={{ fontWeight: 700, borderBottom: '2px solid', borderColor: 'divider' }}>Name</StyledTableCell>
                        <StyledTableCell sx={{ fontWeight: 700, borderBottom: '2px solid', borderColor: 'divider' }}>Email</StyledTableCell>
                        <StyledTableCell sx={{ fontWeight: 700, borderBottom: '2px solid', borderColor: 'divider' }}>Full Name</StyledTableCell>
                        <StyledTableCell sx={{ fontWeight: 700, borderBottom: '2px solid', borderColor: 'divider' }}>Phone Number</StyledTableCell>
                        <StyledTableCell sx={{ fontWeight: 700, borderBottom: '2px solid', borderColor: 'divider' }}>Bank Account</StyledTableCell>
                        <StyledTableCell sx={{ fontWeight: 700, borderBottom: '2px solid', borderColor: 'divider' }}>Created At</StyledTableCell>
                        <StyledTableCell sx={{ fontWeight: 700, borderBottom: '2px solid', borderColor: 'divider' }}>Updated At</StyledTableCell>
                        <StyledTableCell sx={{ fontWeight: 700, borderBottom: '2px solid', borderColor: 'divider' }} align="center">Actions</StyledTableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {usersByRole.length > 0 ? (
                        usersByRole.map((user) => (
                          <StyledTableRow key={user.id}>
                            <StyledTableCell>{user.name}</StyledTableCell>
                            <StyledTableCell>{user.email}</StyledTableCell>
                            <StyledTableCell>{user.full_name}</StyledTableCell>
                            <StyledTableCell>{user.number}</StyledTableCell>
                            <StyledTableCell>{user.bank_account_number}</StyledTableCell>
                            <StyledTableCell>{format(new Date(user.createdAt), 'dd MMM yyyy')}</StyledTableCell>
                            <StyledTableCell>{format(new Date(user.updatedAt), 'dd MMM yyyy')}</StyledTableCell>
                            <StyledTableCell align="center">
                              <StyledIconButton
                                size="small"
                                onClick={() => handleEditUser(user.id)}
                                color="error"
                                sx={{
                                  '&:hover': {
                                    backgroundColor: 'primary.light',
                                  }
                                }}
                              >
                                <EditIcon sx={{ fontSize: 18 }} />
                              </StyledIconButton>
                              <StyledIconButton
                                size="small"
                                onClick={() => handleDeleteUser(user.id)}
                                color="error"
                                sx={{
                                  '&:hover': {
                                    backgroundColor: 'error.light',
                                  }
                                }}
                              >
                                <DeleteIcon sx={{ fontSize: 18 }} />
                              </StyledIconButton>
                            </StyledTableCell>
                          </StyledTableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={9} sx={{ py: 4 }}>
                            <Box sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              color: 'text.secondary'
                            }}>
                              <InfoOutlinedIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
                              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                                No users found for selected role
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </StyledTableContainer>
              )}
              <CreateUserDialog
                open={createUserOpen}
                onClose={() => setCreateUserOpen(false)}
                onSuccess={() => fetchUsersByRole(selectedUserRole)} />
              <EditUserDialog
                open={editUserDialogOpen}
                user={userToEdit}
                onClose={() => { setEditUserDialogOpen(false); setUserToEdit(null); } }
                onSave={handleSaveEditedUser} />
            </StyledCard>
          )}
        </Box>

        {/* get agents */}

        {activeSection === 'agents' && (
  <StyledCard sx={{ p: 3, mb: 4 }}>
    <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#e53935' }}>
      Support Agents
    </Typography>

    {agentsError && (
      <Alert severity="error" sx={{ mb: 2 }}>
        {agentsError}
      </Alert>
    )}

    {loadingAgents ? (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    ) : (
      <StyledTableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>Name</StyledTableCell>
              <StyledTableCell>Email</StyledTableCell>
              <StyledTableCell>Phone Number</StyledTableCell>
              <StyledTableCell>Region</StyledTableCell>
              <StyledTableCell>Created At</StyledTableCell>
              <StyledTableCell>Updated At</StyledTableCell>
              <StyledTableCell>Actions</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {agents.map((agent) => (
              <StyledTableRow key={agent.id}>
                <StyledTableCell>{agent.name}</StyledTableCell>
                <StyledTableCell>{agent.email}</StyledTableCell>
                <StyledTableCell>{agent.number}</StyledTableCell>
                <StyledTableCell>
                  {regions.find((r) => r.id === agent.region_id)?.name || 'Unassigned'}
                </StyledTableCell>
                <StyledTableCell>{format(new Date(agent.createdAt), 'dd MMM yyyy')}</StyledTableCell>
                <StyledTableCell>{format(new Date(agent.updatedAt), 'dd MMM yyyy')}</StyledTableCell>
                <StyledTableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleOpenUpdateRegion(agent)}
                    sx={{
                      borderColor: '#e53935',
                      color: '#e53935',
                      '&:hover': { backgroundColor: '#fdecea' }
                    }}
                  >
                    Update Region
                  </Button>
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </StyledTableContainer>
    )}

    {/* Update Agent Region Dialog */}
    <Dialog open={updateAgentDialogOpen} onClose={() => setUpdateAgentDialogOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle>Update Agent Region</DialogTitle>
      <DialogContent>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel id="select-region-label">Select Region</InputLabel>
          <Select
            labelId="select-region-label"
            value={selectedAgentRegion ?? ''}
            label="Select Region"
            onChange={(e) => setSelectedAgentRegion(Number(e.target.value))}
          >
            {regions.map((region) => (
              <MenuItem key={region.id} value={region.id}>
                {region.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setUpdateAgentDialogOpen(false)}>Cancel</Button>
        <Button onClick={handleUpdateAgentRegion} variant="contained" color="error">
          Update
        </Button>
      </DialogActions>
    </Dialog>
  </StyledCard>
)}











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
                  onChange={handleChange} />
                <LocalizationProvider dateAdapter={AdapterDateFns}>


                  <MuiDatePicker
                    label="Start Date"
                    value={formData.date_debut ? new Date(formData.date_debut) : null}
                    onChange={(date) => {
                      const formatted = date ? format(date, 'yyyy-MM-dd') : '';
                      setFormData((prev) => ({ ...prev, date_debut: formatted }));
                    } }
                    renderInput={(params) => <TextField {...params} required />} />
                </LocalizationProvider>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button type="submit" variant="contained">{editingId ? 'Update' : 'Add'}</Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Attachment Preview Dialog for reclamations in selected region */}
        <AttachmentPreviewDialog
          open={attachmentPreviewOpen}
          onClose={() => setAttachmentPreviewOpen(false)}
          src={attachmentPreviewSrc || ''}
          isImage={attachmentPreviewIsImage} />

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle id="delete-user-dialog-title" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HighlightOff color="error" sx={{ fontSize: 32 }} />
            Confirm Deletion
          </DialogTitle>
          <DialogContent id="delete-user-dialog-desc">
            <Typography variant="body1" sx={{ fontWeight: 500, color: theme.palette.mode === 'dark' ? '#ff8a80' : '#b71c1c', mb: 1 }}>
              Are you sure you want to delete user <b>{deleteTargetUser?.name}</b>?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This action cannot be undone. The user and all their data will be permanently removed.
            </Typography>
            <TextField
              autoFocus
              fullWidth
              label="Type DELETE to confirm"
              variant="outlined"
              value={deleteConfirmText}
              onChange={e => setDeleteConfirmText(e.target.value)}
              sx={{ mb: 1 }}
              inputProps={{ style: { textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 } }} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)} color="inherit" variant="outlined" sx={{ fontWeight: 700, borderRadius: 2 }}>Cancel</Button>
            <Button
              onClick={confirmDeleteUser}
              color="error"
              variant="contained"
              sx={{ fontWeight: 700, borderRadius: 2, boxShadow: 2 }}
              disabled={deleteConfirmText.trim().toUpperCase() !== 'DELETE'}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog for Regions */}
        {/* Create Region Dialog */}
        <Dialog
          open={isRegionDialogOpen}
          onClose={() => {
            setIsRegionDialogOpen(false);
            setRegionError(null);
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Create New Region</DialogTitle>
          <DialogContent>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Box display="flex" flexDirection="column" gap={2} mt={1}>
                <TextField
                  name="name"
                  label="Region Name"
                  variant="outlined"
                  fullWidth
                  value={regionFormData.name}
                  onChange={(e) => setRegionFormData(prev => ({
                    ...prev,
                    name: e.target.value
                  }))}
                  required
                />
                <MuiDatePicker
                  label="Start Date"
                  value={regionFormData.date_debut ? new Date(regionFormData.date_debut) : null}
                  onChange={(date) => {
                    setRegionFormData(prev => ({
                      ...prev,
                      date_debut: date ? format(date, 'yyyy-MM-dd') : ''
                    }));
                  }}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
                {regionError && (
                  <Alert severity="error">
                    {regionError}
                  </Alert>
                )}
              </Box>
            </LocalizationProvider>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setIsRegionDialogOpen(false);
                setRegionError(null);
              }}
              color="secondary"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateRegion}
              color="error"
              variant="contained"
              disabled={loadingRegions || !regionFormData.name || !regionFormData.date_debut  }
            >
              {loadingRegions ? <CircularProgress size={24} /> : 'Create Region'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Create Region Dialog */}
        <Dialog
          open={isRegionDialogOpen}
          onClose={() => {
            setIsRegionDialogOpen(false);
            setRegionError(null);
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Create New Region</DialogTitle>
          <DialogContent>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Box display="flex" flexDirection="column" gap={2} mt={1}>
                <TextField
                  name="name"
                  label="Region Name"
                  variant="outlined"
                  fullWidth
                  value={regionFormData.name}
                  onChange={(e) => setRegionFormData(prev => ({
                    ...prev,
                    name: e.target.value
                  }))}
                  required
                />
                <MuiDatePicker
                  label="Start Date"
                  value={regionFormData.date_debut ? new Date(regionFormData.date_debut) : null}
                  onChange={(date) => {
                    setRegionFormData(prev => ({
                      ...prev,
                      date_debut: date ? format(date, 'yyyy-MM-dd') : ''
                    }));
                  }}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
                {regionError && (
                  <Alert severity="error">
                    {regionError}
                  </Alert>
                )}
              </Box>
            </LocalizationProvider>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setIsRegionDialogOpen(false);
                setRegionError(null);
              }}
              color="secondary"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateRegion}
              color="error"
              variant="contained"
              disabled={loadingRegions || !regionFormData.name || !regionFormData.date_debut }
            >
              {loadingRegions ? <CircularProgress size={24} /> : 'Create Region'}
            </Button> 
          </DialogActions>
        </Dialog>

        <Dialog open={deleteRegionDialogOpen} onClose={() => setDeleteRegionDialogOpen(false)}>
          <DialogTitle id="delete-region-dialog-title" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HighlightOff color="error" sx={{ fontSize: 32 }} />
            Confirm Deletion
          </DialogTitle>
          <DialogContent id="delete-region-dialog-desc">
            <Typography variant="body1" sx={{ fontWeight: 500, color: theme.palette.mode === 'dark' ? '#ff8a80' : '#b71c1c', mb: 1 }}>
              Are you sure you want to delete region <b>{deleteTargetRegion?.name}</b>?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This action cannot be undone. The region and all its data will be permanently removed.
            </Typography>
            <TextField
              autoFocus
              fullWidth
              label="Type DELETE to confirm"
              variant="outlined"
              value={deleteRegionConfirmText}
              onChange={e => setDeleteRegionConfirmText(e.target.value)}
              sx={{ mb: 1 }}
              inputProps={{ style: { textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 } }} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteRegionDialogOpen(false)} color="inherit" variant="outlined" sx={{ fontWeight: 700, borderRadius: 2 }}>Cancel</Button>
            <Button
              onClick={confirmDeleteRegion}
              color="error"
              variant="contained"
              sx={{ fontWeight: 700, borderRadius: 2, boxShadow: 2 }}
              disabled={deleteRegionConfirmText.trim().toUpperCase() !== 'DELETE'}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>

    </Box><FooterHTML /> </>
    
  );
};

export default AdminDashboard; 