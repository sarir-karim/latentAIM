// File: ./server/services/FilePathFilter.js

import { includePatterns, excludePatterns } from "../../shared/filePathConfig.js";
import path from 'path';
import logger from "../../shared/logger.js";

function matchPattern(filePath, pattern) {
    if (pattern.endsWith('/*')) {
        const dirPart = pattern.slice(0, -2);
        return filePath === dirPart || filePath.startsWith(dirPart + '/');
    } else {
        return filePath === pattern;
    }
}

export function shouldProcess(filePath, isDirectory) {
    const normalizedPath = './' + filePath.replace(/\\/g, '/');
    // logger.debug(`Processing path: ${normalizedPath}, isDirectory: ${isDirectory}`);

    // Check if the file/directory should be excluded first
    for (const pattern of excludePatterns) {
        if (matchPattern(normalizedPath, pattern)) {
            // logger.debug(`Excluded by pattern: ${pattern}`);
            return false;
        }
    }

    // Check if the file/directory should be included
    for (const pattern of includePatterns) {
        if (matchPattern(normalizedPath, pattern)) {
            // logger.debug(`Included by pattern: ${pattern}`);
            return true;
        }
    }

    // logger.debug(`Not included by any pattern: ${normalizedPath}`);
    return false;
}