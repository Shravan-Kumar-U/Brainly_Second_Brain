import { Lock, Mail } from 'lucide-react';
import { Link } from 'react-router';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { useForm } from '@/hooks/useForm';
import { validateLogin } from '@/lib/validators';

export default function LoginPage() {
  const { login } = useAuth();

  const { values, errors, formError, submitting, handleChange, handleSubmit } = useForm({
    initialValues: { email: '', password: '' },
    validate: validateLogin,
    onSubmit: ({ email, password }) => login({ email: email.trim(), password }),
  });

  return (
    <>
      <h1 className="text-xl font-semibold tracking-tight">Welcome back</h1>
      <p className="mt-1 text-sm text-fg-muted">Log in to see what's waiting for you.</p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        <Alert>{formError}</Alert>

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
          autoComplete="current-password"
          placeholder="Your password"
          value={values.password}
          onChange={handleChange}
          error={errors.password}
        />

        <Button type="submit" fullWidth loading={submitting}>
          Log in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-fg-muted">
        New to Brainly?{' '}
        <Link to="/register" className="font-semibold text-brand-600 hover:underline dark:text-brand-400">
          Create an account
        </Link>
      </p>
    </>
  );
}