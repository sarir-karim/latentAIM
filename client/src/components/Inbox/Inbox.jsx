import React, { useState, useEffect } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Button } from '@mui/material';
import axios from 'axios';

const Inbox = () => {
  const [apiCalls, setApiCalls] = useState([]);
  const [error, setError] = useState(null);

  const fetchApiCalls = async () => {
    try {
      const response = await axios.get('/api/api-calls');
      setApiCalls(Array.isArray(response.data) ? response.data : []);
      setError(null);
    } catch (error) {
      console.error('Error fetching API calls:', error);
      setError('Failed to fetch API calls. Please try again.');
      setApiCalls([]);
    }
  };

  useEffect(() => {
    fetchApiCalls();
  }, []);

  return (
    <Box sx={{ width: '100%', mx: 'auto', mt: 4 }} maxWidth="layout">
      <Typography variant="h4" gutterBottom>
        API Call Inbox
      </Typography>
      <Button onClick={fetchApiCalls} variant="contained" sx={{ mb: 2 }}>
        Refresh
      </Button>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      {apiCalls.length === 0 ? (
        <Typography>No API calls to display.</Typography>
      ) : (
        <List>
          {apiCalls.map((call, index) => (
            <ListItem key={index} divider>
              <ListItemText
                primary={`${new Date(call.timestamp).toLocaleString()} - Input: ${call.inputTokens}, Output: ${call.outputTokens}`}
                secondary={call.message}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default Inbox;