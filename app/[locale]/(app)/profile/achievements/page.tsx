'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { achievements, getUnlockedAchievements } from '@/lib/achievements';
import { UnlockedAchievement } from '@/types/achievements';
import { cn } from '@/lib/utils';

export default function AchievementsPage() {
  const { firebaseUser } = useAuth();
  const params = useParams();
  const locale = (params.locale as string) || 'ro';
  const t = useTranslations('profile');

  const [unlocked, setUnlocked] = useState<Map<string, UnlockedAchievement>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser) return;
    getUnlockedAchievements(firebaseUser.uid)
      .then(setUnlocked)
      .finally(() => setLoading(false));
  }, [firebaseUser]);

  const unlockedCount = unlocked.size;
  const totalCount = achievements.length;

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
        <div>
          <h1 className="text-xl font-bold text-stone-900">{t('achievements')}</h1>
          <p className="text-xs text-stone-400">
            {t('achievementsCount', { unlocked: unlockedCount, total: totalCount })}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="h-2 rounded-full bg-stone-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-amber-800 transition-all duration-500"
            style={{ width: `${totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0}%` }}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-stone-400 text-sm">...</div>
      ) : (
        <div className="space-y-3">
          {achievements.map((achievement) => {
            const isUnlocked = unlocked.has(achievement.id);

            return (
              <div
                key={achievement.id}
                className={cn(
                  'flex items-center gap-4 rounded-xl border p-4 transition-colors',
                  isUnlocked
                    ? 'border-amber-200 bg-amber-50/50 shadow-sm'
                    : 'border-stone-200 bg-white opacity-60'
                )}
              >
                {/* Icon */}
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-xl text-2xl',
                    isUnlocked ? 'bg-amber-100' : 'bg-stone-100'
                  )}
                >
                  {isUnlocked ? (
                    achievement.icon
                  ) : (
                    <Lock size={20} className="text-stone-400" />
                  )}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      'font-medium',
                      isUnlocked ? 'text-stone-900' : 'text-stone-500'
                    )}
                  >
                    {achievement.title[locale as 'ro' | 'en']}
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {achievement.description[locale as 'ro' | 'en']}
                  </p>
                </div>

                {/* Status */}
                {isUnlocked && (
                  <span className="shrink-0 rounded-full bg-amber-800 px-2.5 py-0.5 text-xs font-medium text-white">
                    {t('unlocked')}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
