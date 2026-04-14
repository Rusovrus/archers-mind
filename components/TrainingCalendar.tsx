'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayActivity } from '@/lib/activityCalendar';
import { cn } from '@/lib/utils';

interface TrainingCalendarProps {
  data: DayActivity[];
  locale: string;
}

export function TrainingCalendar({ data, locale }: TrainingCalendarProps) {
  const t = useTranslations('progress');
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // Index activity data by date key for O(1) lookup
  const activityMap = useMemo(() => {
    const map = new Map<string, DayActivity>();
    for (const d of data) map.set(d.date, d);
    return map;
  }, [data]);

  const monthName = currentMonth.toLocaleString(
    locale === 'ro' ? 'ro-RO' : 'en-US',
    { month: 'long', year: 'numeric' }
  );

  // Build calendar grid
  const { days, dayHeaders } = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Monday = 0, Sunday = 6
    const startPad = (firstDay.getDay() + 6) % 7;
    const totalDays = lastDay.getDate();

    const grid: (number | null)[] = [];
    for (let i = 0; i < startPad; i++) grid.push(null);
    for (let d = 1; d <= totalDays; d++) grid.push(d);
    while (grid.length % 7 !== 0) grid.push(null);

    const headers = locale === 'ro'
      ? ['L', 'M', 'M', 'J', 'V', 'S', 'D']
      : ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    return { days: grid, dayHeaders: headers };
  }, [currentMonth, locale]);

  const today = new Date();
  const todayKey = formatKey(today);

  const prevMonth = () => {
    setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
    setSelectedDay(null);
  };
  const nextMonth = () => {
    const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    if (next <= today) {
      setCurrentMonth(next);
      setSelectedDay(null);
    }
  };

  const canGoNext = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1) <= today;

  const selectedActivity = selectedDay ? activityMap.get(selectedDay) : null;

  return (
    <div className="space-y-3">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="p-1 rounded hover:bg-stone-100">
          <ChevronLeft size={18} className="text-stone-500" />
        </button>
        <p className="text-sm font-medium text-stone-700 capitalize">{monthName}</p>
        <button
          onClick={nextMonth}
          disabled={!canGoNext}
          className={cn('p-1 rounded', canGoNext ? 'hover:bg-stone-100' : 'opacity-30')}
        >
          <ChevronRight size={18} className="text-stone-500" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1">
        {dayHeaders.map((d, i) => (
          <div key={i} className="text-center text-[10px] font-medium text-stone-400 pb-1">
            {d}
          </div>
        ))}

        {/* Calendar days */}
        {days.map((day, i) => {
          if (day === null) {
            return <div key={i} />;
          }

          const key = formatKey(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
          const activity = activityMap.get(key);
          const isToday = key === todayKey;
          const isSelected = key === selectedDay;
          const hasActivity = activity && activity.total > 0;

          return (
            <button
              key={i}
              onClick={() => setSelectedDay(isSelected ? null : key)}
              className={cn(
                'relative flex flex-col items-center justify-center rounded-lg py-1.5 text-xs transition-colors',
                isSelected
                  ? 'bg-amber-800 text-white'
                  : isToday
                    ? 'bg-amber-100 text-amber-900 font-semibold'
                    : hasActivity
                      ? 'bg-stone-50 text-stone-900 hover:bg-stone-100'
                      : 'text-stone-400 hover:bg-stone-50'
              )}
            >
              {day}
              {/* Activity dots */}
              {hasActivity && (
                <div className="flex gap-0.5 mt-0.5">
                  {activity.sessions > 0 && (
                    <span className={cn(
                      'h-1 w-1 rounded-full',
                      isSelected ? 'bg-amber-200' : 'bg-amber-600'
                    )} />
                  )}
                  {activity.exercises > 0 && (
                    <span className={cn(
                      'h-1 w-1 rounded-full',
                      isSelected ? 'bg-green-200' : 'bg-green-600'
                    )} />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-[10px] text-stone-400">
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
          {t('calSessions')}
        </span>
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
          {t('calExercises')}
        </span>
      </div>

      {/* Selected day detail */}
      {selectedDay && selectedActivity && selectedActivity.total > 0 && (
        <div className="rounded-lg bg-amber-50 p-3 text-sm space-y-1">
          <p className="font-medium text-stone-800">{formatDisplayDate(selectedDay, locale)}</p>
          <div className="flex gap-4 text-xs text-stone-600">
            {selectedActivity.sessions > 0 && (
              <span>{t('calDaySessions', { count: selectedActivity.sessions })}</span>
            )}
            {selectedActivity.exercises > 0 && (
              <span>{t('calDayExercises', { count: selectedActivity.exercises })}</span>
            )}
          </div>
        </div>
      )}

      {selectedDay && (!selectedActivity || selectedActivity.total === 0) && (
        <div className="rounded-lg bg-stone-50 p-3 text-center">
          <p className="text-xs text-stone-400">{t('calNoActivity')}</p>
        </div>
      )}
    </div>
  );
}

function formatKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatDisplayDate(key: string, locale: string): string {
  const d = new Date(key + 'T12:00:00');
  return d.toLocaleDateString(locale === 'ro' ? 'ro-RO' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}
