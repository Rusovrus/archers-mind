'use client';

import { useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { TrendingUp, ChevronRight, Camera, Trash2, Loader2, Settings, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { uploadProfilePhoto, deleteProfilePhoto } from '@/lib/profilePhoto';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const { firebaseUser, user, signOut } = useAuth();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('profile');
  const tp = useTranslations('progress');
  const tc = useTranslations('common');

  const fileRef = useRef<HTMLInputElement>(null);
  const [photoURL, setPhotoURL] = useState<string | null | undefined>(undefined);
  const [uploading, setUploading] = useState(false);

  // Use local state if set, otherwise fall back to user doc
  const displayPhoto = photoURL !== undefined ? photoURL : user?.photoURL;
  const initials = (user?.displayName || '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !firebaseUser) return;

    // Basic validation
    if (!file.type.startsWith('image/')) return;
    if (file.size > 10 * 1024 * 1024) return; // 10MB max

    setUploading(true);
    try {
      const url = await uploadProfilePhoto(firebaseUser.uid, file);
      setPhotoURL(url);
      toast.success(t('photoUploaded'));
    } catch {
      toast.error(tc('error'));
    } finally {
      setUploading(false);
      // Reset input so same file can be re-selected
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function handleRemovePhoto() {
    if (!firebaseUser || !confirm(t('removePhoto') + '?')) return;

    setUploading(true);
    try {
      await deleteProfilePhoto(firebaseUser.uid);
      setPhotoURL(null);
      toast.success(t('photoRemoved'));
    } catch {
      toast.error(tc('error'));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-stone-900">{t('title')}</h1>

      {/* Profile card with avatar */}
      <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="h-20 w-20 overflow-hidden rounded-full bg-amber-100">
              {displayPhoto ? (
                <Image
                  src={displayPhoto}
                  alt={user?.displayName || ''}
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-amber-800">
                  {initials}
                </div>
              )}
            </div>

            {/* Camera button overlay */}
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className={cn(
                'absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white shadow-sm transition-colors',
                uploading
                  ? 'bg-stone-200 text-stone-400'
                  : 'bg-amber-800 text-white hover:bg-amber-900'
              )}
            >
              {uploading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Camera size={14} />
              )}
            </button>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Name + email */}
          <div className="flex-1 min-w-0">
            <p className="text-lg font-semibold text-stone-900 truncate">
              {user?.displayName}
            </p>
            <p className="text-sm text-stone-500 truncate">{user?.email}</p>

            {/* Photo actions */}
            <div className="mt-2 flex items-center gap-3">
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="text-xs text-amber-800 hover:underline disabled:opacity-50"
              >
                {t('changePhoto')}
              </button>
              {displayPhoto && (
                <button
                  onClick={handleRemovePhoto}
                  disabled={uploading}
                  className="flex items-center gap-1 text-xs text-stone-400 hover:text-red-500 disabled:opacity-50"
                >
                  <Trash2 size={12} />
                  {t('removePhoto')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit profile + Settings links */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href={`/${locale}/profile/edit`}
          className="flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white p-3 text-sm font-medium text-amber-800 shadow-sm hover:bg-stone-50 transition-colors"
        >
          {t('editProfile')}
        </Link>
        <Link
          href={`/${locale}/profile/settings`}
          className="flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white p-3 text-sm font-medium text-amber-800 shadow-sm hover:bg-stone-50 transition-colors"
        >
          <Settings size={16} />
          {t('settings')}
        </Link>
      </div>

      {/* Stats */}
      <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-stone-400 mb-3">
          {t('stats')}
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-stone-500">{t('totalSessions')}</span>
            <span className="font-medium text-stone-900">{user?.stats?.totalSessions || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">{t('totalExercises')}</span>
            <span className="font-medium text-stone-900">{user?.stats?.totalExercisesCompleted || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">{t('totalMinutes')}</span>
            <span className="font-medium text-stone-900">{user?.stats?.totalMinutesMeditation || 0}</span>
          </div>
        </div>
      </div>

      {/* Progress + Achievements links */}
      <div className="space-y-3">
        <Link
          href={`/${locale}/progress`}
          className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-4 shadow-sm hover:bg-stone-50 transition-colors"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
            <TrendingUp size={20} className="text-amber-800" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-stone-900">{tp('viewProgress')}</p>
            <p className="text-xs text-stone-400">{tp('subtitle')}</p>
          </div>
          <ChevronRight size={18} className="text-stone-300" />
        </Link>

        <Link
          href={`/${locale}/profile/achievements`}
          className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-4 shadow-sm hover:bg-stone-50 transition-colors"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
            <Trophy size={20} className="text-amber-800" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-stone-900">{t('achievements')}</p>
            <p className="text-xs text-stone-400">{t('achievementsDesc')}</p>
          </div>
          <ChevronRight size={18} className="text-stone-300" />
        </Link>
      </div>

      <Button variant="ghost" onClick={signOut} className="text-red-600 hover:bg-red-50">
        {t('logout')}
      </Button>
    </div>
  );
}
