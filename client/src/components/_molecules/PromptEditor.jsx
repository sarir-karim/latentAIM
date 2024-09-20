import React, { useState } from 'react';
import { Box, TextField, Button } from '@mui/material';

const PromptEditor = ({ initialPrompt, onSave }) => {
  const [prompt, setPrompt] = useState(initialPrompt);

  const handleSave = () => {
    onSave(prompt);
  };

  return (
    <Box>
      <TextField
        fullWidth
        multiline
        rows={4}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        variant="outlined"
        sx={{ mb: 2 }}
      />
      <Button variant="contained" onClick={handleSave}>
        Save & Generate
      </Button>
    </Box>
  );
};

export default PromptEditor;