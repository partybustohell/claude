import { useState } from 'react';
import { Rise, Field, Button, Banner } from '../../components/ui';
import { ArrowRight } from '../../components/icons';
import { useNav } from '../../nav';
import { useAuth } from '../../data/auth';
import { emailError, nameError, passwordError } from '../../lib/validate';
import { AuthScreen, AuthForm, AuthSwitch, PasswordField, PasswordGauge } from './parts';

export function SignUp() {
  const { back, push, reset } = useNav();
  const { signUp, pending } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  /**
   * Nothing is marked wrong until the first submit — a field that turns
   * red while you are still typing your own email is scolding, not
   * helping. After that the errors track every keystroke, so a fix is
   * confirmed the moment it lands.
   */
  const [checked, setChecked] = useState(false);
  /** What the account store said, which local rules cannot know. */
  const [taken, setTaken] = useState<string | null>(null);

  const local = {
    name: nameError(name),
    email: emailError(email),
    password: passwordError(password),
  };
  const shown = {
    name: checked ? local.name : null,
    email: taken ?? (checked ? local.email : null),
    password: checked ? local.password : null,
  };

  const submit = async () => {
    setChecked(true);
    if (local.name || local.email || local.password || pending) return;
    const res = await signUp({ name, email, password });
    if (res.ok) reset({ name: 'home' });
    else if (res.field === 'email') setTaken(res.message);
  };

  return (
    <AuthScreen
      eyebrow="Oikonos"
      title="Create your account"
      sub="One account, one device, one ledger. It takes about twenty seconds."
      onBack={back}
    >
      <AuthForm onSubmit={submit}>
        {taken && (
          <Rise className="auth__banner">
            <Banner>{taken}</Banner>
          </Rise>
        )}

        <Rise>
          <Field
            id="su-name"
            label="Your name"
            value={name}
            onChange={setName}
            placeholder="Arjun"
            autoComplete="name"
            maxLength={40}
            error={shown.name}
            hint="Used for the greeting on your home screen."
          />
        </Rise>

        <Rise>
          <Field
            id="su-email"
            label="Email"
            type="email"
            inputMode="email"
            value={email}
            onChange={(v) => { setEmail(v); setTaken(null); }}
            placeholder="you@example.com"
            autoComplete="email"
            error={shown.email}
          />
        </Rise>

        <Rise>
          <PasswordField
            id="su-password"
            label="Password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            error={shown.password}
          />
        </Rise>

        <Rise>
          <PasswordGauge value={password} />
        </Rise>

        <Rise className="auth__commit">
          <Button
            type="submit"
            full
            disabled={pending}
            trailing={<ArrowRight size={20} />}
          >
            {pending ? 'Creating…' : 'Create account'}
          </Button>
        </Rise>

        <Rise>
          <p className="auth__legal">
            Your ledger and your password stay on this device. Oikonos has
            nothing to upload them to.
          </p>
        </Rise>

        <Rise>
          <AuthSwitch
            question="Already have an account?"
            action="Sign in"
            onClick={() => push({ name: 'signin' })}
          />
        </Rise>
      </AuthForm>
    </AuthScreen>
  );
}
