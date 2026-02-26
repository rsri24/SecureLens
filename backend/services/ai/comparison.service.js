// comparison.service.js
// provides functions to reconcile two sets of vulnerability findings
// produced by different AI providers (OpenAI and Claude).

function normalizeFinding(f) {
  // normalize title for comparison: lowercase and trim
  return {
    ...f,
    title: (f.title || '').trim().toLowerCase(),
  };
}

function compareFindings(openaiFindings, claudeFindings) {
  const oList = openaiFindings.map(normalizeFinding);
  const cList = claudeFindings.map(normalizeFinding);

  const common = [];
  const openaiOnly = [];
  const claudeOnly = [];
  const severityMismatches = [];
  const confidenceDeltas = [];

  const cMap = new Map();
  cList.forEach(f => cMap.set(f.title, f));

  // process openai list
  oList.forEach(o => {
    const match = cMap.get(o.title);
    if (match) {
      common.push(o);
      if (o.severity !== match.severity) {
        severityMismatches.push({
          title: o.title,
          openai: o.severity,
          claude: match.severity,
        });
      }
      if (typeof o.confidence_score === 'number' && typeof match.confidence_score === 'number') {
        confidenceDeltas.push({
          title: o.title,
          openai: o.confidence_score,
          claude: match.confidence_score,
          delta: o.confidence_score - match.confidence_score,
        });
      }
      cMap.delete(o.title);
    } else {
      openaiOnly.push(o);
    }
  });

  // remaining in cMap are Claude-only
  for (const [, f] of cMap) {
    claudeOnly.push(f);
  }

  return {
    common,
    openaiOnly,
    claudeOnly,
    severityMismatches,
    confidenceDeltas,
  };
}

module.exports = { compareFindings };
