import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../components/context/AuthContext';
import FakeChatbot from '../components/FakeChatbot';
import ChatbotPanel from '../components/ChatbotPanel'; // Adjust path
import AttachmentPreviewDialog from '../components/AttachmentPreviewDialog';
import VerificationCard from '../components/VerificationCard';

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
  Tooltip,
  Zoom,
  Grid,
  SelectChangeEvent,
  FormHelperText,
  Link,
  Divider
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Logout, Visibility as VisibilityIcon, HighlightOff, DoneAll, 
  Autorenew, HourglassEmpty, CheckCircleOutline, CreditCard, AccountBalance, Payment, Lock, CreditScore, 
  Security, MonetizationOn, PhoneAndroid, Help, Report, AccountCircle, ErrorOutline, Warning,
  BlockOutlined, Password, AccountBalanceWallet, CompareArrows, LoginOutlined, BugReport, MobileFriendly } from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';
import UserHeader from './UserHeader';
import FooterHTML from '../components/FooterHTML';


interface Reclam {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed' | 'rejected';
  priority: 'high' | 'medium' | 'low';
  date_debut: string;
  date_fin: string;
  region_id: number;
  user_id: number;
  currentAgency?: string;
  attachment?: string;
  rejectionReason?: string;
}

interface Region {
  id: number;
  name: string;
}

type BankIssueType = 'card' | 'account' | 'transaction' | 'password' | 'credit' | 'fraud' | 'payment' | 'app' | 'other';

const bankIssueTypes = [
  { value: 'card', label: 'Card Issues', icon: <CreditCard /> },
  { value: 'account', label: 'Account Services', icon: <AccountBalance /> },
  { value: 'transaction', label: 'Transaction Issues', icon: <CompareArrows /> },
  { value: 'password', label: 'Password/Login Issues', icon: <Lock /> },
  { value: 'credit', label: 'Credit Card Issues', icon: <CreditScore /> },
  { value: 'fraud', label: 'Fraud Concerns', icon: <Security /> },
  { value: 'payment', label: 'Payment Issues', icon: <Payment /> },
  { value: 'app', label: 'Banking App Issues', icon: <PhoneAndroid /> },
  { value: 'other', label: 'Other Issues', icon: <Help /> }
];

interface TitleOption {
  title: string;
  icon: JSX.Element;
}


// Professional, unified icon style for title options
const titleOptionIconSx = {
  color: '#b71c1c', // Main red theme color
  fontSize: 28,
  transition: 'transform 0.3s cubic-bezier(.4,2,.6,1), color 0.2s',
  verticalAlign: 'middle',
  mr: 1.1,
  filter: 'drop-shadow(0 2px 8px #b71c1c22)',
  '&:hover': {
    color: '#d32f2f',
    transform: 'scale(1.14) rotate(-6deg)',
    filter: 'drop-shadow(0 6px 16px #b71c1c44)',
  }
};

// Add animation CSS for icon pop effect (only once)
if (typeof window !== 'undefined' && !document.getElementById('title-option-icon-style')) {
  const style = document.createElement('style');
  style.id = 'title-option-icon-style';
  style.innerHTML = `
    .title-option-icon {
      animation: popInTitleOption 0.7s cubic-bezier(.4,2,.6,1);
    }
    @keyframes popInTitleOption {
      from { opacity: 0; transform: scale(0.7) translateY(14px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
  `;
  document.head.appendChild(style);
}

