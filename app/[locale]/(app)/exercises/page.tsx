'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Clock, ChevronRight } from 'lucide-react';
import { getExercises } from '@/lib/exercises';
import { ExerciseCategory } from '@/types/exercise';
import { cn } from '@/lib/utils';

const categories: (ExerciseCategory | 'all')[] = [
  'all',
  'breathing',
  'focus',
  'visualization',
  'recovery',
  'precomp',
];

const categoryIcons: Record<string, string> = {
  all: '✨',
  breathing: '🌬️',
  focus: '🎯',
  visualization: '👁️',
  recovery: '🧘',
  precomp: '🏆',
};

const difficultyColors: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-amber-100 text-amber-700',
  advanced: 'bg-red-100 text-red-700',
};

export default function ExercisesPage() {
  const params = useParams();
  const locale = (params.locale as string) || 'ro';
  const t = useTranslations('exercises');

  const [activeCategory, setActiveCategory] = useState<ExerciseCategory | 'all'>('all');

  const allExercises = getExercises();
  const filtered =
    activeCategory === 'all'
      ? allExercises
      : allExercises.filter((e) => e.category === activeCategory);

  return (
    <div className="px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">{t('title')}</h1>
        <p className="mt-1 text-sm text-stone-500">{t('subtitle')}</p>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              'flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
              activeCategory === cat
                ? 'bg-amber-800 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            )}
          >
            <span>{categoryIcons[cat]}</span>
            {t(`categories.${cat}`)}
          </button>
        ))}
      </div>

      {/* Exercise list */}
      <div className="space-y-3">
        {filtered.map((exercise) => {
          const minutes = Math.round(exercise.duration / 60);
          return (
            <Link
              key={exercise.id}
              href={`/${locale}/exercises/${exercise.id}`}
              className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-4 shadow-sm hover:bg-stone-50 transition-colors"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-lg">
                {categoryIcons[exercise.category]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-stone-900">
                  {exercise.title[locale as 'ro' | 'en']}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className={cn(
                      'inline-block rounded-full px-2 py-0.5 text-xs font-medium',
                      difficultyColors[exercise.difficulty]
                    )}
                  >
                    {t(`difficulty.${exercise.difficulty}`)}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-stone-400">
                    <Clock size={12} />
                    {minutes} min
                  </span>
                </div>
              </div>
              <ChevronRight size={18} className="text-stone-300" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
