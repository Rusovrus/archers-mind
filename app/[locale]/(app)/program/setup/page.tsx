'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { startProgram } from '@/lib/program';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ProgramSetupPage() {
  const { firebaseUser } = useAuth();
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const t = useTranslations('program');
  const ts = useTranslations('program.setup');
  const tc = useTranslations('common');

  const [date, setDate] = useState('');
  const [noCompetition, setNoCompetition] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleStart = async () => {
    if (!firebaseUser) return;
    setSubmitting(true);
    try {
      const target =
        !noCompetition && date ? new Date(`${date}T12:00:00`) : undefined;
      await startProgram(firebaseUser.uid, target);
      router.push(`/${locale}/program`);
    } catch {
      toast.error(tc('error'));
      setSubmitting(false);
    }
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/${locale}/program`}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-stone-600 hover:bg-stone-100"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-stone-900">{ts('title')}</h1>
          <p className="text-sm text-stone-500">{ts('subtitle')}</p>
        </div>
      </div>

      <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm space-y-4">
        <Input
          label={ts('competitionDate')}
          type="date"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            if (e.target.value) setNoCompetition(false);
          }}
          disabled={noCompetition}
        />

        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-stone-300 text-amber-800 focus:ring-amber-800"
            checked={noCompetition}
            onChange={(e) => {
              setNoCompetition(e.target.checked);
              if (e.target.checked) setDate('');
            }}
          />
          {ts('noCompetition')}
        </label>
      </div>

      <Button
        onClick={handleStart}
        loading={submitting}
        disabled={!noCompetition && !date}
      >
        {t('start')}
      </Button>
    </div>
  );
}
