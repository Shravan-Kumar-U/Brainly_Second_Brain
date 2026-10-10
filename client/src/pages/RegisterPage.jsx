import { Lock, Mail, User } from 'lucide-react';
import { Link } from 'react-router';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { useForm } from '@/hooks/useForm';
import { validateRegister } from '@/lib/validators';

// Reminders fire at the time YOU chose, in YOUR timezone, so we capture it at signup
const detectTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return undefined;
  }
};

export default function RegisterPage() {
  const { register } = useAuth();

  const { values, errors, formError, submitting, handleChange, handleSubmit } = useForm({
    initialValues: { name: '', email: '', password: '' },
    validate: validateRegister,
    onSubmit: ({ name, email, password }) =>
      register({ name: name.trim(), email: email.trim(), password, timezone: detectTimezone() }),
  });

  return (
    <>
      <h1 className="text-xl font-semibold tracking-tight">Create your account</h1>
      <p className="mt-1 text-sm text-fg-muted">Start building your second brain.</p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        <Alert>{formError}</Alert>

        <Input
          label="Name"
          name="name"
          icon={User}
          autoComplete="name"
          placeholder="Your name"
          value={values.name}
          onChange={handleChange}
          error={errors.name}
        />

        <Input
          label="Email"
          name="email"
          type="email"
          icon={Mail}
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          value={values.email}
          onChange={handleChange}
          error={errors.email}
        />

        <Input
          label="Password"
          name="password"
          type="password"
          icon={Lock}
          autoComplete="new-password"
          placeholder="At least 8 characters"
          hint="Use letters and at least one number."
          value={values.password}
          onChange={handleChange}
          error={errors.password}
        />

        <Button type="submit" fullWidth loading={submitting}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-fg-muted">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-brand-600 hover:underline dark:text-brand-400">
          Log in
        </Link>
      </p>
    </>
  );
}