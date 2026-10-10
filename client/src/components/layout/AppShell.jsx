import { LogOut } from 'lucide-react';
import { Outlet } from 'react-router';

import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';

export default function AppShell() {
  const { logout } = useAuth();

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b bg-surface/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <Logo />
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="size-4" aria-hidden />
              <span className="hidden sm:inline">Log out</span>
              <span className="sr-only sm:hidden">Log out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 pb-24">
        <Outlet />
      </main>
    </div>
  );
}