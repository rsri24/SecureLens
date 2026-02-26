import React, { useState, useEffect } from 'react';
import UsageMeter from './UsageMeter';
import ResultsPage from './ResultsPage';

export default function ScanPage({ user }) {
  const [url, setUrl] = useState('');
  const [scan, setScan] = useState(null);
  const [error, setError] = useState();
  const [result, setResult] = useState(null);
  const [polling, setPolling] = useState(false);
  const [loading, setLoading] = useState(false);

  async function startScan(e) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setScan(null);
    setLoading(true);
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
      if (data.scan.status === 'completed' || data.scan.status === 'failed') {
        setResult(data.scan);
        setLoading(false);
      } else {
        setPolling(true);
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
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
        if (data.scan && (data.scan.status === 'completed' || data.scan.status === 'failed')) {
          setResult(data.scan);
          setPolling(false);
          setLoading(false);
          clearInterval(interval);
        }
      } catch (e) {}
    }, 2000);
    return () => clearInterval(interval);
  }, [scan, polling]);

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Security Scan</h2>
      <UsageMeter />
      <form onSubmit={startScan} style={{ marginTop: '16px' }}>
        <input
          type="url"
          placeholder="https://example.com"
          value={url}
          onChange={e => setUrl(e.target.value)}
          required
          style={{ padding: '8px', width: '400px', marginRight: '8px' }}
        />
        <button type="submit" disabled={loading} style={{ padding: '8px 16px' }}>
          {loading ? 'Scanning...' : 'Start Scan'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {loading && <p>Analyzing {url}... This may take a moment.</p>}
      {result && result.status === 'completed' && <ResultsPage scanId={result.id} />}
      {result && result.status === 'failed' && (
        <div style={{ marginTop: '16px', padding: '12px', background: '#fff0f0', border: '1px solid #fcc', borderRadius: '4px' }}>
          <strong>Scan failed:</strong> {result.report && result.report.error}
        </div>
      )}
    </div>
  );
}
