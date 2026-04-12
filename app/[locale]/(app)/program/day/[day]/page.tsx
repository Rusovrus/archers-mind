'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Check, Lock, Clock, ChevronRight, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import {
  getProgress,
  getProgramDay,
  completeDay,
  isDayAccessible,
  saveReflection,
} from '@/lib/program';
import { getExercise } from '@/lib/exercises';
import {
  ProgramDay,
  ProgramProgress,
  ProgramPhase,
  DayReflection,
  Exercise,
} from '@/types/exercise';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const phaseColors: Record<ProgramPhase, string> = {
  foundation: 'bg-green-100 text-green-700',
  buildup: 'bg-amber-100 text-amber-800',
  peak: 'bg-red-100 text-red-700',
};

const categoryIcons: Record<string, string> = {
  breathing: '🌬️',
  focus: '🎯',
  visualization: '👁️',
  recovery: '🧘',
  precomp: '🏆',
};

export default function ProgramDayPage() {
  const { firebaseUser } = useAuth();
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const dayNumber = parseInt(params.day as string, 10);
  const t = useTranslations('program');
  const td = useTranslations('program.day_detail');
  const tc = useTranslations('common');

  const [progress, setProgress] = useState<ProgramProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reflectionNotes, setReflectionNotes] = useState('');
  const [reflectionRating, setReflectionRating] = useState(5);
  const [savingReflection, setSavingReflection] = useState(false);

  const programDay: ProgramDay | null = Number.isFinite(dayNumber)
    ? getProgramDay(dayNumber)
    : null;

  useEffect(() => {
    if (!firebaseUser) return;
    getProgress(firebaseUser.uid)
      .then(setProgress)
      .finally(() => setLoading(false));
  }, [firebaseUser]);

  const exercises: Exercise[] = programDay
    ? programDay.exerciseIds
        .map((id) => getExercise(id))
        .filter((e): e is Exercise => e !== null)
    : [];

  const isCompleted = !!progress?.completedDays.includes(dayNumber);
  const accessible = isDayAccessible(progress, dayNumber);
  const existingReflection: DayReflection | null =
    progress?.dayReflections?.[String(dayNumber)] ?? null;

  const handleSaveReflection = async () => {
    if (!firebaseUser || !reflectionNotes.trim()) return;
    setSavingReflection(true);
    try {
      await saveReflection(firebaseUser.uid, dayNumber, reflectionNotes.trim(), reflectionRating);
      toast.success(td('reflectionSaved'));
      const updated = await getProgress(firebaseUser.uid);
      setProgress(updated);
    } catch {
      toast.error(tc('error'));
    } finally {
      setSavingReflection(false);
    }
  };

  const handleComplete = async () => {
    if (!firebaseUser || !programDay || isCompleted) return;
    setSubmitting(true);
    try {
      await completeDay(firebaseUser.uid, dayNumber);
      toast.success(td('dayCompleted'));
      // Refresh progress
      const updated = await getProgress(firebaseUser.uid);
      setProgress(updated);
    } catch {
      toast.error(tc('error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-stone-400">{tc('loading')}</p>
      </div>
    );
  }

  if (!programDay) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-stone-500">{tc('error')}</p>
        <Link href={`/${locale}/program`} className="mt-4 text-amber-800 hover:underline">
          {tc('back')}
        </Link>
      </div>
    );
  }

  if (!accessible) {
    return (
      <div className="px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href={`/${locale}/program`}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-stone-600 hover:bg-stone-100"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-bold text-stone-900">
            {t('day', { day: dayNumber })}
          </h1>
        </div>
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-8 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-stone-400">
            <Lock size={24} />
          </div>
          <p className="text-sm text-stone-600">{td('lockedMsg')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href={`/${locale}/program`}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-stone-600 hover:bg-stone-100"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                phaseColors[programDay.phase]
              )}
            >
              {t(`phases.${programDay.phase}`)}
            </span>
            <span className="text-xs text-stone-400">
              {t('week', { week: programDay.week })}
            </span>
          </div>
          <h1 className="mt-1 text-xl font-bold text-stone-900">
            {programDay.title[locale as 'ro' | 'en']}
          </h1>
        </div>
      </div>

      {/* Goal */}
      <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
          {td('goal')}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-stone-700">
          {programDay.goal[locale as 'ro' | 'en']}
        </p>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-stone-400">
          <Clock size={12} />
          <span>
            {td('estimatedTime')}: {programDay.estimatedMinutes} min
          </span>
        </div>
      </div>

      {/* Exercises */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-stone-400 mb-3">
          {td('exercises')}
        </p>
        <div className="space-y-2">
          {exercises.map((exercise) => {
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
                  <div className="mt-1 flex items-center gap-1 text-xs text-stone-400">
                    <Clock size={12} />
                    {minutes} min
                  </div>
                </div>
                <ChevronRight size={18} className="text-stone-300" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Complete action */}
      {isCompleted ? (
        <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
            <Check size={18} />
          </div>
          <p className="text-sm font-medium">{td('alreadyCompleted')}</p>
        </div>
      ) : (
        <Button onClick={handleComplete} loading={submitting}>
          {td('markComplete')}
        </Button>
      )}

      {/* Reflection — only for completed days */}
      {isCompleted && (
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm space-y-4">
          <div>
            <p className="text-sm font-semibold text-stone-900">{td('reflection')}</p>
            <p className="text-xs text-stone-400 mt-0.5">{td('reflectionSubtitle')}</p>
          </div>

          {existingReflection ? (
            /* Saved reflection — read-only */
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-800">
                  <MessageSquare size={14} />
                </div>
                <p className="text-xs font-medium text-stone-500">{td('yourReflection')}</p>
              </div>
              <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">
                {existingReflection.notes}
              </p>
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {Array.from({ length: 10 }, (_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'h-2 w-4 rounded-sm',
                        i < existingReflection.rating ? 'bg-amber-500' : 'bg-stone-100'
                      )}
                    />
                  ))}
                </div>
                <span className="text-xs font-medium text-stone-500">
                  {td('yourRating', { value: existingReflection.rating })}
                </span>
              </div>
            </div>
          ) : (
            /* Reflection form */
            <div className="space-y-4">
              {/* Prompts */}
              {programDay.reflectionPrompts[locale as 'ro' | 'en'].length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
                    {td('reflectionPrompts')}
                  </p>
                  <ul className="space-y-1.5">
                    {programDay.reflectionPrompts[locale as 'ro' | 'en'].map((prompt, i) => (
                      <li key={i} className="flex gap-2 text-sm text-stone-600">
                        <span className="text-amber-500 mt-0.5">&#8227;</span>
                        {prompt}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Notes textarea */}
              <textarea
                value={reflectionNotes}
                onChange={(e) => setReflectionNotes(e.target.value)}
                placeholder={td('notesPlaceholder')}
                rows={4}
                className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
              />

              {/* Rating */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-stone-500">{td('rating')}</p>
                  <span className="text-sm font-semibold text-amber-800">
                    {td('ratingLabel', { value: reflectionRating })}
                  </span>
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: 10 }, (_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setReflectionRating(i + 1)}
                      className={cn(
                        'flex-1 h-9 rounded-md text-xs font-medium transition-colors',
                        i + 1 <= reflectionRating
                          ? 'bg-amber-500 text-white'
                          : 'bg-stone-100 text-stone-400 hover:bg-stone-200'
                      )}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* Save button */}
              <Button
                onClick={handleSaveReflection}
                loading={savingReflection}
                disabled={!reflectionNotes.trim()}
              >
                {td('saveReflection')}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
