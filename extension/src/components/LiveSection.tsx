import { StreamerCard } from "@/components/StreamerCard";
import { LiveSortSelect } from "@/components/LiveSortSelect";
import type { LiveStreamer } from "@/lib/types";
import { useLiveSorting } from "@/hooks/useLiveSorting";

interface LiveSectionProps {
  live: LiveStreamer[];
  onRemove: (login: string) => void;
}

export function LiveSection({ live, onRemove }: LiveSectionProps) {
  const { sortBy, setSortBy, sortedLive } = useLiveSorting(live);

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <span className="relative flex size-3 mr-1">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex size-3 rounded-full bg-green-500"></span>
          </span>
          <span>Live ({live.length})</span>
        </h3>
        {live.length > 0 ? <LiveSortSelect sortBy={sortBy} setSortBy={setSortBy} /> : null}
      </div>      
      {live.length === 0 ? (
        <p className="text-xs text-slate-500 dark:text-slate-400">Aucun live.</p>
      ) : (
        sortedLive.map((s) => (
          <StreamerCard key={s.id} variant="live" streamer={s} onRemove={onRemove} />
        ))
      )}
    </div>
  );
}
