import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export interface DayActivity {
  date: string; // 'YYYY-MM-DD'
  sessions: number;
  exercises: number;
  total: number; // sessions + exercises
  level: 0 | 1 | 2 | 3 | 4; // intensity: 0=none, 1-4=low to high
}

/**
 * Fetch activity data for the last `days` days (default 90).
 * Aggregates sessions and exercise completions per day.
 */
export async function getActivityCalendar(
  uid: string,
  days = 90
): Promise<DayActivity[]> {
  const now = new Date();
  const startDate = new Date(now.getTime() - days * 86_400_000);
  startDate.setHours(0, 0, 0, 0);
  const startTs = Timestamp.fromDate(startDate);

  // Fetch sessions and completions in parallel
  const [sessionsSnap, completionsSnap] = await Promise.all([
    getDocs(
      query(
        collection(db, 'users', uid, 'sessions'),
        where('createdAt', '>=', startTs)
      )
    ),
    getDocs(
      query(
        collection(db, 'users', uid, 'exerciseCompletions'),
        where('completedAt', '>=', startTs)
      )
    ),
  ]);

  // Count per day
  const dayMap = new Map<string, { sessions: number; exercises: number }>();

  sessionsSnap.forEach((doc) => {
    const data = doc.data();
    const ts = data.createdAt as Timestamp;
    if (!ts) return;
    const key = formatDateKey(ts.toDate());
    const entry = dayMap.get(key) || { sessions: 0, exercises: 0 };
    entry.sessions++;
    dayMap.set(key, entry);
  });

  completionsSnap.forEach((doc) => {
    const data = doc.data();
    const ts = data.completedAt as Timestamp;
    if (!ts) return;
    const key = formatDateKey(ts.toDate());
    const entry = dayMap.get(key) || { sessions: 0, exercises: 0 };
    entry.exercises++;
    dayMap.set(key, entry);
  });

  // Build array for all days in range
  const result: DayActivity[] = [];
  const cursor = new Date(startDate);

  while (cursor <= now) {
    const key = formatDateKey(cursor);
    const entry = dayMap.get(key) || { sessions: 0, exercises: 0 };
    const total = entry.sessions + entry.exercises;

    result.push({
      date: key,
      sessions: entry.sessions,
      exercises: entry.exercises,
      total,
      level: total === 0 ? 0 : total === 1 ? 1 : total <= 3 ? 2 : total <= 5 ? 3 : 4,
    });

    cursor.setDate(cursor.getDate() + 1);
  }

  return result;
}

function formatDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
