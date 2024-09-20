import React, { useEffect, useRef } from "react";
import axios from "axios";
import logger from "../../../../shared/logger.js";

const DataLoader = ({ setDistinctFacts, setIsLoading, setDebugMessage }) => {
  const hasFetchedData = useRef(false);

  useEffect(() => {
    const loadData = async () => {
      if (hasFetchedData.current) return;
      hasFetchedData.current = true;

      try {
        setIsLoading(true);
        setDebugMessage("Loading facts...");
        logger.info("DataLoader: Starting to fetch facts");

        logger.info("API Request: GET /api/facts");
        const { data } = await axios.get("/api/facts");
        logger.info(
          `API Response: GET /api/facts, Data: ${JSON.stringify(data)}`,
        );

        logger.data("DataLoader: Fetched facts", data.facts);

        setDistinctFacts(data.facts);

        logger.success("DataLoader: Facts loaded successfully");
        setDebugMessage("Facts loaded successfully");
      } catch (error) {
        logger.error(`DataLoader: Error in loadData: ${error.message}`);
        setDebugMessage(`Error: ${error.message}`);
        console.error("Full error details:", error);
      } finally {
        setIsLoading(false);
        logger.info("DataLoader: Loading state set to false");
      }
    };

    loadData();
  }, [setDistinctFacts, setDebugMessage, setIsLoading]);

  return null;
};

export default DataLoader;
