// File: ./server/controllers/SchemaController.js
import driver from "../config/neo4jConfig.js";
import logger from "../../shared/logger.js";

class SchemaController {
  static async getSchema(req, res, next) {
    const session = driver.session();
    try {
      logger.debug("Fetching database schema");

      const result = await session.run(`
        CALL db.schema.visualization()
      `);

      const nodes = result.records[0].get("nodes");
      const relationships = result.records[0].get("relationships");

      const schema = {
        nodes: nodes.map((node) => ({
          labels: node.labels,
          properties: Object.keys(node.properties),
        })),
        relationships: relationships.map((rel) => ({
          type: rel.type,
          startNodeLabels: rel.start.labels,
          endNodeLabels: rel.end.labels,
          properties: Object.keys(rel.properties),
        })),
      };

      res.json(schema);
    } catch (error) {
      logger.error(`Error fetching database schema: ${error.message}`);
      next(error);
    } finally {
      await session.close();
    }
  }
}

export default SchemaController;
