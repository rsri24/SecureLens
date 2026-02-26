const express = require('express');
const { requireAuth } = require('../../middleware/auth');
const { trackScan } = require('../../middleware/usage');
const { requireScanPermission } = require('../../middleware/planCheck');
const prisma = require('../../shared/prismaClient');

const router = express.Router();

// POST /scan - save URL and queue analysis
router.post('/', requireAuth, requireScanPermission, trackScan, async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'url required' });
  }
  try {
    const scan = await prisma.scan.create({
      data: { userId: req.user.id, url },
    });
    // queue logic would go here
    res.json({ message: 'scan queued', scan });
  } catch (err) {
    console.error('scan create error', err);
    res.status(500).json({ error: 'failed to create scan' });
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
