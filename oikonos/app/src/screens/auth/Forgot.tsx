import { useState } from 'react';
import { Rise, Field, Button } from '../../components/ui';
import { ArrowRight } from '../../components/icons';
import { useNav } from '../../nav';
import { useAuth } from '../../data/auth';
import { emailError } from '../../lib/validate';
import { AuthScreen, AuthForm, AuthSwitch } from './parts';

export function Forgot() {
  const { back, push } = useNav();
  const { requestReset, pending } = useAuth();

  const [email, setEmail] = useState('');
  const [checked, setChecked] = useState(false);
  const [unknown, setUnknown] = useState<string | null>(null);

  const local = emailError(email);
  const shown = unknown ?? (checked ? local : null);

  const submit = async () => {
    setChecked(true);
    if (local || pending) return;
    const res = await requestReset(email);
    if (res.ok) push({ name: 'reset', email, code: res.code });
    else setUnknown(res.message);
  };

  return (
    <AuthScreen
      eyebrow="Account"
      title="Reset your password"
      sub="Give us the email on the account and we will issue a six-digit code."
      onBack={back}
    >
      <AuthForm onSubmit={submit}>
        <Rise>
          <Field
            id="fp-email"
            label="Email"
            type="email"
            inputMode="email"
            value={email}
            onChange={(v) => { setEmail(v); setUnknown(null); }}
            placeholder="you@example.com"
            autoComplete="email"
            error={shown}
          />
        </Rise>

        <Rise className="auth__commit">
          <Button type="submit" full disabled={pending} trailing={<ArrowRight size={20} />}>
            Send a code
          </Button>
        </Rise>

        <Rise>
          <p className="auth__legal">
            {/* Say what actually happens. An app with no mail server that
                claims to have sent mail is lying to its user. */}
            There is no mail server in this build, so the code is shown to
            you on the next screen rather than posted to your inbox.
          </p>
        </Rise>

        <Rise>
          <AuthSwitch
            question="Remembered it?"
            action="Back to sign in"
            onClick={() => push({ name: 'signin' })}
          />
        </Rise>
      </AuthForm>
    </AuthScreen>
  );
}
