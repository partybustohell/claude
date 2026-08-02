/**
 * Accounts and sessions.
 *
 * Oikonos keeps the ledger on the device, so it keeps the account there
 * too: sign-up writes a record to localStorage, sign-in checks a hash
 * against it, and the session is a pointer to that record. There is no
 * server in this build and the UI never pretends there is one — the
 * password-reset screen shows you your own code rather than claiming to
 * have posted it.
 *
 * The hash is a salted SHA-256. That is the right shape (a password is
 * never stored, and two people with the same password get different
 * digests) but it is deliberately not a slow KDF: a device-local store
 * gains nothing from one, and a real service would be verifying
 * server-side with Argon2 or scrypt instead. Nothing here should be
 * lifted into a product that has a back end.
 */
import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
  type ReactNode,
} from 'react';
import { useDispatch } from './store';
import { SEED } from './seed';
import { handleFromEmail, normalizeEmail } from '../lib/validate';

export interface AuthAccount {
  id: string;
  name: string;
  /** always lowercased — it is the lookup key */
  email: string;
  handle: string;
  salt: string;
  hash: string;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  handle: string;
  createdAt: string;
}

/** Which field to paint red, so a screen never has to guess. */
export type AuthField = 'name' | 'email' | 'password' | 'code' | 'form';

export type AuthResult =
  | { ok: true }
  | { ok: false; field: AuthField; message: string };

interface Auth {
  user: AuthUser | null;
  /** true while a submit is in flight — buttons disable on it */
  pending: boolean;
  signUp: (input: { name: string; email: string; password: string }) => Promise<AuthResult>;
  signIn: (input: { email: string; password: string }) => Promise<AuthResult>;
  signOut: () => void;
  /** Issues a reset code for an existing account and returns it. */
  requestReset: (email: string) => Promise<AuthResult & { code?: string }>;
  /** Consumes the code, rewrites the password, and signs the user in. */
  confirmReset: (input: { email: string; code: string; password: string }) => Promise<AuthResult>;
  /** The seeded account, so the sign-in screen can offer a way in. */
  demo: { email: string; password: string };
}

/* ---------------------------------------------------------------- */
/* The demo account                                                   */
/* ---------------------------------------------------------------- */

/**
 * The seeded ledger belongs to Arjun, so the seeded account does too —
 * signing in as anyone else shows Arjun's transactions under a new name.
 * A prototype with no back end has to hand out a way in somewhere; it is
 * here and on the sign-in screen, and nowhere else.
 */
export const DEMO = {
  name: SEED.user.name,
  email: 'arjun@oikonos.app',
  password: 'aegean2024',
} as const;

/* ---------------------------------------------------------------- */
/* Storage                                                            */
/* ---------------------------------------------------------------- */

const ACCOUNTS_KEY = 'oikonos.accounts.v1';
const SESSION_KEY = 'oikonos.session.v1';

/** Private browsing and `file://` can both make localStorage throw. */
function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* memory-only session; the app still works for this page life */
  }
}

/* ---------------------------------------------------------------- */
/* Hashing                                                            */
/* ---------------------------------------------------------------- */

