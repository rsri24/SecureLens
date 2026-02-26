const express = require('express');
const { requireAuth } = require('../../middleware/auth');
const { trackScan } = require('../../middleware/usage');
const { requireScanPermission } = require('../../middleware/planCheck');
const prisma = require('../../shared/prismaClient');
const { crawl } = require('../crawler/crawler.service');
const { analyzeWithOpenAI } = require('../ai/openai.service');
const { analyzeWithClaude } = require('../ai/claude.service');
const { computeScore } = require('../ai/scoring.service');
const { logError } = require('../log/errorLogger');
const withTimeout = (promise, ms, errorMsg) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(errorMsg)), ms)),
  ]);
};

const router = express.Router();

// POST /scan - save URL and queue analysis
router.post('/', requireAuth, requireScanPermission, trackScan, async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'url required' });
  }
  try {
    // create scan record with status 'queued'
    let scan = await prisma.scan.create({
      data: { userId: req.user.id, url, status: 'queued' },
    });

    // Immediately process scan with timeouts and error logging
    let status = 'processing';
    let report = null;
    try {
      // Crawl the URL (timeout 15s)
      const crawlData = await withTimeout(crawl(url), 15000, 'Crawling timed out');
      const inputData = JSON.stringify(crawlData);
      // Run AI analysis (timeout 30s each)
      const openaiResults = await withTimeout(analyzeWithOpenAI(inputData, req.user.id), 30000, 'OpenAI analysis timed out');
      const claudeResults = await withTimeout(analyzeWithClaude(inputData, req.user.id), 30000, 'Claude analysis timed out');
      // Compute score
      const scoreObj = computeScore(openaiResults, claudeResults);
      // Build report
      report = {
        openai: openaiResults,
        claude: claudeResults,
        score: scoreObj.score,
        risk_level: scoreObj.risk_level,
        explanation: scoreObj.explanation,
      };
      status = 'completed';
    } catch (err) {
      status = 'failed';
      report = { error: err.message, stack: err.stack };
      logError(err, { url, scanId: scan.id, userId: req.user.id });
      console.error('Scan processing error:', err);
    }

    // Update scan record
    scan = await prisma.scan.update({
      where: { id: scan.id },
      data: { status, report },
    });

    res.json({ message: status === 'completed' ? 'scan completed' : 'scan failed', scan });
  } catch (err) {
    logError(err, { url, userId: req.user && req.user.id });
    console.error('scan create error', err);
    res.status(500).json({ error: 'failed to create scan', detail: err.message });
  }
});

// GET /scan/:id - get scan status/result
router.get('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const scan = await prisma.scan.findUnique({ where: { id: Number(id) } });
  if (!scan || scan.userId !== req.user.id) {
    return res.status(404).json({ error: 'scan not found' });
  }
  res.json({ scan });
});

module.exports = router;
