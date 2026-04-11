'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ChevronRight, Check, Lock, Flag } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  getProgress,
  getAllWeekTemplates,
  TOTAL_DAYS,
  TOTAL_WEEKS,
  DAYS_PER_WEEK,
} from '@/lib/program';
import { ProgramProgress, ProgramPhase } from '@/types/exercise';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const phaseColors: Record<ProgramPhase, string> = {
  foundation: 'bg-green-100 text-green-700',
  buildup: 'bg-amber-100 text-amber-800',
  peak: 'bg-red-100 text-red-700',
};

export default function ProgramPage() {
  const { firebaseUser, loading: authLoading } = useAuth();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('program');
  const tc = useTranslations('common');

  const [progress, setProgress] = useState<ProgramProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser) return;
    getProgress(firebaseUser.uid)
      .then(setProgress)
      .finally(() => setLoading(false));
  }, [firebaseUser]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-stone-400">{tc('loading')}</p>
      </div>
    );
  }

  // Not started yet
  if (!progress) {
    return (
      <div className="px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">{t('title')}</h1>
          <p className="mt-1 text-sm text-stone-500">{t('subtitle')}</p>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-3xl">
            📅
          </div>
          <div>
            <p className="font-semibold text-stone-900">{t('notStarted')}</p>
            <p className="mt-2 text-sm text-stone-500">{t('notStartedDesc')}</p>
          </div>
          <Link href={`/${locale}/program/setup`} className="block">
            <Button>{t('start')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const doneCount = progress.completedDays.length;
  const percent = Math.round((doneCount / TOTAL_DAYS) * 100);
  const templates = getAllWeekTemplates();
  const isProgramComplete = progress.status === 'completed';

  return (
    <div className="px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">{t('title')}</h1>
        <p className="mt-1 text-sm text-stone-500">{t('subtitle')}</p>
      </div>

      {/* Progress card */}
      <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
            {t('progressLabel', { done: doneCount, total: TOTAL_DAYS })}
          </p>
          <p className="text-xs font-semibold text-amber-800">{percent}%</p>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-stone-100">
          <div
            className="h-full bg-amber-800 transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>

        {isProgramComplete ? (
          <p className="text-sm text-green-700">{t('completedAll')}</p>
        ) : (
          <Link
            href={`/${locale}/program/day/${progress.currentDay}`}
            className="flex items-center justify-between rounded-lg bg-amber-50 px-4 py-3 hover:bg-amber-100 transition-colors"
          >
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-amber-700">
                {t('currentDayLabel')}
              </p>
              <p className="mt-0.5 font-semibold text-stone-900">
                {t('day', { day: progress.currentDay })} &middot; {t('week', { week: progress.currentWeek })}
              </p>
            </div>
            <ChevronRight size={18} className="text-amber-700" />
          </Link>
        )}
      </div>

      {/* Weeks list */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-stone-400 mb-3">
          {t('weeksList')}
        </p>
        <div className="space-y-2">
          {templates.map((template) => {
            const weekStart = (template.week - 1) * DAYS_PER_WEEK + 1;
            const weekEnd = weekStart + DAYS_PER_WEEK - 1;
            const completedInWeek = progress.completedDays.filter(
              (d) => d >= weekStart && d <= weekEnd
            ).length;
            const weekCompleted = completedInWeek === DAYS_PER_WEEK;
            const isCurrent = template.week === progress.currentWeek && !isProgramComplete;
            const isLocked = template.week > progress.currentWeek;

            return (
              <Link
                key={template.week}
                href={`/${locale}/program/day/${weekStart}`}
                className={cn(
                  'flex items-center gap-3 rounded-xl border p-4 transition-colors',
                  weekCompleted
                    ? 'border-green-200 bg-green-50/50'
                    : isCurrent
                      ? 'border-amber-300 bg-amber-50'
                      : isLocked
                        ? 'border-stone-200 bg-stone-50 opacity-60'
                        : 'border-stone-200 bg-white hover:bg-stone-50'
                )}
              >
                <div
                  className={cn(
                    'flex h-11 w-11 items-center justify-center rounded-lg text-sm font-bold',
                    weekCompleted
                      ? 'bg-green-100 text-green-700'
                      : isLocked
                        ? 'bg-stone-100 text-stone-400'
                        : 'bg-amber-100 text-amber-800'
                  )}
                >
                  {weekCompleted ? (
                    <Check size={20} />
                  ) : isLocked ? (
                    <Lock size={16} />
                  ) : (
                    <span>W{template.week}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                        phaseColors[template.phase]
                      )}
                    >
                      {t(`phases.${template.phase}`)}
                    </span>
                    {isCurrent && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                        <Flag size={10} />
                        {t('current')}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 font-medium text-stone-900">
                    {template.theme[locale as 'ro' | 'en']}
                  </p>
                  <p className="mt-0.5 text-xs text-stone-400">
                    {completedInWeek}/{DAYS_PER_WEEK} {locale === 'ro' ? 'zile' : 'days'}
                  </p>
                </div>
                {!isLocked && <ChevronRight size={18} className="text-stone-300" />}
              </Link>
            );
          })}
        </div>
      </div>

      <p className="text-center text-xs text-stone-400">
        {TOTAL_WEEKS} {locale === 'ro' ? 'săptămâni' : 'weeks'} &middot; {TOTAL_DAYS} {locale === 'ro' ? 'zile' : 'days'}
      </p>
    </div>
  );
}
