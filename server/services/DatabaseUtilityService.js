// File: ./server/services/DatabaseUtilityService.js

import Neo4jRepository from '../repositories/Neo4jRepository.js';
import logger from '../../shared/logger.js';

class DatabaseUtilityService {
  static async getFilterBubbles() {
    try {
      logger.debug('DatabaseUtilityService: Fetching top 20 node and relationship types');

      const types = await Neo4jRepository.getNodeAndRelationshipTypes();
      logger.debug(`Retrieved ${types.length} types`);
      return types.slice(0, 20).map(type => ({
        name: type.name,
        count: typeof type.count === 'object' && type.count.toNumber ? type.count.toNumber() : type.count,
        isRelationship: type.isRelationship
      }));
    } catch (error) {
      logger.error(`Error in getFilterBubbles: ${error.message}`);
      throw error;
    }
  }

  static async applyFilters(filters) {
    try {
      logger.debug(`Applying filters: ${JSON.stringify(filters)}`);
      const results = await Neo4jRepository.getFilteredResults(filters);
      logger.debug(`Retrieved ${results.length} results after applying filters`);

      return results.map(result => ({
        name: result.name,
        type: result.type
      }));
    } catch (error) {
      logger.error(`Error in applyFilters: ${error.message}`);
      throw error;
    }
  }

  static async getUpdatedFilterCounts(selectedFilters) {
    try {
      logger.debug(`Getting updated filter counts for: ${JSON.stringify(selectedFilters)}`);
      const updatedCounts = await Neo4jRepository.getUpdatedFilterCounts(selectedFilters);
      logger.debug(`Retrieved updated counts for ${updatedCounts.length} filters`);
      return updatedCounts;
    } catch (error) {
      logger.error(`Error in getUpdatedFilterCounts: ${error.message}`);
      throw error;
    }
  }

 static async getTags() {
    try {
      logger.debug('DatabaseUtilityService: Fetching all tags');
      const tags = await Neo4jRepository.getTags();
      return tags; 
    } catch (error) {
      logger.error(`Error in getTags: ${error.message}`);
      throw error;
    }
  }
}

export default DatabaseUtilityService;