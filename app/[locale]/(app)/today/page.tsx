'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Plus, Clock, Check, ChevronRight, Flame, Target, Trophy, Lightbulb, Activity } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAchievementCheck } from '@/hooks/useAchievementCheck';
import { getTodaySessions } from '@/lib/sessions';
import { getTodayCompletions } from '@/lib/exerciseCompletions';
import { getFeaturedExercises } from '@/lib/exercises';
import { calculateReadiness, ReadinessData } from '@/lib/readiness';
import { scorePercentage } from '@/lib/utils';
import { Session } from '@/types/session';
import { Exercise, ExerciseCompletion } from '@/types/exercise';

const typeBadgeColors: Record<string, string> = {
  training: 'bg-amber-100 text-amber-800',
  competition: 'bg-red-100 text-red-800',
  tune: 'bg-blue-100 text-blue-800',
};

const categoryIcons: Record<string, string> = {
  breathing: '🌬️',
  focus: '🎯',
  visualization: '👁️',
  recovery: '🧘',
  precomp: '🏆',
};

function pickDailyExercise(list: Exercise[]): Exercise | null {
  if (list.length === 0) return null;
  const now = new Date();
  // Day-of-year index so the pick is stable all day, rotates daily
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / 86_400_000);
  return list[dayOfYear % list.length];
}

