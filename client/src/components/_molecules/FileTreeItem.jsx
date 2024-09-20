import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  List,
  IconButton,
} from '@mui/material';
import {
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  InsertDriveFile as FileIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';

const FileTreeItem = ({ item, depth = 0 }) => {
  const [open, setOpen] = useState(false);

  const handleToggle = () => {
    setOpen(!open);
  };

  const isDirectory = item.type === 'directory';

  return (
    <>
      <ListItem
        button
        onClick={isDirectory ? handleToggle : undefined}
        sx={{ pl: 2 * depth }}
      >
        <ListItemIcon>
          {isDirectory ? (
            open ? <FolderOpenIcon /> : <FolderIcon />
          ) : (
            <FileIcon />
          )}
        </ListItemIcon>
        <ListItemText
          primary={
            isDirectory ? (
              item.name
            ) : (
              <Link
                to={`/file/${encodeURIComponent(item.id)}`}
                style={{ textDecoration: 'none', color: 'inherit',width:'100%' }}
              >
                {item.name}
              </Link>
            )
          }
          secondary={
            !isDirectory &&
            `${item.size !== undefined ? `${item.size} bytes` : 'N/A'} | ${
              item.modifiedAt ? new Date(item.modifiedAt).toLocaleString() : 'N/A'
            }`
          }
        />
        {isDirectory && (
          <IconButton edge="end" onClick={handleToggle} size="small">
            {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        )}
      </ListItem>
      {isDirectory && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {item.children.map((childItem) => (
              <FileTreeItem key={childItem.id} item={childItem} depth={depth + 1} />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
};

export default FileTreeItem;