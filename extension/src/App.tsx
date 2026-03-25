import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchStreams, searchStreamer, sortOfflineByLastStream } from "@/lib/api";
import {
  addToWatchlist,
  getWatchlist,
  removeFromWatchlist,
} from "@/lib/storage";
import { EmptyState } from "@/components/EmptyState";
import { LiveSection } from "@/components/LiveSection";
import { OfflineSection } from "@/components/OfflineSection";
import { SearchBar } from "@/components/SearchBar";
import { SearchResult } from "@/components/SearchResult";
import type {
  LiveStreamer,
  OfflineStreamer,
  SearchResultItem,
  WatchlistStreamer,
} from "@/lib/types";
import { FaArrowRotateLeft } from "react-icons/fa6";
import Skeleton from "@/components/Skeleton";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { GoToTopButton } from "@/components/GoToTopButton";
import { useGoTopVisibility } from "@/hooks/useGoTopVisibility";
import { useThemePreference } from "@/hooks/useThemePreference";

const REFRESH_INTERVAL_MS = 60_000;

function App() {
  const [initialLoading, setInitialLoading] = useState(true);
  const { theme, setTheme } = useThemePreference();
  const showGoTop = useGoTopVisibility(50);
  const [watchlist, setWatchlist] = useState<WatchlistStreamer[]>([]);
  const [live, setLive] = useState<LiveStreamer[]>([]);
  const [offline, setOffline] = useState<OfflineStreamer[]>([]);

  const [search, setSearch] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<SearchResultItem | null>(null);
  const [searchResultStreamer, setSearchResultStreamer] = useState<
    LiveStreamer | OfflineStreamer | null
  >(null);

  const [streamsLoading, setStreamsLoading] = useState(false);
  const [streamsError, setStreamsError] = useState<string | null>(null);

  const logins = useMemo(() => watchlist.map((s) => s.login), [watchlist]);

  const loadWatchlist = useCallback(async () => {
    const list = await getWatchlist();
    setWatchlist(list);
    return list;
  }, []);

  const refreshStreams = useCallback(
    async (showLoader = false) => {
      if (logins.length === 0) {
        setLive([]);
        setOffline([]);
        return;
      }

      if (showLoader) setStreamsLoading(true);
      setStreamsError(null);
      try {
        const data = await fetchStreams(logins);
        setLive(data.live);
        setOffline(sortOfflineByLastStream(data.offline));
      } catch (err) {
        setStreamsError(err instanceof Error ? err.message : "Erreur de connexion");
      } finally {
        if (showLoader) setStreamsLoading(false);
      }
    },
    [logins]
  );

  useEffect(() => {
    const init = async () => {
      try {
        const list = await loadWatchlist();
        if (list.length > 0) {
          const data = await fetchStreams(list.map((s) => s.login));
          setLive(data.live);
          setOffline(sortOfflineByLastStream(data.offline));
        } else {
          setLive([]);
          setOffline([]);
        }
      } catch (err) {
        setStreamsError(err instanceof Error ? err.message : "Erreur de connexion");
      } finally {
        setInitialLoading(false);
      }
    };
    void init();
  }, [loadWatchlist]);

  useEffect(() => {
    refreshStreams();
  }, [refreshStreams]);

  useEffect(() => {
    const id = setInterval(() => void refreshStreams(), REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [refreshStreams]);

  const handleSearch = useCallback(async () => {
    const query = search.trim();
    if (!query) return;

    setSearchLoading(true);
    setSearchError(null);
    setSearchResult(null);
    setSearchResultStreamer(null);

    try {
      const result = await searchStreamer(query);
      setSearchResult(result);
      setSearch("");

      if (result?.login) {
        const status = await fetchStreams([result.login]);
        setSearchResultStreamer(status.live[0] ?? status.offline[0] ?? null);
      }
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Erreur de recherche");
    } finally {
      setSearchLoading(false);
    }
  }, [search]);

  const handleAdd = useCallback(async (streamer: SearchResultItem) => {
    const added = await addToWatchlist({
      id: streamer.id,
      login: streamer.login,
      displayName: streamer.displayName,
      profileImageUrl: streamer.profileImageUrl,
    });
    if (added) {
      await loadWatchlist();
      setSearchResult(null);
      setSearchResultStreamer(null);
    }
  }, [loadWatchlist]);

  const handleRemove = useCallback(
    async (login: string) => {
      await removeFromWatchlist(login);
      await loadWatchlist();
    },
    [loadWatchlist]
  );

  const inWatchlist = (login: string): boolean =>
    watchlist.some((s) => s.login.toLowerCase() === login.toLowerCase());

  if (initialLoading) {
    return (
      <main className="w-xl min-h-[520px] bg-slate-100 p-4 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
        <div className="flex min-h-[480px] items-center justify-center">
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-violet-600" />
            <span>Chargement en cours...</span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="w-xl min-h-[520px] bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <header className="flex items-center justify-between sticky top-0 left-0 z-10 p-4 bg-inherit">
        <h1 className="text-2xl font-bold">Twitch Watchlist</h1>
        <ThemeSwitcher theme={theme} setTheme={setTheme} />
      </header>
      <main className=" grid grid-cols-1 gap-4 p-4">
        <section className="grid grid-cols-1 gap-4">
          <SearchBar
            query={search}
            loading={searchLoading}
            onQueryChange={setSearch}
            onSearch={() => void handleSearch()}
          />
          <SearchResult
            result={searchResult}
            streamer={searchResultStreamer}
            loading={searchLoading}
            error={searchError}
            inWatchlist={searchResult ? inWatchlist(searchResult.login) : false}
            onAdd={() => {
              if (searchResult) void handleAdd(searchResult);
            }}
          />
        </section>

        <section className="grid grid-cols-1 gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Ma watchlist</h2>
            <button
              type="button"
              onClick={() => void refreshStreams(true)}
              disabled={streamsLoading || watchlist.length === 0}
              title="Rafraîchir la watchlist manuellement"
              className="flex items-center gap-2 rounded border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 focus:bg-slate-100 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 dark:focus:bg-slate-600 cursor-pointer"
            >
              <FaArrowRotateLeft
                className={`w-4 h-4 ${streamsLoading ? "animate-spin [animation-direction:reverse]" : ""}`}
              />{" "}
              <span className="text-xs">Rafraîchir</span>
            </button>
          </div>

          {watchlist.length === 0 ? (
            <EmptyState text="Aucun streamer ajouté." />
          ) : streamsLoading ? (
            <div className="grid grid-cols-1 gap-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8">
              {streamsError && (
                <p className="rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                  {streamsError}
                </p>
              )}
              <LiveSection live={live} onRemove={(login) => void handleRemove(login)} />
              <OfflineSection
                offline={offline}
                onRemove={(login) => void handleRemove(login)}
              />
            </div>
          )}
        </section>

        <GoToTopButton visible={showGoTop} />
      </main>
    </div>
  );
}

export default App;
