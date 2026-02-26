const { securityAuditPrompt } = require('./securityPrompt');
const { logEvent } = require('../usage/log');
const { chunkText } = require('./utils');

let client = null;

function getClient() {
  if (!client) {
    const { Anthropic } = require('@anthropic-ai/sdk');
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || 'not-set' });
  }
  return client;
}

const MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514';

async function analyzeWithClaude(data, userId) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }

  const chunks = chunkText(data);
  let aggregateResults = [];
  let totalTokens = 0;

  for (const piece of chunks) {
    const prompt = securityAuditPrompt.replace('${input}', piece);
    try {
      const res = await getClient().messages.create({
        model: MODEL,
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      });
      const message = res.content[0]?.text || '';
      const tokens = (res.usage?.input_tokens || 0) + (res.usage?.output_tokens || 0);
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
