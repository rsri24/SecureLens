import React from 'react';

export default function ScoreViz({ score }) {
  let color = 'green';
  if (score < 40) color = 'red';
  else if (score < 70) color = 'orange';
  return (
    <div>
      <h3>Security Score</h3>
      <div style={{ fontSize: '2rem', color }}>{score}</div>
    </div>
  );
}
