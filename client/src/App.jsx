// File: client/src/App.jsx

import React, { useState, useMemo } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Box, CssBaseline } from "@mui/material";
import Notification from "./components/_atoms/Notification";
import Loader from "./components/_atoms/Loader";
import Layout from "./components/Layouts/Layout";
import FactGeneratorPage from "./pages/FactGeneratorPage";
import DocumentationPage from "./pages/DocumentationPage";
import RepositoryUploadPage from "./pages/RepositoryUploadPage";
import DocBuilderPage from "./pages/DocBuilderPage";
import DatabaseSchemaPage from "./pages/DatabaseSchemaPage";
import DatabaseUtilityPage from "./pages/DatabaseUtilityPage";
import InboxPage from "./pages/InboxPage";
import FilePage from "./pages/FilePage";
import FilesPage from "./pages/FilesPage";
import useFactService from "./hooks/useFactService";
import getTheme from "./theme";

import "./App.css";
import ArtifactPage from "./pages/Artifact";
import ArtifactsPage from "./pages/Artifacts";

function App() {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('lastMode') || 'light';
  });
  const theme = useMemo(() => getTheme(mode), [mode]);
  const {
    isLoading,
    notify,
    debugMessage,
    setDebugMessage,
    setNotify,
    setIsLoading
  } = useFactService();

  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('lastMode', newMode);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout toggleTheme={toggleTheme} mode={mode}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              maxWidth: "1200px",
              margin: "0 auto",
            }}
          >
            <Routes>
              <Route path="/" element={<FactGeneratorPage />} />
              <Route path="/files" element={<FilesPage />} />
               <Route path="/artifact" element={<ArtifactsPage />} />
               <Route path="/artifact/:id" element={<ArtifactPage />} />
              <Route path="/documentation" element={<DocumentationPage setNotify={setNotify} />} />
              <Route 
                path="/repository-upload" 
                element={
                  <RepositoryUploadPage 
                    setIsLoading={setIsLoading} 
                    setNotify={setNotify} 
                    setDebugMessage={setDebugMessage} 
                  />
                } 
              />
              <Route path="/doc-builder" element={<DocBuilderPage setNotify={setNotify} />} />
              <Route path="/database-schema" element={<DatabaseSchemaPage setNotify={setNotify} />} />
              <Route path="/database-utility" element={<DatabaseUtilityPage setNotify={setNotify} />} />
              <Route path="/inbox" element={<InboxPage />} />
              <Route path="/file/:name" element={<FilePage />} />
            </Routes>
            <Loader isLoading={isLoading} />
            <Notification
              message={notify || debugMessage}
              clearMessage={() => setDebugMessage("")}
            />
          </Box>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;