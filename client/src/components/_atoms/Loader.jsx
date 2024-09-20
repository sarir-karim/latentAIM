// File: ./client/src/components/Loader.jsx

import React from "react";
import { CircularProgress, Backdrop } from "@mui/material";

const Loader = ({ isLoading }) => {
  return (
    <Backdrop
      sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
      open={isLoading}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  );
};

export default Loader;
