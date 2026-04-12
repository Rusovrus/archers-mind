import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  increment,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Routine, RoutineStep } from '@/types/exercise';
import { touchStreak } from '@/lib/streak';

// ── Default pre-shot routine ────────────────────────────────────────
// Static template, similar to exercises in lib/exercises.ts

interface DefaultStep {
  order: number;
  name: { ro: string; en: string };
  duration: number;
  cue: { ro: string; en: string };
}

const DEFAULT_STEPS: DefaultStep[] = [
  {
    order: 1,
    name: { ro: 'Poziție', en: 'Stance' },
    duration: 3,
    cue: { ro: 'Picioare la lățimea umerilor, perpendicular pe țintă', en: 'Feet shoulder-width, square to target' },
  },
  {
    order: 2,
    name: { ro: 'Încarcă săgeata', en: 'Nock arrow' },
    duration: 3,
    cue: { ro: 'Mișcare fluidă, fără grabă', en: 'Smooth, unhurried movement' },
  },
  {
    order: 3,
    name: { ro: 'Priză și cârlig', en: 'Grip & hook' },
    duration: 3,
    cue: { ro: 'Priză relaxată, cârlig adânc pe coardă', en: 'Relaxed grip, deep hook on string' },
  },
  {
    order: 4,
    name: { ro: 'Ridică și trage', en: 'Raise & draw' },
    duration: 5,
    cue: { ro: 'Trage lin, cu spatele, până la ancoră', en: 'Draw smoothly with back muscles to anchor' },
  },
  {
    order: 5,
    name: { ro: 'Ancorare și ochire', en: 'Anchor & aim' },
    duration: 5,
    cue: { ro: 'Ancoră consistentă, focus pe țintă', en: 'Consistent anchor, focus on target' },
  },
  {
    order: 6,
    name: { ro: 'Eliberare', en: 'Release' },
    duration: 3,
    cue: { ro: 'Relaxează degetele, menține poziția', en: 'Relax fingers, hold follow-through' },
  },
];

export function getDefaultRoutine(locale: string): Routine {
  const lang = locale === 'ro' ? 'ro' : 'en';
  const steps: RoutineStep[] = DEFAULT_STEPS.map((s) => ({
    order: s.order,
    name: s.name[lang],
    duration: s.duration,
    cue: s.cue[lang],
  }));

  return {
    id: 'default',
    name: lang === 'ro' ? 'Rutină pre-shot standard' : 'Standard pre-shot routine',
    isDefault: true,
    steps,
    totalDuration: steps.reduce((sum, s) => sum + s.duration, 0),
    practiceCount: 0,
    createdAt: Timestamp.now(),
  };
}

// ── Firestore CRUD for user routines ────────────────────────────────
// Stored in users/{uid}/routines/{routineId}

function routinesRef(uid: string) {
  return collection(db, 'users', uid, 'routines');
}

export async function getUserRoutines(uid: string): Promise<Routine[]> {
  const q = query(routinesRef(uid), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    ...d.data(),
    id: d.id,
  })) as Routine[];
}

export async function getRoutine(uid: string, routineId: string): Promise<Routine | null> {
  const ref = doc(routinesRef(uid), routineId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { ...snap.data(), id: snap.id } as Routine;
}

export async function saveRoutine(
  uid: string,
  data: {
    id?: string;
    name: string;
    steps: RoutineStep[];
  }
): Promise<string> {
  const totalDuration = data.steps.reduce((sum, s) => sum + s.duration, 0);
  const ref = data.id ? doc(routinesRef(uid), data.id) : doc(routinesRef(uid));

  await setDoc(
    ref,
    {
      name: data.name,
      isDefault: false,
      steps: data.steps,
      totalDuration,
      ...(data.id ? {} : { practiceCount: 0, createdAt: serverTimestamp() }),
    },
    { merge: true }
  );

  return ref.id;
}

export async function deleteRoutine(uid: string, routineId: string): Promise<void> {
  await deleteDoc(doc(routinesRef(uid), routineId));
}

export async function recordPractice(uid: string, routineId: string): Promise<void> {
  if (routineId === 'default') {
    // Default routine practice only touches streak + stats
  } else {
    const ref = doc(routinesRef(uid), routineId);
    await updateDoc(ref, {
      practiceCount: increment(1),
      lastUsed: serverTimestamp(),
    });
  }

  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    'stats.totalRoutinePractices': increment(1),
    lastActiveAt: serverTimestamp(),
  });

  await touchStreak(uid);
}
