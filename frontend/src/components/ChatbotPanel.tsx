import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FakeChatbot from './FakeChatbot'; // Adjust path as needed

interface ChatbotPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatbotPanel: React.FC<ChatbotPanelProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: '100%',
            maxWidth: 500,
            height: '100vh',
            background: 'linear-gradient(135deg,rgb(52, 7, 7),rgb(189, 151, 151))', // Gradient background
            borderRadius: '15px 0 0 15px', // Rounded corners
            boxShadow: '-4px 0 20px rgba(0,0,0,0.2)', // Shadow effect
            zIndex: 1300,
            overflow: 'hidden', // Ensure content stays within bounds
          }}
        >
          {/* Close button */}
          <Box p={1} textAlign="right">
            <IconButton onClick={onClose} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Chatbot content */}
          <Box px={2} py={3}>
            <FakeChatbot />
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatbotPanel;