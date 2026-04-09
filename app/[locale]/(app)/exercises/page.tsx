'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function ExercisesPage() {
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('exercises');

  return (
    <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
      <span className="text-5xl">🎧</span>
      <h1 className="mt-4 text-xl font-bold text-stone-900">{t('title')}</h1>
      <p className="mt-2 text-sm text-stone-500">
        {locale === 'ro' ? 'În curând disponibil' : 'Coming soon'}
      </p>
    </div>
  );
}
