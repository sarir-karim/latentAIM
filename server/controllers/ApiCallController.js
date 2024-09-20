// File: ./server/controllers/ApiCallController.js

import Neo4jApiCallRepository from "../repositories/Neo4jApiCallRepository.js";
import logger from "../../shared/logger.js";

class ApiCallController {
  static async getApiCalls(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const apiCalls = await Neo4jApiCallRepository.getApiCalls(limit);
      res.json(apiCalls);
    } catch (error) {
      logger.error(`Error in ApiCallController.getApiCalls: ${error.message}`);
      next(error);
    }
  }
}

export default ApiCallController;