function randomHex(bytes: number): string {
  const buf = new Uint8Array(bytes);
  if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(buf);
  else for (let i = 0; i < bytes; i++) buf[i] = Math.floor(Math.random() * 256);
  return [...buf].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * FNV-1a, run over four offset passes to fill 32 hex characters. Only
 * reached when `crypto.subtle` is missing — that is the single-file
 * bundle opened straight off disk, where the page is not a secure
 * context. It keeps the flow usable there; it is not a security claim.
 */
function weakHash(text: string): string {
  let out = '';
  for (let pass = 0; pass < 4; pass++) {
    let h = 0x811c9dc5 ^ (pass * 0x9e3779b9);
    for (let i = 0; i < text.length; i++) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    out += h.toString(16).padStart(8, '0');
  }
  return out;
}

async function hashPassword(password: string, salt: string): Promise<string> {
  const text = `oikonos:${salt}:${password}`;
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) return weakHash(text);
  const digest = await subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Length-independent comparison, so a mismatch costs the same either way. */
function sameDigest(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function sixDigitCode(): string {
  const buf = new Uint32Array(1);
  if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(buf);
  else buf[0] = Math.floor(Math.random() * 0xffffffff);
  return String(buf[0] % 1_000_000).padStart(6, '0');
}

/* ---------------------------------------------------------------- */
/* Provider                                                           */
/* ---------------------------------------------------------------- */

const AuthCtx = createContext<Auth>(null as unknown as Auth);

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useDispatch();
  const [accounts, setAccounts] = useState<AuthAccount[]>(() =>
    readJSON<AuthAccount[]>(ACCOUNTS_KEY, []));
  const [userId, setUserId] = useState<string | null>(() =>
    readJSON<{ userId: string } | null>(SESSION_KEY, null)?.userId ?? null);
  const [pending, setPending] = useState(false);

  /**
   * Reset codes live in memory only. They should not outlive the tab that
   * asked for one, and writing them next to the hashes would hand anyone
   * with the disk a second key to the same door.
   */
  const codes = useRef(new Map<string, string>());

  useEffect(() => { writeJSON(ACCOUNTS_KEY, accounts); }, [accounts]);
  useEffect(() => {
    writeJSON(SESSION_KEY, userId ? { userId, at: new Date().toISOString() } : null);
  }, [userId]);

  /* Seed the demo account once, so there is always something to sign in
     to. Hashing is async, hence the effect rather than a lazy initial. */
  useEffect(() => {
    let live = true;
    if (accounts.some((a) => a.email === DEMO.email)) return;
    (async () => {
      const salt = randomHex(16);
      const hash = await hashPassword(DEMO.password, salt);
      if (!live) return;
      setAccounts((prev) => (prev.some((a) => a.email === DEMO.email) ? prev : [
        ...prev,
        {
          id: 'u-demo',
          name: DEMO.name,
          email: DEMO.email,
          handle: handleFromEmail(DEMO.email),
          salt,
          hash,
          createdAt: '2021-08-14T09:00:00.000Z',
        },
      ]));
    })();
    return () => { live = false; };
  }, [accounts]);

  const user = useMemo<AuthUser | null>(() => {
    const a = accounts.find((x) => x.id === userId);
    if (!a) return null;
    const { id, name, email, handle, createdAt } = a;
    return { id, name, email, handle, createdAt };
  }, [accounts, userId]);

  /* The ledger greets whoever is signed in; signing out puts the seed
     name back so no trace of the last person is left on the stack. */
  useEffect(() => {
    dispatch({
      type: 'user/set',
      user: user ? { name: user.name, handle: user.handle } : SEED.user,
    });
  }, [user, dispatch]);

  const find = useCallback(
    (email: string) => accounts.find((a) => a.email === normalizeEmail(email)),
    [accounts],
  );

  const signUp = useCallback<Auth['signUp']>(async ({ name, email, password }) => {
    setPending(true);
    try {
      const addr = normalizeEmail(email);
      if (accounts.some((a) => a.email === addr)) {
        return {
          ok: false, field: 'email',
          message: 'That email already has an account. Sign in instead.',
        };
      }
      const salt = randomHex(16);
      const hash = await hashPassword(password, salt);
      const account: AuthAccount = {
        id: `u${randomHex(6)}`,
        name: name.trim(),
        email: addr,
        handle: handleFromEmail(addr),
        salt,
        hash,
        createdAt: new Date().toISOString(),
      };
      setAccounts((prev) => [...prev, account]);
      setUserId(account.id);
      return { ok: true };
    } finally {
      setPending(false);
    }
  }, [accounts]);

  const signIn = useCallback<Auth['signIn']>(async ({ email, password }) => {
    setPending(true);
    try {
      const account = find(email);
      if (!account) {
        return {
          ok: false, field: 'email',
          message: 'No account here uses that email.',
        };
      }
      const hash = await hashPassword(password, account.salt);
      if (!sameDigest(hash, account.hash)) {
        return { ok: false, field: 'password', message: 'That password does not match.' };
      }
      setUserId(account.id);
      return { ok: true };
    } finally {
      setPending(false);
    }
  }, [find]);

  const signOut = useCallback(() => {
    codes.current.clear();
    setUserId(null);
  }, []);

  const requestReset = useCallback<Auth['requestReset']>(async (email) => {
    const account = find(email);
    if (!account) {
      return { ok: false, field: 'email', message: 'No account here uses that email.' };
    }
    const code = sixDigitCode();
    codes.current.set(account.email, code);
    return { ok: true, code };
  }, [find]);

  const confirmReset = useCallback<Auth['confirmReset']>(async ({ email, code, password }) => {
    setPending(true);
    try {
      const account = find(email);
      if (!account) {
        return { ok: false, field: 'email', message: 'No account here uses that email.' };
      }
      const expected = codes.current.get(account.email);
      if (!expected) {
        return {
          ok: false, field: 'code',
          message: 'That code has expired. Ask for a new one.',
        };
      }
      if (code.trim() !== expected) {
        return { ok: false, field: 'code', message: 'That code is not right.' };
      }
      const salt = randomHex(16);
      const hash = await hashPassword(password, salt);
      setAccounts((prev) => prev.map((a) => (a.id === account.id ? { ...a, salt, hash } : a)));
      codes.current.delete(account.email);
      setUserId(account.id);
      return { ok: true };
    } finally {
      setPending(false);
    }
  }, [find]);

  const value = useMemo<Auth>(() => ({
    user, pending, signUp, signIn, signOut, requestReset, confirmReset,
    demo: { email: DEMO.email, password: DEMO.password },
  }), [user, pending, signUp, signIn, signOut, requestReset, confirmReset]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
