const logger = require('./logger');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  logger.error(`Error ${statusCode}: ${message}`, req);
  
  res.status(statusCode).json({
    code: statusCode,
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
