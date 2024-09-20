import chalk from "chalk";

const logger = {
  info: (message) => console.log(chalk.blue(`[INFO] ${message}`)),
  success: (message) => console.log(chalk.green(`[SUCCESS] ${message}`)),
  warning: (message) => console.log(chalk.yellow(`[WARNING] ${message}`)),
  warn: (message) => console.warn(message),
  error: (message) => console.log(chalk.red(`[ERROR] ${message}`)),
  debug: (message) => console.log(chalk.magenta(`[DEBUG] ${message}`)),
  data: (label, data) => console.log(chalk.cyan(`[DATA] ${label}:`), data),
};

export default logger;
