'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Wind,
  Timer,
  ClipboardList,
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  Minus,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const CHECKLIST_KEYS = [
  'equipment',
  'warmup',
  'mentalWarmup',
  'breathing',
  'processGoal',
  'hydration',
  'routine',
] as const;

// Breath reset cycle: 4s inhale, 4s hold, 6s exhale = 14s per cycle
const BREATH_CYCLE = [
  { phase: 'inhale', duration: 4 },
  { phase: 'hold', duration: 4 },
  { phase: 'exhale', duration: 6 },
] as const;
const BREATH_TOTAL = 60; // seconds

export default function CompetitionPage() {
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('competition');

  const [activeSection, setActiveSection] = useState<'checklist' | 'breathe' | 'timer' | null>(null);

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

      {/* Section buttons */}
      <div className="grid grid-cols-2 gap-3">
        <SectionButton
          icon={<ClipboardList size={22} />}
          label={t('checklist')}
          desc={t('checklistDesc')}
          active={activeSection === 'checklist'}
          onClick={() => setActiveSection(activeSection === 'checklist' ? null : 'checklist')}
        />
        <SectionButton
          icon={<Wind size={22} />}
          label={t('breathReset')}
          desc={t('breathResetDesc')}
          active={activeSection === 'breathe'}
          onClick={() => setActiveSection(activeSection === 'breathe' ? null : 'breathe')}
        />
        <SectionButton
          icon={<Timer size={22} />}
          label={t('endTimer')}
          desc={t('endTimerDesc')}
          active={activeSection === 'timer'}
          onClick={() => setActiveSection(activeSection === 'timer' ? null : 'timer')}
        />
        <Link
          href={`/${locale}/competition/debrief`}
          className="flex flex-col items-center gap-2 rounded-xl border border-stone-200 bg-white p-4 shadow-sm text-center hover:bg-stone-50 transition-colors"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-800">
            <ClipboardList size={22} />
          </div>
          <div>
            <p className="text-sm font-medium text-stone-900">{t('debrief')}</p>
            <p className="text-[11px] text-stone-400 mt-0.5">{t('debriefDesc')}</p>
          </div>
        </Link>
      </div>

      {/* Expanded sections */}
      {activeSection === 'checklist' && <ChecklistSection t={t} />}
      {activeSection === 'breathe' && <BreathSection t={t} />}
      {activeSection === 'timer' && <TimerSection t={t} />}
    </div>
  );
}

// ── Section button ──────────────────────────────────────────────────

function SectionButton({
  icon,
  label,
  desc,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  desc: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-2 rounded-xl border p-4 shadow-sm text-center transition-colors',
        active
          ? 'border-amber-300 bg-amber-50'
          : 'border-stone-200 bg-white hover:bg-stone-50'
      )}
    >
      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-lg',
          active ? 'bg-amber-800 text-white' : 'bg-amber-50 text-amber-800'
        )}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-stone-900">{label}</p>
        <p className="text-[11px] text-stone-400 mt-0.5">{desc}</p>
      </div>
    </button>
  );
}

// ── Checklist ───────────────────────────────────────────────────────

function ChecklistSection({ t }: { t: ReturnType<typeof useTranslations> }) {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  function toggle(key: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const allDone = checked.size === CHECKLIST_KEYS.length;

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-stone-700">{t('checklist')}</p>
        <span className="text-xs text-stone-400">
          {t('checkedCount', { done: checked.size, total: CHECKLIST_KEYS.length })}
        </span>
      </div>

      <div className="space-y-1">
        {CHECKLIST_KEYS.map((key) => {
          const done = checked.has(key);
          return (
            <button
              key={key}
              onClick={() => toggle(key)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                done ? 'bg-green-50' : 'hover:bg-stone-50'
              )}
            >
              {done ? (
                <CheckCircle2 size={20} className="shrink-0 text-green-600" />
              ) : (
                <Circle size={20} className="shrink-0 text-stone-300" />
              )}
              <span
                className={cn(
                  'text-sm',
                  done ? 'text-green-800 line-through' : 'text-stone-700'
                )}
              >
                {t(`checklistItems.${key}`)}
              </span>
            </button>
          );
        })}
      </div>

      {allDone && (
        <p className="text-center text-sm font-medium text-green-700 pt-1">
          {t('allChecked')}
        </p>
      )}
    </div>
  );
}

// ── Breath reset ────────────────────────────────────────────────────

