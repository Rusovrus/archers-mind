'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';

export default function ProfilePage() {
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('profile');
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

      <Button variant="ghost" onClick={signOut} className="text-red-600 hover:bg-red-50">
        {t('logout')}
      </Button>
    </div>
  );
}
