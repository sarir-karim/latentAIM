import Neo4jDocumentationRepository from "../repositories/Neo4jDocumentationRepository.js";
import Neo4jRepoFileRepository from "../repositories/Neo4jRepoFileRepository.js";
import { callClaude } from "./ClaudeApiClient.js";
import { generateDocumentationPrompt } from "../prompts/generateDocumentation.js";
import logger from "../../shared/logger.js";

class DocumentationService {
  static async getDocumentation() {
    try {
      return await Neo4jDocumentationRepository.getDocumentation();
    } catch (error) {
      logger.error(
        `Error in DocumentationService.getDocumentation: ${error.message}`,
      );
      throw error;
    }
  }

  static async refreshDocumentation() {
    try {
      // Change this line to use the correct method
      const files = await Neo4jRepoFileRepository.getAllFiles();
      const fileList = files
        .map(
          (file) =>
            `${file.file_path}: ${file.file_content.substring(0, 100)}...`,
        )
        .join("\n");

      const prompt = generateDocumentationPrompt.replace(
        "{fileList}",
        fileList,
      );
      const documentation = await callClaude(prompt);

      await Neo4jDocumentationRepository.saveDocumentation(documentation);
      return "Documentation refreshed successfully";
    } catch (error) {
      logger.error(
        `Error in DocumentationService.refreshDocumentation: ${error.message}`,
      );
      throw error;
    }
  }
}

export default DocumentationService;
