// scoring.service.js
// Computes a security confidence score (0–100) from findings produced by
// two models. Also returns a risk level string.
//
// Factors:
// - Each vulnerability contributes based on its severity. Critical/higher
//   severity carry greater weight.
// - Findings seen by both models are treated more reliable (less penalty)
//   whereas single-model findings lower confidence.
// - Critical issues impose a strong downward pressure on the final score.
//
// The returned object:
//   { score: <0-100>, risk_level: 'Low'|'Medium'|'High', explanation: {...} }

const { compareFindings } = require('./comparison.service');

const severityWeight = {
  critical: 50,
  high: 30,
  medium: 15,
  low: 5,
};

function computeScore(openaiFindings, claudeFindings) {
  const comp = compareFindings(openaiFindings, claudeFindings);

  // base penalties
  let penalty = 0;
  let explanation = {
    totalCommon: comp.common.length,
    totalOpenAIOnly: comp.openaiOnly.length,
    totalClaudeOnly: comp.claudeOnly.length,
    weightedSum: 0,
    criticalCount: 0,
  };

  function processList(list, multiplier) {
    for (const f of list) {
      const sev = (f.severity || 'low').toLowerCase();
      const w = severityWeight[sev] || 0;
      explanation.weightedSum += w * multiplier;
      if (sev === 'critical') {
        explanation.criticalCount += 1;
      }
    }
  }

  // common findings are more trustworthy; use smaller multiplier
  processList(comp.common, 0.8);      // 20% confidence boost
  processList(comp.openaiOnly, 1.2); // more penalty
  processList(comp.claudeOnly, 1.2);

  // severity mismatches add a small additional penalty
  penalty += comp.severityMismatches.length * 5;

  // compute raw score as 100 minus weightedSum and other penalties
  let raw = 100 - explanation.weightedSum - penalty;

  // if any critical findings exist at all, clamp raw downward heavily
  if (explanation.criticalCount > 0) {
    raw = Math.min(raw, 100 - 20 * explanation.criticalCount);
  }

  let score = Math.max(0, Math.min(100, Math.round(raw)));

  let risk_level = 'Low';
  if (score < 40) {
    risk_level = 'High';
  } else if (score < 70) {
    risk_level = 'Medium';
  }

  return { score, risk_level, explanation };
}

module.exports = { computeScore };
