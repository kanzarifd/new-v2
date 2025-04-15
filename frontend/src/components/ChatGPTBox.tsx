import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  IconButton,
  TextField,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const ChatGPTBox: React.FC = () => {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messageQueue, setMessageQueue] = useState<string[]>([]);
  const [processingQueue, setProcessingQueue] = useState(false);
  const [lastMessageTime, setLastMessageTime] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitError, setRateLimitError] = useState(false);

  // 🔁 Queue processor
  useEffect(() => {
    const processQueue = async () => {
      if (processingQueue || messageQueue.length === 0 || rateLimitError) return;

      setProcessingQueue(true);
      const currentMessage = messageQueue[0];
      const newMessages = [...messages, { role: 'user', content: currentMessage }];
      setMessages(newMessages);

      try {
        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-3.5-turbo',
            messages: newMessages,
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
            },
            timeout: 30000,
          }
        );

        const reply = response.data.choices[0].message;
        setMessages((prev) => [...prev, reply]);
        setLastMessageTime(new Date());
      } catch (error: any) {
        const errorMsg =
          error.response?.data?.error?.message || error.message || "Couldn't fetch response.";

        if (error.response?.status === 429) {
          setRateLimitError(true);
          setError('Rate limit exceeded. Please wait a moment before trying again.');

          // Handle Retry-After header if present
          const retryAfter = error.response.headers['retry-after'];
          const waitTime = retryAfter ? parseInt(retryAfter) : 30;

          setTimeout(() => {
            setRateLimitError(false);
          }, waitTime * 1000);
        } else {
          setError(errorMsg);
        }

        setMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${errorMsg}` }]);
      } finally {
        setMessageQueue((prev) => prev.slice(1)); // Remove processed/faulty message
        setProcessingQueue(false);

        // ⏱️ Delay before processing next message
        setTimeout(() => {
          processQueue();
        }, 3000);
      }
    };

    if (messageQueue.length > 0) {
      processQueue();
    }
  }, [messageQueue, processingQueue, rateLimitError, messages]);

  const sendMessage = () => {
    if (!input.trim() || rateLimitError) return;

    setMessageQueue((prev) => [...prev, input]);
    setInput('');

    if (messageQueue.length > 0) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Your message is queued. Please wait for the previous message to be processed.`,
        },
      ]);
    }
  };

  return (
    <Paper sx={{ p: 2, mt: 4, maxWidth: 500 }}>
      <Typography variant="h6" gutterBottom>
        🤖 AI Assistant
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {messageQueue.length > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {messageQueue.length} message(s) in queue. Please wait.
        </Alert>
      )}

      <List sx={{ maxHeight: 300, overflowY: 'auto' }}>
        {messages.map((msg, index) => (
          <ListItem key={index}>
            <ListItemText
              primary={`${msg.role === 'user' ? 'You' : 'GPT'}: ${msg.content}`}
              sx={{ color: msg.role === 'user' ? 'primary.main' : 'text.secondary' }}
            />
          </ListItem>
        ))}
        {loading && (
          <ListItem>
            <ListItemText primary="GPT is typing..." />
            <CircularProgress size={20} />
          </ListItem>
        )}
      </List>

      <Box display="flex" gap={1} mt={2}>
        <TextField
          variant="outlined"
          fullWidth
          size="small"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the AI anything..."
        />
        <IconButton onClick={sendMessage} color="primary" disabled={loading || rateLimitError}>
          <SendIcon />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default ChatGPTBox;
