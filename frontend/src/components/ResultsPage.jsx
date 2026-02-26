import React, { useEffect, useState } from 'react';
import ScoreViz from './ScoreViz';
import ComparisonTable from './ComparisonTable';

export default function ResultsPage({ scanId }) {
  const [scan, setScan] = useState(null);
  const [openai, setOpenai] = useState([]);
  const [claude, setClaude] = useState([]);
  const [score, setScore] = useState(null);
  const [error, setError] = useState();

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/scan/${scanId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'failed');
        setScan(data.scan);
        if (data.scan.report) {
          setOpenai(data.scan.report.openai || []);
          setClaude(data.scan.report.claude || []);
          setScore(data.scan.report.score);
        }
      } catch (e) {
        setError(e.message);
      }
    }
    load();
  }, [scanId]);

  if (error) return <div className="error">Error: {error}</div>;
  if (!scan) return <p>Loading...</p>;

  return (
    <div>
      <h2 style={{ marginBottom: 18 }}>Scan Results for {scan.url}</h2>
      <div style={{
        background: '#f4f6fa',
        borderRadius: 10,
        boxShadow: '0 2px 8px #e3e8f0',
        padding: 24,
        marginBottom: 24,
        maxWidth: 600
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 500, fontSize: 17 }}>Status:</span>
          <span style={{
            color: scan.status === 'completed' ? '#256029' : scan.status === 'failed' ? '#b71c1c' : '#2a7be4',
            fontWeight: 600,
            fontSize: 17
          }}>{scan.status}</span>
        </div>
        {score != null && <div style={{ marginTop: 18 }}><ScoreViz score={score} /></div>}
      </div>
      <div style={{ marginBottom: 24 }}>
        <ComparisonTable openai={openai} claude={claude} />
      </div>
    </div>
  );
}
