const { canScan, hasFeature } = require('../services/features/featureFlags');

// middleware to enforce that user can perform a scan (respecting plan limits)
async function requireScanPermission(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'not authenticated' });
  }
  const { allowed, reason } = await canScan(req.user);
  if (!allowed) {
    return res.status(403).json({ error: 'scan limit exceeded', detail: reason });
  }
  next();
}

// middleware factory for gating arbitrary features by key
function requireFeature(featureKey) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'not authenticated' });
    }
    if (!hasFeature(req.user, featureKey)) {
      return res.status(403).json({ error: 'feature not available for your plan', feature: featureKey });
    }
    next();
  };
}

module.exports = { requireScanPermission, requireFeature };