'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Plus, Clock, Check, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getTodaySessions } from '@/lib/sessions';
import { getTodayCompletions } from '@/lib/exerciseCompletions';
import { getFeaturedExercises } from '@/lib/exercises';
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
  const tf = useTranslations('journal.form');

  const [todaySessions, setTodaySessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [todayCompletions, setTodayCompletions] = useState<ExerciseCompletion[]>([]);

  const name = user?.displayName?.split(' ')[0] || 'Arcaș';

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

  return (
    <div className="px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">
          {t('greeting', { name })}
        </h1>
        <p className="mt-1 text-stone-500">
          {locale === 'ro' ? 'Ce facem azi?' : "What's the plan today?"}
        </p>
      </div>

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
            <p className="text-sm text-stone-400">{locale === 'ro' ? 'Se încarcă...' : 'Loading...'}</p>
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
                      {session.distance}m &middot; {session.arrowCount} {locale === 'ro' ? 'săgeți' : 'arrows'} &middot; {session.duration} min
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
          {locale === 'ro' ? 'Profilul tău' : 'Your profile'}
        </p>
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-stone-500">{locale === 'ro' ? 'Nivel' : 'Level'}</span>
            <span className="font-medium text-stone-900 capitalize">{user?.profile?.skillLevel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">{locale === 'ro' ? 'Arc' : 'Bow'}</span>
            <span className="font-medium text-stone-900 capitalize">{user?.profile?.bowType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">{locale === 'ro' ? 'Obiective' : 'Goals'}</span>
            <span className="font-medium text-stone-900">{user?.profile?.goals?.length || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
