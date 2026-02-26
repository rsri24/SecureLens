import React, { useState } from 'react';
import UsageMeter from './UsageMeter';

export default function ScanPage({ user }) {
  const [url, setUrl] = useState('');
  const [scan, setScan] = useState(null);
  const [error, setError] = useState();

  async function startScan(e) {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch('/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'scan failed');
      setScan(data.scan);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h2>New Scan</h2>
      <UsageMeter />
      <form onSubmit={startScan}>
        <input
          type="url"
          placeholder="https://example.com"
          value={url}
          onChange={e => setUrl(e.target.value)}
          required
        />
        <button type="submit">Start Scan</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {scan && <p>Scan queued with ID {scan.id}</p>}
    </div>
  );
}
