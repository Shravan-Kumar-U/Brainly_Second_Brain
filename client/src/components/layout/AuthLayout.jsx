import { Outlet } from 'react-router';

import { Card } from '@/components/ui/Card';
import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function AuthLayout() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-brand-500/15 blur-3xl"
      />

      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo size="lg" showText={false} />
          <p className="mt-4 text-2xl font-bold tracking-tight">Brainly</p>
          <p className="mt-1 text-sm text-fg-muted">Your second brain. Save now, remember later.</p>
        </div>

        <Card className="p-6 sm:p-7">
          <Outlet />
        </Card>
      </div>
    </div>
  );
}