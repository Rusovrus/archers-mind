'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { getSession, deleteSession } from '@/lib/sessions';
import { scorePercentage } from '@/lib/utils';
import { Session } from '@/types/session';
import { Button } from '@/components/ui/Button';
import { format } from 'date-fns';
import { ro, enUS } from 'date-fns/locale';

const typeBadgeColors: Record<string, string> = {
  training: 'bg-amber-100 text-amber-800',
  competition: 'bg-red-100 text-red-800',
  tune: 'bg-blue-100 text-blue-800',
};

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-stone-500">{label}</span>
      <span className="font-medium text-stone-900">{value}</span>
    </div>
  );
}

function MentalBar({ label, value }: { label: string; value: number }) {
  const width = (value / 10) * 100;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-stone-500">{label}</span>
        <span className="font-medium text-stone-900">{value}/10</span>
      </div>
      <div className="h-2 rounded-full bg-stone-100">
        <div
          className="h-2 rounded-full bg-amber-800 transition-all"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

export default function SessionDetailPage() {
  const { firebaseUser } = useAuth();
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const sessionId = params.id as string;
  const t = useTranslations('journal');
  const tf = useTranslations('journal.form');
  const tc = useTranslations('common');

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!firebaseUser) return;
    getSession(firebaseUser.uid, sessionId)
      .then(setSession)
      .finally(() => setLoading(false));
  }, [firebaseUser, sessionId]);

  const handleDelete = async () => {
    if (!firebaseUser || !session) return;
    if (!window.confirm(t('deleteConfirm'))) return;

    setDeleting(true);
    try {
      await deleteSession(firebaseUser.uid, session.id);
      toast.success(t('deleted'));
      router.push(`/${locale}/journal`);
    } catch {
      toast.error(tc('error'));
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-stone-400">{tc('loading')}</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-stone-500">{tc('error')}</p>
        <Link href={`/${locale}/journal`} className="mt-4 text-amber-800 hover:underline">
          {tc('back')}
        </Link>
      </div>
    );
  }

  const date = session.date.toDate();
  const dateLocale = locale === 'ro' ? ro : enUS;
  const pct = scorePercentage(session.score, session.maxScore);

  const windLabels: Record<string, string> = {
    none: tf('windNone'),
    light: tf('windLight'),
    moderate: tf('windModerate'),
    strong: tf('windStrong'),
  };

  const lightingLabels: Record<string, string> = {
    poor: tf('lightingPoor'),
    fair: tf('lightingFair'),
    good: tf('lightingGood'),
    excellent: tf('lightingExcellent'),
  };

  return (
    <div className="px-4 py-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href={`/${locale}/journal`}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-stone-600 hover:bg-stone-100"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${typeBadgeColors[session.type]}`}
            >
              {tf(session.type)}
            </span>
          </div>
          <p className="text-sm text-stone-500">
            {format(date, 'EEEE, d MMMM yyyy', { locale: dateLocale })}
          </p>
        </div>
      </div>

      {/* Score Card */}
      <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm text-center">
        <p className="text-4xl font-bold text-stone-900">{pct}%</p>
        <p className="mt-1 text-sm text-stone-500">
          {session.score} / {session.maxScore}
        </p>
        <div className="mt-4 flex justify-center gap-6 text-sm text-stone-600">
          <div>
            <p className="font-medium text-stone-900">{session.distance}m</p>
            <p className="text-xs text-stone-400">{tf('distance').replace(' (metri)', '').replace(' (meters)', '')}</p>
          </div>
          <div>
            <p className="font-medium text-stone-900">{session.arrowCount}</p>
            <p className="text-xs text-stone-400">{locale === 'ro' ? 'Săgeți' : 'Arrows'}</p>
          </div>
          <div>
            <p className="font-medium text-stone-900">{session.duration} min</p>
            <p className="text-xs text-stone-400">{tf('duration').replace(' (minute)', '').replace(' (minutes)', '')}</p>
          </div>
        </div>
      </div>

      {/* Conditions Card */}
      <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
          {tf('conditions')}
        </p>
        <StatRow
          label={locale === 'ro' ? 'Locație' : 'Location'}
          value={session.conditions.indoor ? tf('indoor') : tf('outdoor')}
        />
        <StatRow label={tf('wind')} value={windLabels[session.conditions.wind]} />
        {session.conditions.temperature != null && (
          <StatRow label={tf('temperature')} value={`${session.conditions.temperature}°C`} />
        )}
        {session.conditions.lighting && (
          <StatRow label={tf('lighting')} value={lightingLabels[session.conditions.lighting]} />
        )}
      </div>

      {/* Mental State Card */}
      <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm space-y-4">
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
            {tf('mentalStatePre')}
          </p>
          <MentalBar label={tf('focus')} value={session.mentalState.preFocus} />
          <MentalBar label={tf('anxiety')} value={session.mentalState.preAnxiety} />
          <MentalBar label={tf('confidence')} value={session.mentalState.preConfidence} />
        </div>

        <div className="border-t border-stone-100" />

        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
            {tf('mentalStatePost')}
          </p>
          <MentalBar label={tf('focus')} value={session.mentalState.postFocus} />
          <MentalBar label={tf('satisfaction')} value={session.mentalState.postSatisfaction} />
          {session.mentalState.dominantEmotion && (
            <StatRow label={tf('dominantEmotion')} value={session.mentalState.dominantEmotion} />
          )}
        </div>
      </div>

      {/* Notes Card */}
      {session.notes && (
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-stone-400 mb-2">
            {tf('notes')}
          </p>
          <p className="text-sm text-stone-700 whitespace-pre-wrap">{session.notes}</p>
        </div>
      )}

      {/* Tags */}
      {session.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {session.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Delete */}
      <div className="pt-4">
        <Button
          variant="ghost"
          onClick={handleDelete}
          loading={deleting}
          className="text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <Trash2 size={16} className="mr-2" />
          {t('delete')}
        </Button>
      </div>
    </div>
  );
}
