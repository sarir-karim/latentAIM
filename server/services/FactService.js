import { callClaude } from "./ClaudeApiClient.js";
import Neo4jFactRepository from "../repositories/Neo4jFactRepository.js";
import { extractFactsPrompt } from "../prompts/extractFacts.js";
import { reconcileFactsPrompt } from "../prompts/reconcileFacts.js";
import { organizeFactsPrompt } from "../prompts/organizeFacts.js";
import logger from "../../shared/logger.js";

class FactService {
  static async processFacts(input) {
    try {
      logger.info("Starting fact processing");

      if (input.trim().toLowerCase() === "delete") {
        logger.info("Delete command received. Clearing all facts.");
        return {
          sustained: [],
          new: [],
          conflicts: [
            {
              id: "d1",
              newFact: "No facts",
              oldFact: "All previous facts",
              explanation: "User requested to delete all facts",
            },
          ],
        };
      }

      // Extract facts
      const extractPrompt = extractFactsPrompt.replace("{input}", input);
      const extractedFacts = await callClaude(extractPrompt);
      logger.debug(`Extracted facts: ${extractedFacts.substring(0, 100)}...`);

      // Get current facts
      const currentFacts = await this.getFacts();

      // Reconcile facts
      const reconcilePrompt = reconcileFactsPrompt
        .replace("{previousFacts}", currentFacts)
        .replace("{newFacts}", extractedFacts);
      const reconcileResponse = await callClaude(reconcilePrompt);
      const reconcileResult = JSON.parse(reconcileResponse);
      logger.debug(
        `Reconciled facts: ${JSON.stringify(reconcileResult).substring(0, 100)}...`,
      );

      return reconcileResult;
    } catch (error) {
      logger.error(`Error in processFacts: ${error.message}`);
      throw error;
    }
  }

  static async finalizeFactsAndSave(reviewedFacts) {
    try {
      logger.info("Finalizing and saving facts");

      // Merge sustained, new, and accepted conflict facts
      const allFacts = [
        ...reviewedFacts.sustained.map((f) => f.fact),
        ...reviewedFacts.new.filter((f) => f.accepted).map((f) => f.fact),
        ...reviewedFacts.conflicts
          .filter((f) => f.accepted)
          .map((f) => f.newFact),
      ];

      // Organize facts
      const organizePrompt = organizeFactsPrompt.replace(
        "{facts}",
        allFacts.join("\n"),
      );
      const organizedFacts = await callClaude(organizePrompt);
      logger.debug(`Organized facts: ${organizedFacts.substring(0, 100)}...`);

      // Save organized facts
      await this.saveFacts(organizedFacts);

      logger.info("Facts finalized and saved successfully");
      return organizedFacts;
    } catch (error) {
      logger.error(`Error in finalizeFactsAndSave: ${error.message}`);
      throw error;
    }
  }

  static async getFacts() {
    try {
      const facts = await Neo4jFactRepository.getData();
      return facts.value || "";
    } catch (error) {
      logger.error(`Error in getFacts: ${error.message}`);
      throw error;
    }
  }

  static async saveFacts(facts) {
    try {
      await Neo4jFactRepository.saveData(facts);
      logger.success("Facts saved successfully");
    } catch (error) {
      logger.error(`Error in saveFacts: ${error.message}`);
      throw error;
    }
  }
}

export default FactService;