const bankIssueTitles: Record<BankIssueType, TitleOption[]> = {
  card: [
    { title: 'Card Lost', icon: <Report /> },
    { title: 'Card Stolen', icon: <Warning /> },
    { title: 'Card Damaged', icon: <BlockOutlined /> },
    { title: 'Card Blocked', icon: <ErrorOutline /> },
    { title: 'PIN Issues', icon: <Password /> }
  ],
  account: [
    { title: 'Account Access Issues', icon: <AccountCircle /> },
    { title: 'Account Balance Discrepancy', icon: <AccountBalanceWallet /> },
    { title: 'Account Statement Issues', icon: <Report /> },
    { title: 'Account Fees Dispute', icon: <Warning /> }
  ],
  transaction: [
    { title: 'Failed Transaction', icon: <ErrorOutline /> },
    { title: 'Duplicate Transaction', icon: <CompareArrows /> },
    { title: 'Unauthorized Transaction', icon: <Warning /> },
    { title: 'Transfer Issues', icon: <Report /> }
  ],
  password: [
    { title: 'Password Reset Failed', icon: <Password /> },
    { title: 'Account Locked', icon: <Lock /> },
    { title: 'Login Issues', icon: <LoginOutlined /> },
    { title: 'Security Questions', icon: <Security /> }
  ],
  credit: [
    { title: 'Credit Limit Issues', icon: <CreditScore /> },
    { title: 'Interest Rate Dispute', icon: <MonetizationOn /> },
    { title: 'Credit Score Issues', icon: <Report /> },
    { title: 'Payment Due Date', icon: <Warning /> }
  ],
  fraud: [
    { title: 'Suspicious Activity', icon: <Warning /> },
    { title: 'Identity Theft', icon: <Security /> },
    { title: 'Unauthorized Access', icon: <ErrorOutline sx={titleOptionIconSx} className="title-option-icon" /> },
    { title: 'Phishing Report', icon: <Report sx={titleOptionIconSx} className="title-option-icon" /> }
  ],
  payment: [
    { title: 'Payment Not Received', icon: <Report sx={titleOptionIconSx} className="title-option-icon" /> },
    { title: 'Payment Processing Delay', icon: <HourglassEmpty sx={titleOptionIconSx} className="title-option-icon" /> },
    { title: 'Wrong Payment Amount', icon: <Warning sx={titleOptionIconSx} className="title-option-icon" /> },
    { title: 'Recurring Payment Issues', icon: <ErrorOutline sx={titleOptionIconSx} className="title-option-icon" /> }
  ],
  app: [
    { title: 'App Login Failed', icon: <LoginOutlined sx={titleOptionIconSx} className="title-option-icon" /> },
    { title: 'App Feature Not Working', icon: <BugReport sx={titleOptionIconSx} className="title-option-icon" /> },
    { title: 'App Crash Issues', icon: <ErrorOutline sx={titleOptionIconSx} className="title-option-icon" /> },
    { title: 'Mobile Banking Error', icon: <MobileFriendly sx={titleOptionIconSx} className="title-option-icon" /> }
  ],
  other: [
    { title: 'General Inquiry', icon: <Help sx={titleOptionIconSx} className="title-option-icon" /> },
    { title: 'Service Quality', icon: <Report sx={titleOptionIconSx} className="title-option-icon" /> },
    { title: 'Branch Related', icon: <AccountBalance sx={titleOptionIconSx} className="title-option-icon" /> },
    { title: 'Other Issue', icon: <Help sx={titleOptionIconSx} className="title-option-icon" /> }
  ]
};


// Add animation CSS for icon pop effect
const style = document.createElement('style');
style.innerHTML = `
  .title-option-icon {
    animation: popInTitleOption 0.7s cubic-bezier(.4,2,.6,1);
  }
  @keyframes popInTitleOption {
    from { opacity: 0; transform: scale(0.7) translateY(14px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }
`;
document.head.appendChild(style);

interface FormValues {
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed' | 'rejected';
  priority: 'high' | 'medium' | 'low';
  date_debut: string;
  date_fin: string;
  regionId: number | null;
  userId: number | null;
  attachment: File | null;
  currentAgency?: string;
  rejectionReason?: string;
  issueType: BankIssueType | '';
}

