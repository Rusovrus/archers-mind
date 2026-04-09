'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getTodaySessions } from '@/lib/sessions';
import { scorePercentage } from '@/lib/utils';
import { Session } from '@/types/session';

const typeBadgeColors: Record<string, string> = {
  training: 'bg-amber-100 text-amber-800',
  competition: 'bg-red-100 text-red-800',
  tune: 'bg-blue-100 text-blue-800',
};

export default function TodayPage() {
  const { firebaseUser, user } = useAuth();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('today');
  const tf = useTranslations('journal.form');

  const [todaySessions, setTodaySessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  const name = user?.displayName?.split(' ')[0] || 'Arcaș';

  useEffect(() => {
    if (!firebaseUser) return;
    getTodaySessions(firebaseUser.uid)
      .then(setTodaySessions)
      .finally(() => setLoadingSessions(false));
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
