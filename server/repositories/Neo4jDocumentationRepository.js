import driver from "../config/neo4jConfig.js";
import logger from "../../shared/logger.js";

class Neo4jDocumentationRepository {
  static async getDocumentation() {
    const session = driver.session();
    try {
      const result = await session.run(
        "MATCH (d:Documentation) RETURN d.content AS content, d.updated_at AS updated_at",
      );
      const record = result.records[0];
      return record
        ? {
            content: record.get("content"),
            updated_at: record.get("updated_at"),
          }
        : null;
    } catch (error) {
      logger.error(
        `Neo4jDocumentationRepository: Error fetching documentation: ${error.message}`,
      );
      throw error;
    } finally {
      await session.close();
    }
  }

  static async saveDocumentation(content) {
    const session = driver.session();
    try {
      await session.run(
        `MERGE (d:Documentation)
         ON CREATE SET d.content = $content, d.created_at = datetime(), d.updated_at = datetime()
         ON MATCH SET d.content = $content, d.updated_at = datetime()`,
        { content },
      );
      return "Documentation saved successfully";
    } catch (error) {
      logger.error(
        `Neo4jDocumentationRepository: Error saving documentation: ${error.message}`,
      );
      throw error;
    } finally {
      await session.close();
    }
  }
}

export default Neo4jDocumentationRepository;
