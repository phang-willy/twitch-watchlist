"use client";

import { useState, useCallback, useEffect } from "react";
import type { SearchResultItem, LiveStreamer, OfflineStreamer } from "@/lib/types";
import { SearchBar } from "@/components/SearchBar";
import { SearchResult } from "@/components/SearchResult";
import { LiveSection } from "@/components/LiveSection";
import { OfflineSection } from "@/components/OfflineSection";
import { EmptyState } from "@/components/EmptyState";
import { useStreamerWatchlist } from "@/hooks/useStreamerWatchlist";

const REFRESH_INTERVAL_MS = 60_000;

export default function Home() {
  const { watchlist, logins, add, remove, isInWatchlist, refresh } =
    useStreamerWatchlist();

  const [searchResult, setSearchResult] = useState<SearchResultItem | null>(null);
  const [searchResultStreamer, setSearchResultStreamer] = useState<
    LiveStreamer | OfflineStreamer | null
  >(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [streamsLoading, setStreamsLoading] = useState(false);
  const [streamsError, setStreamsError] = useState<string | null>(null);
  const [live, setLive] = useState<LiveStreamer[]>([]);
  const [offline, setOffline] = useState<OfflineStreamer[]>([]);

  const fetchStreams = useCallback(async (showLoader = false) => {
    if (logins.length === 0) {
      setLive([]);
      setOffline([]);
      return;
    }
    if (showLoader) setStreamsLoading(true);
    setStreamsError(null);
    try {
      const res = await fetch("/api/twitch/streams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logins }),
      });
      const text = await res.text();
      let data: { error?: string; live?: LiveStreamer[]; offline?: OfflineStreamer[] };
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        setStreamsError(
          res.ok
            ? "Erreur lors du chargement des streams"
            : `Erreur serveur (${res.status})`
        );
        return;
      }
      if (!res.ok) {
        setStreamsError(data.error || "Erreur lors du chargement des streams");
        return;
      }
      setLive(data.live ?? []);
      setOffline(data.offline ?? []);
    } catch (err) {
      setStreamsError(
        err instanceof Error ? err.message : "Erreur de connexion"
      );
    } finally {
      if (showLoader) setStreamsLoading(false);
    }
  }, [logins]);

  useEffect(() => {
    fetchStreams();
  }, [fetchStreams]);

  useEffect(() => {
    const id = setInterval(fetchStreams, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchStreams]);

  const handleSearch = useCallback(async (query: string) => {
    setSearchLoading(true);
    setSearchError(null);
    setSearchResult(null);
    setSearchResultStreamer(null);
    try {
      const res = await fetch(`/api/twitch/search?q=${encodeURIComponent(query)}`);
      const text = await res.text();
      let data: (SearchResultItem & { error?: string }) | { error?: string } | null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        setSearchError(
          res.ok ? "Erreur de recherche" : `Erreur serveur (${res.status})`
        );
        return;
      }
      if (!res.ok) {
        setSearchError(
          (data && "error" in data ? data.error : null) || "Erreur de recherche"
        );
        return;
      }
      const result = data as SearchResultItem | null;
      setSearchResult(result);
      if (result?.login) {
        try {
          const streamsRes = await fetch("/api/twitch/streams", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ logins: [result.login] }),
          });
          const streamsText = await streamsRes.text();
          let streamsData: {
            live?: LiveStreamer[];
            offline?: OfflineStreamer[];
          } = {};
          try {
            streamsData = streamsText ? JSON.parse(streamsText) : {};
          } catch {
            /* ignore */
          }
          const liveArr = streamsData.live ?? [];
          const offlineArr = streamsData.offline ?? [];
          const streamer = liveArr[0] ?? offlineArr[0] ?? null;
          setSearchResultStreamer(streamer);
        } catch {
          setSearchResultStreamer(null);
        }
      } else {
        setSearchResultStreamer(null);
      }
    } catch (err) {
      setSearchError(
        err instanceof Error ? err.message : "Erreur de connexion"
      );
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const handleAdd = useCallback(
    (streamer: SearchResultItem) => {
      add({
        id: streamer.id,
        login: streamer.login,
        displayName: streamer.displayName,
        profileImageUrl: streamer.profileImageUrl,
      });
      setSearchResult(null);
    },
    [add]
  );

  const handleRemove = useCallback(
    (login: string) => {
      remove(login);
    },
    [remove]
  );

  const isDisabled = searchLoading || streamsLoading;
  const liveCount = live.length;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="grid grid-cols-1 gap-8">
        <header>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Twitch Watchlist
          </h1>
          <div className="mt-2 flex items-center gap-3">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                liveCount > 0
                  ? "bg-red-100 text-red-700"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {liveCount} live
            </span>
            <a
              href="https://www.twitch.tv"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-violet-600 hover:text-violet-700"
            >
              Ouvrir Twitch →
            </a>
          </div>
        </header>

        <aside id="search" className="grid grid-cols-1 gap-4">
          <SearchBar
            onSearch={handleSearch}
            loading={searchLoading}
            disabled={isDisabled}
          />
          <div>
            <SearchResult
              result={searchResult}
              streamer={searchResultStreamer}
              loading={searchLoading}
              error={searchError}
              onAdd={handleAdd}
              isInWatchlist={isInWatchlist}
            />
          </div>
        </aside>
        
        <main id="watchlist">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-4xl font-bold text-slate-800">
              Ma watchlist
            </h2>
            <button
              onClick={() => {
                refresh();
                fetchStreams(true);
              }}
              disabled={isDisabled || watchlist.length === 0}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 disabled:hover:bg-white"
            >
              Rafraîchir
            </button>
          </div>

          {watchlist.length === 0 ? (
            <EmptyState type="no-streamers" />
          ) : streamsLoading ? (
            <div className="flex items-center justify-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-12 text-slate-500">
              <div
                className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-violet-600"
                aria-hidden
              />
              <span>Chargement des statuts...</span>
            </div>
          ) : (
            <>
              {streamsError && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                  {streamsError}
                </div>
              )}
              <div className="grid grid-cols-1 gap-8">
                {live.length === 0 ? (
                  <EmptyState type="no-live" />
                ) : (
                  <LiveSection live={live} onRemove={handleRemove} />
                )}
                <OfflineSection offline={offline} onRemove={handleRemove} />
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
