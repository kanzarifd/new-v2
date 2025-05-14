import React, { useState, useEffect } from 'react';
import api from '../config/api';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { CheckCircle as CheckIcon, Pending as PendingIcon, Close as CloseIcon } from '@mui/icons-material';
import { Paper, Typography, Box, Grid, CircularProgress, Alert, useTheme, TableContainer, Table as MuiTable, TableHead, TableBody, TableRow, TableCell, Avatar, IconButton, TableSortLabel, Chip, ChipProps, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, Button, FormControl, InputLabel, Checkbox, TablePagination } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import { styled } from '@mui/material/styles';
import { Search, CheckCircle, Error as ErrorIcon, Edit } from '@mui/icons-material';
import { format } from 'date-fns';
import { ChartData } from '../types/dashboard';
import { Reclam } from './types';
import AttachmentPreviewDialog from './AttachmentPreviewDialog';
import ReclamationDetailsDialog from './ReclamationDetailsDialog';

// ATB Red Gradient Theme
const COLORS = ['#e53935', '#ef5350', '#f44336', '#b71c1c'];
const LOADING_HEIGHT = 300;

interface AdminDashboardStatsProps {
  reclamations: Reclam[];
  onEdit: (reclam: Reclam) => void;
}

const AdminDashboardStats = ({ reclamations, onEdit }: AdminDashboardStatsProps) => {
  const tableRef = React.useRef<HTMLDivElement>(null);
  const handlePrintTable = () => {
    if (!tableRef.current) return;
    const printContents = tableRef.current.innerHTML;
    const printWindow = window.open('', '', 'height=700,width=1000');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Reclamations Table</title>');
      printWindow.document.write('<style>body{font-family:sans-serif;margin:0;padding:24px;} table{border-collapse:collapse;width:100%;} th,td{border:1px solid #ddd;padding:8px;} th{background:#e53935;color:#fff;} </style>');
      printWindow.document.write('</head><body >');
      printWindow.document.write(printContents);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  const theme = useTheme();
  const [dataBar, setDataBar] = useState<ChartData[]>([]);
  const [dataPie, setDataPie] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Define the fields we can sort by
  type SortableField = 'id' | 'date_debut' | 'description' | 'priority' | 'status' | 'regionId' | 'userId' | 'currentAgency';

  // Initialize sortBy state with proper type
  const [sortBy, setSortBy] = useState<SortableField>('id');

  // Initialize order state
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  // Initialize currentPage state (rowsPerPage is now declared only once)
  const [currentPage, setCurrentPage] = useState(1);

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
      case 'currentAgency':
        return reclam.currentAgency;
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

  const [selected, setSelected] = useState<number[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // State for details dialog
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedReclam, setSelectedReclam] = useState<Reclam | null>(null);

  const handleSelect = (id: number) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelected(reclamations.map(r => r.id));
    } else {
      setSelected([]);
    }
  };
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value.toLowerCase());
    setPage(0); // Reset to first page on search
  };
  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const filteredReclams = reclamations.filter(row => {
    // Only search in visible, stringifiable fields for better UX
    return (
      (row.title && row.title.toLowerCase().includes(search)) ||
      (row.status && row.status.toLowerCase().includes(search)) ||
      (row.priority && row.priority.toLowerCase().includes(search)) ||
      (row.currentAgency && row.currentAgency.toLowerCase().includes(search)) ||
      (row.user?.name && row.user.name.toLowerCase().includes(search)) ||
      (row.userId && row.userId.toString().toLowerCase().includes(search)) ||
      (row.attachment && row.attachment.toLowerCase().includes(search))
    );
  });
  const paginatedReclams = filteredReclams.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
            <Typography variant="subtitle1" sx={{ mt: 1, fontWeight: 700 }}>Closed</Typography>
            <Typography variant="h5" sx={{ fontWeight: 900 }}>{dataBar.find((d) => d.name === 'Closed')?.value || 0}</Typography>
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
                <Tooltip contentStyle={{ background: '#fff', color: '#e53935', border: '1px solid #e53935', borderRadius: 8 }} labelStyle={{ color: '#e53935', fontWeight: 700 }} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ mt: 4, p: 2 }} ref={tableRef}>
      <Typography
      variant="h6"
      sx={{
        fontWeight: 'bold',
        color: '#b71c1c',
        letterSpacing: 1,
        fontSize: '1.5rem',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s, color 0.2s',
        '&:hover': {
          color: '#e53935',
          transform: 'scale(1.04)',
          boxShadow: 3,
        },
        borderRadius: 2,
        px: 3,
        py: 1,
        background: 'rgba(229, 57, 53, 0.07)',
      }}
      align="center"
    >
        Recent Reclamations
      </Typography>
        <TextField
          variant="standard"
          placeholder="Search..."
          value={search}
          onChange={handleSearch}
          InputProps={{ startAdornment: <Search /> }}
        />
        <TableContainer>
          <MuiTable>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selected.length === paginatedReclams.length && paginatedReclams.length > 0}
                    indeterminate={selected.length > 0 && selected.length < paginatedReclams.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>ID ⬇</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Current Agency</TableCell>
                <TableCell>Attachment</TableCell>
                <TableCell>Status</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedReclams.map((reclam) => (
                <TableRow key={reclam.id} hover>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selected.includes(reclam.id)}
                      onChange={() => handleSelect(reclam.id)}
                    />
                  </TableCell>
                  <TableCell>{reclam.id}</TableCell>
                  <TableCell>{format(new Date(reclam.date_debut), 'dd MMM yyyy')}</TableCell>
                  <TableCell>
                    <span
                      style={{ color: '#1976d2', cursor: 'pointer', textDecoration: 'underline' }}
                      onClick={() => {
                        setSelectedReclam(reclam);
                        setDetailsDialogOpen(true);
                      }}
                    >
                      {reclam.title}
                    </span>
                  </TableCell>
                  <TableCell>{reclam.user?.name || reclam.userId}</TableCell>
                  <TableCell>{reclam.currentAgency || '-'}</TableCell>
                  <TableCell>
                    {reclam.attachment ? (
                      <Button size="small" variant="outlined" color="primary" onClick={() => handlePreviewAttachment(reclam)}>
                        View
                      </Button>
                    ) : (
                      <span style={{ color: '#aaa' }}>No Attachment</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={reclam.status}
                      color={reclam.status === 'resolved' ? 'success' : reclam.status === 'pending' ? 'warning' : 'error'}
                      icon={reclam.status === 'resolved' ? <CheckCircle /> : reclam.status === 'pending' ? <ErrorIcon /> : <ErrorIcon />}
                      variant="filled"
                      style={{ color: '#fff' }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => { setEditData(reclam); setEditDialogOpen(true); }}>
                      <Edit fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </MuiTable>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredReclams.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[5, 10, 20]}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Reclamation Details Dialog */}
      <ReclamationDetailsDialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        reclam={selectedReclam}
      />

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
          <Button onClick={async () => {
  if (!editData) return;
  // Validate required fields
  const requiredFields = [
    'title', 'description', 'status', 'priority', 'date_debut'
  ];
  for (const field of requiredFields) {
    if (!editData[field as keyof typeof editData]) {
      alert(`Missing required field: ${field}`);
      return;
    }
  }
  const regionId = editData.regionId || editData.region?.id;
  const userId = editData.userId || editData.user?.id;
  if (!regionId) {
    alert('Missing required field: regionId');
    return;
  }
  if (!userId) {
    alert('Missing required field: userId');
    return;
  }
  try {
    await api.put(`/api/reclams/${editData.id}`, {
      title: editData.title,
      description: editData.description,
      status: editData.status,
      priority: editData.priority,
      date_debut: editData.date_debut,
      date_fin: editData.date_fin || undefined,
      regionId,
      userId,
      currentAgency: editData.currentAgency || undefined,
      attachment: editData.attachment || undefined,
    });
    setEditDialogOpen(false);
    window.location.reload();
  } catch (error: any) {
    if (error.response && error.response.data) {
      alert('Error: ' + (error.response.data.error || JSON.stringify(error.response.data)));
    } else {
      alert('Unknown error occurred');
    }
    console.error('PUT error:', error);
  }
}} color="primary">Save</Button>
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