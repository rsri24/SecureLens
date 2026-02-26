const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, '../../logs/error.log');

function logError(error, context = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    message: error.message,
    stack: error.stack,
    ...context,
  };
  fs.appendFileSync(logFile, JSON.stringify(entry) + '\n');
}

module.exports = { logError };
