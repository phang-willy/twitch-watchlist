import { useEffect, useState } from "react";

interface SearchBarProps {
  query: string;
  loading: boolean;
  disabled?: boolean;
  onQueryChange: (value: string) => void;
  onSearch: () => void;
}

export function SearchBar({
  query,
  loading,
  disabled = false,
  onQueryChange,
  onSearch,
}: SearchBarProps) {
  const [localQuery, setLocalQuery] = useState(query);

  // On synchronise uniquement si le parent fournit une valeur non vide
  // (sinon, on préserve l'entrée après une recherche).
  useEffect(() => {
    if (query && localQuery !== query) setLocalQuery(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const triggerSearch = () => {
    if (localQuery !== query) onQueryChange(localQuery);
    onSearch();
  };

  return (
    <div className="flex gap-2">
      <input
        value={localQuery}
        onChange={(e) => {
          const next = e.target.value;
          setLocalQuery(next);
          onQueryChange(next);
        }}
        placeholder="Rechercher un login..."
        className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-violet-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-500"
        onKeyDown={(e) => {
          if (e.key === "Enter") triggerSearch();
        }}
        disabled={disabled}
        type="search"
        name="search-streamer"
        id="search-streamer"
        aria-label="Rechercher un streamer"
        autoComplete="streamer"
      />
      <button
        type="button"
        disabled={loading || disabled || !localQuery.trim()}
        onClick={triggerSearch}
        className="flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {loading ? (
          <>
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
              aria-hidden
            />
            <span>Recherche...</span>
          </>
        ) : (
          "Rechercher"
        )}
      </button>
    </div>
  );
}
