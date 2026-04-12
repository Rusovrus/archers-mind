import { Timestamp } from 'firebase/firestore';

export interface CompetitionDebrief {
  id: string;
  date: Timestamp;
  competitionName: string;
  finalScore: number;
  maxScore: number;
  threeGoodThings: [string, string, string];
  oneImprovement: string;
  overallMood: number; // 1-10
  notes: string;
  createdAt: Timestamp;
}

export type NewDebrief = Omit<CompetitionDebrief, 'id' | 'createdAt'>;