export default function TodayPage() {
  const { firebaseUser, user } = useAuth();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('today');
  const tc = useTranslations('common');
  const tf = useTranslations('journal.form');
  const tr = useTranslations('routine');
  const tcomp = useTranslations('competition');

  useAchievementCheck(locale);

  const [todaySessions, setTodaySessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [todayCompletions, setTodayCompletions] = useState<ExerciseCompletion[]>([]);
  const [readiness, setReadiness] = useState<ReadinessData | null>(null);

  const name = user?.displayName?.split(' ')[0] || 'Arcaș';
  const streak = user?.preferences?.streakCount ?? 0;

  const dailyExercise = useMemo(() => pickDailyExercise(getFeaturedExercises()), []);
  const dailyDone = useMemo(
    () =>
      !!dailyExercise &&
      todayCompletions.some((c) => c.exerciseId === dailyExercise.id),
    [dailyExercise, todayCompletions]
  );

  useEffect(() => {
    if (!firebaseUser) return;
    getTodaySessions(firebaseUser.uid)
      .then(setTodaySessions)
      .finally(() => setLoadingSessions(false));
    getTodayCompletions(firebaseUser.uid).then(setTodayCompletions).catch(() => {});
  }, [firebaseUser]);

  useEffect(() => {
    if (!firebaseUser || !user) return;
    calculateReadiness(firebaseUser.uid, user).then(setReadiness).catch(() => {});
  }, [firebaseUser, user]);

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-stone-900">
            {t('greeting', { name })}
          </h1>
          <p className="mt-1 text-stone-500">
            {t('subtitle')}
          </p>
        </div>
        {streak > 0 && (
          <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-amber-800">
            <Flame size={16} />
            <span className="text-sm font-semibold">{t('currentStreak', { days: streak })}</span>
          </div>
        )}
      </div>

      {/* Readiness score + Weekly summary */}
      {readiness && (
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-5">
            {/* Score ring */}
            <div className="relative shrink-0 h-20 w-20">
              <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="#e7e5e4" strokeWidth="6" />
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  fill="none"
                  stroke={readiness.score >= 70 ? '#16a34a' : readiness.score >= 40 ? '#d97706' : '#dc2626'}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 34}
                  strokeDashoffset={2 * Math.PI * 34 * (1 - readiness.score / 100)}
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-stone-900">{readiness.score}</span>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Activity size={14} className="text-amber-800" />
                <p className="text-sm font-medium text-stone-900">{t('readiness')}</p>
              </div>
              <p className="text-xs text-stone-500">
                {readiness.score >= 70
                  ? t('readinessHigh')
                  : readiness.score >= 40
                    ? t('readinessMed')
                    : t('readinessLow')}
              </p>

              {/* Weekly summary */}
              <div className="mt-2 flex items-center gap-3 text-xs text-stone-400">
                <span>{t('weekSummary')}:</span>
                <span className="font-medium text-stone-600">{t('weekSessions', { count: readiness.weekSessions })}</span>
                <span className="font-medium text-stone-600">{t('weekExercises', { count: readiness.weekExercises })}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Smart suggestion */}
      {readiness && !dailyDone && todaySessions.length === 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50/50 p-3">
          <Lightbulb size={18} className="text-amber-800 shrink-0" />
          <p className="text-sm text-amber-900">
            {!dailyDone
              ? t('suggestExercise')
              : todaySessions.length === 0
                ? t('suggestSession')
                : t('suggestRoutine')}
          </p>
        </div>
      )}

      {/* Daily exercise */}
      {dailyExercise && (
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-stone-400 mb-3">
            {t('dailyExercise')}
          </p>
          <Link
            href={`/${locale}/exercises/${dailyExercise.id}`}
            className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-4 shadow-sm hover:bg-stone-50 transition-colors"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-50 text-xl">
              {categoryIcons[dailyExercise.category]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-stone-900">
                {dailyExercise.title[locale as 'ro' | 'en']}
              </p>
              <div className="mt-1 flex items-center gap-2 text-xs text-stone-400">
                <Clock size={12} />
                <span>{Math.round(dailyExercise.duration / 60)} min</span>
              </div>
            </div>
            {dailyDone ? (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">
                <Check size={18} />
              </div>
            ) : (
              <ChevronRight size={18} className="text-stone-300" />
            )}
          </Link>
          {dailyDone && (
            <p className="mt-2 text-xs text-green-700">{t('dailyExerciseDone')}</p>
          )}
        </div>
      )}

      {/* Pre-shot routine */}
      <Link
        href={`/${locale}/routine`}
        className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-4 shadow-sm hover:bg-stone-50 transition-colors"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-50">
          <Target size={22} className="text-amber-800" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-stone-900">{tr('todayCard')}</p>
          <p className="mt-0.5 text-xs text-stone-400">{tr('todayCardDesc')}</p>
        </div>
        <ChevronRight size={18} className="text-stone-300" />
      </Link>

      {/* Competition mode */}
      <Link
        href={`/${locale}/competition`}
        className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-4 shadow-sm hover:bg-stone-50 transition-colors"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-50">
          <Trophy size={22} className="text-red-700" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-stone-900">{tcomp('todayCard')}</p>
          <p className="mt-0.5 text-xs text-stone-400">{tcomp('todayCardDesc')}</p>
        </div>
        <ChevronRight size={18} className="text-stone-300" />
      </Link>

      {/* New session button */}
      <Link
        href={`/${locale}/journal/new`}
        className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 p-4 text-amber-800 font-medium hover:bg-amber-100 transition-colors"
      >
        <Plus size={20} />
        {t('newSession')}
      </Link>

      {/* Today's sessions */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-stone-400 mb-3">
          {t('todaySessions')}
        </p>

        {loadingSessions ? (
          <div className="rounded-xl border border-stone-200 bg-white p-4">
            <p className="text-sm text-stone-400">{tc('loading')}</p>
          </div>
        ) : todaySessions.length === 0 ? (
          <div className="rounded-xl border border-stone-200 bg-white p-5 text-center">
            <p className="text-sm text-stone-500">{t('noTodaySessions')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {todaySessions.map((session) => {
              const pct = scorePercentage(session.score, session.maxScore);
              return (
                <Link
                  key={session.id}
                  href={`/${locale}/journal/${session.id}`}
                  className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-4 shadow-sm hover:bg-stone-50 transition-colors"
                >
                  <div className="flex-1">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${typeBadgeColors[session.type]}`}
                    >
                      {tf(session.type)}
                    </span>
                    <p className="mt-1 text-sm text-stone-600">
                      {session.distance}m &middot; {session.arrowCount} {t('arrows')} &middot; {session.duration} min
                    </p>
                  </div>
                  <p className="text-lg font-bold text-stone-900">{pct}%</p>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Profile card */}
      <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
          {t('yourProfile')}
        </p>
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-stone-500">{t('level')}</span>
            <span className="font-medium text-stone-900 capitalize">{user?.profile?.skillLevel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">{t('bow')}</span>
            <span className="font-medium text-stone-900 capitalize">{user?.profile?.bowType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">{t('goals')}</span>
            <span className="font-medium text-stone-900">{user?.profile?.goals?.length || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
