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

interface Reclamation {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
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
    resolved: {
      background: '#059669',
      hover: '#047857',
      text: '#059669',
      border: '#047857'
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
      console.log('Fetching reclamations...');
      const response = await axios.get('http://localhost:8000/api/reclams');
      console.log('Reclamations fetched:', response.data);
      setReclams(response.data);
      setError(null);
    } catch (error: unknown) {
      console.error('Error in fetchReclams:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);
      } else {
        console.error('Unknown error:', error);
      }
      setError('Failed to fetch reclamations. Please check the console for details.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log('Component mounted, fetching reclamations...');
    fetchReclams();
  }, [fetchReclams]);

  const getStatusCount = (status: string) => {
    return reclams.filter(r => r.status === status).length;
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await axios.put(`http://localhost:8000/api/reclams/status/${id}`, { status });
      await fetchReclams();
    } catch (err) {
      setError('Failed to update status');
    }
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

  return (
    <DndProvider backend={HTML5Backend}>
      <AgentHeader
        toggleDrawer={() => setDrawerOpen(!drawerOpen)}
        onLogout={logout}
        isMobile={isMobile}
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
                  {getStatusCount('resolved')}
                </Typography>
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: '#111',
                    fontWeight: 'bold',
                  }}
                >
                  Resolved
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
            onDelete={handleDelete}
          />
          <StatusColumn 
            status="in_progress" 
            reclams={reclams} 
            onStatusChange={handleStatusChange}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          <StatusColumn 
            status="resolved" 
            reclams={reclams} 
            onStatusChange={handleStatusChange}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          <StatusColumn 
            status="closed" 
            reclams={reclams} 
            onStatusChange={handleStatusChange}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Grid>

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
                sx={{ mb: 2 }}
              />
              <TextField
                required
                fullWidth
                multiline
                rows={4}
                label="Description"
                name="description"
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                sx={{ mb: 2 }}
              />
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
                  <MenuItem value="resolved">Resolved</MenuItem>
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
      </Box>
    </DndProvider>
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
    resolved: '#059669',
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