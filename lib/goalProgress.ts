import { Session } from '@/types/session';
import { Goal } from '@/types/user';

export type TrendDirection = 'up' | 'down' | 'stable';

export interface GoalProgress {
  goal: Goal;
  current: number;    // recent average (last 5 sessions)
  previous: number;   // earlier average (sessions 6-10)
  trend: TrendDirection;
  label: string;      // i18n key for the metric description
}

/**
 * Compute progress for each of the user's selected goals.
 * Compares the last 5 sessions vs the 5 before that.
 */
export function computeGoalProgress(
  sessions: Session[],
  goals: Goal[]
): GoalProgress[] {
  if (sessions.length < 3 || goals.length === 0) return [];

  // Sessions are desc by date; reverse for chronological
  const chronological = [...sessions].reverse();
  const recent = chronological.slice(-5);
  const earlier = chronological.slice(-10, -5);

  return goals.map((goal) => {
    const { current, previous } = getMetrics(goal, recent, earlier);
    const diff = current - previous;
    // For anxiety, improvement means going DOWN
    const isLowerBetter = goal === 'anxiety';
    const trend: TrendDirection =
      Math.abs(diff) < 0.3
        ? 'stable'
        : isLowerBetter
          ? diff < 0 ? 'up' : 'down'
          : diff > 0 ? 'up' : 'down';

    return {
      goal,
      current: Math.round(current * 10) / 10,
      previous: Math.round(previous * 10) / 10,
      trend,
      label: `goalMetric.${goal}`,
    };
  });
}

function getMetrics(
  goal: Goal,
  recent: Session[],
  earlier: Session[]
): { current: number; previous: number } {
  switch (goal) {
    case 'focus':
      return {
        current: avg(recent, (s) => s.mentalState.preFocus),
        previous: earlier.length > 0 ? avg(earlier, (s) => s.mentalState.preFocus) : 5,
      };
    case 'anxiety':
      return {
        current: avg(recent, (s) => s.mentalState.preAnxiety),
        previous: earlier.length > 0 ? avg(earlier, (s) => s.mentalState.preAnxiety) : 5,
      };
    case 'confidence':
      return {
        current: avg(recent, (s) => s.mentalState.preConfidence),
        previous: earlier.length > 0 ? avg(earlier, (s) => s.mentalState.preConfidence) : 5,
      };
    case 'consistency':
      // Use sessions per week: recent 5 sessions span vs earlier
      return {
        current: sessionsPerWeek(recent),
        previous: earlier.length > 0 ? sessionsPerWeek(earlier) : 1,
      };
    case 'competition':
      // Focus on competition session scores
      return {
        current: avg(
          recent.filter((s) => s.type === 'competition'),
          (s) => s.maxScore > 0 ? (s.score / s.maxScore) * 10 : 5
        ) || avg(recent, (s) => s.maxScore > 0 ? (s.score / s.maxScore) * 10 : 5),
        previous: earlier.length > 0
          ? avg(
              earlier.filter((s) => s.type === 'competition'),
              (s) => s.maxScore > 0 ? (s.score / s.maxScore) * 10 : 5
            ) || avg(earlier, (s) => s.maxScore > 0 ? (s.score / s.maxScore) * 10 : 5)
          : 5,
      };
    case 'recovery':
      return {
        current: avg(recent, (s) => s.mentalState.postSatisfaction),
        previous: earlier.length > 0 ? avg(earlier, (s) => s.mentalState.postSatisfaction) : 5,
      };
    default:
      return { current: 5, previous: 5 };
  }
}

function avg(sessions: Session[], extract: (s: Session) => number): number {
  if (sessions.length === 0) return 0;
  return sessions.reduce((sum, s) => sum + extract(s), 0) / sessions.length;
}

function sessionsPerWeek(sessions: Session[]): number {
  if (sessions.length < 2) return sessions.length;
  const first = sessions[0].date.toDate().getTime();
  const last = sessions[sessions.length - 1].date.toDate().getTime();
  const weeks = Math.max((last - first) / (7 * 86_400_000), 1);
  return Math.round((sessions.length / weeks) * 10) / 10;
}
