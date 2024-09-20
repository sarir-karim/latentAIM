// File: ./server/controllers/DatabaseUtilityController.js

import DatabaseUtilityService from '../services/DatabaseUtilityService.js';
import logger from '../../shared/logger.js';

class DatabaseUtilityController {

  static async getFilterBubbles(req, res, next) {
    try {
      logger.debug('Fetching filter bubbles');
      const bubbles = await DatabaseUtilityService.getFilterBubbles();
      res.json(bubbles);
    } catch (error) {
      logger.error(`Error fetching filter bubbles: ${error.message}`);
      next(error);
    }
  }
  
  static async applyFilters(req, res, next) {
    try {
      const { filters } = req.body;
      const results = await DatabaseUtilityService.applyFilters(filters);
      const updatedFilters = await DatabaseUtilityService.getUpdatedFilterCounts(filters);
      res.json({ results, updatedFilters });
    } catch (error) {
      logger.error(`Error applying filters: ${error.message}`);
      res.status(500).json({ error: 'An error occurred while applying filters' });
    }
  }
  
  static async getTags(req, res, next) {
    try {
      logger.debug('DatabaseUtilityController: Fetching all unique tags');
      const tags = await DatabaseUtilityService.getTags();
      res.json(tags);
    } catch (error) {
      logger.error(`Error in getTags: ${error.message}`);
      next(error);
    }
  }
}

export default DatabaseUtilityController;