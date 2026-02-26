const prisma = require('../../shared/prismaClient');
const { subDays, startOfDay, subWeeks } = require('date-fns');

async function totalUsers() {
  return prisma.user.count();
}

async function dailyActiveUsers() {
  const since = subDays(new Date(), 1);
  return prisma.user.count({ where: { lastLogin: { gte: since } } });
}

async function weeklyScans() {
  const since = subWeeks(new Date(), 1);
  const events = await prisma.usageEvent.aggregate({
    _count: { _all: true },
    where: { eventType: 'SCAN', createdAt: { gte: since } },
  });
  return events._count._all;
}

async function tokenUsage() {
  const res = await prisma.usageEvent.groupBy({
    by: ['eventType'],
    _sum: { tokensUsed: true },
  });
  // return object { OPENAI_CALL: total, CLAUDE_CALL: total }
  const out = {};
  for (const r of res) {
    out[r.eventType] = r._sum.tokensUsed || 0;
  }
  return out;
}

async function mostScannedDomains(limit = 10) {
  const histories = await prisma.scanHistory.findMany({ select: { url: true } });
  const counts = {};
  histories.forEach(h => {
    try {
      const url = new URL(h.url);
      const host = url.host;
      counts[host] = (counts[host] || 0) + 1;
    } catch (_) {}
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([domain, count]) => ({ domain, count }));
}

async function featureUsageByPlan() {
  const users = await prisma.user.groupBy({ by: ['planType'], _count: { planType: true } });
  const out = {};
  users.forEach(u => {
    out[u.planType] = u._count.planType;
  });
  return out;
}

module.exports = {
  totalUsers,
  dailyActiveUsers,
  weeklyScans,
  tokenUsage,
  mostScannedDomains,
  featureUsageByPlan,
};
