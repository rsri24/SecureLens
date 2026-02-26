import React, { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/admin/stats', { credentials: 'include' });
        if (!res.ok) throw new Error('failed to load');
        const data = await res.json();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!stats) return null;

  return (
    <div>
      <h2>Admin Analytics</h2>
      <ul>
        <li>Total users: {stats.users}</li>
        <li>Daily active users: {stats.dau}</li>
        <li>Weekly scans: {stats.scans}</li>
        <li>Token usage: {JSON.stringify(stats.tokens)}</li>
        <li>Most scanned domains:</li>
        <ul>
          {stats.domains.map(d => (
            <li key={d.domain}>{d.domain}: {d.count}</li>
          ))}
        </ul>
        <li>Users per plan: {JSON.stringify(stats.featureStats)}</li>
      </ul>
    </div>
  );
}
