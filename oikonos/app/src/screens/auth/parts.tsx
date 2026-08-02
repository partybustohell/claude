/**
 * The furniture every account screen shares.
 *
 * Four screens ask for a handful of fields and commit them, so the
 * chrome — head, form, footer switch, the password eye — is stated once
 * here. Screens keep only their own rules.
 */
import { useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  Screen, TopBar, PageHead, Stack, Rise, Field, Meter, Eyebrow,
} from '../../components/ui';
import { IcEye, IcEyeOff, Check } from '../../components/icons';
import { snap } from '../../lib/motion';
import { passwordRules, passwordStrength } from '../../lib/validate';
import './auth.css';

export function AuthScreen({
  eyebrow, title, sub, onBack, children,
}: {
  eyebrow: string;
  title: string;
  sub?: ReactNode;
  onBack: () => void;
  children: ReactNode;
}) {
  return (
    <Screen className="auth">
      {/* no overflow menu on a sign-in screen — the slot stays empty
          so the head keeps its optical centre */}
      <TopBar onBack={onBack} right={<span className="topbar__btn" />} />
      <div className="pane pane--pad scroll-y auth__scroll">
        <Stack gap={0}>
          <Rise><PageHead eyebrow={eyebrow} title={title} sub={sub} /></Rise>
          {children}
        </Stack>
      </div>
    </Screen>
  );
}

/**
 * A real form, so Enter commits and a password manager recognises the
 * pair. It is a `motion.form` because the entrance stagger is inherited
 * through the tree — a plain element here would strand the children.
 */
export function AuthForm({
  onSubmit, children,
}: { onSubmit: () => void; children: ReactNode }) {
  return (
    <motion.form
      className="auth__form"
      noValidate
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.055 } } }}
      onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
    >
      {children}
    </motion.form>
  );
}

export function PasswordField({
  id, label, value, onChange, error, hint, autoComplete, placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string | null;
  hint?: ReactNode;
  autoComplete: string;
  placeholder?: string;
}) {
  const [shown, setShown] = useState(false);
  return (
    <Field
      id={id}
      label={label}
      value={value}
      onChange={onChange}
      type={shown ? 'text' : 'password'}
      autoComplete={autoComplete}
      placeholder={placeholder}
      error={error}
      hint={hint}
      trailing={
        <motion.button
          type="button"
          className="auth__eye"
          aria-label={shown ? 'Hide password' : 'Show password'}
          aria-pressed={shown}
          onClick={() => setShown((v) => !v)}
          whileTap={{ scale: 0.88 }}
          transition={snap}
        >
          {shown ? <IcEyeOff size={19} /> : <IcEye size={19} />}
        </motion.button>
      }
    />
  );
}

/** Live read-out on a new password: a meter, a word, and the three rules. */
export function PasswordGauge({ value }: { value: string }) {
  const s = passwordStrength(value);
  const rules = passwordRules(value);
  return (
    <div className="auth__gauge">
      <div className="auth__gaugehead">
        <Eyebrow>Strength</Eyebrow>
        {/* an empty field has not failed yet — it stays neutral until
            there is something to judge */}
        <span
          className="auth__gaugeword"
          style={{ color: value ? `var(--${s.ink})` : 'var(--fg-faint)' }}
        >
          {value ? s.label : '—'}
        </span>
      </div>
      <Meter value={s.score} ink={s.ink} height={6} />
      <ul className="auth__rules">
        {rules.map((r) => (
          <li key={r.label} className={`auth__rule ${r.met ? 'auth__rule--met' : ''}`}>
            <span className="auth__rulemark" aria-hidden>
              {r.met ? <Check size={12} /> : <span className="auth__ruledot" />}
            </span>
            {r.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** "Already have an account? Sign in" — the way out of every dead end. */
export function AuthSwitch({
  question, action, onClick,
}: { question: string; action: string; onClick: () => void }) {
  return (
    <p className="auth__switch">
      {question}{' '}
      <button type="button" className="auth__link" onClick={onClick}>{action}</button>
    </p>
  );
}
