import React, { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { CheckCircle as CheckIcon, Pending as PendingIcon, Close as CloseIcon } from '@mui/icons-material';
import { Paper, Typography, Box, Grid, CircularProgress, Alert, useTheme } from '@mui/material';
import { ChartData, Reclamation } from '../types/dashboard';

const COLORS = ['#4CAF50', '#FFC107', '#F44336', '#2196F3'];
const LOADING_HEIGHT = 300;

interface AdminDashboardStatsProps {
  reclamations: Reclamation[];
}

const AdminDashboardStats = ({ reclamations }: AdminDashboardStatsProps) => {
  const theme = useTheme();
  const [dataBar, setDataBar] = useState<ChartData[]>([]);
  const [dataPie, setDataPie] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Calculate statistics
      const statusCounts = reclamations.reduce((acc: Record<string, number>, reclam: Reclamation) => {
        acc[reclam.status] = (acc[reclam.status] || 0) + 1;
        return acc;
      }, {});

      const priorityCounts = reclamations.reduce((acc: Record<string, number>, reclam: Reclamation) => {
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

  const Table = ({ reclamations }: { reclamations: Reclamation[] }) => (
    <Box sx={{ overflow: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: theme.palette.background.paper }}>
            <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Date</th>
            <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Type</th>
            <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {reclamations.map((reclam, index) => (
            <tr
              key={index}
              style={{
                borderBottom: '1px solid #ddd',
                backgroundColor: index % 2 ? theme.palette.background.default : theme.palette.background.paper,
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.palette.action.hover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = index % 2 ? theme.palette.background.default : theme.palette.background.paper;
              }}
            >
              <td style={{ padding: '8px' }}>{new Date(reclam.created_at).toLocaleDateString()}</td>
              <td style={{ padding: '8px' }}>{reclam.type}</td>
              <td style={{ padding: '8px', display: 'flex', alignItems: 'center' }}>
                {reclam.status === 'resolved' && <CheckIcon style={{ color: '#4CAF50', marginRight: '8px' }} />}
                {reclam.status === 'in_progress' && <PendingIcon style={{ color: '#FFC107', marginRight: '8px' }} />}
                {reclam.status === 'closed' && <CloseIcon style={{ color: '#F44336', marginRight: '8px' }} />}
                {reclam.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  );

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
          <Card
            title="Total Reclamations"
            value={reclamations?.length || 0}
            icon={<CheckIcon sx={{ fontSize: 40, color: '#4CAF50' }} />}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card
            title="In Progress"
            value={dataBar.find((d) => d.name === 'In Progress')?.value || 0}
            icon={<PendingIcon sx={{ fontSize: 40, color: '#FFC107' }} />}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card
            title="Resolved"
            value={dataBar.find((d) => d.name === 'Resolved')?.value || 0}
            icon={<CheckIcon sx={{ fontSize: 40, color: '#4CAF50' }} />}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Reclamation Statistics
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dataBar}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#0088FE" />
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
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                >
                  {dataPie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ mt: 4, p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Recent Reclamations
        </Typography>
        <Table reclamations={reclamations || []} />
      </Paper>
    </Box>
  );
};

export default AdminDashboardStats;
