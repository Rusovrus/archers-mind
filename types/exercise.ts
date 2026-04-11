import { Timestamp } from 'firebase/firestore';
import { Locale } from './user';

export type ExerciseCategory =
  | 'breathing'
  | 'focus'
  | 'visualization'
  | 'recovery'
  | 'precomp';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface LocalizedString {
  ro: string;
  en: string;
}

export interface Exercise {
  id: string;
  title: LocalizedString;
  description: LocalizedString;
  category: ExerciseCategory;
  difficulty: Difficulty;
  duration: number; // seconds
  audioUrl: {
    ro: string;
    en: string;
  };
  transcript?: LocalizedString;
  tags: string[];
  order: number;
  featured: boolean;
}

export interface ExerciseCompletion {
  id: string;
  exerciseId: string;
  category: ExerciseCategory;
  duration: number; // seconds actually practiced
  completedAt: Timestamp;
}

export type ProgramPhase = 'foundation' | 'buildup' | 'peak';

export interface ProgramDay {
  day: number;
  week: number;
  phase: ProgramPhase;
  title: LocalizedString;
  goal: LocalizedString;
  exerciseIds: string[];
  estimatedMinutes: number;
  reflectionPrompts: {
    ro: string[];
    en: string[];
  };
}

export interface DayReflection {
  completed: boolean;
  notes: string;
  rating: number; // 1-10
  completedAt: Timestamp;
}

export interface ProgramProgress {
  programId: string;
  startDate: Timestamp;
  targetCompetitionDate?: Timestamp;
  currentWeek: number;
  currentDay: number;
  completedDays: number[];
  skippedDays: number[];
  dayReflections: Record<string, DayReflection>;
  status: 'active' | 'paused' | 'completed';
  lastActiveAt: Timestamp;
}

export interface RoutineStep {
  order: number;
  name: string;
  duration: number; // seconds
  cue: string;
}

export interface Routine {
  id: string;
  name: string;
  isDefault: boolean;
  steps: RoutineStep[];
  totalDuration: number;
  practiceCount: number;
  lastUsed?: Timestamp;
  createdAt: Timestamp;
}
