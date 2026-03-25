import type {
  OfflineStreamer,
  SearchResultItem,
  StreamsResponse,
} from "@/lib/types";

const API_BASE_URLS = ["https://test.phangwilly.com/twitch", "http://localhost:3000"] as const;

function formatApiError(baseUrl: string, status: number, message: string): string {
  return `[${status}] ${message} (${baseUrl})`;
}

function safeParse<T>(text: string): T | null {
  try {
    return text ? (JSON.parse(text) as T) : null;
  } catch {
    return null;
  }
}

export async function searchStreamer(login: string): Promise<SearchResultItem | null> {
  let lastError = "Backend indisponible";
  for (const baseUrl of API_BASE_URLS) {
    try {
      const res = await fetch(
        `${baseUrl}/api/twitch/search?q=${encodeURIComponent(login)}`,
        { method: "GET" }
      );
      const text = await res.text();
      const data = safeParse<SearchResultItem | { error?: string } | null>(text);
      if (!res.ok) {
        const message =
          data && typeof data === "object" && "error" in data && data.error
            ? data.error
            : `Erreur serveur (${res.status})`;
        throw new Error(formatApiError(baseUrl, res.status, message));
      }
      return (data as SearchResultItem | null) ?? null;
    } catch (err) {
      if (err instanceof Error && err.message) {
        lastError = err.message;
      } else {
        lastError = `[0] Erreur reseau (${baseUrl})`;
      }
    }
  }
  throw new Error(lastError);
}

export async function fetchStreams(logins: string[]): Promise<StreamsResponse> {
  let lastError = "Backend indisponible";
  for (const baseUrl of API_BASE_URLS) {
    try {
      const res = await fetch(`${baseUrl}/api/twitch/streams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logins }),
      });
      const text = await res.text();
      const data = safeParse<StreamsResponse | { error?: string }>(text);

      if (!res.ok) {
        const message =
          data && typeof data === "object" && "error" in data && data.error
            ? data.error
            : `Erreur serveur (${res.status})`;
        throw new Error(formatApiError(baseUrl, res.status, message));
      }

      return (
        (data as StreamsResponse) ?? {
          live: [],
          offline: [],
          liveCount: 0,
        }
      );
    } catch (err) {
      if (err instanceof Error && err.message) {
        lastError = err.message;
      } else {
        lastError = `[0] Erreur reseau (${baseUrl})`;
      }
    }
  }
  throw new Error(lastError);
}

export function sortOfflineByLastStream(streamers: OfflineStreamer[]): OfflineStreamer[] {
  return [...streamers].sort((a, b) => {
    const aTime = a.lastStreamedAt ? new Date(a.lastStreamedAt).getTime() : 0;
    const bTime = b.lastStreamedAt ? new Date(b.lastStreamedAt).getTime() : 0;
    return bTime - aTime;
  });
}
