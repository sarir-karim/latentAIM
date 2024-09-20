import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const MiniSidebar = ({ items = [], onItemSelect, onItemAdd, onItemDelete, selectedItem }) => {
  const [newItemDialogOpen, setNewItemDialogOpen] = useState(false);
  const [deleteConfirmDialogOpen, setDeleteConfirmDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [newItemName, setNewItemName] = useState('');

  const handleNewItemClick = () => {
    setNewItemDialogOpen(true);
  };

  const handleNewItemClose = () => {
    setNewItemDialogOpen(false);
    setNewItemName('');
  };

  const handleNewItemSubmit = () => {
    if (newItemName.trim()) {
      onItemAdd(newItemName.trim());
      handleNewItemClose();
    }
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setDeleteConfirmDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      onItemDelete(itemToDelete);
      setDeleteConfirmDialogOpen(false);
      setItemToDelete(null);
    }
  };

  return (
    <Box sx={{ width: 250, borderRight: 1, borderColor: 'divider', overflowY: 'auto' }}>
      <Button
        startIcon={<AddIcon />}
        onClick={handleNewItemClick}
        fullWidth
        sx={{ my: 1 }}
      >
        New Item
      </Button>
      <List>
        {Array.isArray(items) && items.map((item) => (
          <ListItem
            key={item.id}
            selected={selectedItem && selectedItem.id === item.id}
            secondaryAction={
              <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteClick(item)}>
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText
              primary={item.title}
              onClick={() => onItemSelect(item)}
              sx={{ cursor: 'pointer' }}
            />
          </ListItem>
        ))}
      </List>
  
      {/* Dialog components... */}
    </Box>
  );
};
  
export default MiniSidebar;