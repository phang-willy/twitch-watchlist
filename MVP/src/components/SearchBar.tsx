"use client";

import { useState, useCallback } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  loading?: boolean;
  disabled?: boolean;
}

export function SearchBar({
  onSearch,
  loading = false,
  disabled = false,
}: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const q = query.trim();
      if (q && !disabled) {
        onSearch(q);
        setQuery("");
      }
    },
    [query, onSearch, disabled]
  );

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Rechercher un streamer (login)..."
        disabled={disabled}
        className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-800 placeholder-slate-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-60"
        aria-label="Rechercher un streamer"
        autoComplete="streamer"
        name="streamer"
        id="streamer"
      />
      <button
        type="submit"
        disabled={disabled || loading || !query.trim()}
        className="flex items-center gap-2 rounded-lg bg-violet-600 px-6 py-2 font-medium text-white transition hover:bg-violet-700 disabled:opacity-60 disabled:hover:bg-violet-600"
      >
        {loading ? (
          <>
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
              aria-hidden
            />
            Recherche...
          </>
        ) : (
          "Rechercher"
        )}
      </button>
    </form>
  );
}
