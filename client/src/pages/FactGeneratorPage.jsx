import React, { useState } from 'react';
import FactGenerator from '../components/FactGenerator/FactGenerator';
import useFactService from '../hooks/useFactService';

const FactGeneratorPage = () => {
  const [inputText, setInputText] = useState('');
  const {
    distinctFacts,
    setDistinctFacts,
    isLoading,
    setIsLoading,
    showFactReview,
    factsToReview,
    handleSubmit,
    handleFactReviewComplete,
    setDebugMessage,
  } = useFactService();

  const handleInputSubmit = (text) => {
    if (text && typeof text === 'string' && text.trim()) {
      handleSubmit(text);
      setInputText('');
    }
  };

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
      handleSubmit={handleInputSubmit}
      handleFactReviewComplete={handleFactReviewComplete}
      setDebugMessage={setDebugMessage}
    />
  );
};

export default FactGeneratorPage;