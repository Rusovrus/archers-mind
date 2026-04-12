import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { touchStreak } from '@/lib/streak';
import { exercises as allExercises } from '@/lib/exercises';
import type {
  ProgramDay,
  ProgramPhase,
  ProgramProgress,
  LocalizedString,
  ExerciseCategory,
} from '@/types/exercise';

export const PROGRAM_ID = 'mental-archer-12w';
export const TOTAL_DAYS = 84;
export const DAYS_PER_WEEK = 7;
export const TOTAL_WEEKS = 12;

interface WeekTemplate {
  week: number;
  phase: ProgramPhase;
  theme: LocalizedString;
  goal: LocalizedString;
  categories: ExerciseCategory[];
  estimatedMinutesPerDay: number;
}

// Reflection prompts per phase — each day picks 2 based on day number rotation
const REFLECTION_PROMPTS: Record<ProgramPhase, { ro: string[]; en: string[] }> = {
  foundation: {
    ro: [
      'Ce ai observat despre respirația ta în timpul exercițiului de azi?',
      'Cum te-ai simțit înainte vs. după exercițiu?',
      'Ce gânduri ți-au distras atenția și cum le-ai gestionat?',
      'Care a fost momentul în care te-ai simțit cel mai concentrat?',
      'Ce ai învățat azi despre propria ta minte?',
      'Cum poți aplica ceea ce ai practicat azi la următoarea tragere?',
    ],
    en: [
      'What did you notice about your breathing during today\'s exercise?',
      'How did you feel before vs. after the exercise?',
      'What thoughts distracted you and how did you handle them?',
      'When did you feel most focused?',
      'What did you learn today about your own mind?',
      'How can you apply what you practiced today to your next shooting session?',
    ],
  },
  buildup: {
    ro: [
      'Cum reacționezi când simți presiune în timpul exercițiului?',
      'Ce strategie mentală a funcționat cel mai bine azi?',
      'Ai reușit să menții concentrarea pe tot parcursul? Ce te-a ajutat?',
      'Cum a fost vizualizarea ta azi — clară sau neclară? De ce?',
      'Ce element al exercițiului vrei să îmbunătățești mâine?',
      'Cum poți folosi ce ai practicat azi într-un moment de presiune la concurs?',
    ],
    en: [
      'How do you react when you feel pressure during the exercise?',
      'Which mental strategy worked best today?',
      'Were you able to maintain focus throughout? What helped?',
      'How was your visualization today — clear or unclear? Why?',
      'What element of the exercise do you want to improve tomorrow?',
      'How can you use what you practiced today in a pressure moment at competition?',
    ],
  },
  peak: {
    ro: [
      'Te simți pregătit mental pentru concurs? Ce îți lipsește?',
      'Cum arată rutina ta pre-tragere acum comparativ cu săptămâna 1?',
      'Ce faci când apare o gândire negativă în timpul tragerii?',
      'Care este nivelul tău de încredere de la 1 la 10? Ce l-ar crește?',
      'Descrie cum arată "zona" pentru tine — ce simți când ești complet concentrat?',
      'Ce mesaj ai pentru tine de la concurs? Scrie-l aici.',
    ],
    en: [
      'Do you feel mentally ready for competition? What\'s missing?',
      'How does your pre-shot routine look now compared to week 1?',
      'What do you do when a negative thought appears during shooting?',
      'What\'s your confidence level from 1 to 10? What would increase it?',
      'Describe what "the zone" looks like for you — what do you feel when fully focused?',
      'What message do you have for yourself at competition? Write it here.',
    ],
  },
};

