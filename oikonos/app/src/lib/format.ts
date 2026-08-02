/**
 * Indian numbering system formatting (lakh / crore grouping),
 * plus the small set of date helpers the app needs.
 *
 * ₹8,74,350 — not ₹874,350. The grouping is 3 digits, then 2s.
 */

const RUPEE = '₹';

export function groupINR(n: number): string {
  const neg = n < 0;
  const abs = Math.abs(Math.round(n));
  const s = String(abs);
  let out: string;
  if (s.length <= 3) {
    out = s;
  } else {
    const last3 = s.slice(-3);
    const rest = s.slice(0, -3);
    out = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3;
  }
  return (neg ? '-' : '') + out;
}

/** ₹8,74,350 */
export function inr(n: number): string {
  const neg = n < 0;
  return (neg ? '−' : '') + RUPEE + groupINR(Math.abs(n));
}

/** −₹2,850 with a true minus sign, for expense rows */
export function signedINR(n: number): string {
  if (n < 0) return '−' + RUPEE + groupINR(Math.abs(n));
  return RUPEE + groupINR(n);
}

/** ₹8.7L / ₹1.2Cr — for axis labels and dense chips */
export function compactINR(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? '−' : '';
  if (abs >= 1e7) return `${sign}${RUPEE}${trim(abs / 1e7)}Cr`;
  if (abs >= 1e5) return `${sign}${RUPEE}${trim(abs / 1e5)}L`;
  if (abs >= 1e3) return `${sign}${RUPEE}${trim(abs / 1e3)}K`;
  return `${sign}${RUPEE}${Math.round(abs)}`;
}

function trim(v: number): string {
  return v >= 10 ? String(Math.round(v)) : v.toFixed(1).replace(/\.0$/, '');
}

/**
 * Progress percentage.
 *
 * Always floors. 62.5% of a goal must not read as 63% on the list and 62%
 * on the detail screen — and a goal that is one rupee short of its target
 * must never round up to 100.
 */
export function pctOf(part: number, whole: number): number {
  if (whole <= 0) return 0;
  const raw = (part / whole) * 100;
  return raw >= 100 ? 100 : Math.floor(raw);
}

/** Sep 2024 */
export function monthYearShort(iso: string): string {
  const d = new Date(iso);
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

export function pct(n: number, digits = 1): string {
  return `${n >= 0 ? '' : '−'}${Math.abs(n).toFixed(digits)}%`;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const MONTHS_SHORT = MONTHS.map((m) => m.slice(0, 3));
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** May 18, 2024 */
export function longDate(iso: string): string {
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

/** May 18, 2024 • 1:42 PM */
export function longDateTime(iso: string): string {
  return `${longDate(iso)} • ${time(iso)}`;
}

/** 1:42 PM */
export function time(iso: string): string {
  const d = new Date(iso);
  const h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

/** Today / Yesterday / Monday / May 18 — for activity section headers */
export function relativeDay(iso: string, now: Date): string {
  const d = new Date(iso);
  const a = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const b = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.round((b.getTime() - a.getTime()) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days > 1 && days < 7) return DAYS[d.getDay()];
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}`;
}

export function shortDate(iso: string): string {
  const d = new Date(iso);
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}`;
}

export function monthLabel(iso: string): string {
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** "Good morning" / "Good afternoon" / "Good evening" */
export function greeting(now: Date): string {
  const h = now.getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
