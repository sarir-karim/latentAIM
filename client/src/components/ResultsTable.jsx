// File: ./client/src/components/ResultsTable.jsx

import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Typography 
} from '@mui/material';

const ResultsTable = ({ nodes }) => {
  if (nodes.length === 0) {
    return <Typography>No results found.</Typography>;
  }

  return (
    <TableContainer component={Paper}>
      <Table aria-label="results table">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Type</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {nodes.map((node, index) => (
            <TableRow key={index}>
              <TableCell>{node.name || 'unk'}</TableCell>
              <TableCell>{node.type || 'unk'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ResultsTable;