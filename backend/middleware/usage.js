const { logEvent } = require('../services/usage/log');

// middleware factory for scan routes; expects tokensUsed in req.body.tokens or 0
function trackScan(req, res, next) {
  if (req.user && req.user.id) {
    // record a scan event whenever this route is hit
    logEvent(req.user.id, 'SCAN').catch(err => {
      console.error('failed to log scan event', err);
    });
  }
  next();
}

module.exports = { trackScan };
