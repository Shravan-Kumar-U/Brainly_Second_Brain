import { Plus } from 'lucide-react';
import { NavLink } from 'react-router';

import { NAV_ITEMS } from '@/config/nav';
import { cn } from '@/lib/cn';

const tabClass = ({ isActive }) =>
  cn(
    'flex flex-col items-center gap-1 py-2 text-[11px] font-medium transition',
    isActive ? 'text-brand-600 dark:text-brand-400' : 'text-fg-subtle'
  );

export function BottomNav() {
  const [home, library] = NAV_ITEMS;

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg lg:hidden"
    >
      <div className="mx-auto grid h-16 max-w-md grid-cols-3 items-center">
        <NavLink to={home.to} end className={tabClass}>
          <home.icon className="size-6" aria-hidden />
          {home.label}
        </NavLink>

        <NavLink
          to="/add"
          aria-label="Save a link"
          className="-mt-7 grid size-14 justify-self-center place-items-center rounded-full bg-linear-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-600/40 transition active:scale-95"
        >
          <Plus className="size-7" aria-hidden />
        </NavLink>

        <NavLink to={library.to} className={tabClass}>
          <library.icon className="size-6" aria-hidden />
          {library.label}
        </NavLink>
      </div>
    </nav>
  );
}