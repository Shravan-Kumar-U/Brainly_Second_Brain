import { LogOut } from 'lucide-react';
import { Outlet } from 'react-router';

import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';
import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';

export default function AppShell() {
  const { logout } = useAuth();

  return (
    <div className="min-h-dvh">
      <Sidebar />

      <div className="lg:pl-64">
        {/* Phone-only top bar. On laptops the sidebar replaces it. */}
        <header className="sticky top-0 z-30 border-b bg-surface/80 backdrop-blur-lg lg:hidden">
          <div className="flex h-14 items-center justify-between px-4">
            <Logo />
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <button
                type="button"
                onClick={logout}
                aria-label="Log out"
                className="grid size-10 place-items-center rounded-xl text-fg-muted transition hover:bg-surface-2 hover:text-fg"
              >
                <LogOut className="size-5" aria-hidden />
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1800px] px-4 py-6 pb-28 sm:px-6 lg:px-10 lg:py-10 lg:pb-12">
          <Outlet />
        </main>
      </div>

      <BottomNav />
    </div>
  );
}