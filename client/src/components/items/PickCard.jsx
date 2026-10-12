import { Sparkles } from 'lucide-react';
import { useState } from 'react';

import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { PickModal } from './PickModal';

const CHOICES = [
  { minutes: 5, label: '5 min' },
  { minutes: 15, label: '15 min' },
  { minutes: 30, label: '30 min' },
  { minutes: 60, label: '1 hour' },
  { minutes: undefined, label: 'Any time' },
];

export function PickCard() {
  // null = closed. Using a wrapper object lets "Any time" (no minutes) still mean "open".
  const [choice, setChoice] = useState(null);

  return (
    <Card className="p-5">
      <h2 className="flex items-center gap-2 text-sm font-semibold">
        <Sparkles className="size-4 text-brand-500" aria-hidden />
        Not sure what to start? Let Brainly pick.
      </h2>
      <p className="mt-1 text-xs text-fg-muted">
        Tell it how much time you have. It chooses the most worthwhile item that fits.
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {CHOICES.map((option) => (
          <Chip key={option.label} onClick={() => setChoice({ minutes: option.minutes })}>
            {option.label}
          </Chip>
        ))}
      </div>

      <PickModal open={choice !== null} minutes={choice?.minutes} onClose={() => setChoice(null)} />
    </Card>
  );
}