const WEEK_TEMPLATES: WeekTemplate[] = [
  {
    week: 1,
    phase: 'foundation',
    theme: { ro: 'Fundația respirației', en: 'Breathing foundation' },
    goal: {
      ro: 'Învață tehnicile de bază de respirație care îți vor servi toată cariera de arcaș.',
      en: 'Learn the fundamental breathing techniques that will serve you throughout your archery career.',
    },
    categories: ['breathing'],
    estimatedMinutesPerDay: 10,
  },
  {
    week: 2,
    phase: 'foundation',
    theme: { ro: 'Primii pași în concentrare', en: 'First steps in focus' },
    goal: {
      ro: 'Combină respirația cu exerciții simple de atenție pentru a construi controlul mental.',
      en: 'Combine breathing with simple attention drills to build mental control.',
    },
    categories: ['breathing', 'focus'],
    estimatedMinutesPerDay: 12,
  },
  {
    week: 3,
    phase: 'foundation',
    theme: { ro: 'Vizualizarea de bază', en: 'Basic visualization' },
    goal: {
      ro: 'Începe să vizualizezi săgeata perfectă și să-ți antrenezi imaginația pentru performanță.',
      en: 'Start visualizing the perfect arrow and training your imagination for performance.',
    },
    categories: ['breathing', 'visualization'],
    estimatedMinutesPerDay: 15,
  },
  {
    week: 4,
    phase: 'foundation',
    theme: { ro: 'Consolidare fundație', en: 'Foundation consolidation' },
    goal: {
      ro: 'Integrează respirația, atenția și vizualizarea într-o singură rutină scurtă.',
      en: 'Integrate breathing, attention and visualization into one short routine.',
    },
    categories: ['breathing', 'focus', 'visualization'],
    estimatedMinutesPerDay: 15,
  },
  {
    week: 5,
    phase: 'buildup',
    theme: { ro: 'Adâncire concentrare', en: 'Deeper focus' },
    goal: {
      ro: 'Crește durata și calitatea concentrării sub presiune controlată.',
      en: 'Increase the duration and quality of focus under controlled pressure.',
    },
    categories: ['focus', 'visualization'],
    estimatedMinutesPerDay: 18,
  },
  {
    week: 6,
    phase: 'buildup',
    theme: { ro: 'Vizualizare avansată', en: 'Advanced visualization' },
    goal: {
      ro: 'Vizualizează scenarii complete de concurs, inclusiv momentele de presiune.',
      en: 'Visualize complete competition scenarios, including pressure moments.',
    },
    categories: ['visualization', 'precomp'],
    estimatedMinutesPerDay: 20,
  },
  {
    week: 7,
    phase: 'buildup',
    theme: { ro: 'Recuperare între sesiuni', en: 'Recovery between sessions' },
    goal: {
      ro: 'Dezvoltă capacitatea de a reseta mental și fizic între eforturi intense.',
      en: 'Develop the ability to reset mentally and physically between intense efforts.',
    },
    categories: ['recovery', 'focus'],
    estimatedMinutesPerDay: 18,
  },
  {
    week: 8,
    phase: 'buildup',
    theme: { ro: 'Simulare presiune', en: 'Pressure simulation' },
    goal: {
      ro: 'Exersează răspunsul calm la stres prin simulări progresive de concurs.',
      en: 'Practice a calm response to stress through progressive competition simulations.',
    },
    categories: ['precomp', 'focus'],
    estimatedMinutesPerDay: 20,
  },
  {
    week: 9,
    phase: 'peak',
    theme: { ro: 'Pregătire concurs', en: 'Competition prep' },
    goal: {
      ro: 'Rafinează rutinele pre-tragere și procesele mentale pentru ziua de concurs.',
      en: 'Refine pre-shot routines and mental processes for competition day.',
    },
    categories: ['precomp', 'visualization'],
    estimatedMinutesPerDay: 22,
  },
  {
    week: 10,
    phase: 'peak',
    theme: { ro: 'Rutina finală', en: 'Final routine' },
    goal: {
      ro: 'Fixează rutina ta finală de pre-tragere și revizuiește respirația sub presiune.',
      en: 'Lock in your final pre-shot routine and revisit breathing under pressure.',
    },
    categories: ['precomp', 'breathing'],
    estimatedMinutesPerDay: 22,
  },
  {
    week: 11,
    phase: 'peak',
    theme: { ro: 'Încredere maximă', en: 'Peak confidence' },
    goal: {
      ro: 'Consolidează încrederea prin vizualizare și ancorare mentală.',
      en: 'Consolidate confidence through visualization and mental anchoring.',
    },
    categories: ['visualization', 'precomp'],
    estimatedMinutesPerDay: 20,
  },
  {
    week: 12,
    phase: 'peak',
    theme: { ro: 'Gata de concurs', en: 'Competition ready' },
    goal: {
      ro: 'Redu volumul, păstrează acuitatea mentală și intră în concurs cu încredere.',
      en: 'Taper the volume, keep mental sharpness and enter the competition with confidence.',
    },
    categories: ['precomp', 'breathing'],
    estimatedMinutesPerDay: 15,
  },
];

export function getWeekTemplate(week: number): WeekTemplate | null {
  return WEEK_TEMPLATES.find((w) => w.week === week) || null;
}

export function getAllWeekTemplates(): WeekTemplate[] {
  return WEEK_TEMPLATES;
}

export function getPhaseForWeek(week: number): ProgramPhase {
  const template = getWeekTemplate(week);
  return template?.phase ?? 'foundation';
}

