import React from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  boxShadow: 'none',
  position: 'sticky',
  top: 0,
  zIndex: theme.zIndex.drawer + 1,
}));

const BrandTypography = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  letterSpacing: '0.1em',
  color: theme.palette.common.white,
  flexGrow: 1,
}));

const AppHeader = () => {
  return (
    <StyledAppBar>
      <Toolbar>
        <BrandTypography variant="h6" component="div">
          LATENT KNOWLEDGEBASE
        </BrandTypography>
      </Toolbar>
    </StyledAppBar>
  );
};

export default AppHeader;