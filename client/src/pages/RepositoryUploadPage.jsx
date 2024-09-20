import React from 'react';
import RepositoryUpload from '../components/RepositoryUpload/RepositoryUpload';

const RepositoryUploadPage = ({ setIsLoading, setNotify, setDebugMessage }) => {
  return (
    <RepositoryUpload
      setIsLoading={setIsLoading}
      setNotify={setNotify}
      setDebugMessage={setDebugMessage}
    />
  );
};

export default RepositoryUploadPage;