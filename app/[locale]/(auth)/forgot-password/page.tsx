'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const schema = z.object({
  email: z.string().email('Email invalid'),
});

type ForgotForm = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const t = useTranslations('auth.forgotPassword');
  const { resetPassword } = useAuth();
  const params = useParams();
  const locale = params.locale as string;
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotForm>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: ForgotForm) => {
    setLoading(true);
    try {
      await resetPassword(data.email);
      setSent(true);
    } catch {
      // Firebase nu dezvăluie dacă emailul există — trimitem mereu succes
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="space-y-6 text-center">
        <div className="text-4xl">✉️</div>
        <div>
          <h2 className="text-xl font-bold text-stone-900">Link trimis!</h2>
          <p className="mt-1 text-sm text-stone-500">{t('sent')}</p>
        </div>
        <Link href={`/${locale}/login`} className="block text-sm font-medium text-amber-800 hover:text-amber-900">
          {t('backToLogin')}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-stone-900">{t('title')}</h2>
        <p className="mt-1 text-sm text-stone-500">{t('subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label={t('email')}
          type="email"
          placeholder="arcas@email.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <Button type="submit" loading={loading}>{t('submit')}</Button>
      </form>

      <Link href={`/${locale}/login`} className="block text-center text-sm text-amber-800 hover:text-amber-900">
        {t('backToLogin')}
      </Link>
    </div>
  );
}
