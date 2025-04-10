import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Typography,
  Button,
  useTheme,
  useMediaQuery,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
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

interface Reclamation {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  updatedAt: string;
  userId: number;
  user: {
    name: string;
  };
}

const AgentDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
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

  const theme = useTheme();

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
      setError(null);
      const response = await axios.get('http://localhost:8000/api/reclams');
      setReclams(response.data);
    } catch (err) {
      setError('Failed to load reclamations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
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
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <AppBar position="static" sx={{ mb: 3 }}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Agent Dashboard
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {user?.name}
              </Typography>
              <IconButton onClick={handleLogout} color="inherit">
                <LogoutIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Statistics */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={3}>
            <Paper
              sx={{
                p: 2,
                textAlign: 'center',
                borderRadius: 2,
                transition: 'all 0.3s ease',
                cursor: 'default',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[6]
                }
              }}
              elevation={3}
            >
              <Typography
                variant="h6"
                sx={{
                  color: getStatusColor('pending').text,
                  fontWeight: 'bold'
                }}
              >
                {getStatusCount('pending')}
              </Typography>
              <Typography
                variant="subtitle2"
                sx={{
                  color: getStatusColor('pending').text,
                  fontWeight: 500
                }}
              >
                Pending
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Paper
              sx={{
                p: 2,
                textAlign: 'center',
                borderRadius: 2,
                transition: 'all 0.3s ease',
                cursor: 'default',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[6]
                }
              }}
              elevation={3}
            >
              <Typography
                variant="h6"
                sx={{
                  color: getStatusColor('in_progress').text,
                  fontWeight: 'bold'
                }}
              >
                {getStatusCount('in_progress')}
              </Typography>
              <Typography
                variant="subtitle2"
                sx={{
                  color: getStatusColor('in_progress').text,
                  fontWeight: 500
                }}
              >
                In Progress
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Paper
              sx={{
                p: 2,
                textAlign: 'center',
                borderRadius: 2,
                transition: 'all 0.3s ease',
                cursor: 'default',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[6]
                }
              }}
              elevation={3}
            >
              <Typography
                variant="h6"
                sx={{
                  color: getStatusColor('resolved').text,
                  fontWeight: 'bold'
                }}
              >
                {getStatusCount('resolved')}
              </Typography>
              <Typography
                variant="subtitle2"
                sx={{
                  color: getStatusColor('resolved').text,
                  fontWeight: 500
                }}
              >
                Resolved
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Paper
              sx={{
                p: 2,
                textAlign: 'center',
                borderRadius: 2,
                transition: 'all 0.3s ease',
                cursor: 'default',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[6]
                }
              }}
              elevation={3}
            >
              <Typography
                variant="h6"
                sx={{
                  color: getStatusColor('closed').text,
                  fontWeight: 'bold'
                }}
              >
                {getStatusCount('closed')}
              </Typography>
              <Typography
                variant="subtitle2"
                sx={{
                  color: getStatusColor('closed').text,
                  fontWeight: 500
                }}
              >
                Closed
              </Typography>
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
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'reclam',
    item: { id: reclam.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const priorityColors: Record<string, string> = {
    high: 'error',
    medium: 'warning',
    low: 'success'
  };

  return (
    <Card
      ref={drag}
      sx={{
        mb: 2,
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3
        }
      }}
      elevation={1}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography variant="subtitle1" fontWeight="bold">
            {reclam.title}
          </Typography>
          <Chip 
            label={reclam.priority} 
            size="small" 
            color={priorityColors[reclam.priority] as any}
          />
        </Box>
        
        <Typography variant="body2" sx={{ mt: 1, mb: 2 }}>
          {reclam.description}
        </Typography>
        
        <Typography variant="caption" color="text.secondary">
          Created: {format(new Date(reclam.createdAt), 'PP')}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Avatar sx={{ width: 32, height: 32 }} />
          <Box>
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => onEdit(reclam)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton size="small" onClick={() => onDelete(reclam.id)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AgentDashboard;