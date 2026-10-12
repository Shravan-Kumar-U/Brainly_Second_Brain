import { LogOut } from 'lucide-react';
import { Outlet, useLocation } from 'react-router';

import { BackButton } from '@/components/ui/BackButton';
import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';
import { useEffect } from 'react';
import { pushClient } from '@/lib/pushClient';

export default function AppShell() {
   useEffect(() => {
    pushClient.sync().catch(() => {});
  }, []);
  const { logout } = useAuth();
  const { pathname } = useLocation();
  const online = useOnlineStatus();
  const isHome = pathname === '/';

  return (
    <div className="min-h-dvh">
      <Sidebar />

      <div className="lg:pl-64">
        {/* Phone-only top bar. On laptops the sidebar replaces it. */}
        <header className="sticky top-0 z-30 border-b bg-surface/80 backdrop-blur-lg lg:hidden">
          <div className="flex h-14 items-center justify-between px-4">
            <div className="flex items-center gap-1">
              {!isHome && <BackButton className="-ml-2" />}
              <Logo />
            </div>
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

        {!online && (
          <div
            role="status"
            className="bg-amber-500/15 px-4 py-2 text-center text-xs font-medium text-amber-800 dark:text-amber-200"
          >
            You're offline. Your items will load again when you're back online.
          </div>
        )}

        <main className="mx-auto w-full max-w-[1800px] px-4 py-6 pb-28 sm:px-6 lg:px-10 lg:py-10 lg:pb-12">
          {!isHome && <BackButton withLabel className="-ml-3 mb-4 hidden lg:inline-flex" />}
          <Outlet />
        </main>
      </div>

      <BottomNav />
    </div>
  );
}