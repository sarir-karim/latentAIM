// File: ./client/src/components/SchemaViewer.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Collapse,
  List,
  ListItem,
  ListItemText,
  Chip,
  styled,
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import axios from "axios";

const CountChip = styled(Chip)(({ theme }) => ({
  position: 'absolute',
  top: 8,
  right: 8,
  backgroundColor: theme.palette.grey[300],
  color: theme.palette.text.secondary,
}));

const SchemaViewer = ({ setNotify }) => {
  const [schema, setSchema] = useState(null);
  const [error, setError] = useState(null);
  const [expandedCards, setExpandedCards] = useState({});

  useEffect(() => {
    fetchSchema();
  }, []);

  const fetchSchema = async () => {
    try {
      const response = await axios.get("/api/schema");
      setSchema(processSchema(response.data));
      setError(null);
    } catch (error) {
      setError("Error fetching schema. Please try again.");
      setNotify("Error fetching schema. Please try again.");
      console.error("Error fetching schema:", error);
    }
  };

  const processSchema = (rawSchema) => {
    const nodes = {};
    const relationships = {};

    rawSchema.nodes.forEach((node) => {
      node.labels.forEach((label) => {
        if (!nodes[label]) {
          nodes[label] = { count: 0, properties: new Set() };
        }
        nodes[label].count++;
        node.properties.forEach((prop) => nodes[label].properties.add(prop));
      });
    });

    rawSchema.relationships.forEach((rel) => {
      if (!relationships[rel.type]) {
        relationships[rel.type] = { count: 0, properties: new Set() };
      }
      relationships[rel.type].count++;
      rel.properties.forEach((prop) => relationships[rel.type].properties.add(prop));
    });

    return { nodes, relationships };
  };

  const toggleCard = (id) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderCard = (title, count, properties, id) => (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <CardActionArea onClick={() => toggleCard(id)}>
        <CardContent>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
          <CountChip label={count} size="small" />
          {expandedCards[id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </CardContent>
      </CardActionArea>
      <Collapse in={expandedCards[id]} timeout="auto" unmountOnExit>
        <List dense>
          {Array.from(properties).sort().map((prop) => (
            <ListItem key={prop}>
              <ListItemText primary={prop} />
            </ListItem>
          ))}
        </List>
      </Collapse>
    </Card>
  );

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (!schema) {
    return <Typography>Loading schema...</Typography>;
  }

  // Arrange nodes based on their relevance (this is a simple example, you may need to adjust this logic)
  const arrangedNodes = Object.entries(schema.nodes).sort((a, b) => b[1].count - a[1].count);

  return (
    <Box sx={{ width: "100%", maxWidth: 1200, mx: "auto", mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Database Schema
      </Typography>

      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Nodes
      </Typography>
      <Grid container spacing={2}>
        {arrangedNodes.map(([label, info]) => (
          <Grid item xs={12} sm={6} md={4} key={label}>
            {renderCard(label, info.count, info.properties, `node-${label}`)}
          </Grid>
        ))}
      </Grid>

      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Relationships
      </Typography>
      <Grid container spacing={2}>
        {Object.entries(schema.relationships).map(([type, info]) => (
          <Grid item xs={12} sm={6} md={4} key={type}>
            {renderCard(type, info.count, info.properties, `rel-${type}`)}
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default SchemaViewer;