"use client";

import { StreamerCard } from "./StreamerCard";
import type { LiveStreamer } from "@/lib/types";

interface LiveSectionProps {
  live: LiveStreamer[];
  onRemove?: (login: string) => void;
}

export function LiveSection({ live, onRemove }: LiveSectionProps) {
  if (live.length === 0) return null;

  return (
    <section id="live">
      <h2 className="mb-4 text-xl font-bold text-slate-800">
        En direct ({live.length})
      </h2>
      <div className="grid grid-cols-1 gap-3">
        {live.map((s) => (
          <StreamerCard
            key={s.id}
            variant="live"
            streamer={s}
            onRemove={onRemove}
          />
        ))}
      </div>
    </section>
  );
}
