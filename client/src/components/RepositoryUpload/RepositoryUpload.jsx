// File: ./client/src/components/RepositoryUpload/RepositoryUpload.jsx

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  ListItemSecondaryAction,
  Collapse,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import InfoIcon from '@mui/icons-material/Info';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import axios from 'axios';
import FileDetailModal from './FileDetailModal';

const getTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "m ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m ago";
  return Math.floor(seconds) + "s ago";
};

const formatFileSize = (bytes) => {
  const kb = bytes / 1024;
  return kb < 1 ? `${bytes} B` : `${kb.toFixed(1)} KB`;
};

const FileTreeNode = ({ item, level, onRefresh, onDelete, processingNodes, onDetails, expanded, onToggle }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const getNodeColor = (status) => {
    switch (status) {
      case 'new': return theme.palette.success.main;
      case 'modified': return theme.palette.warning.main;
      case 'deleted': return theme.palette.error.main;
      default: return 'inherit';
    }
  };

  const isProcessing = processingNodes.has(item.id);

  return (
    <ListItem 
      sx={{ 
        pl: level * 2, 
        py: 0.5,
        minHeight: '48px',
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
        },
        position: 'relative', // Add this
      }}
    >
      <Box sx={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        zIndex: 0,
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
        },
      }} />
      <ListItemIcon sx={{ minWidth: 24, display: 'flex', alignItems: 'center', zIndex: 1 }}>
        {item.type === 'directory' 
          ? <FolderIcon fontSize="small" color="primary" /> 
          : <InsertDriveFileIcon fontSize="small" sx={{ color: theme.palette.text.secondary }} />
        }
      </ListItemIcon>
      <ListItemText
        primary={
          <Typography variant="body2" sx={{ color: getNodeColor(item.status), fontWeight: item.type === 'directory' ? 'bold' : 'normal' }}>
            {item.name}
          </Typography>
        }
        secondary={
          item.type === 'file' && !isSmallScreen && (
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              Last updated: {getTimeAgo(item.modifiedAt)} ({formatFileSize(item.size)})
            </Typography>
          )
        }
        sx={{ my: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 1 }}
      />
      <ListItemSecondaryAction sx={{ zIndex: 1 }}>
        {isProcessing ? (
          <CircularProgress size={20} />
        ) : (
          <>
            {item.type === 'file' && (
              <IconButton
                edge="end"
                aria-label="view details"
                onClick={() => onDetails(item)}
                size="small"
                sx={{ color: theme.palette.primary.main }}
              >
                <InfoIcon fontSize="small" />
              </IconButton>
            )}
            {item.type === 'directory' && (
              <IconButton
                edge="end"
                aria-label={expanded ? 'collapse' : 'expand'}
                onClick={() => onToggle(item.id)}
                size="small"
              >
                {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
              </IconButton>
            )}
            <IconButton
              edge="end"
              aria-label="refresh"
              onClick={() => onRefresh(item.id, item.type === 'directory')}
              size="small"
              sx={{ color: theme.palette.info.main }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
            <IconButton
              edge="end"
              aria-label="delete"
              onClick={() => onDelete(item.id, item.type === 'directory')}
              size="small"
              sx={{ color: theme.palette.error.main }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </>
        )}
      </ListItemSecondaryAction>
    </ListItem>
  );
};

const RepositoryUpload = ({ setIsLoading, setNotify, setDebugMessage }) => {
  const [fileTree, setFileTree] = useState(null);
  const [processingNodes, setProcessingNodes] = useState(new Set());
  const [selectedFile, setSelectedFile] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const theme = useTheme();

  useEffect(() => {
    fetchFileTree();
  }, []);

  const expandAllNodes = (node) => {
    let allNodeIds = new Set();
    const traverseTree = (node) => {
      if (node.type === 'directory') {
        allNodeIds.add(node.id);
        if (node.children) {
          node.children.forEach(traverseTree);
        }
      }
    };
    traverseTree(node);
    return allNodeIds;
  };

  const fetchFileTree = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/repository/files');
      setFileTree(response.data.fileTree);
      setExpandedNodes(expandAllNodes(response.data.fileTree));
    } catch (error) {
      console.error('Error fetching file tree:', error);
      setNotify('Error fetching file tree');
      setDebugMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileAction = async (action, nodePath, isFolder) => {
    setProcessingNodes(prev => new Set(prev).add(nodePath));
    try {
      let endpoint = isFolder ? `/api/repository/folder/${action}` : `/api/repository/file/${action}`;
      await axios.post(endpoint, { [isFolder ? 'folderPath' : 'filePath']: nodePath });
      setNotify(`${isFolder ? 'Folder' : 'File'} ${action} successful`);
      fetchFileTree();
    } catch (error) {
      console.error(`Error during ${isFolder ? 'folder' : 'file'} ${action}:`, error);
      setNotify(`Error during ${isFolder ? 'folder' : 'file'} ${action}`);
      setDebugMessage(error.message);
    } finally {
      setProcessingNodes(prev => {
        const newSet = new Set(prev);
        newSet.delete(nodePath);
        return newSet;
      });
    }
  };

  const handleFileDetails = async (item) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/repository/file/mermaid/${encodeURIComponent(item.id)}`);
      const mermaidDiagram = response.data.mermaidDiagram || 'Mermaid diagram not found';

      // Fetch file details including documentation
      const fileDetailsResponse = await axios.get(`/api/repository/file/${encodeURIComponent(item.id)}`);
      const fileDetails = fileDetailsResponse.data;

      setSelectedFile({
        title: item.name,
        filePath: item.id,
        fileSize: formatFileSize(item.size),
        lastUpdated: getTimeAgo(item.modifiedAt),
        documentation: fileDetails.documentation || 'No documentation available.',
        mermaidDiagram: mermaidDiagram,
      });

      setModalOpen(true);
    } catch (error) {
      console.error('Error fetching file details:', error);
      setNotify('Error fetching file details');
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedFile(null);
  };

  const toggleNodeExpansion = (nodeId) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const renderFileTree = (node, level = 0) => {
    return (
      <React.Fragment key={node.id}>
        <FileTreeNode
          item={node}
          level={level}
          onRefresh={(id, isFolder) => handleFileAction('refresh', id, isFolder)}
          onDelete={(id, isFolder) => handleFileAction('delete', id, isFolder)}
          processingNodes={processingNodes}
          onDetails={handleFileDetails}
          expanded={expandedNodes.has(node.id)}
          onToggle={toggleNodeExpansion}
        />
        {node.children && expandedNodes.has(node.id) && (
          <Collapse in={expandedNodes.has(node.id)} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {node.children.map(child => renderFileTree(child, level + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', overflowX: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h2">Repository Files</Typography>
        <IconButton onClick={fetchFileTree} color="primary">
          <RefreshIcon />
        </IconButton>
      </Box>

      {fileTree ? (
        <List dense sx={{ bgcolor: theme.palette.background.paper, borderRadius: 1, boxShadow: 1 }}>
          {renderFileTree(fileTree)}
        </List>
      ) : (
        <Typography variant="body2">No files found or still loading...</Typography>
      )}

      <FileDetailModal
        open={isModalOpen}
        onClose={closeModal}
        fileDetails={selectedFile}
      />
    </Box>
  );
};

export default RepositoryUpload;