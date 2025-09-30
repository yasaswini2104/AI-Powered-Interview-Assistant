// client\src\components\CandidateReportPDF.tsx
import { type Candidate } from '../features/candidatesSlice';

export function CandidateReportPDF({ candidate }: { candidate: Candidate }) {
  if (!candidate) return null;

  // These simple, universal styles are guaranteed to work with html2canvas.
  const styles = {
    page: { width: '210mm', minHeight: '297mm', padding: '20mm', color: '#333', backgroundColor: '#fff', fontSize: '12px', lineHeight: '1.6', fontFamily: 'Arial, sans-serif' },
    header: { borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px' },
    title: { fontSize: '24px', fontWeight: 'bold', color: '#000' },
    sectionTitle: { fontSize: '18px', fontWeight: 'bold', marginTop: '20px', borderBottom: '1px solid #ddd', paddingBottom: '5px', color: '#111' },
    transcriptItem: { marginBottom: '15px', paddingLeft: '10px', borderLeft: '2px solid #eee' },
    flexContainer: { display: 'flex', gap: '20px', marginTop: '15px' },
    list: { listStylePosition: 'inside' as const, paddingLeft: '5px', margin: '0' },
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>{candidate.name} - Interview Report</h1>
        <p><strong>Email:</strong> {candidate.email || 'N/A'}</p>
        <p><strong>Final Score:</strong> {candidate.finalScore.toFixed(1)} / 10</p>
      </div>

      <div>
        <h2 style={styles.sectionTitle}>AI Summary & Insights</h2>
        <p style={{ marginTop: '10px' }}>{candidate.summary || 'No summary available.'}</p>
        <div style={styles.flexContainer}>
          <div>
            <h3><strong>Strengths:</strong></h3>
            <ul style={styles.list}>{candidate.insights.strengths.map((s, i) => <li key={`s-${i}`}>{s}</li>)}</ul>
          </div>
          <div>
            <h3><strong>Weaknesses:</strong></h3>
            <ul style={styles.list}>{candidate.insights.weaknesses.map((w, i) => <li key={`w-${i}`}>{w}</li>)}</ul>
          </div>
        </div>
      </div>

      <div>
        <h2 style={styles.sectionTitle}>Full Interview Transcript</h2>
        {candidate.interviewHistory.map((entry, index) => (
          <div key={`t-${index}`} style={styles.transcriptItem}>
            <p><strong>Q: {entry.question}</strong></p>
            <p><em>A: {entry.answer || "(No answer provided)"}</em></p>
            {entry.feedback && <p><small><strong>AI Feedback:</strong> {entry.feedback}</small></p>}
          </div>
        ))}
      </div>
    </div>
  );
}

