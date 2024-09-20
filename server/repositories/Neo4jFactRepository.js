// File: ./server/repositories/Neo4jFactRepository.js

import driver from "../config/neo4jConfig.js";
import logger from "../../shared/logger.js";

class Neo4jFactRepository {
  static async getData() {
    const session = driver.session();
    try {
      const result = await session.run(
        'MATCH (f:RawFact {raw_fact_id: "007"}) RETURN f.content AS content',
      );
      const content = result.records[0]?.get("content");
      return { ok: true, value: content || "" };
    } catch (error) {
      logger.error(
        `Neo4jFactRepository: Error fetching data: ${error.message}`,
      );
      throw error;
    } finally {
      await session.close();
    }
  }

  static async saveData(facts) {
    const session = driver.session();
    try {
      await session.run(
        `MERGE (f:RawFact {raw_fact_id: "007"})
         ON CREATE SET f.content = $facts, f.creation_date = datetime()
         ON MATCH SET f.content = $facts, f.last_updated = datetime()`,
        { facts },
      );
      return "Facts saved successfully in Neo4j";
    } catch (error) {
      logger.error(`Neo4jFactRepository: Error saving data: ${error.message}`);
      throw error;
    } finally {
      await session.close();
    }
  }
}

export default Neo4jFactRepository;
