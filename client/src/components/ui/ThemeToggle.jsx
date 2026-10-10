import { Monitor, Moon, Sun } from 'lucide-react';

import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/cn';

const ORDER = ['light', 'dark', 'system'];
const META = {
  light: { icon: Sun, label: 'Light' },
  dark: { icon: Moon, label: 'Dark' },
  system: { icon: Monitor, label: 'System' },
};

export function ThemeToggle({ className }) {
  const { theme, setTheme } = useTheme();

  const Icon = META[theme].icon;
  const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      title={`Theme: ${META[theme].label}`}
      aria-label={`Theme: ${META[theme].label}. Switch to ${META[next].label}`}
      className={cn(
        'grid size-10 place-items-center rounded-xl text-fg-muted transition hover:bg-surface-2 hover:text-fg',
        className
      )}
    >
      <Icon className="size-5" aria-hidden />
    </button>
  );
}