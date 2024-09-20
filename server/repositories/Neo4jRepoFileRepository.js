// File: ./server/repositories/Neo4jRepoFileRepository.js

import driver from "../config/neo4jConfig.js";
import logger from "../../shared/logger.js";

class Neo4jRepoFileRepository {
  static async getAllFiles(limit = 10, skip = 0) {
    const session = driver.session();
    try {
      const query = `
        MATCH (f:RepoFile)
        RETURN f
        ORDER BY f.created_at DESC
        SKIP toInteger($skip)
        LIMIT toInteger($limit)
      `;
      const result = await session.run(query, { limit: limit, skip: skip });

      return result.records.map((record) => {
        const file = record.get("f").properties;
        return file;
      });
    } catch (error) {
      logger.error(
        `Neo4jRepoFileRepository: Error fetching files: ${error.message}`,
      );
      throw new Error(`Failed to fetch files: ${error.message}`);
    } finally {
      await session.close();
    }
  }

  static async saveFile(file) {
    const session = driver.session();
    try {
      await session.run(
        `
        MERGE (f:RepoFile {file_path: $file_path})
        ON CREATE SET 
          f.file_name = $file_name,
          f.file_content = $file_content,
          f.file_size = $file_size,
          f.created_at = datetime(),
          f.modified_at = datetime(),
          f.documentation = $documentation,
          f.mermaid_diagram = $mermaid_diagram
        ON MATCH SET
          f.file_name = $file_name,
          f.file_content = $file_content,
          f.file_size = $file_size,
          f.modified_at = datetime(),
          f.documentation = $documentation,
          f.mermaid_diagram = $mermaid_diagram
        `,
        file,
      );
      logger.debug(
        `File ${file.file_path} saved in Neo4j with documentation and Mermaid diagram`,
      );
    } catch (error) {
      logger.error(
        `Neo4jRepoFileRepository: Error saving file: ${error.message}`,
      );
      throw error;
    } finally {
      await session.close();
    }
  }

  static async deleteFile(filePath) {
    const session = driver.session();
    try {
      await session.run("MATCH (f:RepoFile {file_path: $filePath}) DELETE f", {
        filePath,
      });
      logger.debug(`File ${filePath} deleted from Neo4j`);
    } catch (error) {
      logger.error(
        `Neo4jRepoFileRepository: Error deleting file: ${error.message}`,
      );
      throw error;
    } finally {
      await session.close();
    }
  }

  static async getFile(filePath) {
    const session = driver.session();
    try {
      logger.debug(`Fetching file from Neo4j: ${filePath}`);
      const result = await session.run(
        `
        MATCH (f:RepoFile {file_path: $filePath})
        OPTIONAL MATCH (f)-[:RELATED_TO]-(related:RepoFile)
        RETURN f AS file, collect(DISTINCT related) AS relatedFiles
        `,
        { filePath }
      );
      const file = result.records[0]?.get("file").properties;
      const relatedFiles = result.records[0]?.get('relatedFiles').map(rel => rel.properties);
      if (file) {
       logger.debug(`File found: ${filePath} with ${relatedFiles.length} related files`);
      } else {
        logger.warn(`File not found: ${filePath}`);
      }
      return { documentation:file, relatedFiles };
    } catch (error) {
      logger.error(
        `Neo4jRepoFileRepository: Error fetching file: ${error.message}`,
      );
      throw error;
    } finally {
      await session.close();
    }
  }

  static async getFileModificationTime(filePath) {
    const session = driver.session();
    try {
      const result = await session.run(
        "MATCH (f:RepoFile {file_path: $filePath}) RETURN f.modified_at",
        { filePath }
      );
      return result.records[0]?.get("f.modified_at");
    } catch (error) {
      logger.error(
        `Neo4jRepoFileRepository: Error fetching file modification time: ${error.message}`,
      );
      throw error;
    } finally {
      await session.close();
    }
  }

  static async updateChangedFiles(files) {
    const session = driver.session();
    try {
      await session.writeTransaction(async (tx) => {
        for (const file of files) {
          await tx.run(
            `
            MERGE (f:RepoFile {file_path: $file_path})
            ON CREATE SET 
              f.file_name = $file_name,
              f.file_content = $file_content,
              f.file_size = $file_size,
              f.created_at = datetime(),
              f.modified_at = datetime(),
              f.documentation = $documentation,
              f.mermaid_diagram = $mermaid_diagram
            ON MATCH SET
              f.file_name = $file_name,
              f.file_content = $file_content,
              f.file_size = $file_size,
              f.modified_at = datetime(),
              f.documentation = $documentation,
              f.mermaid_diagram = $mermaid_diagram
            `,
            file
          );
        }
      });
      logger.debug(`Updated ${files.length} changed files in Neo4j`);
    } catch (error) {
      logger.error(
        `Neo4jRepoFileRepository: Error updating changed files: ${error.message}`,
      );
      throw error;
    } finally {
      await session.close();
    }
  }

  static async deleteFolderContents(folderPath) {
    const session = driver.session();
    try {
      const result = await session.run(
        `
        MATCH (f:RepoFile)
        WHERE f.file_path STARTS WITH $folderPath
        WITH f
        OPTIONAL MATCH (f)-[r]-()
        DELETE f, r
        RETURN count(f) as deletedCount
        `,
        { folderPath },
      );
      const deletedCount = result.records[0].get("deletedCount").toNumber();
      logger.debug(
        `Deleted ${deletedCount} files from folder ${folderPath} in Neo4j`,
      );
      return deletedCount;
    } catch (error) {
      logger.error(
        `Neo4jRepoFileRepository: Error deleting folder contents: ${error.message}`,
      );
      throw error;
    } finally {
      await session.close();
    }
  }
}

export default Neo4jRepoFileRepository;
