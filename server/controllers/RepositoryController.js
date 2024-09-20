// File: ./server/controllers/RepositoryController.js

import RepoFileService from "../services/RepoFileService.js";
import Neo4jRepoFileRepository from "../repositories/Neo4jRepoFileRepository.js";
import logger from "../../shared/logger.js";

class RepositoryController {
  static async getRepositoryFiles(req, res, next) {
    try {
      logger.debug("Getting all repository files");
      const limit = req.params.limit ?? 10;
      const page = req.params.page ?? 1;
      const result = await RepoFileService.getRepositoryFiles(limit,page);
      res.json(result);
    } catch (error) {
      logger.error(`Error getting repository files: ${error.message}`);
      next(error);
    }
  }

  static async refreshFile(req, res, next) {
    try {
      const { filePath } = req.body;
      logger.debug(`Refreshing file: ${filePath}`);
      const result = await RepoFileService.refreshFile(filePath);
      res.json(result);
    } catch (error) {
      logger.error(`Error refreshing file: ${error.message}`);
      next(error);
    }
  }

  static async deleteFile(req, res, next) {
    try {
      const { filePath } = req.body;
      logger.debug(`Deleting file from database: ${filePath}`);
      const result = await RepoFileService.deleteFile(filePath);
      res.json(result);
    } catch (error) {
      logger.error(`Error deleting file from database: ${error.message}`);
      next(error);
    }
  }

  static async refreshFolder(req, res, next) {
    try {
      const { folderPath } = req.body;
      logger.debug(`Refreshing folder: ${folderPath}`);
      const result = await RepoFileService.refreshFolder(folderPath);
      res.json(result);
    } catch (error) {
      logger.error(`Error refreshing folder: ${error.message}`);
      next(error);
    }
  }

  static async deleteFolder(req, res, next) {
    try {
      const { folderPath } = req.body;
      logger.debug(`Deleting folder from database: ${folderPath}`);
      const result = await RepoFileService.deleteFolder(folderPath);
      res.json(result);
    } catch (error) {
      logger.error(`Error deleting folder from database: ${error.message}`);
      next(error);
    }
  }

  static async getFileDetails(req, res, next) {
    try {
      const { filePath } = req.params;
      logger.debug(`Getting file details for: ${filePath}`);
      const file = await Neo4jRepoFileRepository.getFile(filePath);
      if (!file) {
        logger.warn(`File not found: ${filePath}`);
        return res.status(404).json({ error: "File not found" });
      }
      logger.debug(`Successfully retrieved file details for: ${filePath}`);
      res.json({
        documentation: file.documentation,
        relatedFiles:file.relatedFiles
        // Include other file details as needed
      });
    } catch (error) {
      logger.error(`Error getting file details: ${error.message}`);
      next(error);
    }
  }

  static async generateMermaidDiagram(req, res, next) {
    try {
      const { filePath } = req.params;
      logger.debug(`Generating Mermaid diagram for file: ${filePath}`);
      const file = await Neo4jRepoFileRepository.getFile(filePath);
      if (!file) {
        logger.warn(`File not found: ${filePath}`);
        return res.status(404).json({ error: "File not found" });
      }
      if (!file.documentation.mermaid_diagram) {
        logger.warn(`Mermaid diagram not found for file: ${filePath}`);
        return res
          .status(404)
          .json({ error: "Mermaid diagram not found for this file" });
      }
      logger.debug(
        `Successfully generated Mermaid diagram for file: ${filePath}`
      );
      res.json({ mermaidDiagram: file.documentation.mermaid_diagram });
    } catch (error) {
      logger.error(`Error generating Mermaid diagram: ${error.message}`);
      next(error);
    }
  }
}

export default RepositoryController;