import React from "react";
import { TextField, Button, Box } from "@mui/material";

function InputForm({ onSubmit, value, onChange }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (value && typeof value === 'string' && value.trim()) {
      onSubmit(value);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, mb: 2 }}>
      <TextField
        fullWidth
        multiline
        rows={4}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter text here..."
        variant="outlined"
        sx={{ mb: 2 }}
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={!value || typeof value !== 'string' || !value.trim()}
      >
        Generate Facts
      </Button>
    </Box>
  );
}

export default InputForm;