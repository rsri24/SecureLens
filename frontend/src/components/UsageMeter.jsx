import React, { useEffect, useState } from 'react';

export default function UsageMeter() {
  const [week, setWeek] = useState(null);
  const [month, setMonth] = useState(null);

  useEffect(() => {
    async function fetchUsage() {
      try {
        const w = await fetch('/usage/week', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const wm = await w.json();
        setWeek(wm);
        const m = await fetch('/usage/month', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setMonth(await m.json());
      } catch (e) {
        console.error(e);
      }
    }
    fetchUsage();
  }, []);

  return (
    <div>
      <h4>Usage</h4>
      {week && <p>This week: {week.scans || 0} scans, OpenAI {week.openaiTokens || 0} tokens</p>}
      {month && <p>This month: {month.scans || 0} scans, OpenAI {month.openaiTokens || 0} tokens</p>}
    </div>
  );
}
