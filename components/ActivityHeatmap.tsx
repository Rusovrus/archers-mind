'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { DayActivity } from '@/lib/activityCalendar';
import { cn } from '@/lib/utils';

const LEVEL_COLORS = [
  'bg-stone-100', // 0 — no activity
  'bg-amber-200', // 1
  'bg-amber-400', // 2
  'bg-amber-600', // 3
  'bg-amber-800', // 4
];

interface ActivityHeatmapProps {
  data: DayActivity[];
  locale: string;
}

export function ActivityHeatmap({ data, locale }: ActivityHeatmapProps) {
  const t = useTranslations('progress');

  // Group data into weeks (columns), each with 7 days (rows: Mon-Sun)
  const { weeks, monthLabels } = useMemo(() => {
    if (data.length === 0) return { weeks: [], monthLabels: [] };

    // Pad start so first column starts on Monday
    const firstDate = new Date(data[0].date);
    const firstDay = (firstDate.getDay() + 6) % 7; // Mon=0, Sun=6
    const padded: (DayActivity | null)[] = Array(firstDay).fill(null);
    padded.push(...data);

    // Split into weeks of 7
    const weekArr: (DayActivity | null)[][] = [];
    for (let i = 0; i < padded.length; i += 7) {
      weekArr.push(padded.slice(i, i + 7));
    }

    // Pad last week to 7
    const lastWeek = weekArr[weekArr.length - 1];
    while (lastWeek.length < 7) lastWeek.push(null);

    // Month labels — placed at the first week where a new month starts
    const labels: { weekIndex: number; label: string }[] = [];
    let lastMonth = -1;
    for (let w = 0; w < weekArr.length; w++) {
      for (const day of weekArr[w]) {
        if (!day) continue;
        const d = new Date(day.date);
        const month = d.getMonth();
        if (month !== lastMonth) {
          lastMonth = month;
          const label = d.toLocaleString(locale === 'ro' ? 'ro-RO' : 'en-US', { month: 'short' });
          labels.push({ weekIndex: w, label });
          break;
        }
      }
    }

    return { weeks: weekArr, monthLabels: labels };
  }, [data, locale]);

  const dayLabels = useMemo(() => {
    const days = locale === 'ro'
      ? ['L', 'M', 'M', 'J', 'V', 'S', 'D']
      : ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    // Only show Mon, Wed, Fri
    return days.map((d, i) => (i % 2 === 0 ? d : ''));
  }, [locale]);

  const activeDays = data.filter((d) => d.total > 0).length;

  if (weeks.length === 0) return null;

  return (
    <div className="space-y-2">
      {/* Active days count */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
          {t('activityCalendar')}
        </p>
        <p className="text-xs text-stone-500">
          {t('activeDays', { count: activeDays })}
        </p>
      </div>

      {/* Month labels */}
      <div className="overflow-x-auto">
        <div className="inline-flex flex-col gap-1" style={{ minWidth: 'fit-content' }}>
          {/* Month header */}
          <div className="flex pl-5">
            {weeks.map((_, w) => {
              const monthLabel = monthLabels.find((m) => m.weekIndex === w);
              return (
                <div key={w} className="w-3.5 shrink-0 text-center">
                  {monthLabel && (
                    <span className="text-[9px] text-stone-400">{monthLabel.label}</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Grid: day labels + cells */}
          <div className="flex gap-0">
            {/* Day labels */}
            <div className="flex flex-col gap-[3px] pr-1 pt-0">
              {dayLabels.map((label, i) => (
                <div key={i} className="flex h-3 w-4 items-center justify-end">
                  <span className="text-[9px] text-stone-400">{label}</span>
                </div>
              ))}
            </div>

            {/* Weeks */}
            <div className="flex gap-[3px]">
              {weeks.map((week, w) => (
                <div key={w} className="flex flex-col gap-[3px]">
                  {week.map((day, d) => (
                    <div
                      key={d}
                      className={cn(
                        'h-3 w-3 rounded-sm transition-colors',
                        day ? LEVEL_COLORS[day.level] : 'bg-transparent'
                      )}
                      title={
                        day
                          ? `${day.date}: ${day.sessions}s + ${day.exercises}e`
                          : undefined
                      }
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end gap-1 mt-1">
            <span className="text-[9px] text-stone-400">{t('less')}</span>
            {LEVEL_COLORS.map((color, i) => (
              <div key={i} className={cn('h-3 w-3 rounded-sm', color)} />
            ))}
            <span className="text-[9px] text-stone-400">{t('more')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
