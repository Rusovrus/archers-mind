'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowLeft } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { SelectionGroup } from '@/components/ui/SelectionGroup';
import { SkillLevel, BowType, Goal } from '@/types/user';
import { cn } from '@/lib/utils';

const GOALS: Goal[] = [
  'focus',
  'anxiety',
  'confidence',
  'consistency',
  'competition',
  'recovery',
];

export default function ProfileEditPage() {
  const { firebaseUser, user } = useAuth();
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();
  const t = useTranslations('profile');
  const to = useTranslations('onboarding');

  const [skillLevel, setSkillLevel] = useState<SkillLevel>('beginner');
  const [bowType, setBowType] = useState<BowType>('recurve');
  const [yearsOfPractice, setYearsOfPractice] = useState(0);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [saving, setSaving] = useState(false);

  // Populate from user doc
  useEffect(() => {
    if (!user?.profile) return;
    setSkillLevel(user.profile.skillLevel);
    setBowType(user.profile.bowType);
    setYearsOfPractice(user.profile.yearsOfPractice);
    setGoals(user.profile.goals || []);
  }, [user]);

  function toggleGoal(goal: Goal) {
    setGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  }

  async function handleSave() {
    if (!firebaseUser) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        'profile.skillLevel': skillLevel,
        'profile.bowType': bowType,
        'profile.yearsOfPractice': yearsOfPractice,
        'profile.goals': goals,
      });
      toast.success(t('profileUpdated'));
      router.push(`/${locale}/profile`);
    } catch {
      toast.error('Error');
    } finally {
      setSaving(false);
    }
  }

  const skillOptions = (
    ['beginner', 'intermediate', 'advanced', 'competitive'] as SkillLevel[]
  ).map((v) => ({ value: v, label: to(`profile.${v}`) }));

  const bowOptions = (
    ['recurve', 'compound', 'barebow', 'traditional'] as BowType[]
  ).map((v) => ({ value: v, label: to(`profile.${v}`) }));

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
        <h1 className="text-xl font-bold text-stone-900">{t('editProfile')}</h1>
      </div>

      {/* Skill level */}
      <SelectionGroup
        label={to('profile.skillLevel')}
        options={skillOptions}
        value={skillLevel}
        onChange={(v) => setSkillLevel(v as SkillLevel)}
      />

      {/* Bow type */}
      <SelectionGroup
        label={to('profile.bowType')}
        options={bowOptions}
        value={bowType}
        onChange={(v) => setBowType(v as BowType)}
        columns={2}
      />

      {/* Years of practice */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-stone-700">
          {to('profile.yearsOfPractice')}
        </p>
        <input
          type="number"
          min={0}
          max={50}
          value={yearsOfPractice}
          onChange={(e) => setYearsOfPractice(Math.max(0, Number(e.target.value)))}
          className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none focus:border-amber-800 focus:ring-1 focus:ring-amber-800"
        />
      </div>

      {/* Goals multi-select */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-stone-700">{to('goals.title')}</p>
        <p className="text-xs text-stone-400">{to('goals.subtitle')}</p>
        <div className="grid grid-cols-1 gap-2">
          {GOALS.map((goal) => {
            const selected = goals.includes(goal);
            return (
              <button
                key={goal}
                type="button"
                onClick={() => toggleGoal(goal)}
                className={cn(
                  'rounded-lg border px-3 py-2.5 text-sm font-medium text-left transition-colors',
                  selected
                    ? 'border-amber-800 bg-amber-50 text-amber-900'
                    : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                )}
              >
                {to(`goals.${goal}`)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Save */}
      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? '...' : t('editProfile')}
      </Button>
    </div>
  );
}
