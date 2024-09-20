// File: ./server/controllers/DocBuilderController.js
import driver from "../config/neo4jConfig.js";
import logger from "../../shared/logger.js";

class DocBuilderController {
  static async getDocument(req, res, next) {
    const session = driver.session();
    try {
      const { title } = req.query;
      logger.debug(`Fetching document with title: ${title}`);

      const result = await session.run(
        `MATCH (d:Document {title: $title})-[:HAS_SECTION]->(s:Section)
         RETURN s.title AS title, s.content AS content, ID(s) AS id
         ORDER BY s.order`,
        { title },
      );

      const sections = result.records.map((record) => ({
        id: record.get("id").toString(),
        title: record.get("title"),
        content: record.get("content"),
      }));

      if (sections.length === 0) {
        logger.debug(`Document with title "${title}" not found`);
        res.status(404).json({ error: "Document not found" });
      } else {
        logger.debug(`Successfully fetched document with title: ${title}`);
        res.json(sections);
      }
    } catch (error) {
      logger.error(`Error fetching document: ${error.message}`);
      next(error);
    } finally {
      await session.close();
    }
  }

  static async updateSection(req, res, next) {
    const session = driver.session();
    try {
      const { sectionId, content } = req.body;
      logger.debug(`Updating section with ID: ${sectionId}`);

      const result = await session.run(
        `MATCH (s:Section)
       WHERE ID(s) = $sectionId
       SET s.content = $content
       RETURN s.title AS title, s.content AS content, ID(s) AS id`,
        { sectionId: parseInt(sectionId), content },
      );

      if (result.records.length === 0) {
        logger.debug(`Section with ID ${sectionId} not found`);
        res.status(404).json({ error: "Section not found" });
      } else {
        const updatedSection = result.records[0].toObject();
        logger.debug(`Successfully updated section with ID: ${sectionId}`);
        res.json(updatedSection);
      }
    } catch (error) {
      logger.error(`Error updating section: ${error.message}`);
      next(error);
    } finally {
      await session.close();
    }
  }
}

export default DocBuilderController;