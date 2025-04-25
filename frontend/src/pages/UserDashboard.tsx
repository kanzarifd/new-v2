import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../components/context/AuthContext';
import FakeChatbot from '../components/FakeChatbot';
import ChatbotPanel from '../components/ChatbotPanel'; // Adjust path
import AttachmentPreviewDialog from '../components/AttachmentPreviewDialog';

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
import AdminHeader from './AdminHeader';
import UserHeader from './UserHeader';

interface Reclam {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  priority: 'high' | 'medium' | 'low';
  date_debut: string;
  date_fin: string;
  region_id: number;
  user_id: number;
  currentAgency?: string;
  attachment?: string;
}

interface Region {
  id: number;
  name: string;
}

interface FormValues {
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  priority: 'high' | 'medium' | 'low';
  date_debut: string;
  date_fin: string;
  regionId: number | null;
  userId: number | null;
  attachment: File | null;
  currentAgency?: string;
}

const UserDashboard = () => {
  const theme = useTheme();

  const [chatOpen, setChatOpen] = useState(false);

  const { user, token, logout } = useAuth();
  const [reclams, setReclams] = useState<Reclam[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingReclam, setEditingReclam] = useState<Reclam | null>(null);
  const [formData, setFormData] = useState<FormValues>({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    date_debut: '',
    date_fin: '',
    regionId: null,
    userId: user?.id ? Number(user.id) : null,
    attachment: null,
    currentAgency: '',
  });

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [previewIsImage, setPreviewIsImage] = useState(false);
  const [previewAlt, setPreviewAlt] = useState<string>('');

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

  const handleOpen = (reclam?: Reclam) => {
    setOpen(true);
    setEditingReclam(reclam || null);
    if (reclam) {
      setFormData({
        title: reclam.title,
        description: reclam.description,
        status: reclam.status as FormValues['status'],
        priority: reclam.priority as FormValues['priority'],
        date_debut: reclam.date_debut,
        date_fin: reclam.date_fin,
        regionId: reclam.region_id || null,
        userId: reclam.user_id || null,
        attachment: null,
        currentAgency: reclam.currentAgency || '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        date_debut: '',
        date_fin: '',
        regionId: null,
        userId: user?.id ? Number(user.id) : null,
        attachment: null,
        currentAgency: '',
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
      regionId: null,
      userId: user?.id ? Number(user.id) : null,
      attachment: null,
      currentAgency: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Ensure all required fields have values
      if (!formData.title || !formData.description || !formData.status || !formData.priority || !formData.regionId || !formData.userId) {
        setError('Please fill in all required fields');
        return;
      }

      // Format dates if they exist
      let formattedData;
      if (editingReclam) {
        // For updates, use camelCase keys to match backend expectations
        formattedData = {
          title: formData.title,
          description: formData.description,
          status: formData.status,
          priority: formData.priority,
          date_debut: formData.date_debut,
          date_fin: formData.date_fin,
          regionId: formData.regionId,
          userId: formData.userId,
          currentAgency: formData.currentAgency,
        };
      } else {
        // For creation, use snake_case keys
        formattedData = {
          title: formData.title,
          description: formData.description,
          status: formData.status,
          priority: formData.priority,
          date_debut: formData.date_debut,
          date_fin: formData.date_fin,
          region_id: formData.regionId,
          user_id: formData.userId,
          currentAgency: formData.currentAgency,
        };
      }

      const formDataToSubmit = new FormData();
      Object.entries(formattedData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          formDataToSubmit.append(key, String(value));
        }
      });

      // Only append attachment if a file is selected
      if (formData.attachment) {
        formDataToSubmit.append('attachment', formData.attachment);
      }

      const url = editingReclam 
        ? `http://localhost:8000/api/reclams/${editingReclam.id}`
        : 'http://localhost:8000/api/reclams';

      const method = editingReclam ? 'PUT' : 'POST';
      
      try {
        await axios({
          url,
          method,
          headers: { 
            Authorization: `Bearer ${token}`
            // 'Content-Type' is set automatically by axios for FormData
          },
          data: formDataToSubmit
        });

        setSuccessMessage(editingReclam ? 'Reclamation updated successfully' : 'Reclamation created successfully');
        setOpen(false);
        fetchReclams();
        
      } catch (err) {
        setError('Failed to save reclamation');
        if (axios.isAxiosError(err) && err.response) {
          console.error('Error saving reclamation:', err.response.data);
        } else {
          console.error('Error saving reclamation:', err);
        }
      } finally {
        setLoading(false);
      }
    } catch (err) {
      setError('Failed to save reclamation');
      console.error('Error saving reclamation:', err);
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

  const handlePreviewAttachment = (reclam: Reclam) => {
    if (!reclam.attachment) return;
    const src = `http://localhost:8000/uploads/${reclam.attachment}`;
    setPreviewSrc(src);
    setPreviewAlt(reclam.title);
    // Check if file is an image by extension
    const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(reclam.attachment);
    setPreviewIsImage(isImage);
    setPreviewOpen(true);
  };

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 600);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleDrawer = () => {
    setIsMobile(!isMobile);
  };

  const handleLogout = () => {
    logout();
  };

  const openChat = () => {
    setChatOpen(true);
  };

  return (
    <><Box sx={{ p: 3, bgcolor: theme.palette.background.default, color: theme.palette.text.primary, minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">User Dashboard</Typography>
        <Button
          variant="outlined"
          color="error"
          startIcon={<Logout />}
          onClick={() => {
            logout();
          } }
        >
          Logout
        </Button>
      </Box>
        
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <UserHeader
          toggleDrawer={toggleDrawer}
          onLogout={handleLogout}
          onOpenChat={openChat} isMobile={false}      />

      </Box>

      {/* Summary Cards */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        {[
          { label: 'Total Requests', value: reclams.length },
          { label: 'Pending', value: reclams.filter(r => r.status === 'pending').length },
          { label: 'Resolved', value: reclams.filter(r => r.status === 'resolved').length }
        ].map(item => (
          <Paper
            key={item.label}
            sx={{
              flex: 1,
              p: 2,
              background: 'linear-gradient(90deg, #e53935 0%, #b71c1c 100%)',
              color: '#fff',
              borderRadius: 2,
              boxShadow: 3,
              cursor: 'pointer',
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-4px) scale(1.03)',
                boxShadow: 6,
                background: 'linear-gradient(90deg, #b71c1c 0%, #e53935 100%)',
                filter: 'brightness(1.08)',
              },
            }}
          >
            <Typography variant="subtitle2" sx={{ color: '#fff', mb: 1 }}>{item.label}</Typography>
            <Typography variant="h4" sx={{ color: '#fff', fontWeight: 'bold' }}>{item.value}</Typography>
          </Paper>
        ))}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Button
        variant="contained"
        onClick={() => handleOpen()}
        startIcon={<AddIcon />}
        sx={{
          mb: 2,
          background: 'linear-gradient(90deg, #e53935 0%, #b71c1c 100%)',
          color: '#fff',
          fontWeight: 'bold',
          '&:hover': { background: 'linear-gradient(90deg, #b71c1c 0%, #e53935 100%)' }
        }}
      >
        + New Request
      </Button>

      <Paper sx={{ p: 2, mb: 3, bgcolor: theme.palette.background.paper, color: theme.palette.text.primary }}>
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
                <TableCell>Region</TableCell>
                <TableCell>Attachment</TableCell>
                <TableCell>Current Agency</TableCell>
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
                      }} />
                  </TableCell>
                  <TableCell>{reclam.priority}</TableCell>
                  <TableCell>{reclam.date_debut}</TableCell>
                  <TableCell>
                    {regions.find((r) => r.id === reclam.region_id)?.name || 'Unknown Region'}
                  </TableCell>
                  <TableCell>
                    {reclam.attachment ? (
                      <Button size="small" variant="outlined" color="primary" onClick={() => handlePreviewAttachment(reclam)}>
                        View
                      </Button>
                    ) : (
                      <span>No Attachment</span>
                    )}
                  </TableCell>
                  <TableCell>{reclam.currentAgency || '-'}</TableCell>
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

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, bgcolor: theme.palette.background.paper, boxShadow: 5 } }}
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle
            sx={{
              bgcolor: 'linear-gradient(90deg, #e53935 0%, #b71c1c 100%)',
              color: '#fff',
              textAlign: 'center',
              fontWeight: 'bold',
            }}
          >
            {editingReclam ? 'Edit Reclamation' : 'Add New Reclamation'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                error={!formData.title} />

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required />

              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as FormValues['status'] })}
                  label="Status"
                  required
                  disabled={!editingReclam}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as FormValues['priority'] })}
                  label="Priority"
                  required
                >
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Region</InputLabel>
                <Select
                  value={formData.regionId || ''}
                  onChange={(e) => setFormData({ ...formData, regionId: Number(e.target.value) || null })}
                  label="Region"
                  required
                >
                  <MenuItem value="">Select a region</MenuItem>
                  {regions.map((region) => (
                    <MenuItem key={region.id} value={region.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Chip
                          label={region.name}
                          size="small"
                          sx={{
                            backgroundColor: theme.palette.mode === 'dark'
                              ? '#e0e0e0'
                              : '#f3f6fa',
                            color: '#111',
                            fontWeight: 600,
                            border: theme.palette.mode === 'dark' ? '1px solid #333' : '1px solid #ececec',
                            mr: 1
                          }}
                        />
                      </Box>
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
                  } }
                  renderInput={(params) => (
                    <TextField {...params} fullWidth required />
                  )} />

                  
                  <TextField
                label="Current Agency"
                value={formData.currentAgency}
                onChange={e => setFormData(prev => ({ ...prev, currentAgency: e.target.value }))}
                fullWidth
                sx={{ mt: 2 }}
              />
              </LocalizationProvider>

              {/* Attachment Upload */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Attachment (optional)
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  sx={{
                    borderRadius: 2,
                    borderColor: theme.palette.mode === 'dark' ? '#333' : '#bdbdbd',
                    color: theme.palette.mode === 'dark' ? '#fff' : '#111',
                    fontWeight: 500,
                    textTransform: 'none',
                    background: theme.palette.mode === 'dark' ? '#232526' : '#fafafa',
                    '&:hover': {
                      background: theme.palette.mode === 'dark' ? '#414345' : '#e0e0e0',
                    },
                  }}
                  
                >
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setFormData((prev) => ({ ...prev, attachment: file }));
                      }
                    }}
                  />
                  
                </Button>
                {formData.attachment && (
                  <Typography variant="caption" sx={{ ml: 2 }}>
                    {formData.attachment.name}
                  </Typography>
                )}
              </Box>

              
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, justifyContent: 'flex-end' }}>
            <Button
              onClick={handleClose}
              sx={{ color: '#e53935', fontWeight: 'bold' }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                ml: 1,
                background: 'linear-gradient(90deg, #e53935 0%, #b71c1c 100%)',
                color: '#fff',
                fontWeight: 'bold',
                '&:hover': { background: 'linear-gradient(90deg, #b71c1c 0%, #e53935 100%)' }
              }}
            >
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

      <AttachmentPreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        src={previewSrc || ''}
        alt={previewAlt}
        isImage={previewIsImage}
      />
    </Box>
   

      <ChatbotPanel isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    
    
    </>
  );
};

export default UserDashboard;