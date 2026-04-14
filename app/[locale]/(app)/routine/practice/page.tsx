'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Play, Pause, RotateCcw, Check, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { getDefaultRoutine, getRoutine, recordPractice } from '@/lib/routines';
import { Routine, RoutineStep } from '@/types/exercise';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

type PracticeState = 'ready' | 'running' | 'paused' | 'completed';

export default function RoutinePracticePage() {
  const { firebaseUser } = useAuth();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params.locale as string;
  const routineId = searchParams.get('id') || 'default';
  const t = useTranslations('routine');
  const tc = useTranslations('common');

  const [routine, setRoutine] = useState<Routine | null>(null);
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<PracticeState>('ready');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [audioMode, setAudioMode] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const savedRef = useRef(false);
  const prevStepRef = useRef(-1);

  const { speak, stop, isSupported, playBeep } = useSpeechSynthesis({
    locale,
    enabled: audioMode,
  });

  // Load routine
  useEffect(() => {
    if (routineId === 'default') {
      setRoutine(getDefaultRoutine(locale));
      setLoading(false);
    } else if (firebaseUser) {
      getRoutine(firebaseUser.uid, routineId)
        .then((r) => setRoutine(r))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [routineId, firebaseUser, locale]);

  // Initialize timeLeft when routine loads
  useEffect(() => {
    if (routine && routine.steps.length > 0) {
      setTimeLeft(routine.steps[0].duration);
    }
  }, [routine]);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const advanceStep = useCallback(() => {
    if (!routine) return;

    setCurrentStepIndex((prev) => {
      const next = prev + 1;
      if (next >= routine.steps.length) {
        clearTimer();
        setState('completed');
        return prev;
      }
      setTimeLeft(routine.steps[next].duration);
      return next;
    });
  }, [routine, clearTimer]);

  const startTimer = useCallback(() => {
    clearTimer();
    setState('running');
    savedRef.current = false;

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Step completed — advance
          advanceStep();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearTimer, advanceStep]);

  const pauseTimer = useCallback(() => {
    clearTimer();
    setState('paused');
  }, [clearTimer]);

  const resetPractice = useCallback(() => {
    clearTimer();
    setState('ready');
    setCurrentStepIndex(0);
    savedRef.current = false;
    if (routine && routine.steps.length > 0) {
      setTimeLeft(routine.steps[0].duration);
    }
  }, [clearTimer, routine]);

  // Record practice on completion
  useEffect(() => {
    if (state !== 'completed' || !firebaseUser || !routine || savedRef.current) return;
    savedRef.current = true;
    recordPractice(firebaseUser.uid, routine.id).catch(() => {
      toast.error(tc('error'));
      savedRef.current = false;
    });
  }, [state, firebaseUser, routine, tc]);

  // Speak step name + cue when step changes
  useEffect(() => {
    if (!audioMode || state !== 'running' || !routine) return;
    if (currentStepIndex === prevStepRef.current) return;
    prevStepRef.current = currentStepIndex;
    const step = routine.steps[currentStepIndex];
    playBeep();
    const timer = setTimeout(() => {
      // Short steps (≤4s): only name. Longer steps: name + cue.
      const text = step.duration <= 4
        ? step.name
        : step.cue ? `${step.name}. ${step.cue}` : step.name;
      speak(text, false); // don't interrupt previous — let it finish naturally
    }, 150);
    return () => clearTimeout(timer);
  }, [audioMode, state, currentStepIndex, routine, speak, playBeep]);

  // Stop speech on pause/reset/complete
  useEffect(() => {
    if (state !== 'running') {
      stop();
      if (state === 'ready') prevStepRef.current = -1;
    }
  }, [state, stop]);

  // Cleanup
  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-stone-400">{tc('loading')}</p>
      </div>
    );
  }

  if (!routine) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-stone-500">{tc('error')}</p>
        <Link href={`/${locale}/routine`} className="mt-4 text-amber-800 hover:underline">
          {t('backToRoutines')}
        </Link>
      </div>
    );
  }

  const currentStep = routine.steps[currentStepIndex];
  const progress = routine.totalDuration > 0
    ? ((getElapsedTime(routine, currentStepIndex, currentStep?.duration ?? 0, timeLeft)) / routine.totalDuration) * 100
    : 0;

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href={`/${locale}/routine`}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-stone-600 hover:bg-stone-100"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-stone-900">{routine.name}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs text-stone-400">
              {routine.steps.length} {t('steps').toLowerCase()} · {routine.totalDuration}s
            </p>
            {isSupported && (
              <button
                onClick={() => setAudioMode((p) => !p)}
                className={cn(
                  'flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
                  audioMode ? 'bg-amber-800 text-white' : 'bg-stone-100 text-stone-500'
                )}
              >
                {audioMode ? <Volume2 size={12} /> : <VolumeX size={12} />}
                {t('audioMode')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Completed state */}
      {state === 'completed' ? (
        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm text-center space-y-5">
          <div className="flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <Check size={36} className="text-green-600" />
            </div>
          </div>
          <div>
            <p className="text-xl font-bold text-stone-900">{t('completed')}</p>
            <p className="mt-1 text-sm text-stone-500">{t('completedDesc')}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={resetPractice} className="flex-1">
              {t('practiceAgain')}
            </Button>
            <Link href={`/${locale}/routine`} className="flex-1">
              <Button variant="primary" className="w-full">
                {t('backToRoutines')}
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Overall progress bar */}
          <div className="space-y-1">
            <div className="h-2 w-full rounded-full bg-stone-200">
              <div
                className="h-2 rounded-full bg-amber-800 transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-right text-xs text-stone-400">
              {t('stepOf', { current: currentStepIndex + 1, total: routine.steps.length })}
            </p>
          </div>

          {/* Current step card */}
          <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-6 text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-800 text-sm font-bold text-white">
                {currentStep.order}
              </span>
              <h2 className="text-xl font-bold text-amber-900">{currentStep.name}</h2>
            </div>

            {currentStep.cue && (
              <p className="text-sm text-amber-800 italic">"{currentStep.cue}"</p>
            )}

            {/* Timer ring */}
            <div className="relative mx-auto h-32 w-32">
              <svg className="h-32 w-32 -rotate-90" viewBox="0 0 128 128">
                <circle cx="64" cy="64" r="56" fill="none" stroke="#e7e5e4" strokeWidth="6" />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="#92400e"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 56}
                  strokeDashoffset={
                    currentStep.duration > 0
                      ? 2 * Math.PI * 56 * (timeLeft / currentStep.duration)
                      : 0
                  }
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-stone-900">{timeLeft}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={resetPractice}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-stone-200 text-stone-500 hover:bg-white transition-colors"
              >
                <RotateCcw size={20} />
              </button>

              {state === 'running' ? (
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

            {state === 'ready' && (
              <p className="text-xs text-amber-700">{t('tapToStart')}</p>
            )}
          </div>

          {/* Steps list */}
          <div className="space-y-1.5">
            {routine.steps.map((step, i) => (
              <div
                key={i}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors',
                  i === currentStepIndex
                    ? 'bg-amber-100 border border-amber-200'
                    : i < currentStepIndex
                      ? 'bg-green-50 border border-green-100'
                      : 'bg-white border border-stone-100'
                )}
              >
                <span
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                    i === currentStepIndex
                      ? 'bg-amber-800 text-white'
                      : i < currentStepIndex
                        ? 'bg-green-600 text-white'
                        : 'bg-stone-200 text-stone-500'
                  )}
                >
                  {i < currentStepIndex ? <Check size={14} /> : step.order}
                </span>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      'text-sm font-medium',
                      i === currentStepIndex
                        ? 'text-amber-900'
                        : i < currentStepIndex
                          ? 'text-green-800'
                          : 'text-stone-500'
                    )}
                  >
                    {step.name}
                  </p>
                </div>
                <span
                  className={cn(
                    'text-xs shrink-0',
                    i === currentStepIndex
                      ? 'text-amber-700 font-medium'
                      : 'text-stone-400'
                  )}
                >
                  {step.duration}s
                </span>
                {i === currentStepIndex && state === 'running' && (
                  <ChevronRight size={14} className="text-amber-600 animate-pulse" />
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/** Calculate total elapsed seconds across all completed steps + current step progress */
function getElapsedTime(
  routine: Routine,
  currentIndex: number,
  currentDuration: number,
  timeLeft: number
): number {
  let elapsed = 0;
  for (let i = 0; i < currentIndex; i++) {
    elapsed += routine.steps[i].duration;
  }
  elapsed += currentDuration - timeLeft;
  return elapsed;
}
