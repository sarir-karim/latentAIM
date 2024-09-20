// File: ./server/repositories/Neo4jApiCallRepository.js

import driver from "../config/neo4jConfig.js";
import logger from "../../shared/logger.js";

class Neo4jApiCallRepository {
  static async saveApiCall(apiCall) {
    const session = driver.session();
    try {
      // Format the timestamp to ISO 8601 format
      const formattedTimestamp = apiCall.timestamp.toISOString();

      await session.run(
        `
        CREATE (a:ApiCall {
          timestamp: datetime($timestamp),
          inputTokens: $inputTokens,
          outputTokens: $outputTokens,
          message: $message
        })
        `,
        {
          ...apiCall,
          timestamp: formattedTimestamp
        }
      );
      logger.debug(`API call record saved: ${JSON.stringify(apiCall)}`);
    } catch (error) {
      logger.error(`Error saving API call record: ${error.message}`);
      throw error;
    } finally {
      await session.close();
    }
  }

  static async getApiCalls(limit = 50) {
    const session = driver.session();
    try {
      const result = await session.run(
        `
        MATCH (a:ApiCall)
        RETURN a
        ORDER BY a.timestamp DESC
        LIMIT toInteger($limit)
        `,
        { limit: limit }
      );
      return result.records.map(record => {
        const properties = record.get('a').properties;
        // Convert Neo4j datetime back to JavaScript Date
        properties.timestamp = new Date(properties.timestamp);
        return properties;
      });
    } catch (error) {
      logger.error(`Error fetching API call records: ${error.message}`);
      throw error;
    } finally {
      await session.close();
    }
  }
}
  
export default Neo4jApiCallRepository;
  