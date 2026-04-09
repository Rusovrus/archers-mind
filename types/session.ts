import { Timestamp } from 'firebase/firestore';

export type SessionType = 'training' | 'competition' | 'tune';

export type WindLevel = 'none' | 'light' | 'moderate' | 'strong';

export interface SessionConditions {
  indoor: boolean;
  wind: WindLevel;
  temperature?: number;
  lighting?: 'poor' | 'fair' | 'good' | 'excellent';
}

export interface MentalState {
  /** Scale 1-10 */
  preFocus: number;
  preAnxiety: number;
  preConfidence: number;
  postFocus: number;
  postSatisfaction: number;
  dominantEmotion?: string;
}

export interface Session {
  id: string;
  date: Timestamp;
  type: SessionType;
  distance: number; // meters
  arrowCount: number;
  score: number;
  maxScore: number;
  duration: number; // minutes
  conditions: SessionConditions;
  mentalState: MentalState;
  notes: string;
  exercisesUsed: string[];
  tags: string[];
  createdAt: Timestamp;
}

export type NewSession = Omit<Session, 'id' | 'createdAt'>;
