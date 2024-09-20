import React from 'react';
import { Box, Typography, Chip } from '@mui/material';

const TagSelector = ({ availableTags, selectedTags, onTagToggle, editable = false }) => {
  const renderTags = (tagType) => (
    <Box sx={{ mt: 2, mb: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        {tagType === 'TopicTag' ? 'Topic Tags:' : 'Tags:'}
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {availableTags
          .filter(tag => tag.tagType === tagType)
          .map(tag => (
            <Chip
              key={`${tag.tagType}:${tag.name}`}
              label={tag.name}
              onClick={() => editable && onTagToggle(tag.tagType, tag.name)}
              color={selectedTags.some(t => t.tagType === tag.tagType && t.name === tag.name) ? 'primary' : 'default'}
              size="small"
              sx={{
                borderRadius: '4px',
                fontSize: '0.75rem',
                height: '24px',
                '& .MuiChip-label': {
                  padding: '0 8px',
                },
                cursor: editable ? 'pointer' : 'default',
              }}
            />
          ))}
      </Box>
    </Box>
  );

  return (
    <Box>
      {renderTags('Tag')}
      {renderTags('TopicTag')}
    </Box>
  );
};

export default TagSelector;