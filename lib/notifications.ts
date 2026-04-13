/**
 * Local notification scheduling using the Notification API + setTimeout.
 * No server-side push — runs entirely in the browser while the SW is alive.
 */

const REMINDER_TAG = 'daily-reminder';

/** Check if the browser supports notifications */
export function supportsNotifications(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/** Current permission state */
export function getPermissionState(): NotificationPermission | 'unsupported' {
  if (!supportsNotifications()) return 'unsupported';
  return Notification.permission;
}

/** Request notification permission. Returns the resulting state. */
export async function requestPermission(): Promise<NotificationPermission> {
  if (!supportsNotifications()) return 'denied';
  return Notification.requestPermission();
}

/**
 * Schedule a daily reminder notification via the service worker.
 * Stores the schedule in localStorage so it can be restored on page load.
 */
export function scheduleDailyReminder(time: string, title: string, body: string): void {
  // Save schedule to localStorage for persistence
  localStorage.setItem(
    'dailyReminder',
    JSON.stringify({ time, title, body, enabled: true })
  );

  // Register with service worker
  scheduleNextNotification(time, title, body);
}

/** Cancel any scheduled reminder */
export function cancelDailyReminder(): void {
  localStorage.removeItem('dailyReminder');

  // Clear any pending timeout
  const timeoutId = Number(localStorage.getItem('dailyReminderTimeoutId'));
  if (timeoutId) {
    clearTimeout(timeoutId);
    localStorage.removeItem('dailyReminderTimeoutId');
  }
}

/** Restore the scheduled reminder from localStorage (call on app load) */
export function restoreDailyReminder(): void {
  const stored = localStorage.getItem('dailyReminder');
  if (!stored) return;

  try {
    const { time, title, body, enabled } = JSON.parse(stored);
    if (enabled && Notification.permission === 'granted') {
      scheduleNextNotification(time, title, body);
    }
  } catch {
    // Corrupted data, clean up
    localStorage.removeItem('dailyReminder');
  }
}

/** Calculate ms until next occurrence of HH:mm */
function msUntilTime(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  const now = new Date();
  const target = new Date();
  target.setHours(hours, minutes, 0, 0);

  // If time already passed today, schedule for tomorrow
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }

  return target.getTime() - now.getTime();
}

/** Set a timeout for the next notification, then reschedule for tomorrow */
function scheduleNextNotification(time: string, title: string, body: string): void {
  // Clear any existing timeout
  const existingId = Number(localStorage.getItem('dailyReminderTimeoutId'));
  if (existingId) clearTimeout(existingId);

  const delay = msUntilTime(time);

  const timeoutId = window.setTimeout(async () => {
    // Show notification via service worker if available, else direct
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(title, {
        body,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        tag: REMINDER_TAG,
      } as NotificationOptions);
    } else if (Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/icons/icon-192.png', tag: REMINDER_TAG });
    }

    // Reschedule for tomorrow
    scheduleNextNotification(time, title, body);
  }, delay);

  localStorage.setItem('dailyReminderTimeoutId', String(timeoutId));
}
