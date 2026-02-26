import React from 'react';

export default function ComparisonTable({ openai, claude }) {
  // expect arrays of findings with title, severity, confidence_score
  const titles = new Set();
  openai.forEach(f => titles.add(f.title));
  claude.forEach(f => titles.add(f.title));
  const rows = Array.from(titles).map(title => {
    const o = openai.find(f => f.title === title);
    const c = claude.find(f => f.title === title);
    return { title, openai: o, claude: c };
  });

  return (
    <table border="1" cellPadding="4">
      <thead>
        <tr>
          <th>Vulnerability</th>
          <th>OpenAI (sev/conf)</th>
          <th>Claude (sev/conf)</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(r => (
          <tr key={r.title}>
            <td>{r.title}</td>
            <td>{r.openai ? `${r.openai.severity}/${r.openai.confidence_score}` : '-'}</td>
            <td>{r.claude ? `${r.claude.severity}/${r.claude.confidence_score}` : '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
