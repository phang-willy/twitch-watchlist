"use client";

import { StreamerCard } from "./StreamerCard";
import type { OfflineStreamer } from "@/lib/types";

interface OfflineSectionProps {
  offline: OfflineStreamer[];
  onRemove?: (login: string) => void;
}

export function OfflineSection({ offline, onRemove }: OfflineSectionProps) {
  if (offline.length === 0) return null;

  const sorted = [...offline].sort((a, b) => {
    const aDate = a.lastStreamedAt ? new Date(a.lastStreamedAt).getTime() : 0;
    const bDate = b.lastStreamedAt ? new Date(b.lastStreamedAt).getTime() : 0;
    return bDate - aDate;
  });

  return (
    <section id="offline">
      <h2 className="mb-4 text-xl font-bold text-slate-800">
        Hors ligne ({offline.length})
      </h2>
      <div className="grid grid-cols-1 gap-3">
        {sorted.map((s) => (
          <StreamerCard
            key={s.id}
            variant="offline"
            streamer={s}
            onRemove={onRemove}
          />
        ))}
      </div>
    </section>
  );
}
