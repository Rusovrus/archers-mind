import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { AchievementDef, UnlockedAchievement } from '@/types/achievements';
import { User } from '@/types/user';

// ── Static achievement definitions ──────────────────────────────────────

export const achievements: AchievementDef[] = [
  // Streak
  {
    id: 'streak-3',
    icon: '🔥',
    title: { ro: 'Scânteia', en: 'Spark' },
    description: { ro: '3 zile consecutive de practică', en: '3 consecutive days of practice' },
    category: 'streak',
    field: 'preferences.streakCount',
    threshold: 3,
  },
  {
    id: 'streak-7',
    icon: '🔥',
    title: { ro: 'Flacăra', en: 'Flame' },
    description: { ro: '7 zile consecutive de practică', en: '7 consecutive days of practice' },
    category: 'streak',
    field: 'preferences.streakCount',
    threshold: 7,
  },
  {
    id: 'streak-30',
    icon: '🌋',
    title: { ro: 'Vulcanul', en: 'Volcano' },
    description: { ro: '30 de zile consecutive', en: '30 consecutive days' },
    category: 'streak',
    field: 'preferences.streakCount',
    threshold: 30,
  },

  // Exercises completed
  {
    id: 'exercises-1',
    icon: '🧠',
    title: { ro: 'Prima respirație', en: 'First Breath' },
    description: { ro: 'Primul exercițiu mental completat', en: 'First mental exercise completed' },
    category: 'exercises',
    field: 'stats.totalExercisesCompleted',
    threshold: 1,
  },
  {
    id: 'exercises-10',
    icon: '🧘',
    title: { ro: 'Practicant dedicat', en: 'Dedicated Practitioner' },
    description: { ro: '10 exerciții mentale completate', en: '10 mental exercises completed' },
    category: 'exercises',
    field: 'stats.totalExercisesCompleted',
    threshold: 10,
  },
  {
    id: 'exercises-50',
    icon: '🏅',
    title: { ro: 'Maestru mental', en: 'Mental Master' },
    description: { ro: '50 de exerciții mentale completate', en: '50 mental exercises completed' },
    category: 'exercises',
    field: 'stats.totalExercisesCompleted',
    threshold: 50,
  },
  {
    id: 'exercises-100',
    icon: '💎',
    title: { ro: 'Diamant', en: 'Diamond' },
    description: { ro: '100 de exerciții mentale completate', en: '100 mental exercises completed' },
    category: 'exercises',
    field: 'stats.totalExercisesCompleted',
    threshold: 100,
  },

  // Sessions
  {
    id: 'sessions-1',
    icon: '🎯',
    title: { ro: 'Prima săgeată', en: 'First Arrow' },
    description: { ro: 'Prima sesiune înregistrată', en: 'First session logged' },
    category: 'sessions',
    field: 'stats.totalSessions',
    threshold: 1,
  },
  {
    id: 'sessions-10',
    icon: '🏹',
    title: { ro: 'Arcaș dedicat', en: 'Dedicated Archer' },
    description: { ro: '10 sesiuni de antrenament', en: '10 training sessions' },
    category: 'sessions',
    field: 'stats.totalSessions',
    threshold: 10,
  },
  {
    id: 'sessions-50',
    icon: '🥇',
    title: { ro: 'Veteranul', en: 'The Veteran' },
    description: { ro: '50 de sesiuni de antrenament', en: '50 training sessions' },
    category: 'sessions',
    field: 'stats.totalSessions',
    threshold: 50,
  },

  // Meditation minutes
  {
    id: 'minutes-60',
    icon: '⏱️',
    title: { ro: 'Prima oră', en: 'First Hour' },
    description: { ro: '60 de minute de practică mentală', en: '60 minutes of mental practice' },
    category: 'exercises',
    field: 'stats.totalMinutesMeditation',
    threshold: 60,
  },
  {
    id: 'minutes-300',
    icon: '🕐',
    title: { ro: '5 ore de minte', en: '5 Hours of Mind' },
    description: { ro: '300 de minute de practică mentală', en: '300 minutes of mental practice' },
    category: 'exercises',
    field: 'stats.totalMinutesMeditation',
    threshold: 300,
  },
];

// ── Runtime logic ───────────────────────────────────────────────────────

/** Get a nested field value from an object using dot notation */
function getNestedValue(obj: Record<string, unknown>, path: string): number {
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return 0;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === 'number' ? current : 0;
}

/** Fetch already-unlocked achievement IDs for a user */
export async function getUnlockedAchievements(
  uid: string
): Promise<Map<string, UnlockedAchievement>> {
  const snap = await getDocs(collection(db, 'users', uid, 'achievements'));
  const map = new Map<string, UnlockedAchievement>();
  snap.forEach((d) => map.set(d.id, d.data() as UnlockedAchievement));
  return map;
}

/**
 * Check all achievements against the user's current stats.
 * Returns the list of newly unlocked achievement IDs (empty if none).
 */
export async function checkAchievements(
  uid: string,
  user: User
): Promise<AchievementDef[]> {
  const unlocked = await getUnlockedAchievements(uid);
  const newlyUnlocked: AchievementDef[] = [];

  const userData = user as unknown as Record<string, unknown>;

  for (const achievement of achievements) {
    // Skip already unlocked
    if (unlocked.has(achievement.id)) continue;

    const value = getNestedValue(userData, achievement.field);
    if (value >= achievement.threshold) {
      // Unlock it
      await setDoc(doc(db, 'users', uid, 'achievements', achievement.id), {
        achievementId: achievement.id,
        unlockedAt: serverTimestamp(),
      });
      newlyUnlocked.push(achievement);
    }
  }

  return newlyUnlocked;
}

/** Get a single achievement def by ID */
export function getAchievement(id: string): AchievementDef | undefined {
  return achievements.find((a) => a.id === id);
}
