// File: ./client/src/pages/DatabaseUtilityPage.jsx

import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import axios from 'axios';
import FilterBubbles from '../components/FilterBubbles';
import ResultsTable from '../components/ResultsTable';

const DatabaseUtilityPage = ({ setNotify }) => {
  const [filters, setFilters] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetchFilters();
  }, []);

  const fetchFilters = async () => {
    try {
      const response = await axios.get('/api/database-utility/filters');
      setFilters(response.data);
    } catch (error) {
      console.error('Error fetching filters:', error);
      setNotify('Error fetching filters. Please try again.');
    }
  };

  const handleFilterSelect = async (filter) => {
    const updatedFilters = selectedFilters.includes(filter)
      ? selectedFilters.filter(f => f !== filter)
      : [...selectedFilters, filter];

    setSelectedFilters(updatedFilters);

    try {
      const response = await axios.post('/api/database-utility/apply-filters', { filters: updatedFilters });
      setResults(response.data.results);
      setFilters(response.data.updatedFilters);
    } catch (error) {
      console.error('Error applying filters:', error);
      setNotify('Error applying filters. Please try again.');
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Database Explorer
      </Typography>
      <FilterBubbles
        filters={filters}
        selectedFilters={selectedFilters}
        onFilterSelect={handleFilterSelect}
      />
      <ResultsTable nodes={results} />
    </Box>
  );
  };

export default DatabaseUtilityPage;