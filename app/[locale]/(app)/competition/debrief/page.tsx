'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { saveDebrief, getDebriefs } from '@/lib/debriefs';
import { scorePercentage } from '@/lib/utils';
import { CompetitionDebrief } from '@/types/competition';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export default function DebriefPage() {
  const { firebaseUser } = useAuth();
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const t = useTranslations('competition');
  const tc = useTranslations('common');

  // Form state
  const [competitionName, setCompetitionName] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [finalScore, setFinalScore] = useState('');
  const [maxScore, setMaxScore] = useState('');
  const [things, setThings] = useState(['', '', '']);
  const [improvement, setImprovement] = useState('');
  const [mood, setMood] = useState(7);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Past debriefs
  const [debriefs, setDebriefs] = useState<CompetitionDebrief[]>([]);
  const [loadingDebriefs, setLoadingDebriefs] = useState(true);

  useEffect(() => {
    if (!firebaseUser) return;
    getDebriefs(firebaseUser.uid)
      .then(setDebriefs)
      .catch(() => {})
      .finally(() => setLoadingDebriefs(false));
  }, [firebaseUser]);

  function updateThing(index: number, value: string) {
    setThings((prev) => prev.map((t, i) => (i === index ? value : t)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firebaseUser || !competitionName.trim()) return;

    setSaving(true);
    try {
      await saveDebrief(firebaseUser.uid, {
        competitionName: competitionName.trim(),
        date: Timestamp.fromDate(new Date(date)),
        finalScore: Number(finalScore) || 0,
        maxScore: Number(maxScore) || 0,
        threeGoodThings: [things[0].trim(), things[1].trim(), things[2].trim()],
        oneImprovement: improvement.trim(),
        overallMood: mood,
        notes: notes.trim(),
      });

      toast.success(t('debriefForm.saved'));
      router.push(`/${locale}/competition`);
    } catch {
      toast.error(tc('error'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href={`/${locale}/competition`}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-stone-600 hover:bg-stone-100"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-stone-900">{t('debrief')}</h1>
      </div>

      {/* Debrief form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Competition name */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            {t('debriefForm.competitionName')}
          </label>
          <input
            type="text"
            value={competitionName}
            onChange={(e) => setCompetitionName(e.target.value)}
            placeholder={t('debriefForm.competitionNamePlaceholder')}
            required
            className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 focus:outline-none"
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            {t('debriefForm.date')}
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm text-stone-900 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 focus:outline-none"
          />
        </div>

        {/* Score */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              {t('debriefForm.finalScore')}
            </label>
            <input
              type="number"
              min={0}
              value={finalScore}
              onChange={(e) => setFinalScore(e.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm text-stone-900 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              {t('debriefForm.maxScore')}
            </label>
            <input
              type="number"
              min={0}
              value={maxScore}
              onChange={(e) => setMaxScore(e.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm text-stone-900 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Three good things */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            {t('debriefForm.threeGoodThings')}
          </label>
          <div className="space-y-2">
            {things.map((val, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">
                  {i + 1}
                </span>
                <input
                  type="text"
                  value={val}
                  onChange={(e) => updateThing(i, e.target.value)}
                  placeholder={t('debriefForm.thingPlaceholder')}
                  className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-600 focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* One improvement */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            {t('debriefForm.oneImprovement')}
          </label>
          <input
            type="text"
            value={improvement}
            onChange={(e) => setImprovement(e.target.value)}
            placeholder={t('debriefForm.improvementPlaceholder')}
            className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 focus:outline-none"
          />
        </div>

        {/* Mood 1-10 */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            {t('debriefForm.overallMood')} — {t('debriefForm.moodLabel', { value: mood })}
          </label>
          <div className="flex gap-1.5">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setMood(v)}
                className={cn(
                  'flex h-9 flex-1 items-center justify-center rounded-lg text-sm font-medium transition-colors',
                  v === mood
                    ? 'bg-amber-800 text-white'
                    : 'border border-stone-200 text-stone-600 hover:bg-stone-50'
                )}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            {t('debriefForm.notes')}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('debriefForm.notesPlaceholder')}
            rows={3}
            className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 focus:outline-none resize-none"
          />
        </div>

        <Button type="submit" loading={saving} disabled={!competitionName.trim()}>
          {t('debriefForm.submit')}
        </Button>
      </form>

      {/* Past debriefs */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-stone-400 mb-3">
          {t('pastDebriefs')}
        </p>

        {loadingDebriefs ? (
          <div className="rounded-xl border border-stone-200 bg-white p-4">
            <p className="text-sm text-stone-400">{tc('loading')}</p>
          </div>
        ) : debriefs.length === 0 ? (
          <div className="rounded-xl border border-stone-200 bg-white p-5 text-center">
            <p className="text-sm text-stone-500">{t('noDebriefs')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {debriefs.map((d) => {
              const pct = scorePercentage(d.finalScore, d.maxScore);
              return (
                <div
                  key={d.id}
                  className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-stone-900">{d.competitionName}</p>
                      <p className="text-xs text-stone-400 mt-0.5">
                        {d.date.toDate().toLocaleDateString()} · {d.finalScore}/{d.maxScore} ({pct}%) · {t('debriefForm.moodLabel', { value: d.overallMood })}
                      </p>
                    </div>
                  </div>
                  {d.threeGoodThings.some((t) => t) && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {d.threeGoodThings.filter(Boolean).map((thing, i) => (
                        <span key={i} className="rounded-full bg-green-50 px-2.5 py-1 text-xs text-green-700">
                          {thing}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
