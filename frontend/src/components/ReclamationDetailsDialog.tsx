import React from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton, Box, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import { Reclam } from './types';
import AttachmentPreviewDialog from './AttachmentPreviewDialog';

interface ReclamationDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  reclam: Reclam | null;
}

const ReclamationDetailsDialog: React.FC<ReclamationDetailsDialogProps> = ({ open, onClose, reclam }) => {
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [previewSrc, setPreviewSrc] = React.useState<string | null>(null);
  const [previewIsImage, setPreviewIsImage] = React.useState(true);
  const detailsRef = React.useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!detailsRef.current) return;
    const printContents = detailsRef.current.innerHTML;
    const printWindow = window.open('', '', 'height=700,width=900');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Reclamation Details</title>');
      printWindow.document.write('<style>body{font-family:sans-serif;margin:0;padding:24px;} .MuiBox-root{box-shadow:none!important;border:none!important;} </style>');
      printWindow.document.write('</head><body >');
      printWindow.document.write(printContents);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 700, color: '#b71c1c', letterSpacing: 1 }}>
        Reclamation Details
        <IconButton onClick={onClose} size="small" sx={{ ml: 2 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {reclam && (
          <Box sx={{ p: { xs: 0, sm: 2 }, position: 'relative' }}>
            <Box
              ref={detailsRef}
              sx={{
                p: 3,
                borderRadius: 3,
                boxShadow: 3,
                bgcolor: '#fff',
                minWidth: 320,
                border: '1.5px solid #e53935',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, fontSize: 22, color: '#b71c1c', letterSpacing: 1 }}>{reclam.title}</span>
                <Button
                  size="small"
                  variant="outlined"
                  color="secondary"
                  startIcon={<PrintIcon />}
                  onClick={handlePrint}
                  sx={{ ml: 2 }}
                >
                  Imprimer
                </Button>
              </Box>
              <Box sx={{ mb: 1 }}>
                <span style={{ color: '#444', fontWeight: 500 }}>Description:</span>
                <br />
                <span style={{ color: '#222' }}>{reclam.description}</span>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 1 }}>
                <span><b>Status:</b> <span style={{ color: '#e53935' }}>{reclam.status}</span></span>
                <span><b>Priority:</b> <span style={{ color: (reclam.priority === 'high' ? '#e53935' : (reclam.priority === 'medium' ? '#ff9800' : '#43a047')) }}>{reclam.priority}</span></span>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 1 }}>
                <span><b>Date début:</b> {reclam.date_debut ? new Date(reclam.date_debut).toLocaleDateString() : '-'}</span>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 1 }}>
                <span><b>Utilisateur:</b> {reclam.user?.name || reclam.userId || '-'}</span>
                <span><b>Agence:</b> {reclam.currentAgency || '-'}</span>
              </Box>
              {reclam.attachment && (
                <Box sx={{ mt: 1 }}>
                  <span><b>Pièce jointe:</b> </span>
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    sx={{ ml: 1 }}
                    onClick={() => {
                      setPreviewSrc(`http://localhost:8000/uploads/${reclam.attachment}`);
                      setPreviewIsImage(/\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(reclam.attachment || ''));
                      setPreviewOpen(true);
                    }}
                  >
                    Aperçu pièce jointe
                  </Button>
                </Box>
              )}

            </Box>
          </Box>
        )}
        <AttachmentPreviewDialog
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          src={previewSrc || ''}
          isImage={previewIsImage}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ReclamationDetailsDialog;
