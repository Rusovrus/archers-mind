'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ArrowLeft, TrendingUp, Target, Crosshair, CalendarDays, Download } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getSessions } from '@/lib/sessions';
import { getCompletions } from '@/lib/exerciseCompletions';
import { getActivityCalendar, DayActivity } from '@/lib/activityCalendar';
import { ActivityHeatmap } from '@/components/ActivityHeatmap';
import { TrainingCalendar } from '@/components/TrainingCalendar';
import { scorePercentage } from '@/lib/utils';
import { sessionsToCSV, downloadCSV } from '@/lib/exportData';
import { Session } from '@/types/session';
import { ExerciseCompletion, ExerciseCategory } from '@/types/exercise';

// ── Colors ──────────────────────────────────────────────────────────

const AMBER_800 = '#92400e';
const AMBER_600 = '#d97706';
const AMBER_400 = '#fbbf24';
const GREEN_600 = '#16a34a';
const RED_500 = '#ef4444';
const BLUE_500 = '#3b82f6';
const STONE_300 = '#d6d3d1';

const CATEGORY_COLORS: Record<ExerciseCategory, string> = {
  breathing: BLUE_500,
  focus: AMBER_600,
  visualization: '#8b5cf6',
  recovery: GREEN_600,
  precomp: RED_500,
};

// ── Page ────────────────────────────────────────────────────────────

