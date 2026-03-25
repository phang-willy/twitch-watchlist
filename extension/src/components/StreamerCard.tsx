import { HiOutlineClock, HiUsers } from "react-icons/hi2";
import { formatStartedAt, formatTimeAgo, formatViewers } from "@/lib/format";
import type { LiveStreamer, OfflineStreamer } from "@/lib/types";

const FALLBACK_AVATAR = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
    <rect width="120" height="120" rx="60" fill="#475569"/>
    <circle cx="60" cy="48" r="20" fill="#e2e8f0"/>
    <path d="M30 105c0-16.5 13.5-30 30-30s30 13.5 30 30" fill="#e2e8f0"/>
  </svg>`
)}`;

type StreamerCardProps =
  | { variant: "live"; streamer: LiveStreamer; onRemove: (login: string) => void }
  | { variant: "offline"; streamer: OfflineStreamer; onRemove: (login: string) => void };

export function StreamerCard(props: StreamerCardProps) {
  const { streamer, onRemove } = props;
  const isLive = props.variant === "live";

  return (
    <article className="grid grid-cols-12 items-center gap-2 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-600 dark:bg-slate-700">
      <a 
        href={`https://twitch.tv/${streamer.login}`} 
        target="_blank" 
        rel="noopener noreferrer" 
        title={`Voir le profil de ${streamer.displayName}`}
        className="col-span-2 flex items-center justify-center rounded-full"
      >
        <img
          src={streamer.profileImageUrl || FALLBACK_AVATAR}
          alt={streamer.displayName}
          className="w-full rounded-full object-cover"
          onError={(e) => {
            const img = e.currentTarget;
            if (img.src !== FALLBACK_AVATAR) img.src = FALLBACK_AVATAR;
          }}
        />
      </a>
      <div
        className="min-w-0 grid grid-cols-1 col-span-8"
      >
        <h4 className="mb-2 truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{streamer.displayName}</h4>
        {isLive ? (
          <>
            <p className="truncate text-xs text-slate-600 dark:text-slate-300">{(streamer as LiveStreamer).gameName}</p>
            {(streamer as LiveStreamer).streamTitle && (
              <p className="mb-2 truncate text-[11px] text-slate-500 dark:text-slate-400" title={(streamer as LiveStreamer).streamTitle}>
                {(streamer as LiveStreamer).streamTitle}
              </p>
            )}
            <p className="inline-flex items-center gap-1 text-xs text-violet-600 dark:text-violet-400">
              <HiUsers className="h-3 w-3" />
              {formatViewers((streamer as LiveStreamer).viewerCount)}
            </p>
            <div className="flex items-center gap-1">
              <span className="relative flex size-2 mr-1">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75"></span>
                <span className="relative inline-flex size-2 rounded-full bg-violet-500"></span>
              </span>
              <p className="text-xs text-violet-600 dark:text-violet-400">
                {formatStartedAt((streamer as LiveStreamer).startedAt)}
              </p>
            </div>
          </>
        ) : (
            <p className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <HiOutlineClock className="h-3 w-3" />
            {(streamer as OfflineStreamer).lastStreamedAt
              ? formatTimeAgo((streamer as OfflineStreamer).lastStreamedAt!)
              : "Hors ligne"}
          </p>
        )}
      </div>
      <div className="grid grid-cols-1 gap-2 col-span-2">
        {isLive && (
          <a
            href={`https://twitch.tv/${streamer.login}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded bg-violet-100 px-2 py-1 text-xs font-medium text-violet-700 hover:bg-violet-200 dark:bg-violet-900/40 dark:text-violet-300 dark:hover:bg-violet-900/60 cursor-pointer"
            title={`Aller au live de ${streamer.displayName}`}
          >
            Voir le live
          </a>
        )}
        <button
          type="button"
          title={`Retirer ${streamer.displayName}`}
          onClick={() => onRemove(streamer.login)}
          className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:text-red-600 dark:border-slate-600 dark:text-slate-300 dark:hover:text-red-400 cursor-pointer"
          >
            Retirer
        </button>
      </div>
    </article>
  );
}
