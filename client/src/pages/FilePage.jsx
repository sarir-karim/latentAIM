import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, InsertDriveFile as FileIcon } from '@mui/icons-material';
import MermaidDiagram from '../components/_atoms/MermaidDiagram';

const FilePage = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const [fileDetails, setFileDetails] = useState(null);
  const [relatedFiles, setRelatedFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFileDetails();
  }, [name]);

  const fetchFileDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/repository/file/${encodeURIComponent(name)}`);
      setFileDetails(response.data.documentation);
      setRelatedFiles(response.data.relatedFiles || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching file details:', error);
      setError('Failed to load file details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateObj) => {
    if (!dateObj || !dateObj.year) return 'N/A';
    const { year, month, day, hour, minute, second } = dateObj;
    const date = new Date(year.low, month.low - 1, day.low, hour.low, minute.low, second.low);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, maxWidth: 800, margin: '0', width:'100%' }}>
        <Typography color="error">{error}</Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 3 }}>
        Back
      </Button>

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        <Paper elevation={3} sx={{ p: 3, flexGrow: 1, minWidth: '60%' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {fileDetails?.file_name || 'File Details'}
          </Typography>

          <Typography variant="body1" paragraph>
            <strong>Path:</strong> {fileDetails?.file_path}
          </Typography>

          <Typography variant="body1" paragraph>
            <strong>Size:</strong> {fileDetails?.file_size} bytes
          </Typography>

          <Typography variant="body1" paragraph>
            <strong>Last Modified:</strong> {formatDate(fileDetails?.modified_at)}
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            Documentation
          </Typography>
          <Typography variant="body1" paragraph>
            {fileDetails?.documentation || 'No documentation available.'}
          </Typography>

          {fileDetails?.mermaid_diagram && (
            <>
              <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                Mermaid Diagram
              </Typography>
              <Box sx={{ mt: 2, mb: 2, maxWidth: '100%', overflow: 'auto' }}>
                <MermaidDiagram diagram={fileDetails.mermaid_diagram} />
              </Box>
            </>
          )}
        </Paper>

        {relatedFiles.length > 0 && (
          <Card sx={{ maxWidth: "1200px", width:'100%', alignSelf: 'flex-start' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Related Files
              </Typography>
              <List>
                {relatedFiles.map((file, index) => (
                  <React.Fragment key={file.file_path}>
                    {index > 0 && <Divider />}
                    <ListItem 
                      button 
                      component={Link} 
                      to={`/file/${encodeURIComponent(file.file_path)}`}
                      sx={{ py: 1 }}
                    >
                      <ListItemIcon>
                        <FileIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary={file.file_name} 
                        secondary={file.file_path.split('/').slice(-2).join('/')}
                        primaryTypographyProps={{ variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default FilePage;