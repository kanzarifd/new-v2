import React from 'react';
import {
  Box,
  Typography,
  Divider,
  Grid,
  useTheme,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Chip,
  useMediaQuery,
  Slide
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { format } from 'date-fns';
import type { TransitionProps } from '@mui/material/transitions';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement<any, any> },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface VerificationCardProps {
  data: any;
  onClose?: () => void;
  onAction?: (action: 'confirm' | 'edit' | 'new') => void;
}

const fieldLabels: Record<string, string> = {
  title: 'Titre',
  description: 'Description',
  status: 'Statut',
  priority: 'Priorité',
  date_debut: 'Date Début',
  date_fin: 'Date Fin',
  regionId: 'Région',
  userId: 'Utilisateur',
  currentAgency: 'Agence Actuelle',
  rejectionReason: 'Raison du Rejet',
  issueType: 'Type de Problème',
};

const VerificationCard: React.FC<VerificationCardProps> = ({ data, onClose, onAction }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Format fields
  const formatField = (key: string, value: any) => {
    if (key === 'priority') {
      const color = value === 'high' ? 'error' : value === 'medium' ? 'warning' : 'success';
      return <Chip label={value.charAt(0).toUpperCase() + value.slice(1)} color={color as any} size="small" sx={{ fontWeight: 600 }} />;
    }
    if (key === 'status') {
      let color: any = 'info';
      if (value === 'pending') color = 'warning';
      else if (value === 'resolved' || value === 'closed') color = 'success';
      else if (value === 'in_progress') color = 'info';
      else if (value === 'rejected') color = 'error';
      return <Chip label={value.replace('_', ' ').toUpperCase()} color={color} size="small" sx={{ fontWeight: 600 }} />;
    }
    if (key === 'date_debut' || key === 'date_fin') {
      try {
        return format(new Date(value), 'PPP');
      } catch {
        return value;
      }
    }
    return String(value);
  };

  return (
    <Dialog
      open
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      TransitionComponent={Transition}
      PaperProps={{
        sx: {
          borderRadius: 4,
          bgcolor: theme.palette.mode === 'dark' ? '#181f2a' : '#fff',
          color: theme.palette.text.primary,
          px: { xs: 2, sm: 4 },
          py: { xs: 2, sm: 4 },
          boxShadow: theme.palette.mode === 'dark' ? 12 : 6,
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 700,
          letterSpacing: 1,
          color: theme.palette.mode === 'dark' ? '#b71c1c' : '#b71c1c', // dark red
          textTransform: 'uppercase',
          pb: 1,
          pr: 5,
          textAlign: 'center',
          position: 'relative',
          transition: 'box-shadow 0.2s, color 0.2s, transform 0.2s',
          boxShadow: 'none',
          cursor: 'pointer',
          '&:hover': {
            color: theme.palette.mode === 'dark' ? '#d32f2f' : '#d32f2f',
            boxShadow: theme.shadows[4],
            background: theme.palette.mode === 'dark' ? 'rgba(183,28,28,0.08)' : 'rgba(183,28,28,0.08)',
            transform: 'scale(1.03)',
          },
        }}
      >
        Vérification
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 12,
            top: 12,
            color: theme.palette.grey[500],
            bgcolor: 'transparent',
            '&:hover': { bgcolor: theme.palette.action.hover },
          }}
        >
          <CloseIcon fontSize="medium" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ pt: 2, pb: 1 }}>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={1} sx={{ width: '100%' }}>
          {Object.entries(data).map(([key, value]) =>
            value && fieldLabels[key] ? (
              <React.Fragment key={key}>
                <Grid item xs={5}>
                  <Typography sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
                    {fieldLabels[key]}
                  </Typography>
                </Grid>
                <Grid item xs={7}>
                  <Typography sx={{ fontWeight: 500, color: theme.palette.text.primary }}>
                    {formatField(key, value)}
                  </Typography>
                </Grid>
              </React.Fragment>
            ) : null
          )}
        </Grid>
      </DialogContent>
      <Box sx={{ mt: 3, width: '100%', display: 'flex', flexDirection: 'column', gap: 2, px: 2, pb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: theme.palette.text.secondary, textAlign: 'center' }}>
          Veuillez confirmer les informations ou choisir une action :
        </Typography>
        <Grid container spacing={2} justifyContent="center" direction={isMobile ? 'column' : 'row'}>
          {[{action: 'confirm', label: "+ Oui, c'est correct"}, {action: 'edit', label: '✎ Modifier'}, {action: 'new', label: '+ Nouvelle réclamation'}].map(({action, label}) => (
            <Grid item xs={12} sm={4} key={action}>
              <Button
                onClick={() => onAction?.(action as 'confirm' | 'edit' | 'new')}
                variant="contained"
                fullWidth
                sx={{
                  borderRadius: 3,
                  fontWeight: 700,
                  fontSize: '1rem',
                  bgcolor: '#b71c1c',
                  color: '#fff',
                  borderColor: '#b71c1c',
                  boxShadow: 5,
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: '#d32f2f',
                    color: '#fff',
                    borderColor: '#d32f2f',
                    boxShadow: 6,
                  },
                }}
              >
                {label}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Dialog>
  );
};

export default VerificationCard; 