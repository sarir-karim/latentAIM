// File: ./client/src/components/FileDetailModal.jsx
import React from "react";
import { Modal, Box, Typography } from "@mui/material";
import MermaidDiagram from "../_atoms/MermaidDiagram";

const FileDetailModal = ({ open, onClose, fileDetails }) => {
  if (!fileDetails) return null;
  const {
    title,
    filePath,
    fileSize,
    lastUpdated,
    mermaidDiagram,
  } = fileDetails;
  const {documentation } = fileDetails.documentation;

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="file-detail-modal">
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "80%",
          maxWidth: 600,
          maxHeight: "90vh",
          overflowY: "auto",
          bgcolor: "background.paper",
          boxShadow: 24,
          borderRadius: 2,
          p: 4,
        }}
      >
        <Typography variant="h5" component="h2" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          File Path: {filePath}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          File Size: {fileSize}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Last Updated: {lastUpdated}
        </Typography>
        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Documentation
        </Typography>
        <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", mb: 3 }}>
          {documentation || "No documentation available."}
        </Typography>
        <Typography variant="h6" gutterBottom>
          Mermaid Diagram
        </Typography>
        <Box sx={{ mt: 2, mb: 2 }}>
          <MermaidDiagram diagram={mermaidDiagram} />
        </Box>
      </Box>
    </Modal>
  );
};

export default FileDetailModal;
