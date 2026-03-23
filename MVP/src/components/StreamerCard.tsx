"use client";

import Image from "next/image";
import {
  formatViewers,
  formatStartedAt,
  formatTimeAgo,
} from "@/lib/format";
import type { LiveStreamer, OfflineStreamer } from "@/lib/types";
import { HiUsers, HiOutlineClock  } from "react-icons/hi2";

type StreamerCardProps =
  | {
      variant: "live";
      streamer: LiveStreamer;
      onRemove?: (login: string) => void;
    }
  | {
      variant: "offline";
      streamer: OfflineStreamer;
      onRemove?: (login: string) => void;
    };

export function StreamerCard(props: StreamerCardProps) {
  const { streamer, onRemove } = props;

  const subtitle =
    props.variant === "live"
      ? (
          <span className="inline-flex items-center gap-1.5 text-violet-600">
            <HiUsers className="h-4 w-4 shrink-0" />
            {formatViewers((streamer as LiveStreamer).viewerCount)}
          </span>
        )
      : (() => {
          const last = (streamer as OfflineStreamer).lastStreamedAt;
          return last
            ? (
                <span className="inline-flex items-center gap-1.5 text-slate-500">
                  <HiOutlineClock className="h-4 w-4 shrink-0" />
                  {formatTimeAgo(last)}
                </span>
              )
            : "Hors ligne";
        })();

  const imageEl = (
    <Image
      src={
        streamer.profileImageUrl ||
        "https://static-cdn.jtvnw.net/user-default-pictures-uv/13e738fa-def9-11e9-8110-06f36cef6721-profile_image-300x300.png"
      }
      alt={streamer.displayName}
      width={300}
      height={300}
      className="h-24 w-24 shrink-0 rounded-full object-cover bg-slate-200"
    />
  );

  const removeButton = onRemove ? (
    <button
      type="button"
      title={`Retirer ${streamer.displayName}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onRemove(streamer.login);
      }}
      className="shrink-0 rounded px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-red-600 border"
    >
      Retirer
    </button>
  ) : null;

  if (props.variant === "live") {
    const live = streamer as LiveStreamer;
    return (
      <article>
        <a
          href={live.twitchUrl}
          target="_blank"
          rel="noopener noreferrer"
          title={live.streamTitle || undefined}
          className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-violet-300 hover:shadow-md sm:gap-4"
        >
          {imageEl}
          <div className="flex flex-row justify-between">
            <div className="grid grid-cols-1 gap-2">
              <p className="font-bold text-slate-800 truncate">
                {streamer.displayName}
              </p>
              <div className="grid grid-cols-1 gap-0">
                <p className="text-sm font-medium text-slate-700 truncate">
                  {live.gameName}
                </p>
                <p className="text-xs font-medium text-slate-600 truncate w-3/4">
                  {live.streamTitle}
                </p>
              </div>
              <p className="text-sm truncate">{subtitle}</p>
            </div>
            <div className="hidden md:flex md:items-center md:gap-2">
              <span className="relative flex h-3 w-3 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-500 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-violet-600" />
              </span>
              <p className="text-xs text-violet-600 truncate">
                {formatStartedAt(live.startedAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end">{removeButton}</div>
        </a>
      </article>
    );
  }

  const offline = streamer as OfflineStreamer;
  return (
    <article>
      <a
        href={offline.twitchUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md sm:gap-4"
      >
        {imageEl}
        <div className="min-w-0 flex-1 text-left">
          <p className="font-bold text-slate-800 truncate">
            {streamer.displayName}
          </p>
          <p className="text-sm truncate">{subtitle}</p>
        </div>
        {removeButton}
      </a>
    </article>
  );
}
