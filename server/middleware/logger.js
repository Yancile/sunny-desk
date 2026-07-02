const fs = require('fs');
const path = require('path');

const logDirectory = path.join(__dirname, '../logs');
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

const getCurrentDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

const formatLog = (level, message, req = null) => {
  const timestamp = new Date().toISOString();
  const ip = req ? req.ip || req.connection?.remoteAddress || 'unknown' : 'unknown';
  const method = req ? req.method : '-';
  const url = req ? req.originalUrl : '-';
  return `[${timestamp}] [${level}] [${ip}] ${method} ${url} - ${message}\n`;
};

const writeLog = (level, message, req = null) => {
  const logFile = path.join(logDirectory, `${getCurrentDate()}.log`);
  const logEntry = formatLog(level, message, req);
  
  fs.appendFile(logFile, logEntry, (err) => {
    if (err) {
      console.error('Failed to write log:', err);
    }
  });
  
  if (process.env.NODE_ENV !== 'production') {
    console.log(logEntry.trim());
  }
};

const logger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const message = `Status: ${res.statusCode}, Duration: ${duration}ms`;
    writeLog('INFO', message, req);
  });
  
  next();
};

logger.info = (message, req = null) => writeLog('INFO', message, req);
logger.error = (message, req = null) => writeLog('ERROR', message, req);
logger.warn = (message, req = null) => writeLog('WARN', message, req);

module.exports = logger;
