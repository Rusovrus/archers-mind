'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { TrendingUp, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';

export default function ProfilePage() {
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('profile');
  const tp = useTranslations('progress');
  const { user, signOut } = useAuth();

  return (
    <div className="px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-stone-900">{t('title')}</h1>

      <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm space-y-3">
        <p className="text-lg font-semibold text-stone-900">{user?.displayName}</p>
        <p className="text-sm text-stone-500">{user?.email}</p>
      </div>

      <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-stone-400 mb-3">
          {t('stats')}
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-stone-500">{t('totalSessions')}</span>
            <span className="font-medium text-stone-900">{user?.stats?.totalSessions || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">{t('totalExercises')}</span>
            <span className="font-medium text-stone-900">{user?.stats?.totalExercisesCompleted || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">{t('totalMinutes')}</span>
            <span className="font-medium text-stone-900">{user?.stats?.totalMinutesMeditation || 0}</span>
          </div>
        </div>
      </div>

      {/* Progress link */}
      <Link
        href={`/${locale}/progress`}
        className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-4 shadow-sm hover:bg-stone-50 transition-colors"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
          <TrendingUp size={20} className="text-amber-800" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-stone-900">{tp('viewProgress')}</p>
          <p className="text-xs text-stone-400">{tp('subtitle')}</p>
        </div>
        <ChevronRight size={18} className="text-stone-300" />
      </Link>

      <Button variant="ghost" onClick={signOut} className="text-red-600 hover:bg-red-50">
        {t('logout')}
      </Button>
    </div>
  );
}
