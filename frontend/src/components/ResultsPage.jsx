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

  if (error) return <p>Error: {error}</p>;
  if (!scan) return <p>Loading...</p>;

  return (
    <div>
      <h2>Scan Results for {scan.url}</h2>
      <p>Status: {scan.status}</p>
      {score != null && <ScoreViz score={score} />}
      <ComparisonTable openai={openai} claude={claude} />
    </div>
  );
}
