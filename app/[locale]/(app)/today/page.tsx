'use client';

import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function TodayPage() {
  const { user } = useAuth();
  const params = useParams();
  const locale = params.locale as string;

  const name = user?.displayName?.split(' ')[0] || 'Arcaș';

  return (
    <div className="px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">
          {locale === 'ro' ? `Salut, ${name}` : `Hello, ${name}`}
        </h1>
        <p className="mt-1 text-stone-500">
          {locale === 'ro' ? 'Ce facem azi?' : "What's the plan today?"}
        </p>
      </div>

      <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium text-amber-800">
          {locale === 'ro' ? 'Săptămâna 2 completă' : 'Week 2 complete'}
        </p>
        <h2 className="mt-1 text-lg font-semibold text-stone-900">
          {locale === 'ro' ? 'Autentificare funcțională!' : 'Authentication working!'}
        </h2>
        <p className="mt-2 text-sm text-stone-500">
          {locale === 'ro'
            ? 'Jurnalul de sesiuni urmează în săptămânile 3-4.'
            : 'Session journal coming in weeks 3-4.'}
        </p>
      </div>

      <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
          {locale === 'ro' ? 'Profilul tău' : 'Your profile'}
        </p>
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-stone-500">{locale === 'ro' ? 'Nivel' : 'Level'}</span>
            <span className="font-medium text-stone-900 capitalize">{user?.profile?.skillLevel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">{locale === 'ro' ? 'Arc' : 'Bow'}</span>
            <span className="font-medium text-stone-900 capitalize">{user?.profile?.bowType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">{locale === 'ro' ? 'Obiective' : 'Goals'}</span>
            <span className="font-medium text-stone-900">{user?.profile?.goals?.length || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
