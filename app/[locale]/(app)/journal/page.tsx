'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getSessions } from '@/lib/sessions';
import { scorePercentage } from '@/lib/utils';
import { Session } from '@/types/session';
import { format } from 'date-fns';
import { ro, enUS } from 'date-fns/locale';

const typeBadgeColors: Record<string, string> = {
  training: 'bg-amber-100 text-amber-800',
  competition: 'bg-red-100 text-red-800',
  tune: 'bg-blue-100 text-blue-800',
};

export default function JournalPage() {
  const { firebaseUser } = useAuth();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('journal');
  const tf = useTranslations('journal.form');

  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser) return;
    getSessions(firebaseUser.uid)
      .then(setSessions)
      .finally(() => setLoading(false));
  }, [firebaseUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-stone-400">{locale === 'ro' ? 'Se încarcă...' : 'Loading...'}</p>
      </div>
    );
  }

  // Group sessions by month
  const dateLocale = locale === 'ro' ? ro : enUS;
  const grouped: Record<string, Session[]> = {};
  for (const session of sessions) {
    const date = session.date.toDate();
    const key = format(date, 'LLLL yyyy', { locale: dateLocale });
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(session);
  }

  return (
    <div className="px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-stone-900">{t('title')}</h1>

      {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span className="text-5xl">📓</span>
          <p className="mt-4 text-lg font-medium text-stone-700">{t('noSessions')}</p>
          <p className="mt-1 text-sm text-stone-500">{t('startFirst')}</p>
          <Link
            href={`/${locale}/journal/new`}
            className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-amber-800 px-6 font-medium text-white hover:bg-amber-900 transition-colors"
          >
            {t('newSession')}
          </Link>
        </div>
      ) : (
        <>
          {Object.entries(grouped).map(([month, monthSessions]) => (
            <div key={month}>
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-stone-400">
                {month}
              </p>
              <div className="space-y-2">
                {monthSessions.map((session) => {
                  const date = session.date.toDate();
                  const pct = scorePercentage(session.score, session.maxScore);
                  return (
                    <Link
                      key={session.id}
                      href={`/${locale}/journal/${session.id}`}
                      className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-4 shadow-sm transition-colors hover:bg-stone-50"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${typeBadgeColors[session.type]}`}
                          >
                            {tf(session.type)}
                          </span>
                          <span className="text-xs text-stone-400">
                            {format(date, 'd MMM', { locale: dateLocale })}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-sm text-stone-600">
                          <span>{session.distance}m</span>
                          <span>{session.arrowCount} {locale === 'ro' ? 'săgeți' : 'arrows'}</span>
                          <span>{session.duration} min</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-stone-900">{pct}%</p>
                        <p className="text-xs text-stone-400">
                          {session.score}/{session.maxScore}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </>
      )}

      {/* FAB - Add session */}
      {sessions.length > 0 && (
        <Link
          href={`/${locale}/journal/new`}
          className="fixed bottom-24 right-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-800 text-white shadow-lg hover:bg-amber-900 transition-colors z-10"
        >
          <Plus size={24} />
        </Link>
      )}
    </div>
  );
}
