import { useState } from "react";
import axios from "axios";
import logger from "../../../shared/logger.js";

const useFactService = () => {
  const [state, setState] = useState({
    distinctFacts: "",
    isLoading: false,
    notify: "",
    debugMessage: "",
    showFactReview: false,
    factsToReview: { sustained: [], new: [], conflicts: [] },
  });

  const setDistinctFacts = (facts) => {
    logger.data("useFactService: Setting distinctFacts", facts);
    setState((prev) => ({ ...prev, distinctFacts: facts || "" }));
  };

  const setIsLoading = (isLoading) => {
    logger.info(`useFactService: Setting isLoading to ${isLoading}`);
    setState((prev) => ({ ...prev, isLoading }));
  };

  const setDebugMessage = (message) => {
    logger.debug(`useFactService: Setting debug message: ${message}`);
    setState((prev) => ({ ...prev, debugMessage: message }));
  };

  const handleSubmit = async (input) => {
    setState((prev) => ({
      ...prev,
      isLoading: true,
      notify: "Processing facts...",
    }));
    try {
      logger.info(`API Request: POST /api/facts, Input: ${input}`);
      const { data } = await axios.post("/api/facts", { input });
      logger.info(
        `API Response: POST /api/facts, Data: ${JSON.stringify(data)}`,
      );

      setState((prev) => ({
        ...prev,
        factsToReview: data.result,
        showFactReview: true,
        isLoading: false,
        notify: "",
      }));
    } catch (error) {
      logger.error(`Error in handleSubmit: ${error.message}`);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        notify: "Error processing facts. Please try again.",
        debugMessage: error.message,
      }));
    }
  };

  const handleFactReviewComplete = async (reviewedFacts) => {
    setState((prev) => ({
      ...prev,
      isLoading: true,
      notify: "Updating facts...",
      showFactReview: false,
    }));

    try {
      logger.info(
        `API Request: POST /api/facts/finalize, ReviewedFacts: ${JSON.stringify(reviewedFacts)}`,
      );
      const { data } = await axios.post("/api/facts/finalize", {
        reviewedFacts,
      });
      logger.info(
        `API Response: POST /api/facts/finalize, Data: ${JSON.stringify(data)}`,
      );

      setState((prev) => ({
        ...prev,
        distinctFacts: data.facts,
        isLoading: false,
        notify: "Facts updated successfully!",
      }));

      setTimeout(() => setState((prev) => ({ ...prev, notify: "" })), 3000);
    } catch (error) {
      logger.error(`Error in handleFactReviewComplete: ${error.message}`);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        notify: "Error updating facts. Please try again.",
        debugMessage: error.message,
      }));
    }
  };

  return {
    ...state,
    setDistinctFacts,
    setIsLoading,
    setDebugMessage,
    setNotify: (message) => setState((prev) => ({ ...prev, notify: message })),
    handleSubmit,
    handleFactReviewComplete,
  };
};

export default useFactService;