export default function ProgressPage() {
  const { firebaseUser } = useAuth();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('progress');
  const tc = useTranslations('common');

  const [sessions, setSessions] = useState<Session[]>([]);
  const [completions, setCompletions] = useState<ExerciseCompletion[]>([]);
  const [activityData, setActivityData] = useState<DayActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser) return;
    Promise.all([
      getSessions(firebaseUser.uid),
      getCompletions(firebaseUser.uid),
      getActivityCalendar(firebaseUser.uid),
    ])
      .then(([s, c, a]) => {
        setSessions(s);
        setCompletions(c);
        setActivityData(a);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [firebaseUser]);

  // ── Derived data ──────────────────────────────────────────────────

  const stats = useMemo(() => {
    if (sessions.length === 0) return null;

    const scores = sessions.map((s) => scorePercentage(s.score, s.maxScore));
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const best = Math.max(...scores);
    const totalArrows = sessions.reduce((sum, s) => sum + s.arrowCount, 0);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const sessionsThisMonth = sessions.filter((s) => {
      const d = s.date.toDate();
      return d >= monthStart;
    }).length;

    return { avg, best, totalArrows, sessionsThisMonth };
  }, [sessions]);

  // Score trend — chronological, last 20 sessions
  const scoreTrendData = useMemo(() => {
    return [...sessions]
      .reverse()
      .slice(-20)
      .map((s) => ({
        label: formatShortDate(s.date.toDate(), locale),
        score: scorePercentage(s.score, s.maxScore),
      }));
  }, [sessions, locale]);

  // Session frequency — last 8 weeks
  const sessionFreqData = useMemo(() => {
    const now = new Date();
    const weeks: { label: string; count: number }[] = [];

    for (let w = 7; w >= 0; w--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - w * 7 - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);

      const count = sessions.filter((s) => {
        const d = s.date.toDate();
        return d >= weekStart && d < weekEnd;
      }).length;

      weeks.push({ label: t('week', { n: 8 - w }), count });
    }
    return weeks;
  }, [sessions, t]);

  // Mental state trends — last 15 sessions, chronological
  const mentalData = useMemo(() => {
    return [...sessions]
      .reverse()
      .slice(-15)
      .map((s, i) => ({
        label: `#${i + 1}`,
        focus: s.mentalState.preFocus,
        anxiety: s.mentalState.preAnxiety,
        confidence: s.mentalState.preConfidence,
        satisfaction: s.mentalState.postSatisfaction,
      }));
  }, [sessions]);

  // Exercise category distribution
  const categoryData = useMemo(() => {
    const counts: Partial<Record<ExerciseCategory, number>> = {};
    for (const c of completions) {
      counts[c.category] = (counts[c.category] || 0) + 1;
    }

    const categoryLabels: Record<ExerciseCategory, string> = {
      breathing: t('breathing'),
      focus: t('focusCat'),
      visualization: t('visualization'),
      recovery: t('recovery'),
      precomp: t('precomp'),
    };

    return Object.entries(counts).map(([cat, count]) => ({
      name: categoryLabels[cat as ExerciseCategory] || cat,
      value: count,
      color: CATEGORY_COLORS[cat as ExerciseCategory] || STONE_300,
    }));
  }, [completions, t]);

  // ── Render ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-stone-400">{tc('loading')}</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href={`/${locale}/profile`}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-stone-600 hover:bg-stone-100"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-stone-900">{t('title')}</h1>
          <p className="text-sm text-stone-500">{t('subtitle')}</p>
        </div>
        {sessions.length > 0 && (
          <button
            onClick={() => {
              const csv = sessionsToCSV(sessions, locale);
              const date = new Date().toISOString().split('T')[0];
              downloadCSV(csv, `archers-mind-${date}.csv`);
            }}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100 transition-colors"
            title={t('exportCSV')}
          >
            <Download size={18} />
          </button>
        )}
      </div>

      {/* Activity heatmap — always visible */}
      {activityData.length > 0 && (
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <ActivityHeatmap data={activityData} locale={locale} />
        </div>
      )}

      {/* Training calendar */}
      {activityData.length > 0 && (
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-stone-400 mb-3">
            {t('trainingCalendar')}
          </p>
          <TrainingCalendar data={activityData} locale={locale} />
        </div>
      )}

      {sessions.length === 0 ? (
        <div className="rounded-xl border border-stone-200 bg-white p-8 text-center space-y-2">
          <p className="font-medium text-stone-700">{t('noSessions')}</p>
          <p className="text-sm text-stone-500">{t('noSessionsDesc')}</p>
        </div>
      ) : (
        <>
          {/* Summary stats */}
          {stats && (
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                icon={<TrendingUp size={18} className="text-amber-800" />}
                label={t('avgScore')}
                value={`${stats.avg}%`}
              />
              <StatCard
                icon={<Target size={18} className="text-green-600" />}
                label={t('bestScore')}
                value={`${stats.best}%`}
              />
              <StatCard
                icon={<Crosshair size={18} className="text-blue-600" />}
                label={t('totalArrows')}
                value={stats.totalArrows.toLocaleString()}
              />
              <StatCard
                icon={<CalendarDays size={18} className="text-purple-600" />}
                label={t('sessionsMonth')}
                value={String(stats.sessionsThisMonth)}
              />
            </div>
          )}

          {/* Score trend */}
          {scoreTrendData.length >= 2 && (
            <ChartCard title={t('scoreTrend')}>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={scoreTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: '#a8a29e' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 10, fill: '#a8a29e' }}
                    axisLine={false}
                    tickLine={false}
                    width={30}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid #e7e5e4' }}
                    formatter={(value) => [`${value}%`, t('score')]}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke={AMBER_800}
                    strokeWidth={2}
                    dot={{ r: 3, fill: AMBER_800 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          )}

          {/* Session frequency */}
          <ChartCard title={t('sessionFrequency')}>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={sessionFreqData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: '#a8a29e' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 10, fill: '#a8a29e' }}
                  axisLine={false}
                  tickLine={false}
                  width={20}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid #e7e5e4' }}
                  formatter={(value) => [value, t('sessions')]}
                />
                <Bar dataKey="count" fill={AMBER_600} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Mental state trends */}
          {mentalData.length >= 2 && (
            <ChartCard title={t('mentalTrends')}>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={mentalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: '#a8a29e' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[1, 10]}
                    tick={{ fontSize: 10, fill: '#a8a29e' }}
                    axisLine={false}
                    tickLine={false}
                    width={20}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid #e7e5e4' }}
                  />
                  <Line type="monotone" dataKey="focus" stroke={AMBER_800} strokeWidth={2} name={t('focus')} dot={false} />
                  <Line type="monotone" dataKey="anxiety" stroke={RED_500} strokeWidth={2} name={t('anxiety')} dot={false} />
                  <Line type="monotone" dataKey="confidence" stroke={GREEN_600} strokeWidth={2} name={t('confidence')} dot={false} />
                  <Line type="monotone" dataKey="satisfaction" stroke={BLUE_500} strokeWidth={2} name={t('satisfaction')} dot={false} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 px-1">
                <LegendDot color={AMBER_800} label={t('focus')} />
                <LegendDot color={RED_500} label={t('anxiety')} />
                <LegendDot color={GREEN_600} label={t('confidence')} />
                <LegendDot color={BLUE_500} label={t('satisfaction')} dashed />
              </div>
            </ChartCard>
          )}
        </>
      )}

      {/* Exercise categories */}
      {categoryData.length > 0 && (
        <ChartCard title={t('exerciseCategories')}>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={65}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {categoryData.map((entry, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="flex-1 text-stone-600">{entry.name}</span>
                  <span className="font-medium text-stone-900">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      )}

      {completions.length === 0 && sessions.length > 0 && (
        <div className="rounded-xl border border-stone-200 bg-white p-5 text-center">
          <p className="text-sm text-stone-500">{t('noExercises')}</p>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-1.5">
        {icon}
        <span className="text-xs text-stone-500">{label}</span>
      </div>
      <p className="text-xl font-bold text-stone-900">{value}</p>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-stone-400 mb-3">
        {title}
      </p>
      {children}
    </div>
  );
}

function LegendDot({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-stone-600">
      {dashed ? (
        <span className="h-0.5 w-3 shrink-0 border-t-2 border-dashed" style={{ borderColor: color }} />
      ) : (
        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
      )}
      {label}
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────

function formatShortDate(d: Date, locale: string): string {
  const day = d.getDate();
  const month = d.toLocaleString(locale === 'ro' ? 'ro-RO' : 'en-US', { month: 'short' });
  return `${day} ${month}`;
}
