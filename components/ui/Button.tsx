'use client';

import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  loading,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'flex h-11 w-full items-center justify-center rounded-lg px-4 font-medium transition-colors disabled:opacity-50',
        variant === 'primary' && 'bg-amber-800 text-white hover:bg-amber-900',
        variant === 'outline' && 'border border-stone-300 text-stone-900 hover:bg-stone-100',
        variant === 'ghost' && 'text-amber-800 hover:bg-amber-50',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Se încarcă...' : children}
    </button>
  );
}
