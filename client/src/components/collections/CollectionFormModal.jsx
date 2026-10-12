import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { useCollectionActions } from '@/hooks/useCollections';
import { cn } from '@/lib/cn';
import { COLLECTION_COLORS, COLOR_IDS } from '@/lib/collections';

// Its own component, so the fields reset every time the dialog opens
function FormBody({ collection, onDone }) {
  const actions = useCollectionActions();
  const mutation = collection ? actions.update : actions.create;

  const [name, setName] = useState(collection?.name ?? '');
  const [description, setDescription] = useState(collection?.description ?? '');
  const [color, setColor] = useState(collection?.color ?? 'violet');

  const submit = (event) => {
    event.preventDefault();
    const data = { name: name.trim(), description: description.trim(), color };
    if (!data.name) return;

    mutation.mutate(collection ? { id: collection._id, data } : data, { onSuccess: onDone });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Input
        label="Name"
        placeholder="e.g. AI Learning"
        maxLength={40}
        autoFocus
        value={name}
        onChange={(event) => setName(event.target.value)}
      />

      <Textarea
        label="Description (optional)"
        placeholder="What is this collection for?"
        maxLength={200}
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />

      <div>
        <p className="mb-2 text-sm font-medium">Color</p>
        <div className="flex gap-2" role="radiogroup" aria-label="Color">
          {COLOR_IDS.map((id) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={color === id}
              aria-label={COLLECTION_COLORS[id].label}
              onClick={() => setColor(id)}
              className={cn(
                'size-9 rounded-full transition',
                COLLECTION_COLORS[id].dot,
                color === id ? 'ring-2 ring-offset-2 ring-fg ring-offset-surface' : 'opacity-70 hover:opacity-100'
              )}
            />
          ))}
        </div>
      </div>

      <Button type="submit" fullWidth loading={mutation.isPending} disabled={!name.trim()}>
        {collection ? 'Save changes' : 'Create collection'}
      </Button>
    </form>
  );
}

export function CollectionFormModal({ open, onClose, collection }) {
  return (
    <Modal open={open} onClose={onClose} title={collection ? 'Edit collection' : 'New collection'}>
      <FormBody collection={collection} onDone={onClose} />
    </Modal>
  );
}