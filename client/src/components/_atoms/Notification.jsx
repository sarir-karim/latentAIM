// File: ./client/src/components/Notification.jsx

import React, { useEffect } from "react";
import { Snackbar, Alert } from "@mui/material";

const Notification = ({ message, clearMessage, duration = 3000 }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        clearMessage();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, clearMessage, duration]);

  return (
    <Snackbar
      open={Boolean(message)}
      autoHideDuration={duration}
      onClose={clearMessage}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert
        onClose={clearMessage}
        severity={message.toLowerCase().includes("error") ? "error" : "success"}
        sx={{ width: "100%" }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Notification;
