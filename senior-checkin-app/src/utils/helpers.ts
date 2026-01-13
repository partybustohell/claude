import { Language } from '../types';
import { getTranslation } from '../i18n/translations';

export function formatRelativeTime(date: Date, lang: Language): string {
  const t = getTranslation(lang);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return t.justNow;
  if (diffMins < 60) return `${diffMins} ${t.minutesAgo}`;
  if (diffHours < 24) return `${diffHours} ${t.hoursAgo}`;
  if (diffDays === 1) return t.yesterday;
  return `${diffDays} ${t.daysAgo}`;
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function isWithinCheckInWindow(
  windowStart: string,
  windowEnd: string
): boolean {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [startHour, startMin] = windowStart.split(':').map(Number);
  const [endHour, endMin] = windowEnd.split(':').map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
}

export function isTodayCheckedIn(lastCheckIn?: Date): boolean {
  if (!lastCheckIn) return false;
  const today = new Date();
  return (
    lastCheckIn.getDate() === today.getDate() &&
    lastCheckIn.getMonth() === today.getMonth() &&
    lastCheckIn.getFullYear() === today.getFullYear()
  );
}

export function getBatteryColor(level: number): string {
  if (level > 50) return 'text-safe-green-600';
  if (level > 20) return 'text-alert-amber-600';
  return 'text-danger-red-600';
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// Simulated voice feedback (would use Web Speech API in production)
export function speakText(text: string, lang: Language): void {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);

    // Map language codes to BCP 47 tags
    const langMap: Record<Language, string> = {
      hi: 'hi-IN',
      gu: 'gu-IN',
      mr: 'mr-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      bn: 'bn-IN',
      en: 'en-IN',
    };

    utterance.lang = langMap[lang];
    utterance.rate = 0.8; // Slower for seniors
    utterance.pitch = 1;
    utterance.volume = 1;

    window.speechSynthesis.speak(utterance);
  }
}

// Vibration feedback for tactile confirmation
export function vibrate(pattern: number | number[]): void {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
}
