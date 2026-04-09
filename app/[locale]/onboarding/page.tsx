'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/Button';
import type { SkillLevel, BowType, Goal } from '@/types/user';

type Step = 'welcome' | 'profile' | 'goals';

export default function OnboardingPage() {
  const { firebaseUser, user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [step, setStep] = useState<Step>('welcome');
  const [saving, setSaving] = useState(false);

  const [skillLevel, setSkillLevel] = useState<SkillLevel>('intermediate');
  const [bowType, setBowType] = useState<BowType>('recurve');
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    if (!loading && !firebaseUser) {
      router.replace(`/${locale}/login`);
    }
    if (!loading && user?.onboardingCompleted) {
      router.replace(`/${locale}/today`);
    }
  }, [loading, firebaseUser, user, locale, router]);

  const toggleGoal = (goal: Goal) => {
    setGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const finish = async () => {
    if (!firebaseUser) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || 'Arcaș',
        photoURL: firebaseUser.photoURL || null,
        preferredLanguage: locale,
        onboardingCompleted: true,
        profile: {
          skillLevel,
          bowType,
          yearsOfPractice: 0,
          goals,
        },
        preferences: {
          notificationsEnabled: true,
          dailyReminderTime: '19:00',
          streakCount: 0,
        },
        stats: {
          totalSessions: 0,
          totalExercisesCompleted: 0,
          totalMinutesMeditation: 0,
        },
        createdAt: serverTimestamp(),
        lastActiveAt: serverTimestamp(),
      }, { merge: true });
      router.replace(`/${locale}/today`);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !firebaseUser) return null;

  const skillLevels: { value: SkillLevel; label: string }[] = [
    { value: 'beginner', label: 'Începător (până la 1 an)' },
    { value: 'intermediate', label: 'Intermediar (1-3 ani)' },
    { value: 'advanced', label: 'Avansat (3+ ani)' },
    { value: 'competitive', label: 'Competitiv (particip la concursuri)' },
  ];

  const bowTypes: { value: BowType; label: string }[] = [
    { value: 'recurve', label: 'Recurve' },
    { value: 'compound', label: 'Compound' },
    { value: 'barebow', label: 'Barebow' },
    { value: 'traditional', label: 'Tradițional' },
  ];

  const goalOptions: { value: Goal; label: string }[] = [
    { value: 'focus', label: 'Concentrare și atenție' },
    { value: 'anxiety', label: 'Gestionarea anxietății' },
    { value: 'confidence', label: 'Încredere în sine' },
    { value: 'consistency', label: 'Consistență' },
    { value: 'competition', label: 'Performanță la concurs' },
    { value: 'recovery', label: 'Recuperare după greșeli' },
  ];

  if (step === 'welcome') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-stone-50 px-4 text-center">
        <div className="max-w-sm space-y-6">
          <div className="text-5xl">🏹</div>
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Bine ai venit!</h1>
            <p className="mt-2 text-stone-500">
              Pregătirea mentală este 80% din performanța ta ca arcaș. Hai să te cunoaștem.
            </p>
          </div>
          <Button onClick={() => setStep('profile')}>Să începem</Button>
        </div>
      </div>
    );
  }

  if (step === 'profile') {
    return (
      <div className="flex min-h-screen flex-col bg-stone-50 px-4 py-8">
        <div className="mx-auto w-full max-w-sm space-y-6">
          <div>
            <p className="text-sm font-medium text-amber-800">Pasul 1 din 2</p>
            <h2 className="mt-1 text-xl font-bold text-stone-900">Despre tine</h2>
          </div>

          <div className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-medium text-stone-700">Nivelul tău</p>
              <div className="space-y-2">
                {skillLevels.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setSkillLevel(s.value)}
                    className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                      skillLevel === s.value
                        ? 'border-amber-800 bg-amber-50 font-medium text-amber-900'
                        : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-stone-700">Tipul arcului</p>
              <div className="grid grid-cols-2 gap-2">
                {bowTypes.map((b) => (
                  <button
                    key={b.value}
                    onClick={() => setBowType(b.value)}
                    className={`rounded-lg border px-4 py-3 text-sm transition-colors ${
                      bowType === b.value
                        ? 'border-amber-800 bg-amber-50 font-medium text-amber-900'
                        : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button onClick={() => setStep('goals')}>Mai departe</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-stone-50 px-4 py-8">
      <div className="mx-auto w-full max-w-sm space-y-6">
        <div>
          <p className="text-sm font-medium text-amber-800">Pasul 2 din 2</p>
          <h2 className="mt-1 text-xl font-bold text-stone-900">Obiectivele tale</h2>
          <p className="mt-1 text-sm text-stone-500">Alege ce vrei să îmbunătățești (poți alege mai multe)</p>
        </div>

        <div className="space-y-2">
          {goalOptions.map((g) => (
            <button
              key={g.value}
              onClick={() => toggleGoal(g.value)}
              className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                goals.includes(g.value)
                  ? 'border-amber-800 bg-amber-50 font-medium text-amber-900'
                  : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>

        <Button onClick={finish} loading={saving} disabled={goals.length === 0}>
          Finalizează
        </Button>
      </div>
    </div>
  );
}
