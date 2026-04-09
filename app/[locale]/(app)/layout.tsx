'use client';

import { useEffect } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { href: 'today', label: 'Azi', icon: '🏠' },
  { href: 'journal', label: 'Jurnal', icon: '📓' },
  { href: 'exercises', label: 'Exerciții', icon: '🎧' },
  { href: 'program', label: 'Program', icon: '📅' },
  { href: 'profile', label: 'Profil', icon: '👤' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { firebaseUser, user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const locale = params.locale as string;

  useEffect(() => {
    if (loading) return;
    if (!firebaseUser) {
      router.replace(`/${locale}/login`);
      return;
    }
    if (user && !user.onboardingCompleted) {
      router.replace(`/${locale}/onboarding`);
    }
  }, [loading, firebaseUser, user, locale, router]);

  if (loading || !firebaseUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <div className="text-stone-400">Se încarcă...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-stone-50">
      <main className="flex-1 pb-20">{children}</main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-stone-200 bg-white">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const href = `/${locale}/${item.href}`;
            const isActive = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={item.href}
                href={href}
                className={`flex flex-col items-center gap-0.5 px-3 py-3 text-xs transition-colors ${
                  isActive ? 'text-amber-800' : 'text-stone-400'
                }`}
              >
                <span className="text-xl leading-none">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
