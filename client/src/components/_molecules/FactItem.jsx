import React from "react";
import { Typography, IconButton, Box, Fab } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

function FactItem({
  fact,
  type,
  onReview,
  reviewedStatus,
  buttonStyles,
  iconStyles,
}) {
  const renderFactButtons = () => (
    <Box sx={{ display: "flex", gap: 1, ml: 1, alignItems: "center" }}>
      <IconButton
        size="small"
        onClick={() => onReview(fact.id, false)}
        sx={{
          ...buttonStyles,
          color: reviewedStatus === false ? "error.main" : "action.disabled",
          opacity: reviewedStatus === false ? 1 : 0.5,
          "&:hover": { color: "error.dark", opacity: 1 },
        }}
      >
        <CancelIcon sx={iconStyles} />
      </IconButton>
      <IconButton
        size="small"
        onClick={() => onReview(fact.id, true)}
        sx={{
          ...buttonStyles,
          color: reviewedStatus === true ? "success.main" : "action.disabled",
          opacity: reviewedStatus === true ? 1 : 0.5,
          "&:hover": { color: "success.dark", opacity: 1 },
        }}
      >
        <CheckCircleIcon sx={iconStyles} />
      </IconButton>
    </Box>
  );

  return (
    <Box sx={{ mb: 1.5, display: "flex", alignItems: "center" }}>
      <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
        {type === "conflict" ? (
          <>
            <Typography
              variant="body2"
              sx={{ flex: 1, textAlign: "right", pr: 1 }}
            >
              <span style={{ textDecoration: "line-through" }}>
                {fact.oldFact}
              </span>
            </Typography>
            <ArrowForwardIcon fontSize="small" sx={{ flexShrink: 0 }} />
            <Typography variant="body2" sx={{ flex: 1, pl: 1 }}>
              {fact.newFact}
            </Typography>
          </>
        ) : (
          <Typography variant="body2">{fact.fact}</Typography>
        )}
      </Box>
      {renderFactButtons()}
    </Box>
  );
}

export default FactItem;
