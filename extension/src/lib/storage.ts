import type { WatchlistStreamer } from "@/lib/types";

const STORAGE_KEY = "twitch_watchlist";

function hasChromeStorage(): boolean {
  return typeof chrome !== "undefined" && Boolean(chrome.storage?.local);
}

export async function getWatchlist(): Promise<WatchlistStreamer[]> {
  if (hasChromeStorage()) {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    const value = result[STORAGE_KEY];
    return Array.isArray(value) ? (value as WatchlistStreamer[]) : [];
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as WatchlistStreamer[]) : [];
  } catch {
    return [];
  }
}

export async function saveWatchlist(items: WatchlistStreamer[]): Promise<void> {
  if (hasChromeStorage()) {
    await chrome.storage.local.set({ [STORAGE_KEY]: items });
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export async function addToWatchlist(streamer: WatchlistStreamer): Promise<boolean> {
  const list = await getWatchlist();
  const exists = list.some(
    (s) => s.login.toLowerCase() === streamer.login.toLowerCase()
  );
  if (exists) return false;
  await saveWatchlist([...list, streamer]);
  return true;
}

export async function removeFromWatchlist(login: string): Promise<void> {
  const list = await getWatchlist();
  await saveWatchlist(
    list.filter((s) => s.login.toLowerCase() !== login.toLowerCase())
  );
}
