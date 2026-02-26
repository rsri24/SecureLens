const prisma = require('../../shared/prismaClient');
const { subWeeks, subMonths, startOfWeek, startOfMonth } = require('date-fns');

async function logEvent(userId, eventType, tokensUsed = 0) {
  return prisma.usageEvent.create({
    data: { userId, eventType, tokensUsed },
  });
}

async function getUsageInRange(userId, start, end) {
  return prisma.usageEvent.findMany({
    where: {
      userId,
      createdAt: { gte: start, lt: end },
    },
  });
}

async function aggregateUsage(userId, start, end) {
  const events = await getUsageInRange(userId, start, end);
  const summary = {
    scans: 0,
    openaiTokens: 0,
    claudeTokens: 0,
  };
  for (const ev of events) {
    switch (ev.eventType) {
      case 'SCAN':
        summary.scans += 1;
        break;
      case 'OPENAI_CALL':
        summary.openaiTokens += ev.tokensUsed;
        break;
      case 'CLAUDE_CALL':
        summary.claudeTokens += ev.tokensUsed;
        break;
    }
  }
  return summary;
}

async function getWeeklyUsage(userId) {
  const now = new Date();
  const start = startOfWeek(now, { weekStartsOn: 1 }); // Monday
  const end = now;
  return aggregateUsage(userId, start, end);
}

async function getMonthlyUsage(userId) {
  const now = new Date();
  const start = startOfMonth(now);
  const end = now;
  return aggregateUsage(userId, start, end);
}

module.exports = {
  logEvent,
  getWeeklyUsage,
  getMonthlyUsage,
  getUsageInRange,
  aggregateUsage,
};
