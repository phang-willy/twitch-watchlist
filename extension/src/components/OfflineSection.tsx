import { StreamerCard } from "@/components/StreamerCard";
import type { OfflineStreamer } from "@/lib/types";

interface OfflineSectionProps {
  offline: OfflineStreamer[];
  onRemove: (login: string) => void;
}

export function OfflineSection({ offline, onRemove }: OfflineSectionProps) {
  return (
    <div className="grid grid-cols-1 gap-4">
      <h3 className="text-lg font-semibold uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1">
        <span className="relative flex size-4 mr-1">
          <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex size-4 rounded-full bg-red-500"></span>
        </span>
        <span>Offline ({offline.length})</span>
      </h3>
      {offline.length === 0 ? (
        <p className="text-xs text-slate-500 dark:text-slate-400">Aucun offline.</p>
      ) : (
        offline.map((s) => (
          <StreamerCard key={s.id} variant="offline" streamer={s} onRemove={onRemove} />
        ))
      )}
    </div>
  );
}
