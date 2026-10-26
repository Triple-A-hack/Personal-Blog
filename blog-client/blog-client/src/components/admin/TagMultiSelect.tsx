import { Check } from 'lucide-react';
import type { Tag } from '@/types/blog';
import { cn } from '@/utils/cn';

interface TagMultiSelectProps {
  tags: Tag[];
  value: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
}

export function TagMultiSelect({ tags, value, onChange, disabled = false }: TagMultiSelectProps) {
  if (tags.length === 0) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">No tags exist yet. An administrator can create them under Tags.</p>;
  }

  const toggle = (id: string) => onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);

  return (
    <div role="group" aria-label="Tags" className="flex flex-wrap gap-2">
      {tags.map((tag) => {
        const selected = value.includes(tag.id);
        return (
          <button
            key={tag.id}
            type="button"
            disabled={disabled}
            aria-pressed={selected}
            onClick={() => toggle(tag.id)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors disabled:opacity-60',
              selected
                ? 'border-indigo-600 bg-indigo-600 text-white'
                : 'border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800',
            )}
          >
            {selected && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
            {tag.name}
          </button>
        );
      })}
    </div>
  );
}
