// File: ./server/services/LLMService.js

import { callClaude } from "./ClaudeApiClient.js";
import logger from "../../shared/logger.js";

class LLMService {
  static async generateDocumentation(fileContent) {
    try {
      const prompt =
        "Generate 3 sentences of concise documentation for this file, covering: 1) how it handles core functionality, 2) the operation it performs, and 3) its typical usage in context or purpose.";
      const fullPrompt = `${prompt}\n\nFile content:\n${fileContent}`;

      logger.info("Generating documentation using LLM");
      const documentation = await callClaude(fullPrompt);

      logger.success("Documentation generated successfully");
      return documentation.trim();
    } catch (error) {
      logger.error(`Error generating documentation: ${error.message}`);
      return "Failed to generate documentation";
    }
  }

  static async generateMermaidDiagram(fileContent, fileType) {
    try {
      const prompt = await import("../prompts/generateMermaidDiagram.js");
      const fullPrompt = prompt.default
        .replace("{fileContent}", fileContent)
        .replace("{fileType}", fileType);

      logger.info("Generating Mermaid diagram using LLM");
      const rawMermaidCode = await callClaude(fullPrompt);
      logger.debug(
        `Received raw Mermaid code: ${rawMermaidCode.substring(0, 100)}...`,
      );

      // Process the raw Mermaid code
      const cleanedMermaidCode = this.cleanMermaidCode(rawMermaidCode);

      logger.debug(
        `Cleaned Mermaid code: ${cleanedMermaidCode.substring(0, 100)}...`,
      );
      logger.success("Mermaid diagram generated successfully");
      return cleanedMermaidCode.trim();
    } catch (error) {
      logger.error(`Error generating Mermaid diagram: ${error.message}`);
      logger.error(`Error stack: ${error.stack}`);
      return "Failed to generate Mermaid diagram";
    }
  }

  static cleanMermaidCode(rawCode) {
    // Remove any leading "```mermaid" and trailing "```"
    let cleanedCode = rawCode.replace(/^```mermaid\n?/, "").replace(/```$/, "");

    // Ensure the code starts with a valid Mermaid diagram type
    const validStartKeywords = [
      "graph",
      "flowchart",
      "sequenceDiagram",
      "classDiagram",
      "stateDiagram",
      "erDiagram",
      "gantt",
      "pie",
      "gitGraph",
    ];
    const startsWithValidKeyword = validStartKeywords.some((keyword) =>
      cleanedCode.trim().startsWith(keyword),
    );

    if (!startsWithValidKeyword) {
      logger.warn("Mermaid code does not start with a valid diagram type");
      return "Failed to generate valid Mermaid diagram";
    }

    return cleanedCode.trim();
  }
}

export default LLMService;
