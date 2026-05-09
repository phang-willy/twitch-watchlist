export interface TwitchUser {
  id: string;
  login: string;
  display_name: string;
  profile_image_url: string;
}

export interface TwitchStream {
  user_id: string;
  user_login: string;
  user_name: string;
  viewer_count: number;
  game_name?: string;
  title?: string;
  started_at: string;
}

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
  lastStreamedAt?: string;
}

export interface StreamsResponse {
  live: LiveStreamer[];
  offline: OfflineStreamer[];
  liveCount: number;
}
