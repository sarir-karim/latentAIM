import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
} from "@mui/material";
import ReactMarkdown from 'react-markdown';
import axios from "axios";
import MiniSidebar from "../_molecules/MiniSidebar";

const MINI_SIDEBAR_WIDTH = 250;
const CONTENT_MAX_WIDTH = 950;

const Documentation = ({ setNotify }) => {
  const [documentation, setDocumentation] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    fetchDocumentation();
  }, []);

  const fetchDocumentation = async () => {
    try {
      const response = await axios.get("/api/documentation");
      console.log("FETCHED DOCS\n",response.data)
      setDocumentation(response.data);
      setEditContent(response.data.documentation.content);
    } catch (error) {
      console.error("Error fetching documentation:", error);
      setNotify("Error fetching documentation");
    }
  };

  const handleSave = async () => {
    try {
      await axios.post("/api/documentation/refresh", { content: editContent });
      setDocumentation({ ...documentation, content: editContent });
      setIsEditing(false);
      setNotify("Documentation updated successfully");
    } catch (error) {
      console.error("Error updating documentation:", error);
      setNotify("Error updating documentation");
    }
  };

  return (
    <Box sx={{ 
      flexGrow: 1, 
      p: 2, 
      overflowY: 'auto', 
      display: 'flex', 
      justifyContent: 'center'
    }}>
      <Box sx={{ maxWidth: CONTENT_MAX_WIDTH, width: '100%' }}>
        <Typography variant="h5" gutterBottom>Documentation</Typography>
        {documentation ? (
          <>
            <Box sx={{ mb: 2 }}>
              <Button onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? 'Cancel' : 'Edit Documentation'}
              </Button>
            </Box>
            {isEditing ? (
              <Box>
                <TextField
                  fullWidth
                  multiline
                  rows={20}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
                <Button variant="contained" onClick={handleSave}>
                  Save
                </Button>
              </Box>
            ) : (
              <ReactMarkdown>
                {documentation.content}
              </ReactMarkdown>
            )}
          </>
        ) : (
          <Typography>Loading documentation...ErroE</Typography>
        )}
      </Box>
    </Box>
  );
};

export default Documentation;