// File: server/routes/index.js

import express from "express";
import FactController from "../controllers/FactController.js";
import DocumentationController from "../controllers/DocumentationController.js";
import RepositoryController from "../controllers/RepositoryController.js";
import DocBuilderController from "../controllers/DocBuilderController.js";
import SchemaController from "../controllers/SchemaController.js";
import DocumentController from "../controllers/DocumentController.js";
import ApiCallController from "../controllers/ApiCallController.js";
import DatabaseUtilityController from "../controllers/DatabaseUtilityController.js";

const router = express.Router();

// API call records route
router.get("/api-calls", ApiCallController.getApiCalls);

// Database Utility routes (updated)
router.get("/database-utility/filters", DatabaseUtilityController.getFilterBubbles);
router.post("/database-utility/apply-filters", DatabaseUtilityController.applyFilters);
router.get("/database-utility/tags", DatabaseUtilityController.getTags); 

// Fact routes
router.get("/facts", FactController.getFacts);
router.post("/facts", FactController.processFacts);
router.post("/facts/finalize", FactController.finalizeReviewedFacts);

// Claude API routes
router.post("/claude/extract-facts", FactController.extractFacts);
router.post("/claude/reconcile-facts", FactController.reconcileFacts);
router.post("/claude/organize-facts", FactController.organizeFacts);

// Repository routes
router.get("/repository/files", RepositoryController.getRepositoryFiles);
router.post("/repository/file/refresh", RepositoryController.refreshFile);
router.post("/repository/file/delete", RepositoryController.deleteFile);
router.post("/repository/folder/refresh", RepositoryController.refreshFolder);
router.post("/repository/folder/delete", RepositoryController.deleteFolder);
router.get("/repository/file/mermaid/:filePath", RepositoryController.generateMermaidDiagram);
router.get("/repository/file/:filePath", RepositoryController.getFileDetails);

// Documentation routes
router.get("/documentation", DocumentationController.getDocumentation);
router.post("/documentation/refresh", DocumentationController.refreshDocumentation);

// Document routes
router.get("/documents", DocumentController.getDocuments);
router.get("/documents/:id", DocumentController.getDocument);
router.put("/documents/:id", DocumentController.updateDocument);
router.post("/documents", DocumentController.createDocument);
router.delete("/documents/:id", DocumentController.deleteDocument);


// DocBuilder routes
router.get("/documents", DocBuilderController.getDocument);
router.post("/documents/section", DocBuilderController.updateSection);

// Schema route
router.get("/schema", SchemaController.getSchema);


export default router;