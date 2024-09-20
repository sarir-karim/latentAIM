// File: ./server/services/RepoFileService.js
import path from "path";
import fs from "fs/promises";
import Neo4jRepoFileRepository from "../repositories/Neo4jRepoFileRepository.js";
import LLMService from "./LLMService.js";
import logger from "../../shared/logger.js";
import { shouldProcess } from "./FilePathFilter.js";

class RepoFileService {
  static async getRepositoryFiles(limit,page,repoPath = process.cwd()) {
    try {
      logger.debug("Getting repository files");
      let fileTree = {
        id: "root",
        name: path.basename(repoPath),
        type: "directory",
        children: [],
      };

      const skip =  (page -1 ) * limit;
      const dbFiles = await Neo4jRepoFileRepository.getAllFiles(limit,skip);
      logger.debug(`Retrieved ${dbFiles.length} files from the database`);

      const dbFilesMap = new Map(
        dbFiles
          .filter((file) => file && file.file_path)
          .map((file) => [file.file_path, file])
      );

      logger.debug(`Filtered ${dbFilesMap.size} valid files`);

      await this.buildDirectoryTree(repoPath, "", fileTree, dbFilesMap);

      // Add remaining files from the database that weren't found in the filesystem
      for (const [filePath, dbFile] of dbFilesMap) {
        this.addFileToTree(fileTree, filePath, {
          id: filePath,
          name: path.basename(filePath),
          type: "file",
          size: dbFile.file_size,
          modifiedAt: dbFile.modified_at,
          status: "deleted",
          hasMermaidDiagram: !!dbFile.mermaid_diagram,
        });
      }

      logger.success("Retrieved and compared repository files");
      return { fileTree };
    } catch (error) {
      logger.error(`Error in RepoFileService.getRepositoryFiles: ${error.message}`);
      throw error;
    }
  }
  
