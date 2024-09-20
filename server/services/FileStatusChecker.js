// File: ./server/services/FileStatusChecker.js

class FileStatusChecker {
  getFileStatus(stats, dbFile) {
    if (!dbFile) return "new";
    if (new Date(stats.mtime) > new Date(dbFile.modified_at)) return "modified";
    return "unchanged";
  }
}

export default FileStatusChecker;