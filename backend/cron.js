const cron = require('node-cron');
const { runWeeklyMonitoring } = require('./services/monitor/monitor.service');

// schedule every monday at 3am
cron.schedule('0 3 * * 1', async () => {
  console.log('running weekly monitoring job');
  try {
    await runWeeklyMonitoring();
  } catch (err) {
    console.error('weekly monitoring failed', err);
  }
});

console.log('cron jobs scheduled');
