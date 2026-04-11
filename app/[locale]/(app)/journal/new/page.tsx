'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Timestamp } from 'firebase/firestore';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { createSession } from '@/lib/sessions';
import { NewSession } from '@/types/session';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SelectionGroup } from '@/components/ui/SelectionGroup';
import { SliderInput } from '@/components/ui/SliderInput';

const sessionSchema = z
  .object({
    date: z.string().min(1),
    type: z.enum(['training', 'competition', 'tune']),
    distance: z.coerce.number().min(1),
    arrowCount: z.coerce.number().min(1),
    score: z.coerce.number().min(0),
    maxScore: z.coerce.number().min(1),
    duration: z.coerce.number().min(1),
    indoor: z.boolean(),
    wind: z.enum(['none', 'light', 'moderate', 'strong']),
    temperature: z.coerce.number().optional(),
    lighting: z.enum(['poor', 'fair', 'good', 'excellent']).optional(),
    preFocus: z.number().min(1).max(10),
    preAnxiety: z.number().min(1).max(10),
    preConfidence: z.number().min(1).max(10),
    postFocus: z.number().min(1).max(10),
    postSatisfaction: z.number().min(1).max(10),
    dominantEmotion: z.string().optional(),
    notes: z.string(),
    tags: z.string(),
  })
  .refine((d) => d.score <= d.maxScore, {
    message: 'scoreError',
    path: ['score'],
  });

type FormData = z.infer<typeof sessionSchema>;

