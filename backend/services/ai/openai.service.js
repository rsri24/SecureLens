const { securityAuditPrompt } = require('./securityPrompt');
const { logEvent } = require('../usage/log');
const { chunkText } = require('./utils');

let client = null;

function getClient() {
  if (!client) {
    const OpenAI = require('openai');
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'not-set' });
  }
  return client;
}

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

async function analyzeWithOpenAI(data, userId) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const chunks = chunkText(data);
  let aggregateResults = [];
  let totalTokens = 0;

  for (const piece of chunks) {
    const prompt = securityAuditPrompt.replace('${input}', piece);
    try {
      const res = await getClient().chat.completions.create({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
      });
      const message = res.choices[0].message.content;
      const tokens = res.usage?.total_tokens || 0;
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
      console.error('OpenAI API error', err);
      aggregateResults.push({ error: err.message });
    }
  }

  if (userId) {
    logEvent(userId, 'OPENAI_CALL', totalTokens).catch(err => {
      console.error('failed to log openai tokens', err);
    });
  }

  return aggregateResults;
}

module.exports = { analyzeWithOpenAI };
