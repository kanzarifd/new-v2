import React, { useState } from 'react';
import { Box, TextField, IconButton, List, ListItem, ListItemText, Paper, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import api from '../config/api';
import { Reclam } from './types';

const ReclamSearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Reclam[]>([]);
  const [error, setError] = useState('');

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

  return (
    <Box sx={{ position: 'relative' }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <TextField
          size="small"
          variant="outlined"
          placeholder="Search reclamations"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          sx={{ width: 300 }}
        />
        <IconButton onClick={handleSearch}>
          <SearchIcon />
        </IconButton>
      </Box>
      {error && (
        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}
      {results.length > 0 && (
        <Paper sx={{ position: 'absolute', top: 40, left: 0, right: 0, zIndex: 10, maxHeight: 200, overflow: 'auto' }}>
          <List>
            {results.map((r) => (
              <ListItem
                button
                key={r.id}
                onClick={() => {
                  // set URL hash to trigger scrolling in AdminDashboard
                  window.location.hash = `#reclam-${r.id}`;
                  setResults([]);
                }}
              >
                <ListItemText primary={r.title} secondary={r.description} />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default ReclamSearchBar;
