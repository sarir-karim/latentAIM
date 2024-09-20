// File: ./client/src/components/MainContent.jsx

import React, { lazy, Suspense } from 'react';
import { CircularProgress } from "@mui/material";
import FactGenerator from "./FactGenerator/FactGenerator";
import DocBuilder from "./DocBuilder/DocBuilder";
import DatabaseSchema from "./DatabaseSchema/DatabaseSchema";
import Documentation from "./Documentation/Documentation";
import Inbox from "./Inbox/Inbox";

const RepositoryUpload = lazy(() => import("./RepositoryUpload/RepositoryUpload"));

const MainContent = ({
  activeItem,
  inputText,
  setInputText,
  distinctFacts,
  setDistinctFacts,
  isLoading,
  setIsLoading,
  showFactReview,
  factsToReview,
  handleSubmit,
  handleFactReviewComplete,
  setDebugMessage,
  setNotify
}) => {
  const renderContent = () => {
    switch (activeItem) {
      case "Fact Generator":
        return (
          <FactGenerator
            inputText={inputText}
            setInputText={setInputText}
            distinctFacts={distinctFacts}
            setDistinctFacts={setDistinctFacts}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            showFactReview={showFactReview}
            factsToReview={factsToReview}
            handleSubmit={handleSubmit}
            handleFactReviewComplete={handleFactReviewComplete}
            setDebugMessage={setDebugMessage}
          />
        );
      case "Repository Upload":
        return (
          <Suspense fallback={<CircularProgress />}>
            <RepositoryUpload
              setIsLoading={setIsLoading}
              setNotify={setNotify}
              setDebugMessage={setDebugMessage}
            />
          </Suspense>
        );
      case "Documentation":
        return <Documentation setNotify={setNotify} />;
      case "DocBuilder":
        return <DocBuilder setNotify={setNotify} />;
      case "Database Schema":
        return <DatabaseSchema setNotify={setNotify} />;
      case "Inbox":
        return <Inbox />;
      default:
        return <div>Select an item from the sidebar</div>;
    }
  };

  return renderContent();
};

export default MainContent;