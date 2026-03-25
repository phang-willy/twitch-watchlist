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
