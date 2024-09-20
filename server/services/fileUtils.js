import path from "path";
import logger from "../logger.js";

export function shouldProcessDirectory(dirPath, excludedDirs, includeDir) {
  // Always process the include directory and its subdirectories
  if (dirPath.startsWith(includeDir)) {
    logger.debug(
      `Should process directory ${dirPath}: true (included directory)`,
    );
    return true;
  }

  const shouldProcess = !excludedDirs.some((pattern) =>
    matchesPattern(dirPath, pattern),
  );
  logger.debug(`Should process directory ${dirPath}: ${shouldProcess}`);
  return shouldProcess;
}

export function shouldProcessFile(filePath, excludedDirs, includeDir) {
  // Always process files in the include directory and its subdirectories
  if (filePath.startsWith(includeDir)) {
    logger.debug(`Should process file ${filePath}: true (included directory)`);
    return true;
  }

  const shouldProcess = !excludedDirs.some((pattern) =>
    matchesPattern(filePath, pattern),
  );
  logger.debug(`Should process file ${filePath}: ${shouldProcess}`);
  return shouldProcess;
}

export function matchesPattern(filePath, pattern) {
  const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
  return regex.test(filePath);
}
