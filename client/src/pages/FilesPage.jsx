import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  List,
} from "@mui/material";
import { Refresh as RefreshIcon } from "@mui/icons-material";
import FileTreeItem from "../components/_molecules/FileTreeItem"; 

const FilesPage = () => {
  const [files, setFiles] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("/api/repository/files", {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.data && response.data.fileTree) {
        setFiles(response.data.fileTree);
      } else {
        throw new Error("Unexpected data structure received from the server");
      }
    } catch (error) {
      console.error("Error fetching files:", error);
      setError(
        error.response?.data?.message ||
          "Failed to fetch files. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: "0 auto", width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          Files
        </Typography>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={fetchFiles}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField
          label="Search files"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flexGrow: 1 }}
        />
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Filter</InputLabel>
          <Select value="" label="Filter">
            <MenuItem value="">None</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Paper className="px-4 py-2"  elevation={3} sx={{ maxHeight: "80vh", overflow: "auto" }}>
        <List>
          {loading ? (
            <Typography sx={{ p: 2 }}>Loading...</Typography>
          ) : files ? (
            <FileTreeItem item={files} searchTerm={searchTerm} />
          ) : (
            <Typography sx={{ p: 2 }}>No files found</Typography>
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default FilesPage;