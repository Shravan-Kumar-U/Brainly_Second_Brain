import { X } from 'lucide-react';
import { useState } from 'react';

export function TagInput({ value, onChange, suggestions = [], max = 10 }) {
  const [draft, setDraft] = useState('');

  const add = (raw) => {
    const tag = raw.trim().toLowerCase().replace(/^#/, '').slice(0, 30);
    setDraft('');
    if (!tag || value.includes(tag) || value.length >= max) return;
    onChange([...value, tag]);
  };

  const remove = (tag) => onChange(value.filter((existing) => existing !== tag));

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Enter adds a tag, it must not submit the form
      add(draft);
    } else if (event.key === 'Backspace' && !draft && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  // Phone keyboards don't always report the comma key, so we look at the text itself
  const handleInput = (event) => {
    const text = event.target.value;
    if (text.endsWith(',')) add(text.slice(0, -1));
    else setDraft(text);
  };

  const unused = suggestions.filter((tag) => !value.includes(tag)).slice(0, 6);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5 rounded-xl border bg-surface p-2 transition focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/15">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-lg bg-brand-500/10 py-1 pl-2.5 pr-1.5 text-sm font-medium text-brand-700 dark:text-brand-300"
          >
            #{tag}
            <button
              type="button"
              onClick={() => remove(tag)}
              aria-label={`Remove tag ${tag}`}
              className="grid size-5 place-items-center rounded-md hover:bg-brand-500/20"
            >
              <X className="size-3.5" aria-hidden />
            </button>
          </span>
        ))}

        <input
          value={draft}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onBlur={() => draft && add(draft)}
          disabled={value.length >= max}
          placeholder={value.length ? '' : 'Add tags, e.g. ai, gym, career'}
          aria-label="Add a tag"
          className="h-8 min-w-[8ch] flex-1 bg-transparent px-1.5 text-base outline-none placeholder:text-fg-subtle sm:text-sm"
        />
      </div>

      {unused.length > 0 && value.length < max && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {unused.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => add(tag)}
              className="rounded-lg border px-2.5 py-1 text-xs font-medium text-fg-muted transition hover:bg-surface-2 hover:text-fg"
            >
              + {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}