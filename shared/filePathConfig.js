// File: ./shared/filePathConfig.js

export const includePatterns = [
  "./vite.config.js",
  "./.replit",
  "./package.json",
  "./server/*",
  "./client",
  "./client/src/*"
];

export const excludePatterns = [
  "./*/node_modules/*",
  "./*/.git/*",
  "./*/.*",
  "./*/client/dist/*",
  "./client/package-lock.json"
];

