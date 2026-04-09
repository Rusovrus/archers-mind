'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const registerSchema = z.object({
  name: z.string().min(2, 'Minim 2 caractere'),
  email: z.string().email('Email invalid'),
  password: z.string().min(6, 'Minimum 6 caractere'),
  passwordConfirm: z.string(),
}).refine((d) => d.password === d.passwordConfirm, {
  message: 'Parolele nu se potrivesc',
  path: ['passwordConfirm'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const t = useTranslations('auth.register');
  const { signUp, firebaseUser, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, setError } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    if (!loading && firebaseUser) {
      router.replace(`/${locale}/onboarding`);
    }
  }, [loading, firebaseUser, locale, router]);

  const onSubmit = async (data: RegisterForm) => {
    setSubmitting(true);
    try {
      await signUp(data.email, data.password, data.name, locale as 'ro' | 'en');
      // redirect handled by useEffect
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('email', { message: 'Acest email este deja folosit' });
      } else {
        setError('email', { message: 'A apărut o eroare. Încearcă din nou.' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-stone-900">{t('title')}</h2>
        <p className="mt-1 text-sm text-stone-500">{t('subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label={t('name')}
          type="text"
          placeholder="Numele tău"
          autoComplete="name"
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          label={t('email')}
          type="email"
          placeholder="arcas@email.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label={t('password')}
          type="password"
          placeholder="••••••"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Input
          label={t('passwordConfirm')}
          type="password"
          placeholder="••••••"
          autoComplete="new-password"
          error={errors.passwordConfirm?.message}
          {...register('passwordConfirm')}
        />
        <Button type="submit" loading={submitting}>{t('submit')}</Button>
      </form>

      <p className="text-center text-sm text-stone-500">
        {t('hasAccount')}{' '}
        <Link href={`/${locale}/login`} className="font-medium text-amber-800 hover:text-amber-900">
          {t('loginLink')}
        </Link>
      </p>
    </div>
  );
}
