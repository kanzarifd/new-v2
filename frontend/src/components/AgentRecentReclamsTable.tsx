import React, { useState } from 'react';
import { Paper, Typography, Box, TableContainer, Table as MuiTable, TableHead, TableBody, TableRow, TableCell, Checkbox, TextField, Button, Chip, IconButton, TablePagination, MenuItem } from '@mui/material';
import { format } from 'date-fns';
import { CheckCircle, Error as ErrorIcon } from '@mui/icons-material';
import AttachmentPreviewDialog from './AttachmentPreviewDialog';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Region {
  name: string;
}

interface Reclamation {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'rejected' | 'closed' | 'resolved';
  priority: 'high' | 'medium' | 'low';
  regionId: number;
  region: Region;
  userId: number;
  user: User;
  currentAgency?: string;
  attachment?: string;
  date_debut: string;
}

const AgentRecentReclamsTable: React.FC<{
  reclams: Reclamation[];
  onEdit: (reclam: Reclamation) => void;
}> = ({ reclams, onEdit }) => {
  const [selected, setSelected] = useState<number[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string>('');
  const [previewIsImage, setPreviewIsImage] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editData, setEditData] = useState<Reclamation | null>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterRegion, setFilterRegion] = useState('');

  // Get unique regions for dropdown
  const uniqueRegions = Array.from(new Set(reclams.map(r => r.region?.name).filter(Boolean)));

  const filteredReclams = reclams.filter((reclam) => {
    const searchText = search.toLowerCase();
    const statusMatch = filterStatus ? reclam.status === filterStatus : true;
    const priorityMatch = filterPriority ? reclam.priority === filterPriority : true;
    const regionMatch = filterRegion ? (reclam.region?.name || '').toLowerCase().includes(filterRegion.toLowerCase()) : true;
    return (
      (reclam.title.toLowerCase().includes(searchText) ||
        (reclam.user?.name && reclam.user.name.toLowerCase().includes(searchText)) ||
        (reclam.currentAgency && reclam.currentAgency.toLowerCase().includes(searchText))) &&
      statusMatch && priorityMatch && regionMatch
    );
  });

  const paginatedReclams = filteredReclams.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  function handleSelectAll(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.checked) {
      setSelected(paginatedReclams.map((r) => r.id));
    } else {
      setSelected([]);
    }
  }

  function handleSelect(id: number) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  }

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
  }

  function handleChangePage(_: unknown, newPage: number) {
    setPage(newPage);
  }

  function handleChangeRowsPerPage(e: React.ChangeEvent<HTMLInputElement>) {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  }

  function handlePreviewAttachment(reclam: Reclamation) {
    const src = reclam.attachment ? `http://localhost:8000/uploads/${reclam.attachment}` : '';
    setPreviewSrc(src);
    setPreviewIsImage(/\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(src.split('?')[0]));
    setPreviewOpen(true);
  }

  return (
    <Paper sx={{ mt: 4, p: 2 }}>
      <Box display="flex" justifyContent="center" alignItems="center" p={2}>
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
      </Box>
      <Box display="flex" gap={2} mb={2} flexWrap="wrap" alignItems="center">
        <TextField
          label="Search"
          size="small"
          value={search}
          onChange={handleSearch}
          sx={{ minWidth: 180 }}
        />
        <TextField
          select
          label="Status"
          size="small"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          sx={{ minWidth: 120 }}
          SelectProps={{ native: false }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="pending">pending</MenuItem>
          <MenuItem value="in_progress">in_progress</MenuItem>
          <MenuItem value="rejected">rejected</MenuItem>
          <MenuItem value="closed">closed</MenuItem>
          <MenuItem value="resolved">resolved</MenuItem>
        </TextField>
        <TextField
          select
          label="Priority"
          size="small"
          value={filterPriority}
          onChange={e => setFilterPriority(e.target.value)}
          sx={{ minWidth: 120 }}
          SelectProps={{ native: false }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="high">high</MenuItem>
          <MenuItem value="medium">medium</MenuItem>
          <MenuItem value="low">low</MenuItem>
        </TextField>
       
      </Box>
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
                  <span style={{ color: '#1976d2', cursor: 'pointer' }}>{reclam.title}</span>
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
      <AttachmentPreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        src={previewSrc || ''}
        isImage={previewIsImage}
        alt={previewSrc ? previewSrc.split('/').pop() : 'Attachment'}
      />
    </Paper>
  );
};

export default AgentRecentReclamsTable;
