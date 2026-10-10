import { LogOut, Plus } from 'lucide-react';
import { NavLink } from 'react-router';

import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { NAV_ITEMS } from '@/config/nav';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/cn';

const linkClass = ({ isActive }) =>
  cn(
    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
    isActive
      ? 'bg-brand-500/10 text-brand-700 dark:text-brand-300'
      : 'text-fg-muted hover:bg-surface-2 hover:text-fg'
  );

export function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r bg-surface lg:flex">
      <div className="px-5 pt-6">
        <Logo />
      </div>

      <div className="px-4 pt-6">
        <NavLink
          to="/add"
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-600 text-sm font-semibold text-white shadow-sm shadow-brand-600/25 transition hover:bg-brand-700 active:scale-[0.98]"
        >
          <Plus className="size-4" aria-hidden />
          Save a link
        </NavLink>
      </div>

      <nav aria-label="Main" className="mt-6 flex-1 space-y-1 px-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={linkClass}>
            <Icon className="size-5" aria-hidden />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t p-3">
        <div className="flex items-center gap-3 px-2 py-2">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-500/15 text-sm font-semibold text-brand-700 dark:text-brand-300">
            {user.name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-fg-subtle">{user.email}</p>
          </div>
        </div>

        <div className="mt-1 flex items-center gap-1">
          <ThemeToggle />
          <button
            type="button"
            onClick={logout}
            className="flex h-10 flex-1 items-center gap-2 rounded-xl px-3 text-sm font-medium text-fg-muted transition hover:bg-surface-2 hover:text-fg"
          >
            <LogOut className="size-4" aria-hidden />
            Log out
          </button>
        </div>
      </div>
    </aside>
  );
}