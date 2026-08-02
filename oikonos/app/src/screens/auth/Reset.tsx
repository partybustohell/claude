import { useState } from 'react';
import { Rise, Field, Button, Banner } from '../../components/ui';
import { ArrowRight } from '../../components/icons';
import { useNav } from '../../nav';
import { useAuth } from '../../data/auth';
import { emailError, passwordError } from '../../lib/validate';
import { AuthScreen, AuthForm, AuthSwitch, PasswordField, PasswordGauge } from './parts';

export function Reset({ email: fromRoute, code: issued }: { email?: string; code?: string }) {
  const { back, push, reset } = useNav();
  const { confirmReset, requestReset, pending } = useAuth();

  const [email, setEmail] = useState(fromRoute ?? '');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [checked, setChecked] = useState(false);
  const [rejected, setRejected] = useState<{ field: string; message: string } | null>(null);
  /** The code this build issued, kept visible because nothing mailed it. */
  const [shownCode, setShownCode] = useState(issued ?? null);
  const [resent, setResent] = useState(false);

  const local = {
    email: emailError(email),
    code: /^[0-9]{6}$/.test(code.trim()) ? null : 'The code is six digits.',
    password: passwordError(password),
  };
  const err = (field: keyof typeof local) =>
    (rejected?.field === field ? rejected.message : null) ?? (checked ? local[field] : null);

  const submit = async () => {
    setChecked(true);
    if (local.email || local.code || local.password || pending) return;
    const res = await confirmReset({ email, code, password });
    if (res.ok) reset({ name: 'home' });
    else setRejected({ field: res.field, message: res.message });
  };

  const resend = async () => {
    const res = await requestReset(email);
    if (res.ok) {
      setShownCode(res.code ?? null);
      setRejected(null);
      setResent(true);
    } else {
      setRejected({ field: 'email', message: res.message });
    }
  };

  return (
    <AuthScreen
      eyebrow="Account"
      title="Enter your code"
      sub="Type the code, choose a new password, and you are back in."
      onBack={back}
    >
      <AuthForm onSubmit={submit}>
        {shownCode && (
          <Rise className="auth__banner">
            <Banner tone="ink">
              {resent ? 'New code: ' : 'Your code is '}
              <strong className="auth__codenum figure">{shownCode}</strong>
              {' — shown here because this build has no mail server.'}
            </Banner>
          </Rise>
        )}

        <Rise>
          <Field
            id="rs-email"
            label="Email"
            type="email"
            inputMode="email"
            value={email}
            onChange={(v) => { setEmail(v); setRejected(null); }}
            placeholder="you@example.com"
            autoComplete="email"
            error={err('email')}
          />
        </Rise>

        <Rise>
          <Field
            id="rs-code"
            label="Six-digit code"
            inputMode="numeric"
            value={code}
            onChange={(v) => { setCode(v.replace(/[^0-9]/g, '').slice(0, 6)); setRejected(null); }}
            placeholder="000000"
            autoComplete="one-time-code"
            maxLength={6}
            className="auth__codefield"
            error={err('code')}
          />
        </Rise>

        <Rise>
          <PasswordField
            id="rs-password"
            label="New password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            error={err('password')}
          />
        </Rise>

        <Rise>
          <PasswordGauge value={password} />
        </Rise>

        <Rise className="auth__commit">
          <Button type="submit" full disabled={pending} trailing={<ArrowRight size={20} />}>
            {pending ? 'Setting…' : 'Set new password'}
          </Button>
        </Rise>

        <Rise className="auth__aside">
          <button type="button" className="auth__link" onClick={resend}>
            Send another code
          </button>
        </Rise>

        <Rise>
          <AuthSwitch
            question="Wrong address?"
            action="Start over"
            onClick={() => push({ name: 'forgot' })}
          />
        </Rise>
      </AuthForm>
    </AuthScreen>
  );
}
