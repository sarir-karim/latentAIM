// File: ./client/src/pages/FilterPage.jsx

import React from 'react';
import CloudFuzzyFilter from '../components/CloudFuzzyFilter/CloudFuzzyFilter';

const FilterPage = ({ setNotify }) => {
  return (
    <CloudFuzzyFilter setNotify={setNotify} />
  );
};

export default FilterPage;