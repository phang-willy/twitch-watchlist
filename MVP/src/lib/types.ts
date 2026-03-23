// Twitch API response types
export interface TwitchUser {
  id: string;
  login: string;
  display_name: string;
  type: string;
  broadcaster_type: string;
  description: string;
  profile_image_url: string;
  offline_image_url: string;
  view_count: number;
  created_at: string;
}

export interface TwitchStream {
  id: string;
  user_id: string;
  user_login: string;
  user_name: string;
  game_id: string;
  game_name: string;
  type: string;
  title: string;
  viewer_count: number;
  started_at: string;
  language: string;
  thumbnail_url: string;
  tag_ids: string[];
  is_muted: boolean;
}

// App-facing types
export interface SearchResultItem {
  id: string;
  login: string;
  displayName: string;
  profileImageUrl: string;
  twitchUrl: string;
}

export interface LiveStreamer {
  id: string;
  login: string;
  displayName: string;
  profileImageUrl: string;
  twitchUrl: string;
  viewerCount: number;
  gameName: string;
  streamTitle: string;
  startedAt: string;
}

export interface OfflineStreamer {
  id: string;
  login: string;
  displayName: string;
  profileImageUrl: string;
  twitchUrl: string;
  /** ISO date du dernier stream (fin du VOD) */
  lastStreamedAt?: string;
}

export interface WatchlistStreamer {
  id: string;
  login: string;
  displayName: string;
  profileImageUrl: string;
}

export interface StreamsResponse {
  live: LiveStreamer[];
  offline: OfflineStreamer[];
  liveCount: number;
}
