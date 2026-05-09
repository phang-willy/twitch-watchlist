import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TwitchAuthService } from './twitch-auth.service';
import type {
  LiveStreamer,
  OfflineStreamer,
  SearchResultItem,
  StreamsResponse,
  TwitchStream,
  TwitchUser,
} from './twitch.types';

@Injectable()
export class TwitchService {
  constructor(
    private readonly config: ConfigService,
    private readonly auth: TwitchAuthService,
  ) {}

  private apiUrl(): string {
    return (
      this.config.get<string>('TWITCH_API_URL') ?? 'https://api.twitch.tv/helix'
    );
  }

  private async twitchFetch<T>(endpoint: string): Promise<T> {
    const clientId = this.config.get<string>('TWITCH_CLIENT_ID');
    if (!clientId) {
      throw new Error('Missing TWITCH_CLIENT_ID');
    }
    const token = await this.auth.getAccessToken();
    const url = endpoint.startsWith('http')
      ? endpoint
      : `${this.apiUrl().replace(/\/$/, '')}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    const res = await fetch(url, {
      headers: {
        'Client-Id': clientId,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Twitch API error: ${res.status} ${text}`);
    }

    return res.json() as Promise<T>;
  }

  async searchUsers(login: string): Promise<SearchResultItem | null> {
    const data = await this.twitchFetch<{ data: TwitchUser[] }>(
      `/users?login=${encodeURIComponent(login.toLowerCase())}`,
    );
    const user = data.data?.[0];
    if (!user) {
      return null;
    }
    return {
      id: user.id,
      login: user.login,
      displayName: user.display_name,
      profileImageUrl: user.profile_image_url,
      twitchUrl: `https://www.twitch.tv/${user.login}`,
    };
  }

  async getStreams(logins: string[]): Promise<StreamsResponse> {
    const userLogins = logins
      .map((l) => l.toLowerCase().trim())
      .filter(Boolean);
    if (userLogins.length === 0) {
      return { live: [], offline: [], liveCount: 0 };
    }

    const streamParams = userLogins
      .map((l) => `user_login=${encodeURIComponent(l)}`)
      .join('&');
    const streamsData = await this.twitchFetch<{ data: TwitchStream[] }>(
      `/streams?${streamParams}`,
    );
    const streams = streamsData.data ?? [];
    const liveLogins = new Set(streams.map((s) => s.user_login.toLowerCase()));

    const userParams = userLogins
      .map((l) => `login=${encodeURIComponent(l)}`)
      .join('&');
    const usersData = await this.twitchFetch<{ data: TwitchUser[] }>(
      `/users?${userParams}`,
    );
    const users = usersData.data ?? [];

    const usersById = new Map(users.map((u) => [u.id, u]));
    const usersByLogin = new Map(users.map((u) => [u.login.toLowerCase(), u]));

    const sortedStreams = [...streams].sort(
      (a, b) => b.viewer_count - a.viewer_count,
    );

    const live: LiveStreamer[] = sortedStreams.map((s) => {
      const u =
        usersById.get(s.user_id) ??
        usersByLogin.get(s.user_login.toLowerCase());
      return {
        id: s.user_id,
        login: s.user_login,
        displayName: s.user_name,
        profileImageUrl: u?.profile_image_url ?? '',
        twitchUrl: `https://www.twitch.tv/${s.user_login}`,
        viewerCount: s.viewer_count,
        gameName: s.game_name || 'Unknown',
        streamTitle: s.title || '',
        startedAt: s.started_at,
      };
    });

    const offline: OfflineStreamer[] = [];
    for (const login of userLogins) {
      if (liveLogins.has(login)) {
        continue;
      }
      const u = usersByLogin.get(login);
      if (!u) {
        offline.push({
          id: login,
          login,
          displayName: login,
          profileImageUrl: '',
          twitchUrl: `https://www.twitch.tv/${login}`,
        });
        continue;
      }

      let lastStreamedAt: string | undefined;
      try {
        const videos = await this.twitchFetch<{
          data: { created_at: string }[];
        }>(`/videos?user_id=${encodeURIComponent(u.id)}&first=1&type=archive`);
        lastStreamedAt = videos.data?.[0]?.created_at;
      } catch {
        lastStreamedAt = undefined;
      }

      const item: OfflineStreamer = {
        id: u.id,
        login: u.login,
        displayName: u.display_name,
        profileImageUrl: u.profile_image_url,
        twitchUrl: `https://www.twitch.tv/${u.login}`,
      };
      if (lastStreamedAt) {
        item.lastStreamedAt = lastStreamedAt;
      }
      offline.push(item);
    }

    return {
      live,
      offline,
      liveCount: live.length,
    };
  }
}
