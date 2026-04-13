'use client';

import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './useAuth';
import { checkAchievements } from '@/lib/achievements';

/**
 * Hook that checks for newly unlocked achievements.
 * Shows a toast for each new achievement. Runs once per mount.
 */
export function useAchievementCheck(locale: string) {
  const { firebaseUser, user } = useAuth();
  const checkedRef = useRef(false);

  useEffect(() => {
    if (!firebaseUser || !user || checkedRef.current) return;
    checkedRef.current = true;

    checkAchievements(firebaseUser.uid, user).then((newlyUnlocked) => {
      for (const achievement of newlyUnlocked) {
        const title = achievement.title[locale as 'ro' | 'en'];
        toast.success(`${achievement.icon} ${title}`, { duration: 4000 });
      }
    });
  }, [firebaseUser, user, locale]);
}
