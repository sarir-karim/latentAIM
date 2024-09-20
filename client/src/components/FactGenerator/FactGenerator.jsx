import React from 'react';
import InputForm from "../_molecules/InputForm";
import FactReviewModal from "../_organisms/FactReviewModal";
import FactDisplay from "../_organisms/FactDisplay";
import DataLoader from "./DataLoader";

const FactGenerator = ({
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
}) => {
  const handleInputSubmit = (text) => {
    if (text && typeof text === 'string' && text.trim()) {
      handleSubmit(text);
      setInputText('');
    }
  };

  return (
    <>
      <DataLoader
        setDistinctFacts={setDistinctFacts}
        setIsLoading={setIsLoading}
        setDebugMessage={setDebugMessage}
      />
      <InputForm
        onSubmit={handleInputSubmit}
        value={inputText || ''}
        onChange={setInputText}
      />
      {showFactReview && (
        <FactReviewModal
          sustained={factsToReview.sustained || []}
          newFacts={factsToReview.new || []}
          conflicts={factsToReview.conflicts || []}
          onComplete={handleFactReviewComplete}
        />
      )}
      {!isLoading && !showFactReview && (
        <FactDisplay facts={distinctFacts || ''} />
      )}
    </>
  );
};

export default FactGenerator;