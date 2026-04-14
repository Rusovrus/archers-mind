import { Session } from '@/types/session';

/**
 * Generate a CSV string from sessions data.
 */
export function sessionsToCSV(sessions: Session[], locale: string): string {
  const headers = [
    'Date',
    'Type',
    'Distance (m)',
    'Arrows',
    'Score',
    'Max Score',
    'Score %',
    'Duration (min)',
    'Indoor',
    'Wind',
    'Pre-Focus',
    'Pre-Anxiety',
    'Pre-Confidence',
    'Post-Focus',
    'Post-Satisfaction',
    'Dominant Emotion',
    'Notes',
  ];

  const rows = sessions.map((s) => {
    const date = s.date.toDate();
    const dateStr = date.toISOString().split('T')[0];
    const pct = s.maxScore > 0 ? Math.round((s.score / s.maxScore) * 100) : 0;

    return [
      dateStr,
      s.type,
      s.distance,
      s.arrowCount,
      s.score,
      s.maxScore,
      pct,
      s.duration,
      s.conditions.indoor ? 'Yes' : 'No',
      s.conditions.wind,
      s.mentalState.preFocus,
      s.mentalState.preAnxiety,
      s.mentalState.preConfidence,
      s.mentalState.postFocus,
      s.mentalState.postSatisfaction,
      s.mentalState.dominantEmotion || '',
      escapeCSV(s.notes),
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Trigger a CSV file download in the browser.
 */
export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function escapeCSV(value: string): string {
  if (!value) return '';
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
