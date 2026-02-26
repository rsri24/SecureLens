const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, '../../logs/error.log');

function getRecentErrors(limit = 50) {
  if (!fs.existsSync(logFile)) return [];
  const lines = fs.readFileSync(logFile, 'utf-8').trim().split('\n');
  return lines.slice(-limit).map(line => {
    try {
      return JSON.parse(line);
    } catch {
      return { raw: line };
    }
  }).reverse();
}

module.exports = { getRecentErrors };
