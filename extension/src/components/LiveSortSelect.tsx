import type { Dispatch, SetStateAction } from "react";
import type { LiveSortKey } from "@/lib/liveSorting";

type LiveSortSelectProps = {
  sortBy: LiveSortKey;
  setSortBy: Dispatch<SetStateAction<LiveSortKey>>;
};

export function LiveSortSelect({ sortBy, setSortBy }: LiveSortSelectProps) {
  return (
    <select
      value={sortBy}
      onChange={(e) => setSortBy(e.target.value as LiveSortKey)}
      className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-violet-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-100 focus:bg-slate-100"
      aria-label="Trier les lives"
      name="sort-live"
    >
      <option value="">Par défaut</option>
      <option value="viewers-asc">Viewers croissant</option>
      <option value="viewers-desc">Viewers décroissant</option>
      <option value="name-asc">Nom croissant</option>
      <option value="name-desc">Nom décroissant</option>
      <option value="since-asc">Depuis croissant</option>
      <option value="since-desc">Depuis décroissant</option>
    </select>
  );
}

