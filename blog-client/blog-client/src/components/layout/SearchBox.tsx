import { Search, X } from 'lucide-react';
import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

/** Real-time search: updates the home page's `?search=` param as the user types. */
export function SearchBox({ className }: { className?: string }) {
  const inputId = useId();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const urlSearch = location.pathname === '/' ? (searchParams.get('search') ?? '') : '';
  const [value, setValue] = useState(urlSearch);
  const debounced = useDebouncedValue(value, 400);
  const touched = useRef(false);

  // Keep the latest values reachable from effects without re-triggering them.
  const latest = useRef({ pathname: location.pathname, searchParams, urlSearch, debounced });
  latest.current = { pathname: location.pathname, searchParams, urlSearch, debounced };

  const applySearch = (term: string) => {
    const { pathname, searchParams: current, urlSearch: currentTerm } = latest.current;
    const trimmed = term.trim();
    const onHome = pathname === '/';
    if (onHome && trimmed === currentTerm) return;

    const params = new URLSearchParams(onHome ? current : undefined);
    if (trimmed) params.set('search', trimmed);
    else params.delete('search');
    params.delete('page');
    navigate({ pathname: '/', search: params.toString() }, { replace: onHome });
  };

  // Typing -> URL (debounced).
  useEffect(() => {
    if (!touched.current) return;
    applySearch(debounced);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  // URL -> input (e.g. "clear filters" or browser back), without clobbering in-flight typing.
  useEffect(() => {
    if (latest.current.urlSearch !== latest.current.debounced) {
      touched.current = false;
      setValue(urlSearch);
    }
  }, [urlSearch]);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    touched.current = true;
    applySearch(value);
  };

  return (
    <form role="search" onSubmit={onSubmit} className={className}>
      <label htmlFor={inputId} className="sr-only">
        Search posts
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
        <input
          id={inputId}
          type="search"
          value={value}
          onChange={(event) => {
            touched.current = true;
            setValue(event.target.value);
          }}
          placeholder="Search posts…"
          autoComplete="off"
          className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-9 text-sm placeholder:text-gray-400 focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:placeholder:text-gray-500 [&::-webkit-search-cancel-button]:hidden"
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              touched.current = true;
              setValue('');
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </form>
  );
}
