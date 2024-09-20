import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Box,
  Divider,
  Fab,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import FactItem from "../_molecules/FactItem";

const buttonStyles = {
  height: "32px",
  fontSize: "0.8rem",
  padding: "0 8px",
};

const iconStyles = {
  fontSize: "1.2rem",
};

function FactReviewModal({ sustained, newFacts, conflicts, onComplete }) {
  const [reviewedFacts, setReviewedFacts] = useState({});

  useEffect(() => {
    const initialReview = {};
    [...newFacts, ...conflicts].forEach((fact) => {
      initialReview[fact.id] = null;
    });
    setReviewedFacts(initialReview);
  }, [newFacts, conflicts]);

  const handleFactReview = (id, isAccepted) => {
    setReviewedFacts((prev) => ({ ...prev, [id]: isAccepted }));
  };

  const handleBulkAction = (factType, isAccepted) => {
    setReviewedFacts((prev) => {
      const updated = { ...prev };
      if (factType === "new") {
        newFacts.forEach((fact) => {
          updated[fact.id] = isAccepted;
        });
      } else if (factType === "conflicts") {
        conflicts.forEach((conflict) => {
          updated[conflict.id] = isAccepted;
        });
      }
      return updated;
    });
  };

  const handleSubmit = () => {
    const finalReview = {
      sustained: sustained,
      new: newFacts.map((fact) => ({
        ...fact,
        accepted: reviewedFacts[fact.id],
      })),
      conflicts: conflicts.map((conflict) => ({
        ...conflict,
        accepted: reviewedFacts[conflict.id],
      })),
    };
    onComplete(finalReview);
  };

  const renderBulkActionButtons = (factType) => (
    <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2, gap: 1 }}>
      <Fab
        variant="extended"
        size="small"
        color="error"
        onClick={() => handleBulkAction(factType, false)}
        sx={{ ...buttonStyles, minWidth: "110px" }}
      >
        <CancelIcon sx={{ ...iconStyles, mr: 1 }} />
        Decline All
      </Fab>
      <Fab
        variant="extended"
        size="small"
        color="success"
        onClick={() => handleBulkAction(factType, true)}
        sx={{ ...buttonStyles, minWidth: "110px" }}
      >
        <CheckCircleIcon sx={{ ...iconStyles, mr: 1 }} />
        Accept All
      </Fab>
    </Box>
  );

  return (
    <Box className="fact-review-modal" sx={{ "& *": { fontSize: "0.9rem" } }}>
      <Typography variant="h6" sx={{ mb: 2, fontSize: "1.1rem" }}>
        Review New Facts
      </Typography>

      {newFacts.length > 0 && (
        <Card sx={{ mb: 2, bgcolor: "grey.50" }}>
          <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              New Entries:
            </Typography>
            <Divider sx={{ my: 1 }} />
            {newFacts.map((fact) => (
              <FactItem
                key={fact.id}
                fact={fact}
                type="new"
                onReview={handleFactReview}
                reviewedStatus={reviewedFacts[fact.id]}
                buttonStyles={buttonStyles}
                iconStyles={iconStyles}
              />
            ))}
            {renderBulkActionButtons("new")}
          </CardContent>
        </Card>
      )}

      {conflicts.length > 0 && (
        <Card sx={{ mb: 2, bgcolor: "grey.50" }}>
          <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Conflicts:
            </Typography>
            <Divider sx={{ my: 1 }} />
            {conflicts.map((conflict) => (
              <FactItem
                key={conflict.id}
                fact={conflict}
                type="conflict"
                onReview={handleFactReview}
                reviewedStatus={reviewedFacts[conflict.id]}
                buttonStyles={buttonStyles}
                iconStyles={iconStyles}
              />
            ))}
            {renderBulkActionButtons("conflicts")}
          </CardContent>
        </Card>
      )}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 1,
        }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: "0.8rem" }}
        >
          {sustained.length} fact(s) unchanged
        </Typography>
        <IconButton
          onClick={handleSubmit}
          disabled={Object.values(reviewedFacts).some(
            (value) => value === null,
          )}
          color="primary"
          sx={{
            ...buttonStyles,
            bgcolor: "primary.main",
            color: "white",
            "&:hover": { bgcolor: "primary.dark" },
            "&:disabled": { bgcolor: "grey.300", color: "grey.500" },
          }}
        >
          <CheckCircleIcon sx={iconStyles} />
        </IconButton>
      </Box>
    </Box>
  );
}

export default FactReviewModal;
