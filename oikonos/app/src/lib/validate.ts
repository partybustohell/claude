/**
 * Form validation for the account screens.
 *
 * Every rule returns a sentence the user can act on — "Passwords need at
 * least 8 characters", never "invalid". Messages are the copy, so the
 * screens stay free of prose and two screens cannot drift apart on what
 * counts as a valid email.
 */

/**
 * Deliberately loose: something@something.tld. Anything stricter starts
 * rejecting real addresses, and the only authority on whether an address
 * exists is a message actually arriving at it.
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

export const MIN_PASSWORD = 8;

export function nameError(v: string): string | null {
  const t = v.trim();
  if (!t) return 'Tell us what to call you.';
  if (t.length < 2) return 'That looks a little short for a name.';
  if (t.length > 40) return 'Names cap out at 40 characters.';
  return null;
}

export function emailError(v: string): string | null {
  const t = v.trim();
  if (!t) return 'An email address is needed to sign in.';
  if (!EMAIL_RE.test(t)) return 'That does not look like an email address.';
  return null;
}

export function passwordError(v: string): string | null {
  if (!v) return 'Pick a password.';
  if (v.length < MIN_PASSWORD) return `Passwords need at least ${MIN_PASSWORD} characters.`;
  if (!/[a-z]/i.test(v)) return 'Add at least one letter.';
  if (!/[0-9]/.test(v)) return 'Add at least one number.';
  return null;
}

/** The three things a new password must satisfy, for the live checklist. */
export function passwordRules(v: string): { label: string; met: boolean }[] {
  return [
    { label: `${MIN_PASSWORD} characters or more`, met: v.length >= MIN_PASSWORD },
    { label: 'A letter', met: /[a-z]/i.test(v) },
    { label: 'A number', met: /[0-9]/.test(v) },
  ];
}

export interface Strength {
  /** 0–1, for the meter */
  score: number;
  label: string;
  /** which of the three inks the meter is printed in */
  ink: 'vermilion' | 'ink' | 'olive';
}

/**
 * A rough, honest score: length carries most of it, variety the rest.
 * It is guidance, not a gate — `passwordError` is what actually blocks.
 */
export function passwordStrength(v: string): Strength {
  if (!v) return { score: 0, label: 'Empty', ink: 'vermilion' };

  let points = 0;
  if (v.length >= MIN_PASSWORD) points += 2;
  if (v.length >= 12) points += 1;
  if (v.length >= 16) points += 1;
  if (/[a-z]/.test(v) && /[A-Z]/.test(v)) points += 1;
  if (/[0-9]/.test(v)) points += 1;
  if (/[^a-z0-9]/i.test(v)) points += 1;

  const score = Math.min(1, points / 7);
  if (v.length < MIN_PASSWORD) return { score: Math.min(score, 0.25), label: 'Too short', ink: 'vermilion' };
  if (points <= 3) return { score, label: 'Workable', ink: 'vermilion' };
  if (points <= 5) return { score, label: 'Good', ink: 'ink' };
  return { score, label: 'Strong', ink: 'olive' };
}

/** `arjun@oikonos.app` → `@arjun`, the handle shown on the profile. */
export function handleFromEmail(email: string): string {
  const local = email.trim().toLowerCase().split('@')[0] ?? 'you';
  const slug = local.replace(/[^a-z0-9._-]/g, '').slice(0, 20);
  return `@${slug || 'you'}`;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
