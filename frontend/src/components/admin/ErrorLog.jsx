import React, { useEffect, useState } from 'react';

export default function ErrorLog() {
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();

  useEffect(() => {
    async function fetchErrors() {
      try {
        const res = await fetch('/admin/errors', { credentials: 'include' });
        const data = await res.json();
        setErrors(data.errors || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchErrors();
  }, []);

  if (loading) return <p>Loading error logs...</p>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!errors.length) return <div className="success">No recent errors.</div>;

  return (
    <div>
      <h3 style={{ marginBottom: 16 }}>Recent Error Logs</h3>
      <ul style={{
        maxHeight: 340,
        overflow: 'auto',
        fontSize: '0.98em',
        background: '#f8d7da',
        color: '#721c24',
        padding: 18,
        borderRadius: 8,
        boxShadow: '0 2px 8px #e3e8f0',
        listStyle: 'none',
        margin: 0
      }}>
        {errors.map((err, i) => (
          <li key={i} style={{ marginBottom: 18, borderBottom: '1px solid #f5c6cb', paddingBottom: 10 }}>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{err.timestamp}</div>
            <div style={{ color: '#b71c1c', fontWeight: 500 }}>{err.message}</div>
            {err.url && <div style={{ fontSize: 14 }}>URL: <span style={{ color: '#2a7be4' }}>{err.url}</span></div>}
            {err.scanId && <div style={{ fontSize: 14 }}>Scan ID: <span style={{ color: '#2a7be4' }}>{err.scanId}</span></div>}
            {err.userId && <div style={{ fontSize: 14 }}>User ID: <span style={{ color: '#2a7be4' }}>{err.userId}</span></div>}
            {err.stack && <pre style={{ whiteSpace: 'pre-wrap', color: '#555', background: '#fff', borderRadius: 6, padding: 8, marginTop: 6, fontSize: 13 }}>{err.stack}</pre>}
          </li>
        ))}
      </ul>
    </div>
  );
}
