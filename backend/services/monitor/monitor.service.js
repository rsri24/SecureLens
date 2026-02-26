const prisma = require('../../shared/prismaClient');
const { crawl } = require('../crawler/crawler.service');
const { analyzeWithOpenAI, analyzeWithClaude } = require('../ai/openai.service');
const { computeScore } = require('../ai/scoring.service');

// simple alert handler; in a real app this may send email/Slack/etc.
async function alertUser(userId, url, oldScore, newScore, oldRisk, newRisk) {
  console.log(`ALERT user ${userId}: score for ${url} changed from ${oldScore} (${oldRisk}) to ${newScore} (${newRisk})`);
  // we could also store in a table or push notification
}

async function recordHistory(userId, url, score, riskLevel) {
  return prisma.scanHistory.create({
    data: { userId, url, score, riskLevel },
  });
}

async function rescanUrl(scan) {
  // scan object with {id, userId, url, lastScore, lastRiskLevel}
  const { url, userId, lastScore, lastRiskLevel } = scan;
  // fetch page, run AI analysis
  const data = await crawl(url);
  const combined = JSON.stringify(data); // naive
  const openaiRes = await analyzeWithOpenAI(combined, userId);
  const claudeRes = await analyzeWithClaude(combined, userId);
  const { score, risk_level } = computeScore(openaiRes, claudeRes);

  // store history
  await recordHistory(userId, url, score, risk_level);

  // alert if risk increased
  if (lastScore != null && (score < lastScore || risk_level !== lastRiskLevel)) {
    await alertUser(userId, url, lastScore, score, lastRiskLevel, risk_level);
  }

  // update scan record
  await prisma.scan.update({
    where: { id: scan.id },
    data: { lastScore: score, lastRiskLevel: risk_level },
  });
};

async function runWeeklyMonitoring() {
  const scans = await prisma.scan.findMany({});
  for (const s of scans) {
    try {
      await rescanUrl(s);
    } catch (e) {
      console.error('error rescanning', s.url, e.message);
    }
  }
}

module.exports = { runWeeklyMonitoring };
