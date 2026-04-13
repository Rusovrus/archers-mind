'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Play, Pause, RotateCcw, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { getExercise } from '@/lib/exercises';
import { saveCompletion } from '@/lib/exerciseCompletions';
import { Exercise } from '@/types/exercise';
import { AudioPlayer } from '@/components/AudioPlayer';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const categoryIcons: Record<string, string> = {
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

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

type TimerState = 'idle' | 'running' | 'paused' | 'completed';

export default function ExerciseDetailPage() {
  const { firebaseUser } = useAuth();
  const params = useParams();
  const locale = (params.locale as string) || 'ro';
  const exerciseId = params.id as string;
  const t = useTranslations('exercises');
  const tc = useTranslations('common');

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [timeLeft, setTimeLeft] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const savedRef = useRef(false);

  useEffect(() => {
    const ex = getExercise(exerciseId);
    setExercise(ex);
    if (ex) setTimeLeft(ex.duration);
  }, [exerciseId]);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    setTimerState('running');
    savedRef.current = false;
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearTimer();
          setTimerState('completed');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearTimer]);

  const pauseTimer = useCallback(() => {
    clearTimer();
    setTimerState('paused');
  }, [clearTimer]);

  const resetTimer = useCallback(() => {
    clearTimer();
    setTimerState('idle');
    savedRef.current = false;
    if (exercise) setTimeLeft(exercise.duration);
  }, [clearTimer, exercise]);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  // Persist completion once when timer finishes
  useEffect(() => {
    if (timerState !== 'completed' || !firebaseUser || !exercise || savedRef.current) {
      return;
    }
    savedRef.current = true;
    saveCompletion(firebaseUser.uid, {
      exerciseId: exercise.id,
      category: exercise.category,
      duration: exercise.duration,
    }).catch(() => {
      toast.error(tc('error'));
      savedRef.current = false;
    });
  }, [timerState, firebaseUser, exercise, tc]);

  if (!exercise) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-stone-500">{tc('error')}</p>
        <Link href={`/${locale}/exercises`} className="mt-4 text-amber-800 hover:underline">
          {tc('back')}
        </Link>
      </div>
    );
  }

  const minutes = Math.round(exercise.duration / 60);
  const progress = exercise.duration > 0 ? ((exercise.duration - timeLeft) / exercise.duration) * 100 : 0;

  // Guided steps — compute which step to show based on elapsed time
  const steps = exercise.steps;
  const currentStepIndex = useMemo(() => {
    if (!steps || steps.length === 0) return -1;
    const elapsed = exercise.duration - timeLeft;
    const stepDuration = exercise.duration / steps.length;
    const idx = Math.floor(elapsed / stepDuration);
    return Math.min(idx, steps.length - 1);
  }, [steps, exercise.duration, timeLeft]);

  const audioSrc = exercise.audioUrl[locale as 'ro' | 'en'];

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href={`/${locale}/exercises`}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-stone-600 hover:bg-stone-100"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <p className="text-lg font-bold text-stone-900">
            {exercise.title[locale as 'ro' | 'en']}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-sm">{categoryIcons[exercise.category]}</span>
            <span
              className={cn(
                'inline-block rounded-full px-2 py-0.5 text-xs font-medium',
                difficultyColors[exercise.difficulty]
              )}
            >
              {t(`difficulty.${exercise.difficulty}`)}
            </span>
            <span className="text-xs text-stone-400">{minutes} min</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
        <p className="text-sm leading-relaxed text-stone-700">
          {exercise.description[locale as 'ro' | 'en']}
        </p>
      </div>

      {/* Audio player — only when audio URL exists */}
      {audioSrc && <AudioPlayer src={audioSrc} />}

      {/* Timer */}
      <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm text-center space-y-5">
        {timerState === 'completed' ? (
          <>
            <div className="flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <Check size={36} className="text-green-600" />
              </div>
            </div>
            <div>
              <p className="text-xl font-bold text-stone-900">{t('timer.completed')}</p>
              <p className="mt-1 text-sm text-stone-500">{t('timer.completedDesc')}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={resetTimer} className="flex-1">
                {t('timer.doAgain')}
              </Button>
              <Link href={`/${locale}/exercises`} className="flex-1">
                <Button variant="primary" className="w-full">
                  {t('timer.backToExercises')}
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <>
            {/* Progress ring */}
            <div className="relative mx-auto h-40 w-40">
              <svg className="h-40 w-40 -rotate-90" viewBox="0 0 160 160">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="#e7e5e4"
                  strokeWidth="8"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="#92400e"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 70}
                  strokeDashoffset={2 * Math.PI * 70 * (1 - progress / 100)}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-stone-900">{formatTime(timeLeft)}</span>
                <span className="text-xs text-stone-400">{t('timer.remaining')}</span>
              </div>
            </div>

            {/* Guided step instruction */}
            {steps && steps.length > 0 && currentStepIndex >= 0 && timerState !== 'idle' && (
              <div className="space-y-1 transition-opacity duration-500">
                <p className="text-xs font-medium text-amber-800">
                  {t('guidedStep', { current: currentStepIndex + 1, total: steps.length })}
                </p>
                <p className="text-sm leading-relaxed text-stone-700">
                  {steps[currentStepIndex][locale as 'ro' | 'en']}
                </p>
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={resetTimer}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-stone-200 text-stone-500 hover:bg-stone-50 transition-colors"
              >
                <RotateCcw size={20} />
              </button>

              {timerState === 'running' ? (
                <button
                  onClick={pauseTimer}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-800 text-white shadow-lg hover:bg-amber-900 transition-colors"
                >
                  <Pause size={28} />
                </button>
              ) : (
                <button
                  onClick={startTimer}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-800 text-white shadow-lg hover:bg-amber-900 transition-colors"
                >
                  <Play size={28} className="ml-1" />
                </button>
              )}

              <div className="h-12 w-12" /> {/* Spacer for symmetry */}
            </div>

            {timerState !== 'idle' && (
              <p className="text-xs text-stone-400">
                {timerState === 'paused'
                  ? t('timer.pause')
                  : t('timer.remaining')}
              </p>
            )}
          </>
        )}
      </div>

      {/* Tags */}
      {exercise.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {exercise.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
