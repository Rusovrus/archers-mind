'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Plus, Play, Clock, Pencil, Trash2, Target } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { getDefaultRoutine, getUserRoutines, deleteRoutine } from '@/lib/routines';
import { Routine } from '@/types/exercise';

export default function RoutinePage() {
  const { firebaseUser } = useAuth();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('routine');
  const tc = useTranslations('common');

  const [userRoutines, setUserRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);

  const defaultRoutine = getDefaultRoutine(locale);

  useEffect(() => {
    if (!firebaseUser) return;
    getUserRoutines(firebaseUser.uid)
      .then(setUserRoutines)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [firebaseUser]);

  async function handleDelete(id: string) {
    if (!firebaseUser || !confirm(t('deleteConfirm'))) return;
    try {
      await deleteRoutine(firebaseUser.uid, id);
      setUserRoutines((prev) => prev.filter((r) => r.id !== id));
      toast.success(t('deleted'));
    } catch {
      toast.error(tc('error'));
    }
  }

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href={`/${locale}/today`}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-stone-600 hover:bg-stone-100"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-stone-900">{t('title')}</h1>
          <p className="text-sm text-stone-500">{t('subtitle')}</p>
        </div>
      </div>

      {/* Default routine */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-stone-400 mb-3">
          {t('defaultRoutine')}
        </p>
        <RoutineCard
          routine={defaultRoutine}
          locale={locale}
          t={t}
        />
      </div>

      {/* User routines */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
            {t('myRoutines')}
          </p>
          <Link
            href={`/${locale}/routine/builder`}
            className="flex items-center gap-1 text-xs font-medium text-amber-800 hover:text-amber-900"
          >
            <Plus size={14} />
            {t('createNew')}
          </Link>
        </div>

        {loading ? (
          <div className="rounded-xl border border-stone-200 bg-white p-4">
            <p className="text-sm text-stone-400">{tc('loading')}</p>
          </div>
        ) : userRoutines.length === 0 ? (
          <div className="rounded-xl border border-stone-200 bg-white p-5 text-center">
            <p className="text-sm text-stone-500">{t('noCustom')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {userRoutines.map((routine) => (
              <RoutineCard
                key={routine.id}
                routine={routine}
                locale={locale}
                t={t}
                onEdit
                onDelete={() => handleDelete(routine.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create new button */}
      <Link
        href={`/${locale}/routine/builder`}
        className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 p-4 text-amber-800 font-medium hover:bg-amber-100 transition-colors"
      >
        <Plus size={20} />
        {t('createNew')}
      </Link>
    </div>
  );
}

function RoutineCard({
  routine,
  locale,
  t,
  onEdit,
  onDelete,
}: {
  routine: Routine;
  locale: string;
  t: ReturnType<typeof useTranslations>;
  onEdit?: boolean;
  onDelete?: () => void;
}) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-amber-50">
          <Target size={22} className="text-amber-800" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-stone-900">{routine.name}</p>
          <div className="mt-1 flex items-center gap-3 text-xs text-stone-400">
            <span>{routine.steps.length} {t('steps').toLowerCase()}</span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {routine.totalDuration}s
            </span>
            {routine.practiceCount > 0 && (
              <span>{t('practices', { count: routine.practiceCount })}</span>
            )}
          </div>
        </div>
      </div>

      {/* Steps preview */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {routine.steps.map((step, i) => (
          <span
            key={i}
            className="rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-600"
          >
            {step.name}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-3 flex items-center gap-2">
        <Link
          href={`/${locale}/routine/practice?id=${routine.id}`}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-amber-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-900 transition-colors"
        >
          <Play size={16} />
          {t('practice')}
        </Link>
        {onEdit && (
          <Link
            href={`/${locale}/routine/builder?id=${routine.id}`}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-stone-200 text-stone-500 hover:bg-stone-50 transition-colors"
          >
            <Pencil size={16} />
          </Link>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-stone-200 text-stone-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