export function getProgramDay(dayNumber: number): ProgramDay | null {
  if (dayNumber < 1 || dayNumber > TOTAL_DAYS) return null;
  const week = Math.ceil(dayNumber / DAYS_PER_WEEK);
  const dayInWeek = ((dayNumber - 1) % DAYS_PER_WEEK) + 1;
  const template = getWeekTemplate(week);
  if (!template) return null;

  // Pool of exercises matching the week's categories, stable ordering by exercise.order
  const pool = allExercises
    .filter((e) => template.categories.includes(e.category))
    .sort((a, b) => a.order - b.order);

  const exerciseIds: string[] = [];
  if (pool.length > 0) {
    // Rotate picks so different days within a week use different exercises
    const primaryIdx = (dayInWeek - 1) % pool.length;
    exerciseIds.push(pool[primaryIdx].id);
    if (pool.length > 1) {
      const secondaryIdx = (primaryIdx + 1) % pool.length;
      exerciseIds.push(pool[secondaryIdx].id);
    }
  }

  return {
    day: dayNumber,
    week,
    phase: template.phase,
    title: {
      ro: `Ziua ${dayNumber} — ${template.theme.ro}`,
      en: `Day ${dayNumber} — ${template.theme.en}`,
    },
    goal: template.goal,
    exerciseIds,
    estimatedMinutes: template.estimatedMinutesPerDay,
    reflectionPrompts: getReflectionPrompts(template.phase, dayNumber),
  };
}

function getReflectionPrompts(
  phase: ProgramPhase,
  dayNumber: number
): { ro: string[]; en: string[] } {
  const pool = REFLECTION_PROMPTS[phase];
  const count = pool.ro.length;
  // Pick 2 prompts deterministically based on day number
  const i1 = (dayNumber - 1) % count;
  const i2 = (i1 + 1) % count;
  return {
    ro: [pool.ro[i1], pool.ro[i2]],
    en: [pool.en[i1], pool.en[i2]],
  };
}

function progressRef(uid: string) {
  return doc(db, 'users', uid, 'programProgress', PROGRAM_ID);
}

export async function getProgress(uid: string): Promise<ProgramProgress | null> {
  const snap = await getDoc(progressRef(uid));
  if (!snap.exists()) return null;
  return snap.data() as ProgramProgress;
}

export async function startProgram(
  uid: string,
  targetCompetitionDate?: Date
): Promise<void> {
  const now = Timestamp.now();
  const data: ProgramProgress = {
    programId: PROGRAM_ID,
    startDate: now,
    ...(targetCompetitionDate && {
      targetCompetitionDate: Timestamp.fromDate(targetCompetitionDate),
    }),
    currentWeek: 1,
    currentDay: 1,
    completedDays: [],
    skippedDays: [],
    dayReflections: {},
    status: 'active',
    lastActiveAt: now,
  };
  await setDoc(progressRef(uid), data);
}

export async function completeDay(uid: string, dayNumber: number): Promise<void> {
  const ref = progressRef(uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const progress = snap.data() as ProgramProgress;

  if (progress.completedDays.includes(dayNumber)) return;

  const newCompleted = [...progress.completedDays, dayNumber].sort((a, b) => a - b);
  const isComplete = newCompleted.length >= TOTAL_DAYS;
  const nextDay = isComplete ? TOTAL_DAYS : Math.min(dayNumber + 1, TOTAL_DAYS);
  const nextWeek = Math.ceil(nextDay / DAYS_PER_WEEK);

  await updateDoc(ref, {
    completedDays: newCompleted,
    currentDay: nextDay,
    currentWeek: nextWeek,
    status: isComplete ? 'completed' : 'active',
    lastActiveAt: serverTimestamp(),
  });

  await touchStreak(uid);
}

export function isDayAccessible(
  progress: ProgramProgress | null,
  dayNumber: number
): boolean {
  if (!progress) return false;
  if (dayNumber < 1 || dayNumber > TOTAL_DAYS) return false;
  if (progress.completedDays.includes(dayNumber)) return true;
  return dayNumber <= progress.currentDay;
}

export async function saveReflection(
  uid: string,
  dayNumber: number,
  notes: string,
  rating: number
): Promise<void> {
  const ref = progressRef(uid);
  await updateDoc(ref, {
    [`dayReflections.${dayNumber}`]: {
      completed: true,
      notes,
      rating,
      completedAt: serverTimestamp(),
    },
    lastActiveAt: serverTimestamp(),
  });
}
