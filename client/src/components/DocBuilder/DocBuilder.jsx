import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Modal,
  Chip,
} from "@mui/material";
import axios from "axios";
import DocumentCard from "../_molecules/DocumentCard";

const CONTENT_MAX_WIDTH = 950;

const DocBuilder = ({ setNotify }) => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documentContent, setDocumentContent] = useState("");
  const [deletingDocumentId, setDeletingDocumentId] = useState(null);
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  useEffect(() => {
    fetchDocuments();
    fetchTags();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get("/api/documents");
      setDocuments(response.data);
    } catch (error) {
      console.error("Error fetching documents:", error);
      setNotify("Error fetching documents");
    }
  };

  const fetchTags = async () => {
    try {
      const response = await axios.get("/api/database-utility/tags");
      console.log("tags",response.data)
      setTags(response.data);
    } catch (error) {
      console.error("Error fetching tags:", error);
      setNotify("Error fetching tags");
    }
  };

  const handleDocumentSelect = async (document) => {
    try {
      const response = await axios.get(`/api/documents/${document.id}`);
      setSelectedDocument(response.data);
      setDocumentContent(response.data.documentation);
      setTitle(response.data.title);
      setPrompt(response.data.prompt || "");
      setSelectedTags(JSON.parse(response.data.tags || "[]"));
    } catch (error) {
      console.error("Error fetching document:", error);
      setNotify("Error fetching document");
    }
  };

  const handleDocumentDelete = async (id) => {
    setDeletingDocumentId(id);
    try {
      await axios.delete(`/api/documents/${id}`);
      setDocuments(documents.filter(doc => doc.id !== id));
      if (selectedDocument && selectedDocument.id === id) {
        setSelectedDocument(null);
        setDocumentContent("");
      }
      setNotify("Document deleted successfully");
    } catch (error) {
      console.error("Error deleting document:", error);
      setNotify("Error deleting document");
    } finally {
      setDeletingDocumentId(null);
    }
  };

  const handleDocumentAdd = async () => {
    setLoading(true);
    try {
      const response = await axios.post("/api/documents", {
        title,
        prompt,
        tags: selectedTags,
      });
      setDocuments([...documents, response.data.document]);
      setTitle("");
      setPrompt("");
      setNotify("Document created successfully");
      setModalOpen(false);
      setSelectedTags([]);
    } catch (error) {
      console.error("Error creating document:", error);
      setNotify("Error creating document");
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpdate = async (id, body) => {
    setLoading(true);
    const { title, prompt } = body;
    try {
      const response = await axios.put(`/api/documents/${id}`, {
        title,
        prompt,
        tags: selectedTags,
      });
      const updatedDoc = response.data.document;
      setDocuments(
        documents.map((doc) => (doc.id === updatedDoc.id ? updatedDoc : doc))
      );
      setSelectedDocument(updatedDoc);
      setDocumentContent(updatedDoc.documentation);
      setNotify("Document updated successfully");
    } catch (error) {
      console.error("Error updating document:", error);
      setNotify("Error updating document");
    } finally {
      setLoading(false);
    }
  };

  const handleTagToggle = (tagType, name) => {
    setSelectedTags((prevTags) => {
      const tagKey = `${tagType}:${name}`;
      return prevTags.some((t) => t.tagType === tagType && t.name === name)
        ? prevTags.filter((t) => !(t.tagType === tagType && t.name === name))
        : [...prevTags, { tagType, name }];
    });
  };

  const handleViewMoreArtifacts = () => {
    navigate("/artifact");
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        maxWidth: "1200px",
        width: "calc(90vw - 260px);",
        minWidth: "320px",
      }}
    >
      <Box
        sx={{
          width: "100%",
          mt: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
        maxWidth="layout"
      >
        <Typography variant="h4" gutterBottom>
          Recent Artifacts
        </Typography>
        <Button variant="contained" onClick={() => setModalOpen(true)}>
          Create Artifact
        </Button>
      </Box>
      <Box
        sx={{
          flexGrow: 1,
          p: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
        <Box
          className="flex flex-col flex-wrap md:flex-row gap-3 items-start w-full"
          sx={{ 
            maxWidth: CONTENT_MAX_WIDTH, 
            width: "100%",
            minHeight: "200px", // Ensure minimum height even when empty
          }}
        >
          {documents?.map((doc) => {
            if (doc.document?.id) {
              return (
                <DocumentCard
                  key={doc.document.lastModified}
                  document={doc.document}
                  onEdit={handleDocumentUpdate}
                  onDelete={handleDocumentDelete}
                  isDeleting={deletingDocumentId === doc.document.id}
                  versions={doc.versions}
                />
              );
            }
            return null;
          })}
        </Box>
        <Button 
          variant="outlined" 
          onClick={handleViewMoreArtifacts} 
          sx={{ mt: 4, mb: 2 }}
        >
          View More Artifacts
        </Button>
      </Box>
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        aria-labelledby="add-document-modal"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "60%",
            minWidth: "300px",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Add New Artifact
          </Typography>
          <TextField
            fullWidth
            label="Artifact Title"
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
            rows={6}
          />
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <Box sx={{ mt: 2, mb: 2, minWidth: "300px" }}>
              <Typography variant="subtitle2" gutterBottom>
                Tags:
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {tags.map((tag) => {
                  if (tag.tagType === "TopicTag") return null;
                  return (
                    <Chip
                      key={`${tag.tagType}:${tag.name}`}
                      label={tag.name}
                      onClick={() => handleTagToggle(tag.tagType, tag.name)}
                      color={
                        selectedTags.some(
                          (t) =>
                            t.tagType === tag.tagType && t.name === tag.name
                        )
                          ? "primary"
                          : "default"
                      }
                      size="small"
                      sx={{
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                        height: "24px",
                        "& .MuiChip-label": {
                          padding: "0 8px",
                        },
                      }}
                    />
                  );
                })}
              </Box>
            </Box>
            <Box sx={{ mt: 2, mb: 2, minWidth: "300px" }}>
              <Typography variant="subtitle2" gutterBottom>
                Topic Tags:
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {tags.map((tag) => {
                  if (tag.tagType === "Tag") return null;
                  return (
                    <Chip
                      key={`${tag.tagType}:${tag.name}`}
                      label={tag.name}
                      onClick={() => handleTagToggle(tag.tagType, tag.name)}
                      color={
                        selectedTags.some(
                          (t) =>
                            t.tagType === tag.tagType && t.name === tag.name
                        )
                          ? "primary"
                          : "default"
                      }
                      size="small"
                      sx={{
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                        height: "24px",
                        "& .MuiChip-label": {
                          padding: "0 8px",
                        },
                      }}
                    />
                  );
                })}
              </Box>
            </Box>
          </div>
          <Button
            variant="contained"
            onClick={handleDocumentAdd}
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : "Generate Artifact"}
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default DocBuilder;