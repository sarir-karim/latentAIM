// File: ./client/src/components/FilterBubbles.jsx

import React from 'react';
import { Box, Chip } from '@mui/material';

const FilterBubbles = ({ filters, selectedFilters, onFilterSelect }) => {
  return (
    <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {filters.map((filter) => (
        <Chip
          key={filter.name}
          label={`${filter.name} (${filter.count})`}
          onClick={() => onFilterSelect(filter)}
          color={selectedFilters.includes(filter) ? "primary" : "default"}
          variant={selectedFilters.includes(filter) ? "filled" : "outlined"}
          sx={{ 
            '&:hover': { 
              backgroundColor: (theme) => selectedFilters.includes(filter) 
                ? theme.palette.primary.dark 
                : theme.palette.action.hover 
            } 
          }}
        />
      ))}
    </Box>
  );
};

export default FilterBubbles;