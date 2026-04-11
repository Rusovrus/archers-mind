import { doc, runTransaction, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function calendarDaysBetween(earlier: Date, later: Date): number {
  const a = new Date(earlier.getFullYear(), earlier.getMonth(), earlier.getDate()).getTime();
  const b = new Date(later.getFullYear(), later.getMonth(), later.getDate()).getTime();
  return Math.round((b - a) / 86_400_000);
}

/**
 * Updates the user's streak based on the current date.
 * - Same day as last activity: no-op
 * - Next calendar day: increments streakCount
 * - Gap > 1 day or first activity: resets streakCount to 1
 */
export async function touchStreak(uid: string): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(userRef);
    if (!snap.exists()) return;

    const data = snap.data();
    const now = new Date();
    const lastTs = data.preferences?.lastStreakDate as Timestamp | undefined;
    const lastDate = lastTs ? lastTs.toDate() : null;
    const current = (data.preferences?.streakCount as number | undefined) ?? 0;

    let newCount: number;

    if (!lastDate) {
      newCount = 1;
    } else if (isSameDay(lastDate, now)) {
      return; // already counted today
    } else if (calendarDaysBetween(lastDate, now) === 1) {
      newCount = current + 1;
    } else {
      newCount = 1;
    }

    tx.update(userRef, {
      'preferences.streakCount': newCount,
      'preferences.lastStreakDate': Timestamp.fromDate(now),
    });
  });
}
