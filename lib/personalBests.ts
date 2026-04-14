import { Session } from '@/types/session';
import { scorePercentage } from './utils';

export interface PersonalBests {
  bestScorePct: number;
  bestScoreSession: { date: string; distance: number; score: string } | null;
  mostArrowsSession: number;
  longestSessionMin: number;
  bestFocus: number;
  lowestAnxiety: number;
  totalSessions: number;
  totalArrows: number;
  totalMinutes: number;
}

/**
 * Compute personal bests / all-time records from session history.
 */
export function computePersonalBests(sessions: Session[]): PersonalBests {
  if (sessions.length === 0) {
    return {
      bestScorePct: 0,
      bestScoreSession: null,
      mostArrowsSession: 0,
      longestSessionMin: 0,
      bestFocus: 0,
      lowestAnxiety: 10,
      totalSessions: 0,
      totalArrows: 0,
      totalMinutes: 0,
    };
  }

  let bestScorePct = 0;
  let bestScoreSession: PersonalBests['bestScoreSession'] = null;
  let mostArrowsSession = 0;
  let longestSessionMin = 0;
  let bestFocus = 0;
  let lowestAnxiety = 10;
  let totalArrows = 0;
  let totalMinutes = 0;

  for (const s of sessions) {
    const pct = scorePercentage(s.score, s.maxScore);
    if (pct > bestScorePct) {
      bestScorePct = pct;
      const d = s.date.toDate();
      bestScoreSession = {
        date: d.toISOString().split('T')[0],
        distance: s.distance,
        score: `${s.score}/${s.maxScore}`,
      };
    }

    if (s.arrowCount > mostArrowsSession) mostArrowsSession = s.arrowCount;
    if (s.duration > longestSessionMin) longestSessionMin = s.duration;
    if (s.mentalState.preFocus > bestFocus) bestFocus = s.mentalState.preFocus;
    if (s.mentalState.preAnxiety < lowestAnxiety) lowestAnxiety = s.mentalState.preAnxiety;

    totalArrows += s.arrowCount;
    totalMinutes += s.duration;
  }

  return {
    bestScorePct,
    bestScoreSession,
    mostArrowsSession,
    longestSessionMin,
    bestFocus,
    lowestAnxiety,
    totalSessions: sessions.length,
    totalArrows,
    totalMinutes,
  };
}
