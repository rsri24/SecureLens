const { Anthropic } = require('@anthropic/sdk');
const { securityAuditPrompt } = require('./securityPrompt');
const { logEvent } = require('../usage/log');
const { chunkText } = require('./utils');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = process.env.CLAUDE_MODEL || 'claude-2.1';

async function analyzeWithClaude(data, userId) {
  const chunks = chunkText(data);
  let aggregateResults = [];
  let totalTokens = 0;

  for (const piece of chunks) {
    const prompt = securityAuditPrompt.replace('${input}', piece);
    try {
      const res = await client.responses.create({
        model: MODEL,
        input: prompt,
      });
      // Claude wraps output in "output_text" field
      const message = res.output_text;
      const tokens = res?.usage?.total_tokens || 0;
      totalTokens += tokens;

      let parsed;
      try {
        parsed = JSON.parse(message);
      } catch (e) {
        parsed = { parse_error: e.message, raw: message };
      }

      if (Array.isArray(parsed)) {
        aggregateResults = aggregateResults.concat(parsed);
      } else {
        aggregateResults.push(parsed);
      }
    } catch (err) {
      console.error('Claude API error', err);
      aggregateResults.push({ error: err.message });
    }
  }

  if (userId) {
    logEvent(userId, 'CLAUDE_CALL', totalTokens).catch(err => {
      console.error('failed to log claude tokens', err);
    });
  }

  return aggregateResults;
}

module.exports = { analyzeWithClaude };
