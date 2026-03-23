import type { WatchlistStreamer } from "./types";

const STORAGE_KEY = "twitch_watchlist";

export function getWatchlist(): WatchlistStreamer[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveWatchlist(items: WatchlistStreamer[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function addToWatchlist(streamer: WatchlistStreamer): boolean {
  const list = getWatchlist();
  const exists = list.some(
    (s) => s.login.toLowerCase() === streamer.login.toLowerCase()
  );
  if (exists) return false;
  list.push(streamer);
  saveWatchlist(list);
  return true;
}

export function removeFromWatchlist(login: string): void {
  const list = getWatchlist().filter(
    (s) => s.login.toLowerCase() !== login.toLowerCase()
  );
  saveWatchlist(list);
}

export function isInWatchlist(login: string): boolean {
  return getWatchlist().some(
    (s) => s.login.toLowerCase() === login.toLowerCase()
  );
}