const UserDashboard = () => {
  const [verificationOpen, setVerificationOpen] = useState(false);
  const [verificationData, setVerificationData] = useState<any | null>(null);
  const theme = useTheme();

  const [chatOpen, setChatOpen] = useState(false);

  const [regions, setRegions] = useState<Region[]>([]);

  const { user, token, logout } = useAuth();

  const todayStr = format(new Date('2025-05-09'), 'yyyy-MM-dd');
  const defaultValues: FormValues = {
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    date_debut: todayStr,
    date_fin: '',
    regionId: null,
    userId: user?.id ? Number(user.id) : null,
    attachment: null,
    currentAgency: '',
    rejectionReason: '',
    issueType: '',
  };

  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [reclams, setReclams] = useState<Reclam[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [rejectedNotifOpen, setRejectedNotifOpen] = useState(false);
  const [editingReclam, setEditingReclam] = useState<Reclam | null>(null);
  const [formData, setFormData] = useState<FormValues>(defaultValues);
  const [selectedReclamForView, setSelectedReclamForView] = useState<Reclam | null>(null);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [previewIsImage, setPreviewIsImage] = useState(false);
  const [previewAlt, setPreviewAlt] = useState<string>('');

  const [openReasonDialogId, setOpenReasonDialogId] = useState<number | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const fetchReclams = async () => {
    try {
      if (!user?.id) {
        setError('User not authenticated');
        return;
      }
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/reclams', {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Filter reclams by current user ID
      const userReclams = response.data.filter((reclam: Reclam) => reclam.user_id === Number(user.id));
      setReclams(userReclams);
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
        rejectionReason: reclam.rejectionReason || '',
        issueType: '',
      });
    } else {
      setFormData({ ...defaultValues, date_debut: format(new Date(), 'yyyy-MM-dd') });
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditingReclam(null);
    setFormData(defaultValues);
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
        // For updates, match backend field names
        formattedData = {
          title: editingReclam.title, // Keep the existing title
          description: formData.description,
          status: formData.status,
          priority: formData.priority,
          date_debut: formData.date_debut,
          date_fin: formData.date_fin,
          regionId: formData.regionId,
          userId: formData.userId,
          currentAgency: formData.currentAgency,
          rejectionReason: formData.rejectionReason
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
          rejectionReason: formData.rejectionReason,
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

        setOpen(false);
        fetchReclams();
        // Professional notification logic
        if (formData.status === 'rejected') {
          setRejectedNotifOpen(true);
        } else if (editingReclam) {
          setSuccessMessage('Reclamation updated successfully.');
        } else {
          setSuccessMessage('Reclamation created successfully.');
          setVerificationData({ ...formData });
          setVerificationOpen(true);
        }
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

  const handleDelete = (id: number) => {
    setDeleteDialogOpen(true);
    setDeleteTargetId(id);
    setDeleteConfirmText('');
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    setDeleteDialogOpen(false);
    try {
      setLoading(true);
      setError(null);
      await axios.delete(`http://localhost:8000/api/reclams/${deleteTargetId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccessMessage('Reclamation deleted successfully');
      fetchReclams();
    } catch (err) {
      setError('Failed to delete reclamation');
      console.error('Error deleting reclamation:', err);
    } finally {
      setLoading(false);
      setDeleteTargetId(null);
      setDeleteConfirmText('');
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
    setChatOpen(true); // Open the chat panel
  
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
      {/* Reclamation View Modal */}

    </Box>
        
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <UserHeader
          toggleDrawer={toggleDrawer}
          onLogout={handleLogout}
          onOpenChat={openChat} isMobile={false}      />
      {chatOpen && <ChatbotPanel isOpen={chatOpen} onClose={() => setChatOpen(false)} />}

      {/* Reclamation View Modal */}

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
      {/* Reclamation View Modal */}

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
                <TableCell>Rejection Reason</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reclams.map((reclam) => (
                <TableRow
                  key={reclam.id}
                  sx={(() => {
                    if (reclam.status !== 'rejected') return {};
                    // Use the same background color for the entire row and all cells
                    return {
                      background:
                        theme.palette.mode === 'dark'
                          ? 'rgba(229,57,53,0.18)'
                          : '#ffcdd2',
                      borderLeft: '4px solid rgb(96, 14, 13)',
                    };
                  })()}
                >
                  <TableCell sx={{ p: 1 }}>
  <Link
    component="button"
    underline="hover"
    sx={{
      fontWeight: 700,
      color: theme.palette.mode === 'dark' ? '#ff8a80' : '#b71c1c',
      fontSize: '1.08rem',
      letterSpacing: '0.01em',
      fontFamily: 'inherit',
      textTransform: 'none',
      cursor: 'pointer',
      '&:hover': {
        textDecoration: 'underline',
        color: theme.palette.mode === 'dark' ? '#ff5252' : '#d32f2f',
      },
    }}
    aria-label={`Afficher les détails de la réclamation : ${reclam.title}`}
    onClick={() => setSelectedReclamForView(reclam)}
  >
    {reclam.title}
  </Link>
</TableCell>
                  <TableCell
                    sx={{
                      background: reclam.status === 'rejected' ? (theme.palette.mode === 'dark' ? 'rgba(229,57,53,0.13)' : '#ffcdd2') : 'transparent',
                      color:
                        reclam.status === 'rejected'
                          ? theme.palette.mode === 'dark'
                            ? '#ff5252'
                            : '#b71c1c'
                          : theme.palette.mode === 'dark'
                          ? '#e0e0e0'
                          : 'inherit',
                      fontWeight: 700,
                      letterSpacing: '0.01em',
                      fontFamily: 'inherit',
                      textTransform: 'capitalize',
                      py: 1.2,
                      px: 0,
                      border: 'none',
                      minWidth: 160,
                      maxWidth: 220,
                      verticalAlign: 'middle',
                      transition: 'background 0.25s, color 0.25s',
                    }}
                  >
                    <Tooltip
                      title={(() => {
                        switch (reclam.status) {
                          case 'pending': return 'This request is pending and awaiting processing.';
                          case 'in_progress': return 'This request is currently being processed.';
                          case 'resolved': return 'This request has been resolved.';
                          case 'closed': return 'This request is closed.';
                          case 'rejected': return 'This request was rejected.';
                          default: return reclam.status;
                        }
                      })()}
                      placement="top"
                      arrow
                      TransitionComponent={Zoom}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-start',
                          gap: 1.1,
                          px: 1.2,
                          py: 0.5,
                          borderRadius: 2,
                          boxShadow: reclam.status === 'rejected'
                            ? theme.palette.mode === 'dark'
                              ? '0 2px 12px #ff525233'
                              : '0 2px 12px #b71c1c22'
                            : theme.palette.mode === 'dark'
                            ? '0 1px 8px #222b'
                            : '0 1px 4px #ccc1',
                          background:
                            reclam.status === 'pending'
                              ? (theme.palette.mode === 'dark' ? '#fffde7' : '#fffde7')
                              : reclam.status === 'in_progress'
                              ? (theme.palette.mode === 'dark' ? '#1565c0' : '#e3f2fd')
                              : reclam.status === 'resolved'
                              ? (theme.palette.mode === 'dark' ? '#1b5e20' : '#e8f5e9')
                              : reclam.status === 'closed'
                              ? (theme.palette.mode === 'dark' ? '#3e2723' : '#efebe9')
                              : reclam.status === 'rejected'
                              ? theme.palette.mode === 'dark'
                                ? 'rgba(229,57,53,0.13)'
                                : '#ffcdd2'
                              : theme.palette.mode === 'dark'
                              ? '#23272b'
                              : '#f5f5f5',
                          border: reclam.status === 'rejected'
                            ? `1.5px solid ${theme.palette.mode === 'dark' ? '#ff5252' : '#b71c1c'}`
                            : reclam.status === 'pending'
                            ? `1.5px solid ${theme.palette.mode === 'dark' ? '#ffe082' : '#fbc02d'}`
                            : reclam.status === 'in_progress'
                            ? `1.5px solid ${theme.palette.mode === 'dark' ? '#1976d2' : '#1976d2'}`
                            : reclam.status === 'resolved'
                            ? `1.5px solid ${theme.palette.mode === 'dark' ? '#66bb6a' : '#388e3c'}`
                            : reclam.status === 'closed'
                            ? `1.5px solid ${theme.palette.mode === 'dark' ? '#8d6e63' : '#6d4c41'}`
                            : theme.palette.mode === 'dark'
                            ? '1.5px solid #444'
                            : '1.5px solid #e0e0e0',
                          transition: 'all 0.3s cubic-bezier(.4,2,.6,1)',
                          boxSizing: 'border-box',
                          cursor: 'pointer',
                          '&:hover': {
                            boxShadow: reclam.status === 'rejected'
                              ? theme.palette.mode === 'dark'
                                ? '0 4px 24px #ff5252cc'
                                : '0 4px 24px #b71c1ccc'
                              : theme.palette.mode === 'dark'
                              ? '0 4px 16px #222d'
                              : '0 4px 16px #aaa6',
                            transform: 'scale(1.04)',
                          },
                          animation: 'fadeInStatus 0.8s cubic-bezier(.4,2,.6,1)',
                          '@keyframes fadeInStatus': {
                            from: { opacity: 0, transform: 'translateY(12px) scale(0.95)' },
                            to: { opacity: 1, transform: 'translateY(0) scale(1)' },
                          },
                        }}
                      >
                        {(() => {
                          switch (reclam.status) {
                            case 'pending':
                              return <HourglassEmpty fontSize="small" sx={{ color: theme.palette.mode === 'dark' ? '#ffe082' : '#fbc02d', mr: 0.5, animation: 'spin 1.5s linear infinite' }} titleAccess="Pending" />;
                            case 'in_progress':
                              return <Autorenew fontSize="small" sx={{ color: theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2', mr: 0.5, animation: 'spin 1.2s linear infinite' }} titleAccess="In Progress" />;
                            case 'resolved':
                              return <DoneAll fontSize="small" sx={{ color: theme.palette.mode === 'dark' ? '#66bb6a' : '#388e3c', mr: 0.5, animation: 'popIn 0.7s cubic-bezier(.4,2,.6,1)' }} titleAccess="Resolved" />;
                            case 'closed':
                              return <CheckCircleOutline fontSize="small" sx={{ color: theme.palette.mode === 'dark' ? '#8d6e63' : '#6d4c41', mr: 0.5, animation: 'popIn 0.7s cubic-bezier(.4,2,.6,1)' }} titleAccess="Closed" />;
                            case 'rejected':
                              return <HighlightOff fontSize="small" sx={{ color: theme.palette.mode === 'dark' ? '#ff5252' : '#b71c1c', mr: 0.5, animation: 'shake 0.7s cubic-bezier(.36,.07,.19,.97) both' }} titleAccess="Rejected" />;
                            default:
                              return null;
                          }
                        })()}
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 800,
                            fontSize: '1.08rem',
                            color:
                              reclam.status === 'rejected'
                                ? theme.palette.mode === 'dark'
                                  ? '#ff5252'
                                  : '#b71c1c'
                                : theme.palette.mode === 'dark'
                                ? '#e0e0e0'
                                : 'inherit',
                            textTransform: 'capitalize',
                            letterSpacing: '0.02em',
                            fontFamily: 'inherit',
                            userSelect: 'text',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: 120,
                          }}
                        >
                          {reclam.status.replace('_', ' ')}
                        </Typography>
                      {/* Reclamation View Modal */}

    </Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={reclam.status === 'rejected' ? {background: 'inherit', color: theme.palette.mode === 'dark' ? '#ff8a80' : '#b71c1c', fontWeight: 700} : {}}>{reclam.priority}</TableCell>
                  <TableCell sx={reclam.status === 'rejected' ? {background: 'inherit', color: theme.palette.mode === 'dark' ? '#ff8a80' : '#b71c1c', fontWeight: 700} : {}}>{reclam.date_debut}</TableCell>
                  <TableCell sx={reclam.status === 'rejected' ? {background: 'inherit', color: theme.palette.mode === 'dark' ? '#ff8a80' : '#b71c1c', fontWeight: 700} : {}}>
                    {regions.find((r: Region) => r.id === reclam.region_id)?.name || 'Unknown Region'}
                  </TableCell>
                  <TableCell sx={reclam.status === 'rejected' ? {background: 'inherit', color: theme.palette.mode === 'dark' ? '#ff8a80' : '#b71c1c', fontWeight: 700} : {}}>
                    {reclam.attachment ? (
                      <Button size="small" variant="outlined" color="primary" onClick={() => handlePreviewAttachment(reclam)}>
                        View
                      </Button>
                    ) : (
                      <span>No Attachment</span>
                    )}
                  </TableCell>
                  <TableCell sx={reclam.status === 'rejected' ? {background: 'inherit', color: theme.palette.mode === 'dark' ? '#ff8a80' : '#b71c1c', fontWeight: 700} : {}}>{reclam.currentAgency || '-'}</TableCell>
                  <TableCell sx={reclam.status === 'rejected' ? {background: 'inherit', color: theme.palette.mode === 'dark' ? '#ff8a80' : '#b71c1c', fontWeight: 700} : {}}>
                    {reclam.status === 'rejected' && reclam.rejectionReason ? (
                      <>
                        <span
                          style={{
                            color: theme.palette.mode === 'dark' ? '#ff8a80' : '#e53935',
                            fontWeight: 600,
                            fontSize: '1rem',
                            letterSpacing: '0.01em',
                            fontFamily: 'inherit',
                            textShadow: theme.palette.mode === 'dark'
                              ? '0 1px 4px #000, 0 1px 2px #b71c1c44'
                              : '0 1px 3px rgba(229,57,53,0.07)',
                            padding: 0,
                            display: 'inline-block',
                            maxWidth: 140,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            verticalAlign: 'middle',
                          }}
                          title={reclam.rejectionReason}
                        >
                          {reclam.rejectionReason}
                        </span>
                        {reclam.rejectionReason.length > 30 && (
                          <IconButton
                            aria-label="See more"
                            size="small"
                            sx={{ ml: 1, verticalAlign: 'middle' }}
                            onClick={() => setOpenReasonDialogId(reclam.id)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        )}
                        <Dialog open={openReasonDialogId === reclam.id} onClose={() => setOpenReasonDialogId(null)}>
                          <DialogTitle>Rejection Reason</DialogTitle>
                          <DialogContent>
                            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', color: theme.palette.mode === 'dark' ? '#ff8a80' : '#b71c1c' }}>
                              {reclam.rejectionReason}
                            </Typography>
                          </DialogContent>
                          <DialogActions sx={{ 
            p: 3, 
            gap: 2,
            borderTop: '1px solid #eee',
            bgcolor: '#fff'
          }}>
                            <Button onClick={() => setOpenReasonDialogId(null)} color="primary" autoFocus>Close</Button>
                          </DialogActions>
                        </Dialog>
                      </>
                    ) : (
                      <span style={{ color: '#888', fontStyle: 'italic' }}>-</span>
                    )}
                  </TableCell>
                  <TableCell sx={reclam.status === 'rejected' ? {background: 'inherit'} : {}}>
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
        PaperProps={{
          sx: {
            borderRadius: 2,
            '& .MuiDialogContent-root': {
              p: 3
            }
          }
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #8B0000 0%, #B71C1C 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 3,
            fontSize: '1.5rem',
            fontWeight: 600,
            borderBottom: '2px solid rgba(255,255,255,0.1)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
              opacity: 0,
              transition: 'opacity 0.3s ease',
            },
            '&:hover::before': {
              opacity: 1,
            },
            '& .MuiTypography-root': {
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'translateX(5px)',
              },
              '& .MuiSvgIcon-root': {
                fontSize: '2rem',
                transition: 'transform 0.3s ease',
              },
              '&:hover .MuiSvgIcon-root': {
                transform: 'rotate(10deg)',
              }
            }
          }}
        >
          <Typography variant="h5" component="div">
            {editingReclam ? <EditIcon /> : <AddIcon />}
            {editingReclam ? 'Edit Reclamation' : 'New Reclamation'}
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 3,
            bgcolor: theme => theme.palette.mode === 'dark' ? '#1a1a1a' : '#ffffff',
            borderRadius: 1,
            p: 3,
            color: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#333333',
            '& .MuiFormControl-root': {
              '& .MuiInputLabel-root': {
                color: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#666666',
                '&.Mui-focused': {
                  color: theme => theme.palette.mode === 'dark' ? '#ff1744' : '#B71C1C'
                }
              },
              '& .MuiOutlinedInput-root': {
                color: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#333333',
                backgroundColor: theme => theme.palette.mode === 'dark' ? 'transparent' : '#ffffff',
                '& fieldset': {
                  borderColor: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(183, 28, 28, 0.3)'
                },
                '&:hover fieldset': {
                  borderColor: theme => theme.palette.mode === 'dark' ? '#ff1744' : '#B71C1C'
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme => theme.palette.mode === 'dark' ? '#ff1744' : '#B71C1C'
                },
                '& input': {
                  color: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#333333'
                },
                '& textarea': {
                  color: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#333333'
                }
              },
              '& .MuiSelect-select': {
                display: 'flex',
                alignItems: 'center',
                gap: 1
              },
              '& .MuiMenuItem-root': {
                transition: 'all 0.2s',
                color: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#333333',
                '&:hover': {
                  bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255,23,68,0.1)' : 'rgba(183, 28, 28, 0.1)',
                  '& .MuiSvgIcon-root': {
                    color: theme => theme.palette.mode === 'dark' ? '#ff1744' : '#B71C1C'
                  }
                }
              },
              '& .MuiSelect-icon': {
                color: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#666666'
              },
              '& .MuiSvgIcon-root': {
                color: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#666666'
              }
            }
          }}>
            <Typography variant="subtitle1" sx={{ mb: 2, color: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#666666' }}>
              Please provide the details of your reclamation below
            </Typography>

            {!editingReclam && (
              <>
                <FormControl fullWidth>
                  <InputLabel>Issue Type</InputLabel>
                  <Select
                    value={formData.issueType}
                    label="Issue Type"
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        issueType: e.target.value as BankIssueType,
                        title: ''
                      });
                    }}
                    required
                  >
                    {bankIssueTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {type.icon}
                          {type.label}
                        {/* Reclamation View Modal */}

    </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Title</InputLabel>
                  <Select
                    value={formData.title}
                    label="Title"
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    disabled={!formData.issueType}
                  >
                    {formData.issueType && bankIssueTitles[formData.issueType].map((item) => (
                      <MenuItem key={item.title} value={item.title}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {item.icon}
                          {item.title}
                        {/* Reclamation View Modal */}

    </Box>
                      </MenuItem>
                    ))}
                  </Select>
                  {!formData.issueType && (
                    <FormHelperText>Please select an issue type first</FormHelperText>
                  )}
                </FormControl>
              </>
            )}

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: 'primary.light'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main'
                  }
                }
              }}
            />

            <TextField
              fullWidth
              label="Status"
              value={formData.status.charAt(0).toUpperCase() + formData.status.slice(1).replace('_', ' ')}
              InputProps={{
                readOnly: true,
              }}
              sx={{
                '& .MuiInputBase-input.Mui-readOnly': {
                  opacity: 0.7,
                }
              }}
            />

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
                {regions.map((region: Region) => (
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
                    {/* Reclamation View Modal */}

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
                  if (date instanceof Date && !isNaN(date.getTime())) {
                    setFormData((prev) => ({ ...prev, date_debut: format(date, 'yyyy-MM-dd') }));
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2.5,
                        background: '#fafafa',
                        boxShadow: '0 2px 8px rgba(183,28,28,0.07)',
                        '& fieldset': {
                          borderColor: '#b71c1c44',
                        },
                        '&:hover fieldset': {
                          borderColor: '#b71c1c',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#b71c1c',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: '#b71c1c',
                        fontWeight: 600,
                      },
                      '& .MuiSvgIcon-root': {
                        color: '#b71c1c',
                      },
                    }}
                  />
                )}
              />
            </LocalizationProvider>

            <TextField
              label="Current Agency"
              value={formData.currentAgency}
              onChange={e => setFormData(prev => ({ ...prev, currentAgency: e.target.value }))}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: 'primary.light'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main'
                  }
                }
              }}
            />

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Attachment (optional)
              </Typography>
              <Button
                variant="outlined"
                color="error"
                component="label"
                startIcon={<VisibilityIcon />}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  borderColor: '#b71c1c',
                  color: '#b71c1c',
                  fontWeight: 700,
                  background: '#fff',
                  boxShadow: '0 1px 4px #b71c1c22',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: '#b71c1c',
                    color: '#fff',
                    borderColor: '#b71c1c',
                    boxShadow: '0 2px 8px #b71c1c33',
                  },
                  '&:focus': {
                    bgcolor: '#b71c1c',
                    color: '#fff',
                    borderColor: '#b71c1c',
                  }
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
            {/* Reclamation View Modal */}

    </Box>
          {/* Reclamation View Modal */}

    </Box>
        </DialogContent>

        <DialogActions sx={{ 
          p: 3, 
          gap: 2,
          borderTop: theme => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(183, 28, 28, 0.1)'}`,
          bgcolor: theme => theme.palette.mode === 'dark' ? '#1a1a1a' : '#ffffff'
        }}>
          <Button 
            onClick={handleClose}
            variant="outlined"
            startIcon={<HighlightOff />}
            sx={{
              borderRadius: 2,
              px: 3,
              color: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#666666',
              borderColor: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(183, 28, 28, 0.3)',
              '&:hover': {
                bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(183, 28, 28, 0.05)',
                borderColor: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#B71C1C',
                color: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#B71C1C'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            startIcon={loading ? null : editingReclam ? <EditIcon /> : <AddIcon />}
            sx={{
              borderRadius: 2,
              px: 4,
              background: theme => theme.palette.mode === 'dark' 
                ? 'linear-gradient(135deg, #ff1744 0%, #B71C1C 100%)'
                : 'linear-gradient(135deg, #B71C1C 0%, #8B0000 100%)',
              color: 'white',
              '&:hover': {
                background: theme => theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, #B71C1C 0%, #ff1744 100%)'
                  : 'linear-gradient(135deg, #8B0000 0%, #B71C1C 100%)'
              },
              '&:disabled': {
                background: theme => `rgba(${theme.palette.mode === 'dark' ? '255,255,255' : '183, 28, 28'}, 0.12)`,
                color: theme => `rgba(${theme.palette.mode === 'dark' ? '255,255,255' : '183, 28, 28'}, 0.3)`
              }
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : editingReclam ? (
              'Update'
            ) : (
              'Submit'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-reclam-dialog-title"
        aria-describedby="delete-reclam-dialog-desc"
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1,
            minWidth: 350,
            bgcolor: theme.palette.mode === 'dark' ? '#212121' : '#fff',
            boxShadow: 8,
          },
        }}
      >
        <DialogTitle id="delete-reclam-dialog-title" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HighlightOff color="error" sx={{ fontSize: 32 }} />
          Confirm Deletion
        </DialogTitle>
        <DialogContent id="delete-reclam-dialog-desc">
          <Typography variant="body1" sx={{ fontWeight: 500, color: theme.palette.mode === 'dark' ? '#ff8a80' : '#b71c1c', mb: 1 }}>
            Are you sure you want to delete this reclamation?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This action cannot be undone. The reclamation and its data will be permanently removed.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label="Type DELETE to confirm"
            variant="outlined"
            value={deleteConfirmText}
            onChange={e => setDeleteConfirmText(e.target.value)}
            sx={{ mb: 1 }}
            inputProps={{ style: { textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit" variant="outlined" sx={{ fontWeight: 700, borderRadius: 2 }}>Cancel</Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            sx={{ fontWeight: 700, borderRadius: 2, boxShadow: 2 }}
            disabled={deleteConfirmText.trim().toUpperCase() !== 'DELETE'}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setSuccessMessage(null)} severity="success" sx={{ fontWeight: 'bold', fontSize: '1.06rem', bgcolor: theme.palette.mode === 'dark' ? '#263238' : '#e8f5e9', color: theme.palette.mode === 'dark' ? '#fff' : '#388e3c', boxShadow: 3 }}>
          {successMessage}
        </Alert>
      </Snackbar>
      <Snackbar
        open={rejectedNotifOpen}
        autoHideDuration={7000}
        onClose={() => setRejectedNotifOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setRejectedNotifOpen(false)} severity="error" icon={<HighlightOff sx={{ color: '#e53935' }} />} sx={{ fontWeight: 'bold', fontSize: '1.07rem', bgcolor: theme.palette.mode === 'dark' ? '#2d090a' : '#ffcdd2', color: theme.palette.mode === 'dark' ? '#ff5252' : '#b71c1c', boxShadow: 3 }}>
          Reclamation has been <b>rejected</b>. Please check the reason provided.
        </Alert>
      </Snackbar>

      <AttachmentPreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        src={previewSrc || ''}
        alt={previewAlt}
        isImage={previewIsImage}
      />
    {/* Reclamation View Modal */}

    </Box>

    {/* Reclamation View Modal */}
    <Dialog
      open={!!selectedReclamForView}
      onClose={() => setSelectedReclamForView(null)}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 2,
          bgcolor: theme.palette.mode === 'dark' ? '#212121' : '#fff',
          boxShadow: 8,
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 800, color: '#b71c1c', fontSize: '2rem', textAlign: 'center', letterSpacing: 1, textShadow: '0 2px 8px rgba(183,28,28,0.08)' }}>
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <span style={{ fontSize: 28, color: '#b71c1c' }}>📄</span> Reclamation Details
        </span>
      </DialogTitle>
      <DialogContent sx={{ bgcolor: theme => theme.palette.mode === 'dark' ? '#191c1f' : '#fafbfc', borderRadius: 3, boxShadow: 0 }}>
        {selectedReclamForView && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 1 }}>
            <Typography variant="h5" sx={{ color: '#b71c1c', fontWeight: 800, mb: 1, letterSpacing: 0.5 }}>{selectedReclamForView.title}</Typography>
            <Divider sx={{ mb: 1 }} />
            <Typography variant="body1" sx={{ mb: 2, fontSize: 17, color: 'text.primary' }}>
              <b>Description:</b> {selectedReclamForView.description}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
              <Box sx={{ minWidth: 130 }}>
                <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span style={{ color: selectedReclamForView.status?.toLowerCase() === 'resolved' ? '#388e3c' : '#b71c1c', fontWeight: 700 }}>
                    ●
                  </span>
                  <Typography fontWeight={600}>{selectedReclamForView.status}</Typography>
                </Box>
              </Box>
              <Box sx={{ minWidth: 130 }}>
                <Typography variant="subtitle2" color="text.secondary">Priority</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span style={{ color: selectedReclamForView.priority?.toLowerCase() === 'high' ? '#b71c1c' : '#fbc02d', fontWeight: 700 }}>
                    ▲
                  </span>
                  <Typography fontWeight={600}>{selectedReclamForView.priority}</Typography>
                </Box>
              </Box>
              <Box sx={{ minWidth: 130 }}>
                <Typography variant="subtitle2" color="text.secondary">Start Date</Typography>
                <Typography fontWeight={600}>{selectedReclamForView.date_debut}</Typography>
              </Box>
              <Box sx={{ minWidth: 130 }}>
                <Typography variant="subtitle2" color="text.secondary">Region</Typography>
                <Typography fontWeight={600}>{regions.find(r => r.id === selectedReclamForView.region_id)?.name || 'Unknown'}</Typography>
              </Box>
              <Box sx={{ minWidth: 130 }}>
                <Typography variant="subtitle2" color="text.secondary">Current Agency</Typography>
                <Typography fontWeight={600}>{selectedReclamForView.currentAgency || '-'}</Typography>
              </Box>
              <Box sx={{ minWidth: 130 }}>
                <Typography variant="subtitle2" color="text.secondary">Rejection Reason</Typography>
                {selectedReclamForView.rejectionReason ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <Alert severity="error" icon={<Warning sx={{ color: '#b71c1c' }} />} sx={{ p: 0.5, pl: 1.5, bgcolor: '#ffebee', color: '#b71c1c', fontWeight: 700, fontStyle: 'italic', border: '1px solid #b71c1c', width: '100%' }}>
                      {selectedReclamForView.rejectionReason}
                    </Alert>
                  </Box>
                ) : (
                  <Typography fontWeight={600} sx={{ color: 'text.secondary' }}>—</Typography>
                )}
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            {selectedReclamForView.attachment && (
  <Box>
    <Typography variant="body2" sx={{ mb: 1 }}><b>Attachment:</b></Typography>
    {/* Check if the attachment is an image by extension */}
    {/\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(selectedReclamForView.attachment) ? (
      <Box
        sx={{
          display: 'inline-block',
          p: 1,
          borderRadius: 2,
          boxShadow: 4,
          border: theme => `2px solid ${theme.palette.mode === 'dark' ? '#333' : '#e0e0e0'}`,
          background: theme => theme.palette.mode === 'dark' ? '#181818' : '#fafafa',
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
          '&:hover': {
            transform: 'scale(1.04)',
            boxShadow: 8,
            borderColor: '#b71c1c',
          },
          maxWidth: 180,
          maxHeight: 180,
          overflow: 'hidden',
        }}
        onClick={() => {
          setPreviewSrc(`http://localhost:8000/uploads/${selectedReclamForView.attachment}`);
          setPreviewAlt(selectedReclamForView.title);
          setPreviewIsImage(true);
          setPreviewOpen(true);
        }}
        title="Click to enlarge"
      >
        <img
          src={`http://localhost:8000/uploads/${selectedReclamForView.attachment}`}
          alt={selectedReclamForView.title}
          style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 10, objectFit: 'cover', background: '#f4f4f4' }}
          loading="lazy"
        />
      </Box>
    ) : (
      <Button
        variant="outlined"
        color="primary"
        href={`http://localhost:8000/uploads/${selectedReclamForView.attachment}`}
        target="_blank"
        rel="noopener noreferrer"
        sx={{ mt: 1 }}
      >
        Download Attachment
      </Button>
    )}
  </Box>
)}
          {/* Reclamation View Modal */}

    </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setSelectedReclamForView(null)} color="error" variant="contained" sx={{ fontWeight: 700, borderRadius: 2 }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>

    {/* Verification Card Modal */}
    {verificationOpen && verificationData && (
      <VerificationCard
        data={verificationData}
        onAction={(action) => {
          if (action === 'confirm') {
            setVerificationOpen(false);
            setVerificationData(null);
          } else if (action === 'edit') {
            setVerificationOpen(false);
            setOpen(true); // Reopen the form dialog for editing
          } else if (action === 'new') {
            setVerificationOpen(false);
            setFormData(defaultValues);
            setOpen(true); // Open the form for a new reclamation
          }
        }}
        onClose={() => setVerificationOpen(false)}
      />
    )}

   
    <FooterHTML />
    </>
  );
};

export default UserDashboard;