const express = require('express');
const { requireAdmin } = require('../../middleware/admin');
const analytics = require('../analytics/analytics.service');

const router = express.Router();

router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const [users, dau, scans, tokens, domains, featureStats] = await Promise.all([
      analytics.totalUsers(),
      analytics.dailyActiveUsers(),
      analytics.weeklyScans(),
      analytics.tokenUsage(),
      analytics.mostScannedDomains(),
      analytics.featureUsageByPlan(),
    ]);
    res.json({ users, dau, scans, tokens, domains, featureStats });
  } catch (err) {
    console.error('admin stats error', err);
    res.status(500).json({ error: 'failed to compute stats' });
  }
});

module.exports = router;
