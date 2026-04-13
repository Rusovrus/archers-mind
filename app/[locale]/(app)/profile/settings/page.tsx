'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Bell, BellOff, Globe, Clock, Check } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import {
  supportsNotifications,
  getPermissionState,
  requestPermission,
  scheduleDailyReminder,
  cancelDailyReminder,
} from '@/lib/notifications';

const TIME_OPTIONS = [
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '12:00',
  '14:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
];

export default function SettingsPage() {
  const { firebaseUser, user } = useAuth();
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();
  const t = useTranslations('profile');
  const tc = useTranslations('common');

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('19:00');
  const [permissionState, setPermissionState] = useState<
    NotificationPermission | 'unsupported'
  >('default');
  const [saving, setSaving] = useState(false);

  // Populate from user doc
  useEffect(() => {
    if (!user?.preferences) return;
    setNotificationsEnabled(user.preferences.notificationsEnabled);
    setReminderTime(user.preferences.dailyReminderTime || '19:00');
  }, [user]);

  // Check notification permission
  useEffect(() => {
    setPermissionState(getPermissionState());
  }, []);

  async function handleToggleNotifications() {
    const newValue = !notificationsEnabled;

    if (newValue && permissionState !== 'granted') {
      const result = await requestPermission();
      setPermissionState(result);
      if (result !== 'granted') return;
    }

    setNotificationsEnabled(newValue);

    if (newValue) {
      scheduleDailyReminder(
        reminderTime,
        tc('appName'),
        t('dailyReminder')
      );
      toast.success(t('notificationScheduled', { time: reminderTime }));
    } else {
      cancelDailyReminder();
      toast.success(t('notificationDisabled'));
    }

    // Save to Firestore
    if (firebaseUser) {
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        'preferences.notificationsEnabled': newValue,
      });
    }
  }

  async function handleTimeChange(time: string) {
    setReminderTime(time);

    if (firebaseUser) {
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        'preferences.dailyReminderTime': time,
      });
    }

    // Reschedule if notifications are active
    if (notificationsEnabled && permissionState === 'granted') {
      scheduleDailyReminder(time, tc('appName'), t('dailyReminder'));
      toast.success(t('notificationScheduled', { time }));
    }
  }

  async function handleLanguageChange(newLocale: string) {
    if (newLocale === locale) return;

    setSaving(true);
    try {
      if (firebaseUser) {
        await updateDoc(doc(db, 'users', firebaseUser.uid), {
          preferredLanguage: newLocale,
        });
      }
      // Navigate to the same page in the new locale
      router.push(`/${newLocale}/profile/settings`);
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
          href={`/${locale}/profile`}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-stone-600 hover:bg-stone-100"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-stone-900">{t('settings')}</h1>
      </div>

      {/* Notifications section */}
      <div className="rounded-xl border border-stone-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50">
              <Bell size={18} className="text-amber-800" />
            </div>
            <div>
              <p className="font-medium text-stone-900">{t('notifications')}</p>
              <p className="text-xs text-stone-400">{t('notificationsDesc')}</p>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Toggle */}
          <button
            onClick={handleToggleNotifications}
            className="flex w-full items-center justify-between"
          >
            <div className="flex items-center gap-3">
              {notificationsEnabled ? (
                <Bell size={18} className="text-amber-800" />
              ) : (
                <BellOff size={18} className="text-stone-400" />
              )}
              <span className="text-sm font-medium text-stone-700">
                {t('dailyReminder')}
              </span>
            </div>
            <div
              className={cn(
                'relative h-6 w-11 rounded-full transition-colors',
                notificationsEnabled ? 'bg-amber-800' : 'bg-stone-300'
              )}
            >
              <div
                className={cn(
                  'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                  notificationsEnabled ? 'translate-x-5' : 'translate-x-0.5'
                )}
              />
            </div>
          </button>

          {/* Permission warning */}
          {permissionState === 'denied' && (
            <p className="text-xs text-red-500">{t('notificationDenied')}</p>
          )}

          {permissionState === 'unsupported' && (
            <p className="text-xs text-stone-400">{t('notificationPermissionDesc')}</p>
          )}

          {/* Time picker */}
          {notificationsEnabled && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-stone-500">
                <Clock size={14} />
                <span>{t('reminderTime')}</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {TIME_OPTIONS.map((time) => (
                  <button
                    key={time}
                    onClick={() => handleTimeChange(time)}
                    className={cn(
                      'rounded-lg border px-2 py-2 text-sm font-medium transition-colors',
                      time === reminderTime
                        ? 'border-amber-800 bg-amber-50 text-amber-900'
                        : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                    )}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Language section */}
      <div className="rounded-xl border border-stone-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50">
              <Globe size={18} className="text-amber-800" />
            </div>
            <div>
              <p className="font-medium text-stone-900">{t('language')}</p>
              <p className="text-xs text-stone-400">{t('languageDesc')}</p>
            </div>
          </div>
        </div>

        <div className="px-5 py-3 space-y-1">
          {[
            { code: 'ro', label: 'Romana' },
            { code: 'en', label: 'English' },
          ].map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              disabled={saving}
              className={cn(
                'flex w-full items-center justify-between rounded-lg px-3 py-3 text-sm font-medium transition-colors',
                locale === lang.code
                  ? 'bg-amber-50 text-amber-900'
                  : 'text-stone-600 hover:bg-stone-50'
              )}
            >
              <span>{lang.label}</span>
              {locale === lang.code && (
                <Check size={16} className="text-amber-800" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