export default function NewSessionPage() {
  const { firebaseUser } = useAuth();
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const t = useTranslations('journal');
  const tf = useTranslations('journal.form');
  const tc = useTranslations('common');

  const [submitting, setSubmitting] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(sessionSchema) as Resolver<FormData>,
    defaultValues: {
      date: today,
      type: 'training',
      distance: undefined,
      arrowCount: undefined,
      score: undefined,
      maxScore: undefined,
      duration: undefined,
      indoor: true,
      wind: 'none',
      temperature: undefined,
      lighting: undefined,
      preFocus: 5,
      preAnxiety: 3,
      preConfidence: 5,
      postFocus: 5,
      postSatisfaction: 5,
      dominantEmotion: '',
      notes: '',
      tags: '',
    },
  });

  const sessionType = watch('type');
  const indoor = watch('indoor');
  const wind = watch('wind');
  const lighting = watch('lighting');
  const preFocus = watch('preFocus');
  const preAnxiety = watch('preAnxiety');
  const preConfidence = watch('preConfidence');
  const postFocus = watch('postFocus');
  const postSatisfaction = watch('postSatisfaction');

  const onSubmit = async (data: FormData) => {
    if (!firebaseUser) return;
    setSubmitting(true);

    try {
      const newSession: NewSession = {
        date: Timestamp.fromDate(new Date(data.date + 'T12:00:00')),
        type: data.type,
        distance: data.distance,
        arrowCount: data.arrowCount,
        score: data.score,
        maxScore: data.maxScore,
        duration: data.duration,
        conditions: {
          indoor: data.indoor,
          wind: data.wind,
          ...(data.temperature != null && { temperature: data.temperature }),
          ...(data.lighting && { lighting: data.lighting }),
        },
        mentalState: {
          preFocus: data.preFocus,
          preAnxiety: data.preAnxiety,
          preConfidence: data.preConfidence,
          postFocus: data.postFocus,
          postSatisfaction: data.postSatisfaction,
          ...(data.dominantEmotion && { dominantEmotion: data.dominantEmotion }),
        },
        notes: data.notes,
        exercisesUsed: [],
        tags: data.tags
          ? data.tags.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
      };

      await createSession(firebaseUser.uid, newSession);
      toast.success(t('created'));
      router.push(`/${locale}/journal`);
    } catch {
      toast.error(tc('error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href={`/${locale}/journal`}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-stone-600 hover:bg-stone-100"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-stone-900">{t('newSession')}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Info */}
        <section className="space-y-4">
          <Input
            label={tf('date')}
            type="date"
            {...register('date')}
            error={errors.date?.message}
          />

          <SelectionGroup
            label={tf('type')}
            columns={3}
            options={[
              { value: 'training', label: tf('training') },
              { value: 'competition', label: tf('competition') },
              { value: 'tune', label: tf('tune') },
            ]}
            value={sessionType}
            onChange={(v) => setValue('type', v as FormData['type'])}
          />

          <Input
            label={tf('distance')}
            type="number"
            inputMode="numeric"
            {...register('distance')}
            error={errors.distance?.message}
          />

          <Input
            label={tf('arrowCount')}
            type="number"
            inputMode="numeric"
            {...register('arrowCount')}
            error={errors.arrowCount?.message}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label={tf('score')}
              type="number"
              inputMode="numeric"
              {...register('score')}
              error={errors.score ? tf('scoreError') : undefined}
            />
            <Input
              label={tf('maxScore')}
              type="number"
              inputMode="numeric"
              {...register('maxScore')}
              error={errors.maxScore?.message}
            />
          </div>

          <Input
            label={tf('duration')}
            type="number"
            inputMode="numeric"
            {...register('duration')}
            error={errors.duration?.message}
          />
        </section>

        {/* Divider */}
        <div className="border-t border-stone-200" />

        {/* Conditions */}
        <section className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-stone-400">
            {tf('conditions')}
          </p>

          <SelectionGroup
            columns={2}
            options={[
              { value: 'true', label: tf('indoor') },
              { value: 'false', label: tf('outdoor') },
            ]}
            value={String(indoor)}
            onChange={(v) => setValue('indoor', v === 'true')}
          />

          <SelectionGroup
            label={tf('wind')}
            columns={2}
            options={[
              { value: 'none', label: tf('windNone') },
              { value: 'light', label: tf('windLight') },
              { value: 'moderate', label: tf('windModerate') },
              { value: 'strong', label: tf('windStrong') },
            ]}
            value={wind}
            onChange={(v) => setValue('wind', v as FormData['wind'])}
          />

          <Input
            label={tf('temperature')}
            type="number"
            inputMode="numeric"
            {...register('temperature')}
          />

          <SelectionGroup
            label={tf('lighting')}
            columns={2}
            options={[
              { value: 'poor', label: tf('lightingPoor') },
              { value: 'fair', label: tf('lightingFair') },
              { value: 'good', label: tf('lightingGood') },
              { value: 'excellent', label: tf('lightingExcellent') },
            ]}
            value={lighting || ''}
            onChange={(v) => setValue('lighting', v as FormData['lighting'])}
          />
        </section>

        {/* Divider */}
        <div className="border-t border-stone-200" />

        {/* Mental State - Before */}
        <section className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-stone-400">
            {tf('mentalStatePre')}
          </p>

          <SliderInput
            label={tf('focus')}
            value={preFocus}
            onChange={(v) => setValue('preFocus', v)}
            lowLabel={locale === 'ro' ? 'Scăzut' : 'Low'}
            highLabel={locale === 'ro' ? 'Ridicat' : 'High'}
          />

          <SliderInput
            label={tf('anxiety')}
            value={preAnxiety}
            onChange={(v) => setValue('preAnxiety', v)}
            lowLabel={locale === 'ro' ? 'Calm' : 'Calm'}
            highLabel={locale === 'ro' ? 'Anxios' : 'Anxious'}
          />

          <SliderInput
            label={tf('confidence')}
            value={preConfidence}
            onChange={(v) => setValue('preConfidence', v)}
            lowLabel={locale === 'ro' ? 'Scăzută' : 'Low'}
            highLabel={locale === 'ro' ? 'Ridicată' : 'High'}
          />
        </section>

        {/* Divider */}
        <div className="border-t border-stone-200" />

        {/* Mental State - After */}
        <section className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-stone-400">
            {tf('mentalStatePost')}
          </p>

          <SliderInput
            label={tf('focus')}
            value={postFocus}
            onChange={(v) => setValue('postFocus', v)}
            lowLabel={locale === 'ro' ? 'Scăzut' : 'Low'}
            highLabel={locale === 'ro' ? 'Ridicat' : 'High'}
          />

          <SliderInput
            label={tf('satisfaction')}
            value={postSatisfaction}
            onChange={(v) => setValue('postSatisfaction', v)}
            lowLabel={locale === 'ro' ? 'Scăzută' : 'Low'}
            highLabel={locale === 'ro' ? 'Ridicată' : 'High'}
          />

          <Input
            label={tf('dominantEmotion')}
            placeholder={tf('emotionPlaceholder')}
            {...register('dominantEmotion')}
          />
        </section>

        {/* Divider */}
        <div className="border-t border-stone-200" />

        {/* Notes & Tags */}
        <section className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-stone-700">{tf('notes')}</label>
            <textarea
              {...register('notes')}
              rows={3}
              placeholder={tf('notesPlaceholder')}
              className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-stone-900 placeholder-stone-400 focus:border-amber-800 focus:outline-none focus:ring-1 focus:ring-amber-800"
            />
          </div>

          <Input
            label={tf('tags')}
            placeholder={tf('tagsPlaceholder')}
            {...register('tags')}
          />
        </section>

        {/* Submit */}
        <Button type="submit" loading={submitting}>
          {tf('submit')}
        </Button>
      </form>
    </div>
  );
}
