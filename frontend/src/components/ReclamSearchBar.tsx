import React, { useState } from 'react';
import { Box, Paper, Typography, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Chip, OutlinedInput, InputAdornment, IconButton, useTheme } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import api from '../config/api';
import { Reclam } from './types';
import { Card, CardContent, CardActions } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { red, amber, green } from '@mui/material/colors';

const ReclamSearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Reclam[]>([]);
  const [error, setError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Reclam | null>(null);
  const statusColor: Record<string, 'error'|'warning'|'success'|'info'|'default'|'primary'> = { completed:'success', pending:'warning', active:'info', inactive:'default' };
  // Custom hex colors for priority chips
  const priorityColorHex: Record<string, string> = { high: red[600], medium: amber[600], low: green[600] };

  const handleSearch = async () => {
    if (!query.trim()) return;
    try {
      const res = await api.get<{ reclams: Reclam[] }>('/api/reclams/search', { params: { query: query.trim() } });
      setResults(res.data.reclams);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Search error');
      setResults([]);
    }
  };

  // Delete result from backend
  const handleDeleteResult = async (id: number) => {
    try {
      await api.delete(`/api/reclams/${id}`);
      setResults((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const confirmDelete = () => {
    if (deleteTarget) { handleDeleteResult(deleteTarget.id); setDeleteTarget(null); }
    setConfirmOpen(false);
  };

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Styled search bar */}
      <Box sx={{ position: 'relative', width: '100%', maxWidth: 360, mx: 'auto' }}>
        <Paper
          component="form"
          onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
          sx={{ display: 'flex', alignItems: 'center', borderRadius: 2, boxShadow: 1, bgcolor: 'background.paper' }}
        >
          <OutlinedInput
            size="small"
            fullWidth
            placeholder="Search reclamations..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            startAdornment={
              <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>
            }
            endAdornment={
              query && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => { setQuery(''); setResults([]); }}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              )
            }
            sx={{ borderRadius: 2 }}
            inputProps={{ 'aria-label': 'search reclamations' }}
          />
        </Paper>
      </Box>
      {error && (
        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}
      {results.length > 0 && (
        <Paper sx={{ position: 'absolute', top: 40, left: 0, right: 0, zIndex: 10, maxHeight: 300, overflow: 'auto', p: 1 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 1 }}>
            {results.map((r) => (
              <Card key={r.id} variant="outlined">
                <CardContent sx={{ cursor: 'pointer' }} onClick={() => { window.location.hash = `#reclam-${r.id}`; setResults([]); }}>
                  <Typography variant="subtitle1">{r.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{r.description}</Typography>
                  <Box sx={{ mt:1, display:'flex', gap:1 }}>
                    <Chip label={r.status} size="small" color={statusColor[r.status] || 'default'} />
                    <Chip
                      label={r.priority}
                      size="small"
                      sx={{
                        backgroundColor: priorityColorHex[r.priority] || undefined,
                        color: '#fff',
                      }}
                    />
                  </Box>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => { window.location.hash = `#reclam-${r.id}`; setResults([]); }}>View</Button>
                  <IconButton size="small" color="error" onClick={() => { setDeleteTarget(r); setConfirmOpen(true); }}>
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            ))}
          </Box>
        </Paper>
      )}
      {/* Confirm Deletion Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete "{deleteTarget?.title}"?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button color="error" onClick={confirmDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReclamSearchBar;
