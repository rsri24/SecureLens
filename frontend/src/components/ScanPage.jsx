import React, { useState, useEffect } from 'react';
import UsageMeter from './UsageMeter';
import ResultsPage from './ResultsPage';

export default function ScanPage({ user }) {
  const [url, setUrl] = useState('');
  const [scan, setScan] = useState(null);
  const [error, setError] = useState();
  const [result, setResult] = useState(null);
  const [polling, setPolling] = useState(false);

  async function startScan(e) {
    e.preventDefault();
    setError(null);
    setResult(null);
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
      setPolling(true);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    if (!scan || !polling) return;
    let interval = setInterval(async () => {
      try {
        const res = await fetch(`/scan/${scan.id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const data = await res.json();
        if (data.scan && data.scan.status === 'completed') {
          setResult(data.scan);
          setPolling(false);
          clearInterval(interval);
        } else if (data.scan && data.scan.status === 'failed') {
          setResult(data.scan);
          setPolling(false);
          clearInterval(interval);
        }
      } catch (e) {
        // ignore polling errors
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [scan, polling]);

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>New Scan</h2>
      <div style={{ marginBottom: 24 }}>
        <UsageMeter />
      </div>
      <form onSubmit={startScan} style={{
        background: '#f4f6fa',
        borderRadius: 10,
        boxShadow: '0 2px 8px #e3e8f0',
        padding: 24,
        marginBottom: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        maxWidth: 480
      }}>
        <label htmlFor="scan-url" style={{ fontWeight: 500, marginBottom: 4 }}>Website URL</label>
        <input
          id="scan-url"
          type="url"
          placeholder="https://example.com"
          value={url}
          onChange={e => setUrl(e.target.value)}
          required
        />
        <button type="submit" style={{ alignSelf: 'flex-start', marginTop: 8 }}>Start Scan</button>
      </form>
      {error && <div className="error">{error}</div>}
      {scan && !result && <div style={{ color: '#2a7be4', fontWeight: 500, marginBottom: 12 }}>Scan queued with ID {scan.id}. Processing...</div>}
      {result && result.status === 'completed' && <ResultsPage scanId={result.id} />}
      {result && result.status === 'failed' && <div className="error">Scan failed: {result.report && result.report.error}</div>}
    </div>
  );
}
