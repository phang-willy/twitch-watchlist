"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import type { WatchlistStreamer } from "@/lib/types";
import {
  getWatchlist,
  addToWatchlist as addStorage,
  removeFromWatchlist as removeStorage,
  isInWatchlist as checkStorage,
} from "@/lib/storage";

export function useStreamerWatchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistStreamer[]>([]);

  const load = useCallback(() => {
    setWatchlist(getWatchlist());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const add = useCallback((streamer: WatchlistStreamer): boolean => {
    const added = addStorage({
      id: streamer.id,
      login: streamer.login,
      displayName: streamer.displayName,
      profileImageUrl: streamer.profileImageUrl,
    });
    if (added) {
      setWatchlist(getWatchlist());
    }
    return added;
  }, []);

  const remove = useCallback((login: string) => {
    removeStorage(login);
    setWatchlist(getWatchlist());
  }, []);

  const isInWatchlist = useCallback((login: string) => {
    return checkStorage(login);
  }, []);

  const logins = useMemo(
    () => watchlist.map((s) => s.login),
    [watchlist]
  );

  return { watchlist, logins, add, remove, isInWatchlist, refresh: load };
}
