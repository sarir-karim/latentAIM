import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Divider,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Chip,
  Tooltip,
} from "@mui/material";
import { Delete as DeleteIcon, Edit as EditIcon, Save as SaveIcon, ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { markDownToHtml } from "../lib/utils";
import TagSelector from "../components/_molecules/TagSelector";

const ArtifactPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [versions, setVersions] = useState([]);
  const [selectedVersionIndex, setSelectedVersionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState("");
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  useEffect(() => {
    fetchDocument();
    fetchTags();
  }, [id]);

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

  const fetchDocument = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/documents/${id}`);
      const { document, versions } = response.data;
      setVersions([document, ...versions]);
      setEditedPrompt(document.prompt);
      setSelectedTags(parseTags(document.tags));
      setLoading(false);
    } catch (err) {
      console.error("Error fetching document:", err);
      setError("Failed to fetch the document. Please try again later.");
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await axios.get("/api/database-utility/tags");
      setAvailableTags(response.data);
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  const handleVersionSelect = (index) => {
    setSelectedVersionIndex(index);
    setEditedPrompt(versions[index].prompt);
    setSelectedTags(parseTags(versions[index].tags));
    setEditMode(false);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/documents/${id}`);
      setOpenDeleteDialog(false);
      navigate("/artifact", { replace: true });
    } catch (err) {
      console.error("Error deleting document:", err);
      setError("Failed to delete the document. Please try again later.");
    }
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      await axios.put(`/api/documents/${id}`, {
        ...versions[selectedVersionIndex],
        prompt: editedPrompt,
        tags: JSON.stringify(selectedTags),
      });
      await fetchDocument();
      setEditMode(false);
    } catch (err) {
      console.error("Error updating document:", err);
      setError("Failed to update the document. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" mt={4}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (versions.length === 0) {
    return (
      <Box textAlign="center" mt={4}>
        <Typography>Document not found.</Typography>
      </Box>
    );
  }

  const selectedVersion = versions[selectedVersionIndex];

  return (
    <Box sx={{ maxWidth: 1200, p: 3 }}>
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={handleBack}
        sx={{ mb: 2 }}
      >
        Back
      </Button>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" component="h1">
            {selectedVersion.title}
          </Typography>
          <Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={editMode ? <SaveIcon /> : <EditIcon />}
              onClick={() => editMode ? handleUpdate() : setEditMode(true)}
              sx={{ mr: 1 }}
              disabled={selectedVersionIndex !== 0}
            >
              {editMode ? "Save" : "Edit"}
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setOpenDeleteDialog(true)}
              disabled={selectedVersionIndex !== 0}
            >
              Delete
            </Button>
          </Box>
        </Box>

        <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {versions.map((version, index) => (
            <Tooltip
              key={version.id || index}
              title={index === 0 ? "Latest Version" : ""}
              arrow
            >
              <Chip
                label={`Version ${versions.length - index}`}
                onClick={() => handleVersionSelect(index)}
                color={selectedVersionIndex === index ? "primary" : "default"}
                variant={selectedVersionIndex === index ? "filled" : "outlined"}
              />
            </Tooltip>
          ))}
        </Box>

        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Prompt:
        </Typography>
        {editMode ? (
          <TextField
            fullWidth
            multiline
            rows={4}
            value={editedPrompt}
            onChange={(e) => setEditedPrompt(e.target.value)}
            variant="outlined"
            sx={{ mb: 2 }}
          />
        ) : (
          <Typography paragraph>{selectedVersion.prompt}</Typography>
        )}

        <TagSelector
          availableTags={availableTags}
          selectedTags={selectedTags}
          onTagToggle={handleTagToggle}
          editable={editMode}
        />

        <Divider sx={{ my: 3 }} />
        <Box
          className="markdown-content w-full"
          dangerouslySetInnerHTML={{
            __html: markDownToHtml(selectedVersion.documentation),
          }}
          sx={{
            "& h1, & h2, & h3, & h4, & h5, & h6": {
              mt: 2,
              mb: 1,
            },
            "& p": {
              mb: 2,
            },
            "& ul, & ol": {
              mb: 2,
              pl: 4,
            },
            "& code": {
              backgroundColor: "grey.100",
              p: 0.5,
              borderRadius: 1,
            },
            "& pre": {
              backgroundColor: "grey.100",
              p: 2,
              borderRadius: 2,
              overflowX: "auto",
            },
            "& a": {
              m: 0.5,
              borderRadius: 1.5,
              textDecoration: "none",
              cursor: "pointer"
            },
          }}
        />
      </Paper>

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
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
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ArtifactPage;