import { Plus } from 'lucide-react';
import { NavLink } from 'react-router';

import { NAV_ITEMS } from '@/config/nav';
import { cn } from '@/lib/cn';

const tabClass = ({ isActive }) =>
  cn(
    'flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium transition',
    isActive ? 'text-brand-600 dark:text-brand-400' : 'text-fg-subtle'
  );

const Tab = ({ to, label, icon: Icon, end }) => (
  <NavLink key={to} to={to} end={end} className={tabClass}>
    <Icon className="size-6" aria-hidden />
    {label}
  </NavLink>
);

export function BottomNav() {
  const left = NAV_ITEMS.slice(0, 2);
  const right = NAV_ITEMS.slice(2);
  // Keeps the "+" centered while the right side has fewer tabs (Phase 9 adds one)
  const spacers = Math.max(0, left.length - right.length);

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg lg:hidden"
    >
      <div className="mx-auto flex h-16 max-w-md items-center">
        {left.map(Tab)}

        <NavLink
          to="/add"
          aria-label="Save a link"
          className="-mt-7 mx-2 grid size-14 shrink-0 place-items-center rounded-full bg-linear-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-600/40 transition active:scale-95"
        >
          <Plus className="size-7" aria-hidden />
        </NavLink>

        {right.map(Tab)}
        {Array.from({ length: spacers }, (_, index) => (
          <span key={index} className="flex-1" aria-hidden />
        ))}
      </div>
    </nav>
  );
}