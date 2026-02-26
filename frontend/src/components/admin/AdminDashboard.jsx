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
  if (error) return <div className="error">Error: {error}</div>;
  if (!stats) return null;

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>Admin Analytics</h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 24,
        marginBottom: 32
      }}>
        <div style={{ background: '#f4f6fa', borderRadius: 8, padding: 20, boxShadow: '0 2px 8px #e3e8f0' }}>
          <h3 style={{ margin: 0, fontSize: '1.1em', color: '#2a7be4' }}>Total Users</h3>
          <div style={{ fontSize: 28, fontWeight: 600 }}>{stats.users}</div>
        </div>
        <div style={{ background: '#f4f6fa', borderRadius: 8, padding: 20, boxShadow: '0 2px 8px #e3e8f0' }}>
          <h3 style={{ margin: 0, fontSize: '1.1em', color: '#2a7be4' }}>Daily Active</h3>
          <div style={{ fontSize: 28, fontWeight: 600 }}>{stats.dau}</div>
        </div>
        <div style={{ background: '#f4f6fa', borderRadius: 8, padding: 20, boxShadow: '0 2px 8px #e3e8f0' }}>
          <h3 style={{ margin: 0, fontSize: '1.1em', color: '#2a7be4' }}>Weekly Scans</h3>
          <div style={{ fontSize: 28, fontWeight: 600 }}>{stats.scans}</div>
        </div>
        <div style={{ background: '#f4f6fa', borderRadius: 8, padding: 20, boxShadow: '0 2px 8px #e3e8f0' }}>
          <h3 style={{ margin: 0, fontSize: '1.1em', color: '#2a7be4' }}>Token Usage</h3>
          <div style={{ fontSize: 16, fontWeight: 500 }}>{JSON.stringify(stats.tokens)}</div>
        </div>
      </div>
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 8 }}>Most Scanned Domains</h3>
        <ul style={{ background: '#f4f6fa', borderRadius: 8, padding: 16, boxShadow: '0 2px 8px #e3e8f0', listStyle: 'none', margin: 0 }}>
          {stats.domains.map(d => (
            <li key={d.domain} style={{ padding: '4px 0', borderBottom: '1px solid #e3e8f0' }}>
              <span style={{ fontWeight: 500 }}>{d.domain}</span>: <span style={{ color: '#2a7be4', fontWeight: 600 }}>{d.count}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 style={{ marginBottom: 8 }}>Users per Plan</h3>
        <pre style={{ background: '#f4f6fa', borderRadius: 8, padding: 12, boxShadow: '0 2px 8px #e3e8f0', fontSize: 15 }}>{JSON.stringify(stats.featureStats, null, 2)}</pre>
      </div>
    </div>
  );
}
