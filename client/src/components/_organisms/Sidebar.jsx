import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Collapse, 
  Box,
  useTheme
} from '@mui/material';
import { 
  ExpandLess, 
  ExpandMore, 
  Home, 
  Description, 
  MenuBook, 
  Build,
  Inbox,
  CloudUpload,
  Code,
  AccountTree,
  Schema,
  Storage
} from '@mui/icons-material';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';

const MenuItem = ({ item, level, location }) => {
  const [open, setOpen] = useState(true);
  const theme = useTheme();

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <>
      <ListItem 
        button 
        onClick={handleClick}
        sx={{ 
          pl: theme.spacing(2 + 2 * level),
          py: 0.5,
        }}
      >
        <ListItemIcon 
          sx={{ 
            color: theme.palette.text.primary,
            minWidth: 36,
            mr: 1,
          }}
        >
          {React.cloneElement(item.icon, { fontSize: 'small' })}
        </ListItemIcon>
        <ListItemText 
          primary={item.name} 
          primaryTypographyProps={{ variant: 'body2' }}
        />
        {item.subitems && (open ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />)}
      </ListItem>
      {item.subitems && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {item.subitems.map((subitem, index) => (
              subitem.path ? (
                <ListItem
                  button
                  component={Link}
                  to={subitem.path}
                  key={index}
                  sx={{ 
                    pl: theme.spacing(4 + 2 * level),
                    py: 0.5,
                    bgcolor: location.pathname === subitem.path ? theme.palette.action.selected : 'transparent',
                    '&:hover': {
                      bgcolor: theme.palette.action.hover,
                    },
                  }}
                >
                  <ListItemIcon 
                    sx={{ 
                      color: theme.palette.text.primary,
                      minWidth: 36,
                      mr: 1,
                    }}
                  >
                    {React.cloneElement(subitem.icon, { fontSize: 'small' })}
                  </ListItemIcon>
                  <ListItemText 
                    primary={subitem.name} 
                    primaryTypographyProps={{ 
                      variant: 'body2',
                      color: subitem.style?.color || theme.palette.text.primary,
                    }}
                  />
                </ListItem>
              ) : (
                <ListItem
                  button
                  key={index}
                  sx={{ 
                    pl: theme.spacing(4 + 2 * level),
                    py: 0.5,
                    '&:hover': {
                      bgcolor: theme.palette.action.hover,
                    },
                  }}
                  disabled={!subitem.path}
                >
                  <ListItemIcon 
                    sx={{ 
                      color: theme.palette.text.primary,
                      minWidth: 36,
                      mr: 1,
                    }}
                  >
                    {React.cloneElement(subitem.icon, { fontSize: 'small' })}
                  </ListItemIcon>
                  <ListItemText 
                    primary={subitem.name} 
                    primaryTypographyProps={{ 
                      variant: 'body2',
                      color: subitem.style?.color || theme.palette.text.primary,
                    }}
                  />
                </ListItem>
              )
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
};

const Sidebar = ({ open, drawerWidth }) => {
  const location = useLocation();
  const theme = useTheme();

  const menuItems = [
    {
      name: 'Home',
      icon: <Home />,
      subitems: [
        { name: 'Inbox', icon: <Inbox />, path: '/inbox' }
      ]
    },
    {
      name: 'Knowledge Base',
      icon: <MenuBook />,
      subitems: [
        { name: 'Fact Generator', icon: <Description />, path: '/' },
        { name: 'Artifact Builder', icon: <Description />, path: '/doc-builder' }
      ]
    },
    {
      name: 'Wiki',
      icon: <MenuBook />,
      subitems: [
        { name: 'Artifacts', icon: <LibraryBooksIcon /> ,path:'artifact' },
        { name: 'Code Explorer', icon: <Code /> ,path:'files' },
        { name: 'Tree View', icon: <AccountTree /> }
      ]
    },
    {
      name: 'Utilities',
      icon: <Build />,
      subitems: [
        { name: 'Repository Upload', icon: <CloudUpload />, path: '/repository-upload' },
        { name: 'Database Schema', icon: <Schema />, path: '/database-schema' },
        { name: 'Database Utility', icon: <Storage />, path: '/database-utility' }
      ]
    }
  ];

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          bgcolor: 'background.paper',
          borderRight: `1px solid ${theme.palette.divider}`,
          mt: ['48px', '56px', '64px'],
        },
      }}
    >
      <Box sx={{ overflow: 'auto', py: 1 }}>
        <List>
          {menuItems.map((item, index) => (
            <MenuItem key={index} item={item} level={0} location={location} />
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;