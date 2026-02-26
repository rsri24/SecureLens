// featureFlags.js
// Centralized map of what each plan is allowed to do.  Additional gating logic
// can be added here (e.g. checking limits via usage log).  This file exports
// helpers for checking individual features by user object.

const { getWeeklyUsage } = require('../usage/log');

// configuration
const PLAN_CONFIG = {
  FREE: {
    maxScansPerWeek: 5,
    pdfExport: false,
    historicalTrends: false,
    weeklyMonitoring: false,
    complianceReports: false,
    cicdHooks: false,
  },
  PRO: {
    maxScansPerWeek: Infinity,
    pdfExport: true,
    historicalTrends: true,
    weeklyMonitoring: true,
    complianceReports: true,
    cicdHooks: true,
  },
  ENTERPRISE: {
    maxScansPerWeek: Infinity,
    pdfExport: true,
    historicalTrends: true,
    weeklyMonitoring: true,
    complianceReports: true,
    cicdHooks: true,
  },
};

// retrieve plan config (falls back to FREE if unknown)
function getPlanConfig(planType) {
  return PLAN_CONFIG[planType] || PLAN_CONFIG.FREE;
}

// async check for scan permission (enforces weekly limit for free users)
async function canScan(user) {
  const cfg = getPlanConfig(user.planType);
  if (cfg.maxScansPerWeek === Infinity) {
    return { allowed: true };
  }

  const usage = await getWeeklyUsage(user.id);
  const scans = usage.scans || 0;
  if (scans >= cfg.maxScansPerWeek) {
    return { allowed: false, reason: 'weekly scan limit reached' };
  }
  return { allowed: true };
}

// helper for checking if a particular feature is enabled for plan
function hasFeature(user, featureKey) {
  const cfg = getPlanConfig(user.planType);
  return Boolean(cfg[featureKey]);
}

module.exports = { getPlanConfig, canScan, hasFeature };
