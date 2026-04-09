import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function scorePercentage(score: number, maxScore: number): number {
  if (maxScore === 0) return 0;
  return Math.round((score / maxScore) * 100 * 10) / 10;
}

export function getSkillLevelLabel(
  level: 'beginner' | 'intermediate' | 'advanced' | 'competitive',
  locale: 'ro' | 'en'
): string {
  const labels = {
    ro: {
      beginner: 'Începător',
      intermediate: 'Intermediar',
      advanced: 'Avansat',
      competitive: 'Competitiv',
    },
    en: {
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
      competitive: 'Competitive',
    },
  };
  return labels[locale][level];
}

export function daysUntil(targetDate: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  const diff = target.getTime() - now.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}
