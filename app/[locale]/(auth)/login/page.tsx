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

const loginSchema = z.object({
  email: z.string().email('Email invalid'),
  password: z.string().min(6, 'Minimum 6 caractere'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const t = useTranslations('auth.login');
  const { signIn, signInWithGoogle, firebaseUser, user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, setError } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  // Redirect dacă deja autentificat
  useEffect(() => {
    if (!loading && firebaseUser) {
      if (user?.onboardingCompleted) {
        router.replace(`/${locale}/today`);
      } else {
        router.replace(`/${locale}/onboarding`);
      }
    }
  }, [loading, firebaseUser, user, locale, router]);

  const onSubmit = async (data: LoginForm) => {
    setSubmitting(true);
    try {
      await signIn(data.email, data.password);
      // redirect handled by useEffect above
    } catch (err: any) {
      const code = err.code;
      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
        setError('email', { message: 'Email sau parolă incorectă' });
      } else if (code === 'auth/wrong-password') {
        setError('password', { message: 'Parolă incorectă' });
      } else {
        setError('email', { message: 'A apărut o eroare. Încearcă din nou.' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle(locale as 'ro' | 'en');
      // redirect handled by useEffect above
    } catch {
      // user closed popup
    } finally {
      setGoogleLoading(false);
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
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <div className="text-right">
          <Link href={`/${locale}/forgot-password`} className="text-sm text-amber-800 hover:text-amber-900">
            {t('forgotPassword')}
          </Link>
        </div>
        <Button type="submit" loading={submitting}>{t('submit')}</Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-stone-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-stone-400">sau</span>
        </div>
      </div>

      <Button variant="outline" type="button" onClick={handleGoogle} loading={googleLoading}>
        {t('googleSignIn')}
      </Button>

      <p className="text-center text-sm text-stone-500">
        {t('noAccount')}{' '}
        <Link href={`/${locale}/register`} className="font-medium text-amber-800 hover:text-amber-900">
          {t('createAccount')}
        </Link>
      </p>
    </div>
  );
}
