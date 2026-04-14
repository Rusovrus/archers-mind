'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Plus, Search, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getSessions } from '@/lib/sessions';
import { scorePercentage } from '@/lib/utils';
import { Session, SessionType } from '@/types/session';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ro, enUS } from 'date-fns/locale';

const typeBadgeColors: Record<string, string> = {
  training: 'bg-amber-100 text-amber-800',
  competition: 'bg-red-100 text-red-800',
  tune: 'bg-blue-100 text-blue-800',
};

const typeFilters: ('all' | SessionType)[] = ['all', 'training', 'competition', 'tune'];

export default function JournalPage() {
  const { firebaseUser } = useAuth();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('journal');
  const tf = useTranslations('journal.form');

  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<'all' | SessionType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    if (!firebaseUser) return;
    getSessions(firebaseUser.uid)
      .then(setSessions)
      .finally(() => setLoading(false));
  }, [firebaseUser]);

  // Filter sessions
  const filtered = useMemo(() => {
    let result = sessions;
    if (typeFilter !== 'all') {
      result = result.filter((s) => s.type === typeFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.notes?.toLowerCase().includes(q) ||
          s.tags?.some((tag) => tag.toLowerCase().includes(q)) ||
          `${s.distance}m`.includes(q)
      );
    }
    return result;
  }, [sessions, typeFilter, searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-stone-400">{locale === 'ro' ? 'Se încarcă...' : 'Loading...'}</p>
      </div>
    );
  }

  // Group filtered sessions by month
  const dateLocale = locale === 'ro' ? ro : enUS;
  const grouped: Record<string, Session[]> = {};
  for (const session of filtered) {
    const date = session.date.toDate();
    const key = format(date, 'LLLL yyyy', { locale: dateLocale });
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(session);
  }

  return (
    <div className="px-4 py-6 space-y-4">
      {/* Header with search toggle */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900">{t('title')}</h1>
        {sessions.length > 0 && (
          <button
            onClick={() => {
              setShowSearch((p) => !p);
              if (showSearch) setSearchQuery('');
            }}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100 transition-colors"
          >
            {showSearch ? <X size={18} /> : <Search size={18} />}
          </button>
        )}
      </div>

      {/* Search bar */}
      {showSearch && (
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
          autoFocus
        />
      )}

      {/* Type filters */}
      {sessions.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {typeFilters.map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={cn(
                'whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors',
                typeFilter === type
                  ? 'bg-amber-800 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              )}
            >
              {type === 'all' ? t('filterAll') : tf(type)}
            </button>
          ))}
          {(typeFilter !== 'all' || searchQuery) && (
            <span className="flex items-center text-xs text-stone-400">
              {t('filterCount', { count: filtered.length })}
            </span>
          )}
        </div>
      )}

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
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-stone-200 bg-white p-8 text-center">
          <p className="text-sm text-stone-500">{t('noResults')}</p>
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