  static async buildDirectoryTree(dirPath, relativePath, tree, dbFilesMap) {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        const entryRelativePath = path.join(relativePath, entry.name);

        if (!shouldProcess(entryRelativePath, entry.isDirectory())) continue;

        if (entry.isDirectory()) {
          const newDir = {
            id: entryRelativePath || "root",
            name: entry.name,
            type: "directory",
            children: [],
          };
          tree.children.push(newDir);
          await this.buildDirectoryTree(fullPath, entryRelativePath, newDir, dbFilesMap);
        } else {
          const stats = await fs.stat(fullPath);
          const dbFile = dbFilesMap.get(entryRelativePath);
          const status = this.getFileStatus(stats, dbFile);
          dbFilesMap.delete(entryRelativePath);

          tree.children.push({
            id: entryRelativePath,
            name: entry.name,
            type: "file",
            size: stats.size,
            modifiedAt: stats.mtime.toISOString(),
            status: status,
            hasMermaidDiagram: status !== "new" && !!dbFile?.mermaid_diagram,
          });
        }
      }
    } catch (error) {
      logger.error(`Error reading directory ${dirPath}: ${error.message}`);
    }
  }

  static addFileToTree(tree, filePath, fileInfo) {
    const parts = filePath.split(path.sep);
    let currentNode = tree;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      let childNode = currentNode.children.find((child) => child.name === part);
      if (!childNode) {
        childNode = {
          id: parts.slice(0, i + 1).join(path.sep),
          name: part,
          type: "directory",
          children: [],
        };
        currentNode.children.push(childNode);
      }
      currentNode = childNode;
    }

    currentNode.children.push(fileInfo);
  }

  static getFileStatus(stats, dbFile) {
    if (!dbFile) return "new";
    if (new Date(stats.mtime) > new Date(dbFile.modified_at)) return "modified";
    return "unchanged";
  }

  static async refreshFile(filePath) {
    if (!filePath) {
      throw new Error('File path is required');
    }
    try {
      logger.debug(`Starting refreshFile for: ${filePath}`);
      const fullPath = path.join(process.cwd(), filePath);
      const fileContent = await fs.readFile(fullPath, "utf-8");
      const stats = await fs.stat(fullPath);
      const fileType = path.extname(filePath).slice(1);

      const documentation = await LLMService.generateDocumentation(fileContent);
      const mermaidDiagram = await LLMService.generateMermaidDiagram(fileContent, fileType);

      const fileData = {
        file_name: path.basename(filePath),
        file_path: filePath,
        file_content: fileContent,
        file_size: stats.size,
        modified_at: stats.mtime.toISOString(),
        documentation: documentation,
        mermaid_diagram: mermaidDiagram,
      };

      await Neo4jRepoFileRepository.saveFile(fileData);
      logger.success(`File ${filePath} refreshed, documented, and diagrammed successfully`);

      return {
        status: "success",
        message: `File ${filePath} refreshed, documented, and diagrammed successfully`,
        hasMermaidDiagram: !!mermaidDiagram,
      };
    } catch (error) {
      logger.error(`Error refreshing file ${filePath}: ${error.message}`);
      throw error;
    }
  }

  static async deleteFile(filePath) {
    if (!filePath) {
      throw new Error('File path is required');
    }
    try {
      await Neo4jRepoFileRepository.deleteFile(filePath);
      logger.success(`File ${filePath} deleted from database`);
      return {
        status: "success",
        message: `File ${filePath} deleted from database`,
      };
    } catch (error) {
      logger.error(`Error deleting file ${filePath} from database: ${error.message}`);
      throw error;
    }
  }

  static async refreshFolder(folderPath) {
    if (!folderPath) {
      throw new Error('Folder path is required');
    }
    try {
      const updatedFiles = await this.refreshFolderRecursive(folderPath);
      logger.success(`Folder ${folderPath} refreshed successfully`);
      return { status: "success", updatedFiles };
    } catch (error) {
      logger.error(`Error refreshing folder ${folderPath}: ${error.message}`);
      throw error;
    }
  }

  static async deleteFolder(folderPath) {
    if (!folderPath) {
      throw new Error('Folder path is required');
    }
    try {
      const deletedFiles = await Neo4jRepoFileRepository.deleteFolderContents(folderPath);
      logger.success(`Folder ${folderPath} deleted from database`);
      return {
        status: "success",
        message: `Folder ${folderPath} deleted from database`,
        deletedFiles,
      };
    } catch (error) {
      logger.error(`Error deleting folder ${folderPath} from database: ${error.message}`);
      throw error;
    }
  }

  static async getFilesInFolder(folderPath) {
    const files = [];
    await this.traverseFolder(folderPath, files, process.cwd());
    return files.map(f => f.path);
  }

  static async refreshFileIfNeeded(fullPath, relativePath) {
    const stats = await fs.stat(fullPath);
    const dbFile = await Neo4jRepoFileRepository.getFile(relativePath);

    if (!dbFile || new Date(stats.mtime) > new Date(dbFile.modified_at)) {
      const fileContent = await fs.readFile(fullPath, "utf-8");
      const fileType = path.extname(fullPath).slice(1);

      const documentation = await LLMService.generateDocumentation(fileContent);
      const mermaidDiagram = await LLMService.generateMermaidDiagram(fileContent, fileType);

      const fileData = {
        file_name: path.basename(fullPath),
        file_path: relativePath,
        file_content: fileContent,
        file_size: stats.size,
        modified_at: stats.mtime.toISOString(),
        documentation: documentation,
        mermaid_diagram: mermaidDiagram,
      };

      await Neo4jRepoFileRepository.saveFile(fileData);
      logger.info(`File ${relativePath} updated`);

      return {
        path: relativePath,
        status: dbFile ? 'updated' : 'new',
        hasMermaidDiagram: !!mermaidDiagram,
      };
    }

    return null;
  }

  static async refreshFolderRecursive(folderPath, rootDir = process.cwd()) {
    const updatedFiles = [];
    const entries = await fs.readdir(folderPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(folderPath, entry.name);
      const relativePath = path.relative(rootDir, fullPath);

      if (!shouldProcess(relativePath, entry.isDirectory())) continue;

      if (entry.isDirectory()) {
        const subFolderUpdates = await this.refreshFolderRecursive(fullPath, rootDir);
        updatedFiles.push(...subFolderUpdates);
      } else {
        const fileUpdate = await this.refreshFileIfNeeded(fullPath, relativePath);
        if (fileUpdate) {
          updatedFiles.push(fileUpdate);
        }
      }
    }

    return updatedFiles;
  }
  
  static async traverseFolder(folderPath, files, rootDir) {
    const entries = await fs.readdir(folderPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(folderPath, entry.name);
      const relativePath = path.relative(rootDir, fullPath);

      if (shouldProcess(relativePath, entry.isDirectory())) {
        if (entry.isDirectory()) {
          await this.traverseFolder(fullPath, files, rootDir);
        } else {
          const stats = await fs.stat(fullPath);
          files.push({
            path: relativePath,
            name: entry.name,
            size: stats.size,
            modifiedAt: stats.mtime.toISOString(),
          });
        }
      }
    }
  }
}

export default RepoFileService;