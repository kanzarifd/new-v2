import React, { useState, useEffect, useCallback  } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/context/AuthContext';
import { useThemeContext } from '../contexts/ThemeContext';
import {
  Box,
  Typography,
  Button,
  useTheme,
  useMediaQuery,
  Paper,
  CircularProgress,
  Alert,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Card,
  CardContent,
  Chip,
  Grid,
  AppBar,
  Toolbar,
  Tooltip,
  Avatar 
} from '@mui/material';
import {
  Logout as LogoutIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import axios from 'axios';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { format } from 'date-fns';
import AgentHeader from './AgentHeader';
import AgentRecentReclamsTable from '../components/AgentRecentReclamsTable';
import FooterHTML from '../components/FooterHTML';

interface Reclamation {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'rejected' | 'closed';
  priority: 'high' | 'medium' | 'low';
  regionId: number;
  region: {
    name: string;
  };
  userId: number;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;
}

const AgentDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { mode } = useThemeContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reclams, setReclams] = useState<Reclamation[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium'
  });

  const [drawerOpen, setDrawerOpen] = useState(false);

  interface StatusColorConfig {
    background: string;
    hover: string;
    text: string;
    border?: string;
  }
  
  interface StatusColors {
    [key: string]: StatusColorConfig;
  }
  
  const getStatusColors = (theme: any): StatusColors => ({
    pending: {
      background: '#2563EB',
      hover: '#1D4ED8',
      border: '#1D4ED8',
      text: '#1D4ED8'
    },
    in_progress: {
      background: '#D97706',
      hover: '#B45309',
      text: '#D97706',
      border: '#B45309'
    },
    rejected: {
      background: '#FF0000',
      hover: '#FF3737',
      text: '#FF0000',
      border: '#FF3737'
    },
    closed: {
      background: '#000000',
      hover: '#1E1E1E',
      text: '#000000',
      border: '#1E1E1E'
    }
  });
  
  const statusColors = getStatusColors(theme);

  const getStatusColor = (status: string) => {
    const colors = statusColors[status as keyof typeof statusColors];
    return {
      background: colors.background,
      hover: colors.hover,
      text: colors.text
    };
  };

  const fetchReclams = useCallback(async () => {
    try {
      setLoading(true);
  
      if (!user || !user.id) throw new Error('User not authenticated');
  
      const response = await axios.get(`http://localhost:8000/api/reclams/by-user-region/${user.id}`);
      setReclams(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching:', error);
      setError('Failed to fetch reclamations.');
    } finally {
      setLoading(false);
    }
  }, [user]);
  

  useEffect(() => {
    console.log('Component mounted, fetching reclamations...');
    fetchReclams(); 
  }, [fetchReclams]);

  const getStatusCount = (status: string) => {
    return reclams.filter(r => r.status === status).length;
  };

  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [rejectionReasonValue, setRejectionReasonValue] = useState('');
  const [pendingRejectionId, setPendingRejectionId] = useState<number|null>(null);

  const handleStatusChange = async (id: number, status: string) => {
    if (status === 'rejected') {
      setPendingRejectionId(id);
      setRejectionReasonValue('');
      setRejectionDialogOpen(true);
      return;
    }
    try {
      await axios.put(`http://localhost:8000/api/reclams/status/${id}`, { status });
      await fetchReclams();
    } catch (err) {
      setError('Failed to update status');
    }
  };

  const handleRejectionDialogSubmit = async () => {
    if (!rejectionReasonValue.trim()) {
      setError('Rejection reason is required.');
      return;
    }
    try {
      await axios.put(`http://localhost:8000/api/reclams/status/${pendingRejectionId}`, { status: 'rejected', rejectionReason: rejectionReasonValue });
      setRejectionDialogOpen(false);
      setPendingRejectionId(null);
      setRejectionReasonValue('');
      await fetchReclams();
    } catch (err) {
      setError('Failed to update status');
      setRejectionDialogOpen(false);
    }
  };

  const handleRejectionDialogClose = () => {
    setRejectionDialogOpen(false);
    setPendingRejectionId(null);
    setRejectionReasonValue('');
  };

  const handleEdit = async (reclam: Reclamation) => {
    try {
      setFormData({
        title: reclam.title,
        description: reclam.description,
        status: reclam.status,
        priority: reclam.priority
      });
      setOpen(true);
    } catch (err) {
      setError('Failed to edit reclamation');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this reclamation?')) return;

    try {
      await axios.delete(`http://localhost:8000/api/reclams/${id}`);
      await fetchReclams();
    } catch (err) {
      setError('Failed to delete reclamation');
    }
  };




  useEffect(() => {
    const fetchRegion = async () => {
      if (user?.region_id) {
        try {
          const res = await axios.get(`http://localhost:8000/api/regions/${user.region_id}`);
          setRegionName(res.data.name);
        } catch (err) {
          console.error('Error fetching region:', err);
        }
      }
    };
    fetchRegion();

    
  }, [user?.region_id]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      if (!user) {
        throw new Error('User not authenticated');
      }
      await axios.post('http://localhost:8000/api/reclams', {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        userId: user.id
      });
      setOpen(false);
      setFormData({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium'
      });
      await fetchReclams();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create reclamation');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Wrap the handleEdit function so it matches the expected signature for AgentRecentReclamsTable
  const handleEditTable = (reclam: any) => {
    handleEdit(reclam);
  };

  const [regionName, setRegionName] = useState<string | null>(null);

  useEffect(() => {
    console.log('User data:', user);
    console.log('Region ID:', user?.region_id);
    const fetchRegionName = async () => {
      if (!user?.region_id) return;
      try {
        console.log('Fetching region:', user.region_id);
        const res = await axios.get(`http://localhost:8000/api/regions/${user.region_id}`);
        console.log('Region response:', res.data);
        setRegionName(res.data.name);
      } catch (err) {
        console.error('Error fetching region name:', err);
      }
    };

    fetchRegionName();
  }, [user?.region_id]);

  // Convert Reclamation[] to Reclam[] for AgentRecentReclamsTable
  const reclamsForTable = reclams.map((r: any) => ({
    ...r,
    date_debut: r.date_debut || r.createdAt || '',
    date_fin: r.date_fin || r.updatedAt || '',
    priority: r.priority || 'medium',
    status: r.status || 'pending',
    region: r.region ? { id: r.region.id || 0, name: r.region.name || '' } : undefined,
    user: r.user ? { id: r.user.id || 0, name: r.user.name || '' } : undefined,
    attachment: r.attachment,
    currentAgency: r.currentAgency || ''
  }));

  return (
    <><DndProvider backend={HTML5Backend}>
      <AgentHeader
        toggleDrawer={() => setDrawerOpen(!drawerOpen)}
        onLogout={logout}
        isMobile={isMobile} 
        
        regionName={regionName || undefined}
/>
      <Box sx={{
        p: 3,
        bgcolor: mode === 'dark' ? 'background.default' : 'background.default',
        minHeight: '100vh',
        color: mode === 'dark' ? 'text.primary' : 'text.primary',
        transition: 'background 0.3s, color 0.3s',
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Agent Dashboard</Typography>

        </Box>

        {/* Statistics */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={3}>
            <Paper
              sx={{
                p: 2,
                textAlign: 'center',
                borderRadius: 2,
                background: 'linear-gradient(135deg, #b71c1c 0%, #e53935 100%)',
                color: '#fff',
                boxShadow: theme.shadows[4],
                transition: 'all 0.3s cubic-bezier(.4,2,.6,1)',
                cursor: 'default',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-4px) scale(1.03)',
                  boxShadow: theme.shadows[8],
                  background: 'linear-gradient(135deg, #a31515 0%, #e53935 100%)',
                  transition: 'all 0.25s cubic-bezier(.4,2,.6,1)',
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.08) 0%, transparent 70%)',
                  zIndex: 0,
                  pointerEvents: 'none',
                  transition: 'opacity 0.3s',
                },
              }}
            >
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: '#111',
                    fontWeight: 'bold',
                  }}
                >
                  {getStatusCount('pending')}
                </Typography>
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: '#111',
                    fontWeight: 'bold',
                  }}
                >
                  Pending
                </Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Paper
              sx={{
                p: 2,
                textAlign: 'center',
                borderRadius: 2,
                background: 'linear-gradient(135deg, #b71c1c 0%, #e53935 100%)',
                color: '#fff',
                boxShadow: theme.shadows[4],
                transition: 'all 0.3s cubic-bezier(.4,2,.6,1)',
                cursor: 'default',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-4px) scale(1.03)',
                  boxShadow: theme.shadows[8],
                  background: 'linear-gradient(135deg, #a31515 0%, #e53935 100%)',
                  transition: 'all 0.25s cubic-bezier(.4,2,.6,1)',
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.08) 0%, transparent 70%)',
                  zIndex: 0,
                  pointerEvents: 'none',
                  transition: 'opacity 0.3s',
                },
              }}
            >
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: '#111',
                    fontWeight: 'bold',
                  }}
                >
                  {getStatusCount('in_progress')}
                </Typography>
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: '#111',
                    fontWeight: 'bold',
                  }}
                >
                  In Progress
                </Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Paper
              sx={{
                p: 2,
                textAlign: 'center',
                borderRadius: 2,
                background: 'linear-gradient(135deg, #b71c1c 0%, #e53935 100%)',
                color: '#fff',
                boxShadow: theme.shadows[4],
                transition: 'all 0.3s cubic-bezier(.4,2,.6,1)',
                cursor: 'default',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-4px) scale(1.03)',
                  boxShadow: theme.shadows[8],
                  background: 'linear-gradient(135deg, #a31515 0%, #e53935 100%)',
                  transition: 'all 0.25s cubic-bezier(.4,2,.6,1)',
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.08) 0%, transparent 70%)',
                  zIndex: 0,
                  pointerEvents: 'none',
                  transition: 'opacity 0.3s',
                },
              }}
            >
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: '#111',
                    fontWeight: 'bold',
                  }}
                >
                  {getStatusCount('rejected')}
                </Typography>
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: '#111',
                    fontWeight: 'bold',
                  }}
                >
                  Rejected
                </Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Paper
              sx={{
                p: 2,
                textAlign: 'center',
                borderRadius: 2,
                background: 'linear-gradient(135deg, #b71c1c 0%, #e53935 100%)',
                color: '#fff',
                boxShadow: theme.shadows[4],
                transition: 'all 0.3s cubic-bezier(.4,2,.6,1)',
                cursor: 'default',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-4px) scale(1.03)',
                  boxShadow: theme.shadows[8],
                  background: 'linear-gradient(135deg, #a31515 0%, #e53935 100%)',
                  transition: 'all 0.25s cubic-bezier(.4,2,.6,1)',
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.08) 0%, transparent 70%)',
                  zIndex: 0,
                  pointerEvents: 'none',
                  transition: 'opacity 0.3s',
                },
              }}
            >
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: '#111',
                    fontWeight: 'bold',
                  }}
                >
                  {getStatusCount('closed')}
                </Typography>
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: '#111',
                    fontWeight: 'bold',
                  }}
                >
                  Closed
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Kanban Board */}
        <Grid container spacing={2}>
          <StatusColumn
            status="pending"
            reclams={reclams}
            onStatusChange={handleStatusChange}
            onEdit={handleEdit}
            onDelete={handleDelete} />
          <StatusColumn
            status="in_progress"
            reclams={reclams}
            onStatusChange={handleStatusChange}
            onEdit={handleEdit}
            onDelete={handleDelete} />
          <StatusColumn
            status="rejected"
            reclams={reclams}
            onStatusChange={handleStatusChange}
            onEdit={handleEdit}
            onDelete={handleDelete} />
          <StatusColumn
            status="closed"
            reclams={reclams}
            onStatusChange={handleStatusChange}
            onEdit={handleEdit}
            onDelete={handleDelete} />
        </Grid>

        {/* Recent Reclamations Table */}
        <Box sx={{ mt: 4 }}>
          <AgentRecentReclamsTable reclams={reclamsForTable} onEdit={handleEditTable} />
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error}
          </Alert>
        )}

        {/* Loading Indicator */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Dialog */}
        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Reclamation</DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <TextField
                required
                fullWidth
                label="Title"
                name="title"
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                sx={{ mb: 2 }} />
              <TextField
                required
                fullWidth
                multiline
                rows={4}
                label="Description"
                name="description"
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  select
                  fullWidth
                  label="Status"
                  name="status"
                  value={formData.status}
                  onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                  <MenuItem value="closed">Closed</MenuItem>
                </TextField>
                <TextField
                  select
                  fullWidth
                  label="Priority"
                  name="priority"
                  value={formData.priority}
                  onChange={e => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                >
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </TextField>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" variant="contained">Update</Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Rejection Reason Dialog */}
        <Dialog open={rejectionDialogOpen} onClose={handleRejectionDialogClose} maxWidth="xs" fullWidth>
          <DialogTitle sx={{
            background: theme.palette.mode === 'dark'
              ? 'linear-gradient(90deg,#ff616f 0%,#ff1744 100%)'
              : 'linear-gradient(90deg,#ff616f 0%,#ff1744 100%)',
            color: '#fff',
            fontWeight: 800,
            letterSpacing: 1,
            textAlign: 'center',
            textTransform: 'uppercase',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            Provide Rejection Reason
          </DialogTitle>
          <DialogContent sx={{
            p: 3,
            background: theme.palette.mode === 'dark' ? '#232526' : '#fff',
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12
          }}>
            <Typography sx={{ mb: 2, fontWeight: 600, color: theme.palette.mode === 'dark' ? '#fff' : '#d32f2f' }}>
              Please enter the reason for rejecting this reclamation. This will be visible to the user.
            </Typography>
            <TextField
              autoFocus
              multiline
              minRows={2}
              maxRows={5}
              fullWidth
              variant="outlined"
              label="Rejection Reason"
              value={rejectionReasonValue}
              onChange={e => setRejectionReasonValue(e.target.value)}
              sx={{
                background: theme.palette.mode === 'dark' ? '#2d2d2d' : '#fff0f1',
                borderRadius: 2,
                mb: 1,
                '& .MuiOutlinedInput-root': {
                  fontWeight: 600,
                },
              }}
              inputProps={{ maxLength: 250 }} />
          </DialogContent>
          <DialogActions sx={{
            background: theme.palette.mode === 'dark' ? '#232526' : '#fff',
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12,
            pb: 2
          }}>
            <Button onClick={handleRejectionDialogClose} variant="outlined" color="inherit">
              Cancel
            </Button>
            <Button onClick={handleRejectionDialogSubmit} variant="contained" color="error" sx={{ fontWeight: 700 }}>
              Submit
            </Button>
          </DialogActions>
        </Dialog>


      </Box>
    </DndProvider><FooterHTML /></>
    
  ); 
};

// Status Column Component
const StatusColumn = ({ status, reclams, onStatusChange, onEdit, onDelete }: {
  status: string;
  reclams: Reclamation[];
  onStatusChange: (id: number, status: string) => void;
  onEdit: (reclam: Reclamation) => void;
  onDelete: (id: number) => void;
}) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'reclam',
    drop: (item: { id: number }) => onStatusChange(item.id, status),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const statusCount = reclams.filter(r => r.status === status).length;
  const statusLabel = status.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');

  const statusColors: Record<string, string> = {
    pending: '#2563EB',
    in_progress: '#D97706',
    rejected: '#FF0000',
    closed: '#000000'
  };

  return (
    <Grid item xs={12} sm={6} md={3}>
      <Paper
        ref={drop}
        sx={{
          p: 2,
          minHeight: '500px',
          backgroundColor: isOver ? 'action.hover' : 'background.paper',
          borderLeft: `4px solid ${statusColors[status]}`
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            {statusLabel}
          </Typography>
          <Chip label={statusCount} size="small" />
        </Box>

        {reclams
          .filter(r => r.status === status)
          .map(reclam => (
            <ReclamCard 
              key={reclam.id}
              reclam={reclam}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
      </Paper>
    </Grid>
  );
};

// Reclamation Card Component
const ReclamCard = ({ reclam, onEdit, onDelete }: {
  reclam: Reclamation;
  onEdit: (reclam: Reclamation) => void;
  onDelete: (id: number) => void;
}) => {
  const theme = useTheme();

  type PaletteColor = 'error' | 'warning' | 'success' | 'primary' | 'secondary' | 'info' | 'default';

  interface ColorConfig {
    [key: string]: PaletteColor;
  }

  const priorityColors: ColorConfig = {
    high: 'error',
    medium: 'warning',
    low: 'success'
  };

  const regionColors: ColorConfig = {
    'Casablanca': 'primary',
    'Rabat': 'secondary',
    'Marrakech': 'info',
    'Fes': 'warning',
    'Agadir': 'success'
  };

  const userColors: ColorConfig = {
    'agent': 'primary',
    'admin': 'secondary',
    'client': 'info'
  };

  const getRegionColor = (regionName: string): PaletteColor => {
    return regionColors[regionName as keyof typeof regionColors] || 'default';
  };

  const getUserColor = (userRole: string): PaletteColor => {
    return userColors[userRole as keyof typeof userColors] || 'default';
  };

  const getPriorityColor = (priority: string): PaletteColor => {
    return priorityColors[priority as keyof typeof priorityColors] || 'default';
  };

  const getBackgroundColor = (color: PaletteColor) => {
    switch (color) {
      case 'error':
        return theme.palette.error.light;
      case 'warning':
        return theme.palette.warning.light;
      case 'success':
        return theme.palette.success.light;
      case 'primary':
        return theme.palette.primary.light;
      case 'secondary':
        return theme.palette.secondary.light;
      case 'info':
        return theme.palette.info.light;
      default:
        return theme.palette.grey[200];
    }
  };

  const getTextColor = (color: PaletteColor) => {
    switch (color) {
      case 'error':
        return theme.palette.error.contrastText;
      case 'warning':
        return theme.palette.warning.contrastText;
      case 'success':
        return theme.palette.success.contrastText;
      case 'primary':
        return theme.palette.primary.contrastText;
      case 'secondary':
        return theme.palette.secondary.contrastText;
      case 'info':
        return theme.palette.info.contrastText;
      default:
        return theme.palette.text.primary;
    }
  };

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'reclam',
    item: { id: reclam.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <Card
      ref={drag}
      sx={{
        mb: 2,
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
        transition: 'all 0.2s ease-in-out',
        borderRadius: 3,
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, #232526 0%, #414345 100%)'
          : 'linear-gradient(135deg, #fff 0%, #f3f6fa 100%)',
        boxShadow: theme.palette.mode === 'dark' ? 8 : 2,
        '&:hover': {
          transform: 'translateY(-2px) scale(1.01)',
          boxShadow: theme.palette.mode === 'dark' ? 16 : 4,
        },
        border: theme.palette.mode === 'dark' ? '1px solid #333' : '1px solid #ececec',
      }}
      elevation={0}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography variant="subtitle1" fontWeight="bold">
            {reclam.title}
          </Typography>
          <Chip 
            label={reclam.priority} 
            size="small" 
            color={getPriorityColor(reclam.priority)}
            sx={{
              backgroundColor: getBackgroundColor(getPriorityColor(reclam.priority)),
              color: getTextColor(getPriorityColor(reclam.priority))
            }}
          />
        </Box>
        
        <Typography variant="body2" sx={{ mt: 1, mb: 2 }}>
          {reclam.description}
        </Typography>

        {/* Professional Rejection Reason Display */}
        {reclam.status === 'rejected' && reclam.rejectionReason && (
          <Box
            sx={{
              mt: 2,
              mb: 1,
              p: 2,
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(90deg,#2d2d2d 0%,#ff1744 100%)'
                : 'linear-gradient(90deg,#fff0f1 0%,#ff1744 100%)',
              borderRadius: 2,
              border: theme.palette.mode === 'dark' ? '1px solid #ff616f' : '1px solid #ff1744',
              boxShadow: theme.palette.mode === 'dark' ? 8 : 2,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 2,
            }}
          >
            <Box sx={{ mt: 0.5 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ display: 'block' }}>
                <circle cx="12" cy="12" r="12" fill="#ff1744" fillOpacity="0.12" />
                <path d="M12 7v5" stroke="#ff1744" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="16" r="1" fill="#ff1744" />
              </svg>
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ color: '#ff1744', fontWeight: 700, letterSpacing: 1, mb: 0.5 }}>
                Rejection Reason
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.mode === 'dark' ? '#fff' : '#d32f2f', fontWeight: 500 }}>
                {reclam.rejectionReason}
              </Typography>
            </Box>
          </Box>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mr: 1 }}>
              Region:
            </Typography>
            <Chip
              label={
                !reclam.region || !reclam.region.name || reclam.region.name === 'Unknown Region'
                  ? 'Region Not Found'
                  : reclam.region.name
              }
              size="small"
              color={getRegionColor(reclam.region?.name || '')}
              sx={{
                backgroundColor: theme.palette.mode === 'dark'
                  ? `${getBackgroundColor(getRegionColor(reclam.region?.name || ''))} !important`
                  : getBackgroundColor(getRegionColor(reclam.region?.name || '')),
                color: '#111',
                fontWeight: 600,
                border: theme.palette.mode === 'dark' ? '1px solid #333' : '1px solid #ececec',
              }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Created: {format(new Date(reclam.createdAt), 'PP')}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.mode === 'dark' ? '#3949ab' : '#e3f2fd', color: theme.palette.mode === 'dark' ? '#fff' : '#3949ab', fontWeight: 700 }}>
            {reclam.user && reclam.user.email
              ? reclam.user.email[0].toUpperCase()
              : (reclam.user && reclam.user.name ? reclam.user.name[0].toUpperCase() : 'U')}
          </Avatar>
          <Box sx={{ ml: 1 }}>
            <Chip
              label={reclam.user && reclam.user.name && reclam.user.name !== 'Unknown User' ? reclam.user.name : (reclam.user?.name || 'User Not Found')}
              size="small"
              color={getUserColor(reclam.user?.role || '')}
              sx={{
                backgroundColor: theme.palette.mode === 'dark'
                  ? `${getBackgroundColor(getUserColor(reclam.user?.role || ''))} !important`
                  : getBackgroundColor(getUserColor(reclam.user?.role || '')),
                color: '#111',
                fontWeight: 600,
                border: theme.palette.mode === 'dark' ? '1px solid #333' : '1px solid #ececec',
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>
              {reclam.user && reclam.user.email && reclam.user.name !== 'Unknown User' ? reclam.user.email : ''}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
    
  );
}; 


export default AgentDashboard;