import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { User } from '@/types/user';

export interface ReadinessData {
  score: number; // 0-100
  streakPoints: number; // 0-25
  exercisePoints: number; // 0-25
  sessionPoints: number; // 0-25
  consistencyPoints: number; // 0-25
  weekSessions: number;
  weekExercises: number;
}

/**
 * Calculate mental readiness score (0–100) based on:
 * - Streak (0-25): current consecutive days
 * - Recent exercises (0-25): exercises completed in the last 7 days
 * - Recent sessions (0-25): training sessions in the last 7 days
 * - Consistency (0-25): based on total practice time and program progress
 */
export async function calculateReadiness(
  uid: string,
  user: User
): Promise<ReadinessData> {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86_400_000);
  const weekAgoTs = Timestamp.fromDate(weekAgo);

  // Fetch recent sessions
  const sessionsSnap = await getDocs(
    query(
      collection(db, 'users', uid, 'sessions'),
      where('createdAt', '>=', weekAgoTs)
    )
  );
  const weekSessions = sessionsSnap.size;

  // Fetch recent exercise completions
  const completionsSnap = await getDocs(
    query(
      collection(db, 'users', uid, 'exerciseCompletions'),
      where('completedAt', '>=', weekAgoTs)
    )
  );
  const weekExercises = completionsSnap.size;

  // Streak points: 0-25
  // 1 day = 5pts, 3 days = 15pts, 5+ days = 25pts
  const streak = user.preferences?.streakCount ?? 0;
  const streakPoints = Math.min(25, streak * 5);

  // Exercise points: 0-25
  // 1 exercise = 5pts, 3 = 15pts, 5+ = 25pts
  const exercisePoints = Math.min(25, weekExercises * 5);

  // Session points: 0-25
  // 1 session = 8pts, 2 = 16pts, 3+ = 25pts
  const sessionPoints = Math.min(25, Math.round(weekSessions * 8.33));

  // Consistency points: 0-25
  // Based on total minutes of mental practice
  const totalMinutes = user.stats?.totalMinutesMeditation ?? 0;
  // 60 min = 10pts, 300 min = 20pts, 600+ min = 25pts
  const consistencyPoints = Math.min(25, Math.round(totalMinutes / 24));

  const score = streakPoints + exercisePoints + sessionPoints + consistencyPoints;

  return {
    score: Math.min(100, score),
    streakPoints,
    exercisePoints,
    sessionPoints,
    consistencyPoints,
    weekSessions,
    weekExercises,
  };
}
