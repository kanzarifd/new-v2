import React, { useState, useEffect } from 'react';
import api from '../config/api';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { CheckCircle as CheckIcon, Pending as PendingIcon, Close as CloseIcon } from '@mui/icons-material';
import { Paper, Typography, Box, Grid, CircularProgress, Alert, useTheme, TableContainer, Table as MuiTable, TableHead, TableBody, TableRow, TableCell, Avatar, IconButton, TableSortLabel, Chip, ChipProps, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, Button, FormControl, InputLabel } from '@mui/material';
import { styled } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import { format } from 'date-fns';
import { ChartData } from '../types/dashboard';
import { Reclam } from './types';
import AttachmentPreviewDialog from './AttachmentPreviewDialog';

// ATB Red Gradient Theme
const COLORS = ['#e53935', '#ef5350', '#f44336', '#b71c1c'];
const LOADING_HEIGHT = 300;

interface AdminDashboardStatsProps {
  reclamations: Reclam[];
  onEdit: (reclam: Reclam) => void;
}

const AdminDashboardStats = ({ reclamations, onEdit }: AdminDashboardStatsProps) => {
  const theme = useTheme();
  const [dataBar, setDataBar] = useState<ChartData[]>([]);
  const [dataPie, setDataPie] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Define the fields we can sort by
  type SortableField = 'id' | 'date_debut' | 'description' | 'priority' | 'status' | 'regionId' | 'userId';

  // Initialize sortBy state with proper type
  const [sortBy, setSortBy] = useState<SortableField>('id');

  // Initialize order state
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  // Initialize currentPage and rowsPerPage state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Helper function to get the value for sorting
  const getSortValue = (reclam: Reclam, field: SortableField) => {
    switch (field) {
      case 'id':
        return reclam.id;
      case 'date_debut':
        return reclam.date_debut;
      case 'description':
        return reclam.description;
      case 'priority':
        return reclam.priority;
      case 'status':
        return reclam.status;
      case 'regionId':
        return reclam.regionId ?? reclam.region?.id ?? 0;
      case 'userId':
        return reclam.userId ?? reclam.user?.id ?? 0;
      default:
        return reclam.id;
    }
  };

  useEffect(() => {
    try {
      // Calculate statistics
      const statusCounts = reclamations.reduce((acc: Record<string, number>, reclam: Reclam) => {
        acc[reclam.status] = (acc[reclam.status] || 0) + 1;
        return acc;
      }, {});

      const priorityCounts = reclamations.reduce((acc: Record<string, number>, reclam: Reclam) => {
        acc[reclam.priority] = (acc[reclam.priority] || 0) + 1;
        return acc;
      }, {});

      // Prepare data for charts
      const barData = [
        { name: 'Pending', value: statusCounts.pending || 0 },
        { name: 'In Progress', value: statusCounts.in_progress || 0 },
        { name: 'Resolved', value: statusCounts.resolved || 0 },
        { name: 'Closed', value: statusCounts.closed || 0 },
      ];

      const pieData = [
        { name: 'High', value: priorityCounts.high || 0 },
        { name: 'Medium', value: priorityCounts.medium || 0 },
        { name: 'Low', value: priorityCounts.low || 0 },
      ];

      setDataBar(barData);
      setDataPie(pieData);
      setLoading(false);
    } catch (err) {
      setError('Failed to calculate statistics');
      console.error('Error calculating statistics:', err);
      setLoading(false);
    }
  }, [reclamations]);

  const Card = ({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) => (
    <Paper
      sx={{
        p: 2,
        textAlign: 'center',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4],
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
        {icon}
      </Box>
      <Typography variant="subtitle1" color="text.secondary">
        {title}
      </Typography>
      <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold' }}>
        {value}
      </Typography>
    </Paper>
  );

  // Styled rows/cells
  const StyledTableRow = styled(TableRow)(({ theme }) => ({ '&:hover': { backgroundColor: theme.palette.action.hover } }));
  const StyledTableCell = styled(TableCell)(({ theme }) => ({ padding: theme.spacing(1) }));

  const statusColorMap: Record<string, ChipProps['color']> = {
    pending: 'default',
    in_progress: 'primary',
    resolved: 'success',
    closed: 'error',
  };

  const priorityColorMap: Record<string, ChipProps['color']> = {
    high: 'error',
    medium: 'warning',
    low: 'success',
  };

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editData, setEditData] = useState<Reclam | null>(null);

  // Attachment preview dialog state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [previewIsImage, setPreviewIsImage] = useState(true);

  const handlePreviewAttachment = (reclam: Reclam) => {
    setPreviewSrc(`http://localhost:8000/uploads/${reclam.attachment}`);
    setPreviewIsImage(!!reclam.attachment && /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(reclam.attachment));
    setPreviewOpen(true);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100px' }}>
              <CircularProgress />
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100px' }}>
              <CircularProgress />
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100px' }}>
              <CircularProgress />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <Box sx={{
            background: 'linear-gradient(135deg, #e53935 0%, #111 100%)',
            color: '#fff',
            borderRadius: 3,
            boxShadow: '0 4px 18px 0 rgba(220,20,60,0.12)',
            border: '1.5px solid #e53935',
            transition: 'transform 0.2s, box-shadow 0.2s',
            p: 2,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            '&:hover': {
              transform: 'scale(1.04)',
              boxShadow: '0 8px 24px 0 rgba(220,20,60,0.20)',
              background: 'linear-gradient(135deg, #111 0%, #e53935 100%)',
            },
          }}>
            <CheckIcon sx={{ fontSize: 40, color: '#e53935', bgcolor: '#111', borderRadius: '50%', p: 1.2, boxShadow: '0 2px 8px 0 rgba(220,20,60,0.10)' }} />
            <Typography variant="subtitle1" sx={{ mt: 1, fontWeight: 700 }}>Total Reclamations</Typography>
            <Typography variant="h5" sx={{ fontWeight: 900 }}>{reclamations?.length || 0}</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Box sx={{
            background: 'linear-gradient(135deg, #b71c1c 0%, #e53935 100%)',
            color: '#fff',
            borderRadius: 3,
            boxShadow: '0 4px 18px 0 rgba(220,20,60,0.12)',
            border: '1.5px solid #b71c1c',
            transition: 'transform 0.2s, box-shadow 0.2s',
            p: 2,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            '&:hover': {
              transform: 'scale(1.04)',
              boxShadow: '0 8px 24px 0 rgba(220,20,60,0.20)',
              background: 'linear-gradient(135deg, #e53935 0%, #b71c1c 100%)',
            },
          }}>
            <PendingIcon sx={{ fontSize: 40, color: '#fff', bgcolor: '#e53935', borderRadius: '50%', p: 1.2, boxShadow: '0 2px 8px 0 rgba(220,20,60,0.10)' }} />
            <Typography variant="subtitle1" sx={{ mt: 1, fontWeight: 700 }}>In Progress</Typography>
            <Typography variant="h5" sx={{ fontWeight: 900 }}>{dataBar.find((d) => d.name === 'In Progress')?.value || 0}</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Box sx={{
            background: 'linear-gradient(135deg, #111 0%, #e53935 100%)',
            color: '#fff',
            borderRadius: 3,
            boxShadow: '0 4px 18px 0 rgba(220,20,60,0.12)',
            border: '1.5px solid #111',
            transition: 'transform 0.2s, box-shadow 0.2s',
            p: 2,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            '&:hover': {
              transform: 'scale(1.04)',
              boxShadow: '0 8px 24px 0 rgba(220,20,60,0.20)',
              background: 'linear-gradient(135deg, #e53935 0%, #111 100%)',
            },
          }}>
            <CheckIcon sx={{ fontSize: 40, color: '#b71c1c', bgcolor: '#fff', borderRadius: '50%', p: 1.2, boxShadow: '0 2px 8px 0 rgba(220,20,60,0.10)' }} />
            <Typography variant="subtitle1" sx={{ mt: 1, fontWeight: 700 }}>Resolved</Typography>
            <Typography variant="h5" sx={{ fontWeight: 900 }}>{dataBar.find((d) => d.name === 'Resolved')?.value || 0}</Typography>
          </Box>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Reclamation Statistics
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dataBar} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <XAxis dataKey="name" stroke={theme.palette.error.main} />
                <YAxis stroke={theme.palette.error.main} />
                <Tooltip contentStyle={{ background: '#fff', color: '#e53935', border: '1px solid #e53935', borderRadius: 8 }} labelStyle={{ color: '#e53935', fontWeight: 700 }} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} fill={COLORS[0]}>
                  {dataBar.map((entry, index) => (
                    <Cell key={`cell-bar-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Reclamation Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dataPie}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#e53935"
                  dataKey="value"
                  stroke="#111"
                  strokeWidth={2}
                >
                  {dataPie.map((entry, index) => (
                    <Cell key={`cell-pie-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#111', color: '#e53935', border: '1px solid #e53935', borderRadius: 8 }} labelStyle={{ color: '#e53935', fontWeight: 700 }} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ mt: 4, p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Recent Reclamations
        </Typography>
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <MuiTable>
            <TableHead>
              <TableRow>
                {[
                  { id: 'title', label: 'Title' },
                  { id: 'status', label: 'Status' },
                  { id: 'priority', label: 'Priority' },
                  { id: 'date_debut', label: 'Start Date' },
                  { id: 'userId', label: 'User' },
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
                            setSortBy(column.id as any);
                            setOrder('asc');
                          }
                        }}
                      >
                        {column.label}
                      </TableSortLabel>
                    ) : (
                      column.label
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {reclamations
                .slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
                .sort((a, b) => {
                  if (sortBy === 'date_debut') {
                    return order === 'asc'
                      ? new Date(a.date_debut).getTime() - new Date(b.date_debut).getTime()
                      : new Date(b.date_debut).getTime() - new Date(a.date_debut).getTime();
                  }
                  return 0;
                })
                .map((r) => {
                  const isImage = r.attachment && /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(r.attachment);
                  return (
                    <StyledTableRow id={`reclam-${r.id}`} key={r.id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                      <StyledTableCell>{r.title}</StyledTableCell>
                      <StyledTableCell>
                        <Chip label={r.status} size="small" color={statusColorMap[r.status]} />
                      </StyledTableCell>
                      <StyledTableCell>
                        <Chip label={r.priority} size="small" color={priorityColorMap[r.priority]} />
                      </StyledTableCell>
                      <StyledTableCell>
                        {format(new Date(r.date_debut), 'dd MMM yyyy')}
                      </StyledTableCell>
                      <StyledTableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar sx={{ width: 24, height: 24, fontSize: 14 }}>
                            {r.user?.name?.charAt(0)}
                          </Avatar>
                          {r.user?.name}
                        </Box>
                      </StyledTableCell>
                      <StyledTableCell>
                        {r.attachment ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 100 }}>
                            <Button size="small" variant="outlined" color="primary" onClick={() => handlePreviewAttachment(r)}>
                              View
                            </Button>
                            {isImage && (
                              <img
                                src={`http://localhost:8000/uploads/${r.attachment}`}
                                alt="attachment"
                                style={{ maxWidth: 40, maxHeight: 40, borderRadius: 6, border: '1px solid #eee', marginLeft: 8 }}
                                onError={e => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none'; }}
                              />
                            )}
                          </Box>
                        ) : (
                          <span style={{ color: '#aaa' }}>No Attachment</span>
                        )}
                      </StyledTableCell>
                      <StyledTableCell>
                        <IconButton size="small" onClick={() => { setEditData(r); setEditDialogOpen(true); }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </StyledTableCell>
                    </StyledTableRow>
                  );
                })}
            </TableBody>
          </MuiTable>
        </TableContainer>
      </Paper>

      {/* Edit Reclamation Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Reclamation</DialogTitle>
        <DialogContent dividers>
          <TextField margin="dense" label="Title" fullWidth value={editData?.title || ''} disabled />
          <TextField margin="dense" label="Description" fullWidth multiline rows={3} value={editData?.description || ''} disabled />
          <FormControl margin="dense" fullWidth>
            <InputLabel>Status</InputLabel>
            <Select label="Status" value={editData?.status || ''} onChange={(e) => editData && setEditData({ ...editData, status: e.target.value as any })}>
              {['pending','in_progress','resolved','closed'].map((s) => (<MenuItem key={s} value={s}>{s}</MenuItem>))}
            </Select>
          </FormControl>
          <FormControl margin="dense" fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select label="Priority" value={editData?.priority || ''} onChange={(e) => editData && setEditData({ ...editData, priority: e.target.value as any })}>
              {['high','medium','low'].map((p) => (<MenuItem key={p} value={p}>{p}</MenuItem>))}
            </Select>
          </FormControl>
          <Typography variant="body2" sx={{ mt:2 }}>User: {editData?.user?.name || 'N/A'}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={async () => { if (editData) { await api.put(`/api/reclams/${editData.id}`, editData); setEditDialogOpen(false); window.location.reload(); } }} color="primary">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Attachment Preview Dialog */}
      <AttachmentPreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        src={previewSrc || ''}
        isImage={previewIsImage}
      />
    </Box>
  );
};

export default AdminDashboardStats;