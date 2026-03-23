"use client";

import Image from "next/image";
import {
  formatViewers,
  formatStartedAt,
  formatTimeAgo,
} from "@/lib/format";
import type {
  SearchResultItem,
  LiveStreamer,
  OfflineStreamer,
} from "@/lib/types";
import { HiUsers, HiOutlineClock } from "react-icons/hi2";

const FALLBACK_AVATAR =
  "https://static-cdn.jtvnw.net/user-default-pictures-uv/13e738fa-def9-11e9-8110-06f36cef6721-profile_image-300x300.png";

interface SearchResultProps {
  result: SearchResultItem | null;
  streamer: LiveStreamer | OfflineStreamer | null;
  loading: boolean;
  error: string | null;
  onAdd: (streamer: SearchResultItem) => void;
  isInWatchlist: (login: string) => boolean;
}

function isLiveStreamer(
  s: LiveStreamer | OfflineStreamer
): s is LiveStreamer {
  return "viewerCount" in s;
}

export function SearchResult({
  result,
  streamer,
  loading,
  error,
  onAdd,
  isInWatchlist,
}: SearchResultProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-6 text-slate-500">
        <div
          className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-violet-600"
          aria-hidden
        />
        <span>Recherche en cours...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        {error}
      </div>
    );
  }

  if (!result) return null;

  const inList = isInWatchlist(result.login);
  const isLive = streamer && isLiveStreamer(streamer);

  const subtitle = isLive ? (
    <span className="inline-flex items-center gap-1.5 text-violet-600">
      <HiUsers className="h-4 w-4 shrink-0" />
      {formatViewers(streamer.viewerCount)}
    </span>
  ) : streamer && !isLiveStreamer(streamer) ? (
    streamer.lastStreamedAt ? (
      <span className="inline-flex items-center gap-1.5 text-slate-500">
        <HiOutlineClock className="h-4 w-4 shrink-0" />
        {formatTimeAgo(streamer.lastStreamedAt)}
      </span>
    ) : (
      "Hors ligne"
    )
  ) : (
    <span className="text-slate-500">@{result.login}</span>
  );

  const imageEl = (
    <Image
      src={result.profileImageUrl || FALLBACK_AVATAR}
      alt={result.displayName}
      width={300}
      height={300}
      className="h-24 w-24 shrink-0 rounded-full object-cover bg-slate-200"
    />
  );

  const actions = (
    <div className="flex items-center gap-2">
      <a
        href={result.twitchUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="rounded px-3 py-1.5 text-xs font-medium text-violet-600 hover:bg-violet-50"
      >
        Twitch
      </a>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onAdd(result);
        }}
        disabled={inList}
        className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
          inList
            ? "cursor-not-allowed bg-slate-100 text-slate-400"
            : "bg-violet-600 text-white hover:bg-violet-700"
        }`}
      >
        {inList ? "Ajouté" : "Ajouter"}
      </button>
    </div>
  );

  return (
    <div
      title={isLive && streamer.streamTitle ? streamer.streamTitle : undefined}
      className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:gap-4"
    >
      {imageEl}
      <div className="flex min-w-0 flex-1 flex-row justify-between">
        <div className="grid grid-cols-1 gap-2">
          <p className="font-bold text-slate-800 truncate">
            {result.displayName}
          </p>
          {isLive ? (
            <>
              <div className="grid grid-cols-1 gap-0">
                <p className="text-sm font-medium text-slate-700 truncate">
                  {streamer.gameName}
                </p>
                {streamer.streamTitle && (
                  <p
                    className="text-xs font-medium text-slate-600 truncate w-3/4"
                    title={streamer.streamTitle}
                  >
                    {streamer.streamTitle}
                  </p>
                )}
              </div>
              <p className="text-sm truncate">{subtitle}</p>
            </>
          ) : (
            <p className="text-sm truncate">{subtitle}</p>
          )}
        </div>
        {isLive && (
          <div className="hidden shrink-0 md:flex md:items-center md:gap-2">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-600" />
            </span>
            <p className="text-xs text-violet-600 truncate">
              {formatStartedAt(streamer.startedAt)}
            </p>
          </div>
        )}
      </div>
      {actions}
    </div>
  );
}
