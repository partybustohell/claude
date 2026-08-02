import { useState } from 'react';
import { Rise, Field, Button, Banner } from '../../components/ui';
import { ArrowRight } from '../../components/icons';
import { useNav } from '../../nav';
import { useAuth } from '../../data/auth';
import { emailError } from '../../lib/validate';
import { AuthScreen, AuthForm, AuthSwitch, PasswordField } from './parts';

export function SignIn() {
  const { back, push, reset } = useNav();
  const { signIn, pending, demo } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [checked, setChecked] = useState(false);
  /** Whichever field the account store rejected, and why. */
  const [rejected, setRejected] = useState<{ field: string; message: string } | null>(null);

  const local = {
    email: emailError(email),
    /* Sign-in does not police the shape of an existing password — the
       rules may have changed since it was set. Only emptiness is ours. */
    password: password ? null : 'Enter your password.',
  };
  const shown = {
    email: (rejected?.field === 'email' ? rejected.message : null) ?? (checked ? local.email : null),
    password: (rejected?.field === 'password' ? rejected.message : null)
      ?? (checked ? local.password : null),
  };

  const submit = async () => {
    setChecked(true);
    if (local.email || local.password || pending) return;
    const res = await signIn({ email, password });
    if (res.ok) reset({ name: 'home' });
    else setRejected({ field: res.field, message: res.message });
  };

  const useDemo = () => {
    setEmail(demo.email);
    setPassword(demo.password);
    setRejected(null);
  };

  return (
    <AuthScreen
      eyebrow="Oikonos"
      title="Welcome back"
      sub="Sign in and your ledger picks up where it left off."
      onBack={back}
    >
      <AuthForm onSubmit={submit}>
        {rejected?.field === 'form' && (
          <Rise className="auth__banner"><Banner>{rejected.message}</Banner></Rise>
        )}

        <Rise>
          <Field
            id="si-email"
            label="Email"
            type="email"
            inputMode="email"
            value={email}
            onChange={(v) => { setEmail(v); setRejected(null); }}
            placeholder="you@example.com"
            autoComplete="email"
            error={shown.email}
          />
        </Rise>

        <Rise>
          <PasswordField
            id="si-password"
            label="Password"
            value={password}
            onChange={(v) => { setPassword(v); setRejected(null); }}
            autoComplete="current-password"
            placeholder="Your password"
            error={shown.password}
          />
        </Rise>

        <Rise className="auth__aside">
          <button
            type="button"
            className="auth__link"
            onClick={() => push({ name: 'forgot' })}
          >
            Forgot your password?
          </button>
        </Rise>

        <Rise className="auth__commit">
          <Button
            type="submit"
            full
            disabled={pending}
            trailing={<ArrowRight size={20} />}
          >
            {pending ? 'Signing in…' : 'Sign in'}
          </Button>
        </Rise>

        <Rise>
          {/* This build has no back end and no way to make you an
              account you already trust, so it ships with one. */}
          <button type="button" className="auth__demo" onClick={useDemo}>
            <span className="auth__demolabel">Just looking?</span>
            <span className="auth__demoaction">
              Use the demo
              <ArrowRight size={15} />
            </span>
          </button>
        </Rise>

        <Rise>
          <AuthSwitch
            question="New to Oikonos?"
            action="Create an account"
            onClick={() => push({ name: 'signup' })}
          />
        </Rise>
      </AuthForm>
    </AuthScreen>
  );
}
