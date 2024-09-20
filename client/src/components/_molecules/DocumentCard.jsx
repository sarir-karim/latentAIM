import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Modal,
  Box,
  TextField,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Select,
  MenuItem,
  Tooltip,
  Chip,
} from "@mui/material";
import { Edit as EditIcon, Link as LinkIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { markDownToHtml } from "../../lib/utils.js";
import axios from "axios";
import TagSelector from "./TagSelector.jsx";

const StyledCard = styled(Card)(({ theme }) => ({
  height: 150,
  maxWidth: "300px",
  width: "288px",
  display: "flex",
  flexDirection: "column",
  cursor: "pointer",
  transition: "box-shadow 0.3s ease-in-out",
  "&:hover": {
    boxShadow: "0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)",
  },
}));

const TruncatedTypography = styled(Typography)({
  overflow: "hidden",
  textOverflow: "ellipsis",
  display: "-webkit-box",
  WebkitLineClamp: 3,
  WebkitBoxOrient: "vertical",
});

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 900,
  height: '80%',
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  overflowY: "auto",
};

const DocumentCard = ({ document, onEdit, onDelete, isDeleting, versions }) => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [title, setTitle] = useState(document.title);
  const [prompt, setPrompt] = useState(document.prompt);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVersionIndex, setSelectedVersionIndex] = useState(0);
  const [availableTags, setAvailableTags] = useState([]);

  const parseTags = (tags) => {
    if (!tags) return [];
    try {
      const parsed = JSON.parse(tags);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error("Error parsing tags:", error);
      return [];
    }
  };

  const [selectedTags, setSelectedTags] = useState(parseTags(document.tags));

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await axios.get("/api/database-utility/tags");
      setAvailableTags(response.data);
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  const allVersions = useMemo(() => {
    const uniqueVersions = [document, ...(versions || [])].reduce((acc, curr) => {
      if (!acc.find(v => v.version === curr.version)) {
        acc.push({...curr, parsedTags: parseTags(curr.tags)});
      }
      return acc;
    }, []);
    return uniqueVersions.sort((a, b) => b.version - a.version);
  }, [document, versions]);

  const handleEditClick = (e) => {
    e.stopPropagation();
    setEditModalOpen(true);
  };

  const handleEditSubmit = async () => {
    setIsLoading(true);
    try {
      const updatedDocument = await onEdit(document.id, { title, prompt, tags: JSON.stringify(selectedTags) });
      setTitle(updatedDocument.title);
      setPrompt(updatedDocument.prompt);
      setSelectedTags(parseTags(updatedDocument.tags));
      setEditModalOpen(false);
    } catch (error) {
      console.error("Error updating document:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = () => {
    setViewModalOpen(true);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await onDelete(document.id);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  const handleVersionChange = (event) => {
    setSelectedVersionIndex(event.target.value);
  };

  const handleTagToggle = (tagType, name) => {
    setSelectedTags((prevTags) => {
      const tagExists = prevTags.some((t) => t.tagType === tagType && t.name === name);
      if (tagExists) {
        return prevTags.filter((t) => !(t.tagType === tagType && t.name === name));
      } else {
        return [...prevTags, { tagType, name }];
      }
    });
  };

  return (
    <>
      <StyledCard onClick={handleCardClick}>
        <CardContent>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography className="truncate" variant="h6" component="div" gutterBottom>
              {document.title}
            </Typography>
          </Box>
          <Box className="flex flex-nowrap gap-2 items-center">
            <IconButton
              component={Link}
              to={`/artifact/${document.id}`}
              onClick={(e) => e.stopPropagation()}
              size="small"
            >
              <LinkIcon fontSize='small' />
            </IconButton>
            <IconButton onClick={handleEditClick} size="small">
              <EditIcon fontSize='small'  />
            </IconButton>
            <IconButton 
              onClick={handleDeleteClick} 
              size="small" 
              disabled={isDeleting}
            >
              {isDeleting ? <CircularProgress size={24} /> : <DeleteIcon />}
            </IconButton>
          </Box>
          <TruncatedTypography variant="body2" color="text.secondary">
            {document.prompt}
          </TruncatedTypography>
          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {selectedTags.map((tag) => (
              <Chip
                key={`${tag.tagType}:${tag.name}`}
                label={tag.name}
                size="small"
                sx={{
                  borderRadius: '4px',
                  fontSize: '0.6rem',
                  height: '18px',
                  '& .MuiChip-label': {
                    padding: '0 4px',
                  },
                }}
              />
            ))}
          </Box>
        </CardContent>
      </StyledCard>

      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)}>
        <Box sx={modalStyle}>
          <Typography variant="h6" component="h2" gutterBottom>
            Edit Document
          </Typography>
          <TextField
            fullWidth
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            margin="normal"
            multiline
            rows={4}
          />
          <TagSelector
            availableTags={availableTags}
            selectedTags={selectedTags}
            onTagToggle={handleTagToggle}
            editable={true}
          />
          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={() => setEditModalOpen(false)} sx={{ mr: 1 }}>
              Cancel
            </Button>
            <Button
              onClick={handleEditSubmit}
              variant="contained"
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : "Save"}
            </Button>
          </Box>
        </Box>
      </Modal>

      <Modal open={viewModalOpen} onClose={() => setViewModalOpen(false)}>
        <Box sx={modalStyle}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" component="h2">
              {allVersions[selectedVersionIndex].title}
            </Typography>
            <Select
              value={selectedVersionIndex}
              onChange={handleVersionChange}
              size="small"
            >
              {allVersions.map((version, index) => (
                <MenuItem key={version.id || index} value={index}>
                  Version {version.version}
                  {index === 0 && " (Current)"}
                </MenuItem>
              ))}
            </Select>
          </Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Version: {allVersions[selectedVersionIndex].version}
          </Typography>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Prompt:
          </Typography>
          <Typography variant="body1" paragraph>
            {allVersions[selectedVersionIndex].prompt}
          </Typography>
          <TagSelector
            availableTags={availableTags}
            selectedTags={allVersions[selectedVersionIndex].parsedTags}
            onTagToggle={() => {}}
            editable={false}
          />
          <Typography variant="h6" gutterBottom>
            Documentation:
          </Typography>
          <Box 
            dangerouslySetInnerHTML={{ __html: markDownToHtml(allVersions[selectedVersionIndex].documentation) }} 
            sx={{ 
              mt: 2, 
              '& img': { maxWidth: '100%', height: 'auto' },
              '& pre': { overflowX: 'auto', backgroundColor: '#f0f0f0', padding: '1em' },
              '& code': { fontFamily: 'monospace', backgroundColor: '#f0f0f0', padding: '0.2em 0.4em' },
            }}
          />
        </Box>
      </Modal>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Delete Document"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this document? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus disabled={isDeleting}>
            {isDeleting ? <CircularProgress size={24} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DocumentCard;