function BreathSection({ t }: { t: ReturnType<typeof useTranslations> }) {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  function start() {
    clear();
    setRunning(true);
    setDone(false);
    intervalRef.current = setInterval(() => {
      setElapsed((prev) => {
        if (prev + 1 >= BREATH_TOTAL) {
          clear();
          setRunning(false);
          setDone(true);
          return BREATH_TOTAL;
        }
        return prev + 1;
      });
    }, 1000);
  }

  function reset() {
    clear();
    setRunning(false);
    setElapsed(0);
    setDone(false);
  }

  useEffect(() => () => clear(), [clear]);

  // Calculate current phase
  const cycleLength = BREATH_CYCLE.reduce((s, p) => s + p.duration, 0);
  const posInCycle = elapsed % cycleLength;
  let acc = 0;
  let currentPhase: (typeof BREATH_CYCLE)[number] = BREATH_CYCLE[0];
  let phaseElapsed = 0;
  for (const phase of BREATH_CYCLE) {
    if (posInCycle < acc + phase.duration) {
      currentPhase = phase;
      phaseElapsed = posInCycle - acc;
      break;
    }
    acc += phase.duration;
  }

  const phaseLabels: Record<string, string> = {
    inhale: t('inhale'),
    hold: t('hold'),
    exhale: t('exhale'),
  };

  const phaseProgress = currentPhase.duration > 0 ? phaseElapsed / currentPhase.duration : 0;

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm text-center space-y-4">
      {done ? (
        <>
          <p className="text-lg font-bold text-green-700">{t('breathDone')}</p>
          <button
            onClick={reset}
            className="text-sm text-amber-800 hover:underline"
          >
            {t('timerReset')}
          </button>
        </>
      ) : (
        <>
          {/* Phase indicator */}
          <div className="space-y-2">
            <p className={cn(
              'text-2xl font-bold transition-all',
              currentPhase.phase === 'inhale' && 'text-blue-600',
              currentPhase.phase === 'hold' && 'text-amber-600',
              currentPhase.phase === 'exhale' && 'text-green-600',
            )}>
              {running ? phaseLabels[currentPhase.phase] : t('breathe')}
            </p>

            {running && (
              <div className="mx-auto h-2 w-48 rounded-full bg-stone-200">
                <div
                  className={cn(
                    'h-2 rounded-full transition-all duration-1000',
                    currentPhase.phase === 'inhale' && 'bg-blue-500',
                    currentPhase.phase === 'hold' && 'bg-amber-500',
                    currentPhase.phase === 'exhale' && 'bg-green-500',
                  )}
                  style={{ width: `${phaseProgress * 100}%` }}
                />
              </div>
            )}
          </div>

          {/* Overall progress */}
          <p className="text-sm text-stone-400">{elapsed}s / {BREATH_TOTAL}s</p>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={reset}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 text-stone-500 hover:bg-stone-50"
            >
              <RotateCcw size={18} />
            </button>
            {running ? (
              <button
                onClick={() => { clear(); setRunning(false); }}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-800 text-white shadow-lg hover:bg-amber-900"
              >
                <Pause size={24} />
              </button>
            ) : (
              <button
                onClick={start}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-800 text-white shadow-lg hover:bg-amber-900"
              >
                <Play size={24} className="ml-0.5" />
              </button>
            )}
            <div className="h-10 w-10" />
          </div>
        </>
      )}
    </div>
  );
}

// ── Series timer ────────────────────────────────────────────────────

function TimerSection({ t }: { t: ReturnType<typeof useTranslations> }) {
  const [minutes, setMinutes] = useState(2);
  const [timeLeft, setTimeLeft] = useState(minutes * 60);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  function start() {
    if (timeLeft <= 0) return;
    clear();
    setRunning(true);
    setDone(false);
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clear();
          setRunning(false);
          setDone(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function reset() {
    clear();
    setRunning(false);
    setDone(false);
    setTimeLeft(minutes * 60);
  }

  function adjustMinutes(delta: number) {
    if (running) return;
    const next = Math.max(1, Math.min(10, minutes + delta));
    setMinutes(next);
    setTimeLeft(next * 60);
    setDone(false);
  }

  useEffect(() => () => clear(), [clear]);

  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm text-center space-y-4">
      {done ? (
        <>
          <p className="text-2xl font-bold text-red-600">{t('timeUp')}</p>
          <button onClick={reset} className="text-sm text-amber-800 hover:underline">
            {t('timerReset')}
          </button>
        </>
      ) : (
        <>
          {/* Minutes selector (only when not running) */}
          {!running && (
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => adjustMinutes(-1)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 text-stone-500 hover:bg-stone-50"
              >
                <Minus size={16} />
              </button>
              <div>
                <p className="text-3xl font-bold text-stone-900">{minutes}</p>
                <p className="text-xs text-stone-400">{t('timerMinutes')}</p>
              </div>
              <button
                onClick={() => adjustMinutes(1)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 text-stone-500 hover:bg-stone-50"
              >
                <Plus size={16} />
              </button>
            </div>
          )}

          {/* Running display */}
          {running && (
            <p className="text-4xl font-bold text-stone-900 font-mono">
              {m}:{s.toString().padStart(2, '0')}
            </p>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={reset}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 text-stone-500 hover:bg-stone-50"
            >
              <RotateCcw size={18} />
            </button>
            {running ? (
              <button
                onClick={() => { clear(); setRunning(false); }}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-800 text-white shadow-lg hover:bg-amber-900"
              >
                <Pause size={24} />
              </button>
            ) : (
              <button
                onClick={start}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-800 text-white shadow-lg hover:bg-amber-900"
              >
                <Play size={24} className="ml-0.5" />
              </button>
            )}
            <div className="h-10 w-10" />
          </div>
        </>
      )}
    </div>
  );
}
