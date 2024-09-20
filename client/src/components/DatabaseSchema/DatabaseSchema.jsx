import React from 'react';
import SchemaViewer from './SchemaViewer';

const DatabaseSchema = ({ setNotify }) => {
  return <SchemaViewer setNotify={setNotify} />;
};

export default DatabaseSchema;