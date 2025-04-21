import React, { useState } from 'react';
import { TextField, IconButton, List, ListItem, ListItemText } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';

const ReclamSearchById: React.FC = () => {
  const [id, setId] = useState<string>('');
  const [result, setResult] = useState<any[]>([]);
  const [error, setError] = useState<string>('');

  const handleSearch = async (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (!id.trim()) return;
    try {
      const res = await axios.get(`/api/reclams/searchList?query=${id.trim()}`);
      setResult(Array.isArray(res.data) ? res.data : []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error fetching reclamation');
      setResult([]);
    }
  };

  return (
    <>
      <TextField
        size="small"
        variant="outlined"
        placeholder="Search Reclam by ID"
        value={id}
        onChange={(e) => setId(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
        InputProps={{
          endAdornment: (
            <IconButton size="small" onClick={handleSearch}>
              <SearchIcon />
            </IconButton>
          ),
        }}
      />
      {/* Render list of results below search bar */}
      {result.length > 0 && (
        <List sx={{ mt: 1, bgcolor: 'background.paper', maxHeight: 200, overflow: 'auto' }}>
          {result.map((r) => (
            <ListItem button key={r.id} onClick={() => console.log(r)}>
              <ListItemText primary={`${r.id}: ${r.title}`} secondary={r.description} />
            </ListItem>
          ))}
        </List>
      )}
      {result.length === 0 && error && (
        <div style={{ marginTop: 8, color: 'red' }}>{error}</div>
      )}
    </>
  );
};

export default ReclamSearchById;
