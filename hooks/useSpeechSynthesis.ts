'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseSpeechOptions {
  locale: string;
  enabled: boolean;
}

export function useSpeechSynthesis({ locale, enabled }: UseSpeechOptions) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const isSupported =
    typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Pick the best voice for the locale
  useEffect(() => {
    if (!isSupported) return;

    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const lang = locale === 'ro' ? 'ro' : 'en';
      // Prefer exact locale match, then prefix match
      voiceRef.current =
        voices.find((v) => v.lang.startsWith(lang + '-')) ||
        voices.find((v) => v.lang.startsWith(lang)) ||
        null;
    };

    pickVoice();
    window.speechSynthesis.addEventListener('voiceschanged', pickVoice);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', pickVoice);
    };
  }, [isSupported, locale]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  const speak = useCallback(
    (text: string, interrupt = true) => {
      if (!isSupported || !enabled || !text) return;
      if (interrupt) window.speechSynthesis.cancel();

      const utt = new SpeechSynthesisUtterance(text);
      if (voiceRef.current) utt.voice = voiceRef.current;
      utt.lang = locale === 'ro' ? 'ro-RO' : 'en-US';
      utt.rate = 0.75;
      utt.pitch = 1;

      utt.onstart = () => setIsSpeaking(true);
      utt.onend = () => setIsSpeaking(false);
      utt.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utt);
    },
    [isSupported, enabled, locale],
  );

  const playBeep = useCallback(() => {
    if (!enabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 660;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // AudioContext not available
    }
  }, [enabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isSupported) window.speechSynthesis.cancel();
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, [isSupported]);

  return { speak, stop, isSpeaking, isSupported, playBeep };
}
