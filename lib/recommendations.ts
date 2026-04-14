import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from './firebase';
import { getExercisesByCategory } from './exercises';
import { Exercise, ExerciseCategory } from '@/types/exercise';
import { MentalState } from '@/types/session';

interface MentalInsight {
  category: ExerciseCategory;
  reason: 'low_focus' | 'high_anxiety' | 'low_confidence' | 'low_satisfaction';
  avgValue: number;
}

export interface Recommendation {
  exercise: Exercise;
  reason: string; // i18n key
}

/**
 * Analyze the user's recent sessions (last 10) and recommend
 * exercises targeting their weakest mental areas.
 * Returns up to 3 recommendations.
 */
export async function getRecommendations(uid: string): Promise<Recommendation[]> {
  const q = query(
    collection(db, 'users', uid, 'sessions'),
    orderBy('date', 'desc'),
    limit(10)
  );
  const snap = await getDocs(q);

  if (snap.empty) return [];

  // Collect mental state averages
  const states: MentalState[] = [];
  snap.forEach((doc) => {
    const data = doc.data();
    if (data.mentalState) states.push(data.mentalState as MentalState);
  });

  if (states.length < 2) return [];

  const avg = {
    focus: states.reduce((s, m) => s + m.preFocus, 0) / states.length,
    anxiety: states.reduce((s, m) => s + m.preAnxiety, 0) / states.length,
    confidence: states.reduce((s, m) => s + m.preConfidence, 0) / states.length,
    satisfaction: states.reduce((s, m) => s + m.postSatisfaction, 0) / states.length,
  };

  // Identify weak areas (thresholds on 1-10 scale)
  const insights: MentalInsight[] = [];

  if (avg.anxiety > 5.5) {
    insights.push({ category: 'breathing', reason: 'high_anxiety', avgValue: avg.anxiety });
  }
  if (avg.focus < 5.5) {
    insights.push({ category: 'focus', reason: 'low_focus', avgValue: avg.focus });
  }
  if (avg.confidence < 5.5) {
    insights.push({ category: 'visualization', reason: 'low_confidence', avgValue: avg.confidence });
  }
  if (avg.satisfaction < 5.5) {
    insights.push({ category: 'recovery', reason: 'low_satisfaction', avgValue: avg.satisfaction });
  }

  // Sort by severity (worst first)
  insights.sort((a, b) => {
    // For anxiety: higher is worse; for others: lower is worse
    const sevA = a.reason === 'high_anxiety' ? a.avgValue : 10 - a.avgValue;
    const sevB = b.reason === 'high_anxiety' ? b.avgValue : 10 - b.avgValue;
    return sevB - sevA;
  });

  // Pick one exercise per insight, up to 3
  const recommendations: Recommendation[] = [];
  const usedCategories = new Set<ExerciseCategory>();

  for (const insight of insights.slice(0, 3)) {
    if (usedCategories.has(insight.category)) continue;
    usedCategories.add(insight.category);

    const exercises = getExercisesByCategory(insight.category);
    if (exercises.length === 0) continue;

    // Pick a random exercise from the category (stable per day)
    const now = new Date();
    const dayOfYear = Math.floor(
      (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86_400_000
    );
    const exercise = exercises[dayOfYear % exercises.length];

    recommendations.push({
      exercise,
      reason: insight.reason,
    });
  }

  return recommendations;
}
