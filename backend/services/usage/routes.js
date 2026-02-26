const express = require('express');
const { requireAuth } = require('../../middleware/auth');
const { getWeeklyUsage, getMonthlyUsage } = require('./log');

const router = express.Router();

router.get('/week', requireAuth, async (req, res) => {
  const usage = await getWeeklyUsage(req.user.id);
  res.json(usage);
});

router.get('/month', requireAuth, async (req, res) => {
  const usage = await getMonthlyUsage(req.user.id);
  res.json(usage);
});

module.exports = router;
