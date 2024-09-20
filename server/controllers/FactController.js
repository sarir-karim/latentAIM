// File: ./server/controllers/FactController.js

import FactService from "../services/FactService.js";
import RepoFileService from "../services/RepoFileService.js";
import logger from "../../shared/logger.js";

class FactController {
  static async getFacts(req, res, next) {
    try {
      logger.debug("Fetching facts");
      const facts = await FactService.getFacts();
      res.json({ facts });
    } catch (error) {
      logger.error(`Error fetching facts: ${error.message}`);
      next(error);
    }
  }

  static async processFacts(req, res, next) {
    try {
      const { input } = req.body;
      logger.debug(`Processing facts from input: ${input.substring(0, 50)}...`);

      if (!input || typeof input !== "string") {
        const error = new Error("Invalid input. Expected a non-empty string.");
        error.statusCode = 400;
        throw error;
      }

      const result = await FactService.processFacts(input);
      logger.debug(
        `Facts processed: ${JSON.stringify(result).substring(0, 100)}...`,
      );

      res.json({ result });
    } catch (error) {
      logger.error(`Error processing facts: ${error.message}`);
      next(error);
    }
  }

  static async extractFacts(req, res, next) {
    try {
      const { input } = req.body;
      const extractedFacts = await FactService.extractFacts(input);
      res.json({ extractedFacts });
    } catch (error) {
      logger.error(`Error extracting facts: ${error.message}`);
      next(error);
    }
  }

  static async reconcileFacts(req, res, next) {
    try {
      const { currentFacts, newFacts } = req.body;
      const reconciled = await FactService.reconcileFacts(
        currentFacts,
        newFacts,
      );
      res.json({ reconciled });
    } catch (error) {
      logger.error(`Error reconciling facts: ${error.message}`);
      next(error);
    }
  }

  static async organizeFacts(req, res, next) {
    try {
      const { facts } = req.body;
      const organized = await FactService.organizeFacts(facts);
      res.json({ organized });
    } catch (error) {
      logger.error(`Error organizing facts: ${error.message}`);
      next(error);
    }
  }

  static async finalizeReviewedFacts(req, res, next) {
    try {
      const { reviewedFacts } = req.body;
      logger.debug(
        `Finalizing reviewed facts: ${JSON.stringify(reviewedFacts).substring(0, 100)}...`,
      );

      const finalizedFacts =
        await FactService.finalizeFactsAndSave(reviewedFacts);
      logger.debug(
        `Facts finalized and saved: ${finalizedFacts.substring(0, 100)}...`,
      );

      res.json({ facts: finalizedFacts });
    } catch (error) {
      logger.error(`Error finalizing reviewed facts: ${error.message}`);
      next(error);
    }
  }

  static async getRepositoryFiles(req, res, next) {
    try {
      const files = await RepoFileService.getRepositoryFiles();
      res.json({ files });
    } catch (error) {
      logger.error(`Error getting repository files: ${error.message}`);
      next(error);
    }
  }

  static async uploadRepositoryFile(req, res, next) {
    try {
      const { file } = req.body;
      const result = await RepoFileService.uploadFile(file);
      res.json(result);
    } catch (error) {
      logger.error(`Error uploading repository file: ${error.message}`);
      next(error);
    }
  }
}

export default FactController;
