'use client';

import { cn } from '@/lib/utils';

interface Option {
  value: string;
  label: string;
}

interface SelectionGroupProps {
  label?: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  columns?: 1 | 2 | 3 | 4;
}

export function SelectionGroup({
  label,
  options,
  value,
  onChange,
  columns = 1,
}: SelectionGroupProps) {
  return (
    <div className="space-y-2">
      {label && (
        <p className="text-sm font-medium text-stone-700">{label}</p>
      )}
      <div
        className={cn(
          'grid gap-2',
          columns === 1 && 'grid-cols-1',
          columns === 2 && 'grid-cols-2',
          columns === 3 && 'grid-cols-3',
          columns === 4 && 'grid-cols-4'
        )}
      >
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors',
              value === option.value
                ? 'border-amber-800 bg-amber-50 text-amber-900'
                : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
