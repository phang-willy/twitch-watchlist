import { getAccessToken } from "./twitch-auth";
import type { TwitchUser, TwitchStream } from "./types";
import type { SearchResultItem, LiveStreamer, OfflineStreamer } from "./types";

const API_URL = process.env.TWITCH_API_URL ?? "https://api.twitch.tv/helix";

async function twitchFetch<T>(endpoint: string): Promise<T> {
  const token = await getAccessToken();
  const clientId = process.env.TWITCH_CLIENT_ID;

  if (!clientId) {
    throw new Error("Missing TWITCH_CLIENT_ID in environment");
  }

  const url = endpoint.startsWith("http") ? endpoint : `${API_URL}${endpoint}`;
  const res = await fetch(url, {
    headers: {
      "Client-ID": clientId,
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Twitch API error: ${res.status} ${text}`);
  }

  return res.json();
}

export async function searchUsers(login: string): Promise<SearchResultItem | null> {
  const data = (await twitchFetch<{ data: TwitchUser[] }>(
    `/users?login=${encodeURIComponent(login.toLowerCase())}`
  )) as { data: TwitchUser[] };

  const user = data.data?.[0];
  if (!user) return null;

  return {
    id: user.id,
    login: user.login,
    displayName: user.display_name,
    profileImageUrl: user.profile_image_url,
    twitchUrl: `https://www.twitch.tv/${user.login}`,
  };
}

interface StreamsApiResponse {
  data: TwitchStream[];
}

export async function getStreams(logins: string[]): Promise<{
  live: LiveStreamer[];
  offline: OfflineStreamer[];
  liveCount: number;
}> {
  if (logins.length === 0) {
    return { live: [], offline: [], liveCount: 0 };
  }

  const userLogins = logins.map((l) => l.toLowerCase()).filter(Boolean);
  const usersParam = userLogins.map((l) => `user_login=${l}`).join("&");

  const streamsData = (await twitchFetch<StreamsApiResponse>(
    `/streams?${usersParam}`
  )) as StreamsApiResponse;

  const streams = streamsData.data ?? [];
  const liveLogins = new Set(streams.map((s) => s.user_login.toLowerCase()));

  const usersData = (await twitchFetch<{ data: TwitchUser[] }>(
    `/users?${userLogins.map((l) => `login=${l}`).join("&")}`
  )) as { data: TwitchUser[] };

  const usersById = new Map(
    (usersData.data ?? []).map((u) => [u.id, u])
  );
  const usersByLogin = new Map(
    (usersData.data ?? []).map((u) => [u.login.toLowerCase(), u])
  );

  const live: LiveStreamer[] = streams
    .sort((a, b) => b.viewer_count - a.viewer_count)
    .map((s) => {
      const user = usersById.get(s.user_id) ?? usersByLogin.get(s.user_login.toLowerCase());
      const profileUrl = user?.profile_image_url ?? "";
      return {
        id: s.user_id,
        login: s.user_login,
        displayName: s.user_name,
        profileImageUrl: profileUrl,
        twitchUrl: `https://www.twitch.tv/${s.user_login}`,
        viewerCount: s.viewer_count,
        gameName: s.game_name || "Unknown",
        streamTitle: s.title || "",
        startedAt: s.started_at,
      };
    });

  const offlineLogins = userLogins.filter((login) => !liveLogins.has(login));

  const offline: OfflineStreamer[] = await Promise.all(
    offlineLogins.map(async (login) => {
      const user = usersByLogin.get(login);
      if (!user) {
        return {
          id: login,
          login,
          displayName: login,
          profileImageUrl: "",
          twitchUrl: `https://www.twitch.tv/${login}`,
        };
      }
      let lastStreamedAt: string | undefined;
      try {
        const videosData = (await twitchFetch<{ data: { created_at: string }[] }>(
          `/videos?user_id=${user.id}&first=1&type=archive`
        )) as { data: { created_at: string }[] };
        lastStreamedAt = videosData.data?.[0]?.created_at;
      } catch {
        // ignore - lastStreamedAt reste undefined
      }
      return {
        id: user.id,
        login: user.login,
        displayName: user.display_name,
        profileImageUrl: user.profile_image_url,
        twitchUrl: `https://www.twitch.tv/${user.login}`,
        lastStreamedAt,
      };
    })
  );

  return {
    live,
    offline,
    liveCount: live.length,
  };
}
