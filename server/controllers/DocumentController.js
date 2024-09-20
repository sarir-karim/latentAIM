import { callClaude } from "../services/ClaudeApiClient.js";
import logger from "../../shared/logger.js";
import driver from "../config/neo4jConfig.js";
import createArtifactCreationChain from "../services/ArtifactChain.js";
import Neo4jRepository from "../repositories/Neo4jRepository.js";

class DocumentController {
  static async getDocuments(req, res, next) {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (d:Document)
        WHERE d.active IS NULL OR d.active <> false
        WITH d
        ORDER BY d.createdAt DESC
        WITH d.id AS id
        MATCH (d:Document {id: id})
        WITH id, collect(d) as versions
        WITH id, versions[0] as latestVersion, versions[1..] as olderVersions
        RETURN {
          id: id,
          document: latestVersion,
          versions: olderVersions
        } as documentWithVersions
        ORDER BY latestVersion.createdAt DESC`,
      );

      const documents = result.records.map((record) => {
        const documentWithVersions = record.get("documentWithVersions");
        const latestVersion = documentWithVersions.document.properties;
        const olderVersions = documentWithVersions.versions.map(
          (v) => v.properties,
        );

        return {
          document: {
            id: latestVersion.id,
            title: latestVersion.title,
            prompt: latestVersion.prompt,
            version: latestVersion.version,
            documentation: latestVersion.documentation,
            tags: JSON.parse(latestVersion.tags || '[]'),
            lastModified: Neo4jRepository.convertCypherDateToJsDate(
              latestVersion.updatedAt,
            ),
          },
          versions: olderVersions.map((v) => ({
            id: v.id,
            title: v.title,
            prompt: v.prompt,
            version: v.version,
            documentation: v.documentation,
            tags: JSON.parse(v.tags || '[]'),
            lastModified: Neo4jRepository.convertCypherDateToJsDate(
              v.updatedAt,
            ),
          })),
        };
      });
      res.json(documents);
    } catch (error) {
      logger.error(`Error fetching documents: ${error.message}`);
      next(error);
    } finally {
      await session.close();
    }
  }

  static async getDocument(req, res, next) {
    const session = driver.session();
    try {
      const { id } = req.params;
      const result = await session.run(
        `MATCH (d:Document {id: $id})
         WITH d ORDER BY d.version DESC
         WITH collect(d) as versionArray
         WITH versionArray[0] as latestVersion, versionArray[1..] as versions
         RETURN latestVersion as document, versions`,
        { id },
      );

      if (result.records.length === 0) {
        return res.status(404).json({ error: "Document not found" });
      }

      const document = result.records[0].get("document").properties;
      const versions = result.records[0]
        .get("versions")
        .map((node) => node.properties);

      res.json({
        document: {
          ...document,
          tags: JSON.parse(document.tags || '[]'),
        },
        versions: versions.map(v => ({
          ...v,
          tags: JSON.parse(v.tags || '[]'),
        })),
      });
    } catch (error) {
      logger.error(`Error fetching document: ${error.message}`);
      next(error);
    } finally {
      await session.close();
    }
  }

  static async createDocument(req, res, next) {
    const session = driver.session();
    try {
      const { title, prompt, tags } = req.body;
      const artifactCreationChain = await createArtifactCreationChain();
      const newDocument = await artifactCreationChain({ title, prompt, tags });
      res.status(201).json(newDocument);
    } catch (error) {
      logger.error(`Error creating document: ${error.message}`);
      next(error);
    } finally {
      await session.close();
    }
  }

  static async updateDocument(req, res, next) {
    const session = driver.session();
    try {
      const { id } = req.params;
      const { title, prompt, tags } = req.body;

      // Fetch the existing document to ensure it exists
      const existingDoc = await session.run(
        "MATCH (d:Document {id: $id}) RETURN d",
        { id },
      );

      if (existingDoc.records.length === 0) {
        return res.status(404).json({ error: "Document not found" });
      }

      const artifactCreationChain = await createArtifactCreationChain();
      const updatedDocument = await artifactCreationChain({
        id,
        title,
        prompt,
        tags,
      });

      res.json(updatedDocument);
    } catch (error) {
      logger.error(`Error updating document: ${error.message}`);
      next(error);
    } finally {
      await session.close();
    }
  }

  static async deleteDocument(req, res, next) {
    const session = driver.session();
    try {
      const { id } = req.params;
      await session.run("MATCH (d:Document {id: $id}) SET d.active = false", {
        id,
      });
      res.json({ message: "Document deleted successfully" });
    } catch (error) {
      logger.error(`Error deleting document: ${error.message}`);
      next(error);
    } finally {
      await session.close();
    }
  }
}

export default DocumentController;