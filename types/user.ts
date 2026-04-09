import { Timestamp } from 'firebase/firestore';

export type Locale = 'ro' | 'en';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'competitive';

export type BowType = 'recurve' | 'compound' | 'barebow' | 'traditional';

export type Goal =
  | 'focus'
  | 'anxiety'
  | 'confidence'
  | 'consistency'
  | 'competition'
  | 'recovery';

export interface UserProfile {
  skillLevel: SkillLevel;
  bowType: BowType;
  yearsOfPractice: number;
  goals: Goal[];
  nextCompetitionDate?: Timestamp | null;
}

export interface UserPreferences {
  notificationsEnabled: boolean;
  dailyReminderTime: string; // "HH:mm" format
  streakCount: number;
  lastStreakDate?: Timestamp;
}

export interface UserStats {
  totalSessions: number;
  totalExercisesCompleted: number;
  totalMinutesMeditation: number;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string | null;
  preferredLanguage: Locale;
  createdAt: Timestamp;
  lastActiveAt: Timestamp;
  onboardingCompleted: boolean;
  profile: UserProfile;
  preferences: UserPreferences;
  stats: UserStats;
}
