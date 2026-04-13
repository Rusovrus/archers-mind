'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface AudioPlayerProps {
  src: string;
  onEnded?: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function AudioPlayer({ src, onEnded }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const t = useTranslations('exercises.player');

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play();
    }
  }, [playing]);

  const skip = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(audio.currentTime + seconds, audio.duration || 0));
  }, []);

  const seek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * duration;
  }, [duration]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEndedHandler = () => {
      setPlaying(false);
      onEnded?.();
    };

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEndedHandler);

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEndedHandler);
    };
  }, [onEnded]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm space-y-3">
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Progress bar */}
      <div
        className="relative h-2 cursor-pointer rounded-full bg-stone-200"
        onClick={seek}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-amber-800 transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Time + controls */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-stone-400 tabular-nums w-10">
          {formatTime(currentTime)}
        </span>

        <div className="flex items-center gap-3">
          <button
            onClick={() => skip(-15)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-stone-500 hover:bg-stone-100 transition-colors"
            aria-label={t('skip15b')}
          >
            <SkipBack size={18} />
          </button>

          <button
            onClick={toggle}
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-full shadow transition-colors',
              'bg-amber-800 text-white hover:bg-amber-900'
            )}
            aria-label={playing ? t('pause') : t('play')}
          >
            {playing ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
          </button>

          <button
            onClick={() => skip(15)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-stone-500 hover:bg-stone-100 transition-colors"
            aria-label={t('skip15f')}
          >
            <SkipForward size={18} />
          </button>
        </div>

        <span className="text-xs text-stone-400 tabular-nums w-10 text-right">
          {formatTime(duration)}
        </span>
      </div>
    </div>
  );
}
