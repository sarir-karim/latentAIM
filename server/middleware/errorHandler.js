import logger from "../../shared/logger.js";

const errorHandler = (err, req, res, next) => {
  logger.error(`Error details: ${err.message}`);
  logger.error(`Stack trace: ${err.stack}`);

  const statusCode = err.statusCode || 500;
  const message = "An error occurred while processing your request.";

  res.status(statusCode).json({
    error: {
      message: message,
    },
  });
};

export default errorHandler;
