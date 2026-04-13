import { Timestamp } from 'firebase/firestore';
import { LocalizedString } from './exercise';

export type AchievementCategory =
  | 'streak'
  | 'exercises'
  | 'sessions'
  | 'program'
  | 'routine'
  | 'special';

export interface AchievementDef {
  id: string;
  icon: string;
  title: LocalizedString;
  description: LocalizedString;
  category: AchievementCategory;
  /** Field path in User doc to check (e.g. 'preferences.streakCount', 'stats.totalSessions') */
  field: string;
  /** Threshold value to unlock */
  threshold: number;
}

export interface UnlockedAchievement {
  achievementId: string;
  unlockedAt: Timestamp;
}
