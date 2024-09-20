// File: ./client/src/components/FactDisplay.jsx

import React from "react";
import { Typography, Paper, Box } from "@mui/material";

function FactDisplay({ facts }) {
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Current Facts:
      </Typography>
      <Paper elevation={3} sx={{ p: 2, maxHeight: "400px", overflow: "auto" }}>
        <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {facts}
        </pre>
      </Paper>
    </Box>
  );
}

export default FactDisplay;
