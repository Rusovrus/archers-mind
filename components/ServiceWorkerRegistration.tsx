'use client';

import { useEffect } from 'react';
import { restoreDailyReminder, supportsNotifications } from '@/lib/notifications';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => {
          // Restore daily reminder schedule after SW is ready
          if (supportsNotifications() && Notification.permission === 'granted') {
            restoreDailyReminder();
          }
        })
        .catch(() => {
          // SW registration failed — ignore silently
        });
    }
  }, []);

  return null;
}
