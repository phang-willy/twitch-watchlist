import { useMemo, useState } from "react";
import type { LiveStreamer } from "@/lib/types";
import type { LiveSortKey } from "@/lib/liveSorting";
import { sortLiveStreamers } from "@/lib/liveSorting";

export function useLiveSorting(live: LiveStreamer[]) {
  const [sortBy, setSortBy] = useState<LiveSortKey>("viewers-desc");

  const sortedLive = useMemo(
    () => sortLiveStreamers(live, sortBy),
    [live, sortBy]
  );

  return { sortBy, setSortBy, sortedLive };
}

