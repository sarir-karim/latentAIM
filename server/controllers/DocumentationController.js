import DocumentationService from "../services/DocumentationService.js";
import logger from "../../shared/logger.js";

class DocumentationController {
  static async getDocumentation(req, res, next) {
    try {
      logger.debug("Fetching documentation");
      const documentation = await DocumentationService.getDocumentation();
      res.json({ documentation });
    } catch (error) {
      logger.error(`Error fetching documentation: ${error.message}`);
      next(error);
    }
  }

  static async refreshDocumentation(req, res, next) {
    try {
      logger.debug("Refreshing documentation");
      const result = await DocumentationService.refreshDocumentation();
      res.json({ message: result });
    } catch (error) {
      logger.error(`Error refreshing documentation: ${error.message}`);
      next(error);
    }
  }
}

export default DocumentationController;