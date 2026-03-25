import { HiOutlineClock, HiUsers } from "react-icons/hi2";
import { formatStartedAt, formatTimeAgo, formatViewers } from "@/lib/format";
import type {
  LiveStreamer,
  OfflineStreamer,
  SearchResultItem,
} from "@/lib/types";

const FALLBACK_AVATAR = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
    <rect width="120" height="120" rx="60" fill="#475569"/>
    <circle cx="60" cy="48" r="20" fill="#e2e8f0"/>
    <path d="M30 105c0-16.5 13.5-30 30-30s30 13.5 30 30" fill="#e2e8f0"/>
  </svg>`
)}`;

interface SearchResultProps {
  result: SearchResultItem | null;
  streamer: LiveStreamer | OfflineStreamer | null;
  loading: boolean;
  error: string | null;
  inWatchlist: boolean;
  onAdd: () => void;
}

export function SearchResult({
  result,
  streamer,
  loading,
  error,
  inWatchlist,
  onAdd,
}: SearchResultProps) {
  if (loading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center text-xs text-slate-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-400">
        Recherche...
      </div>
    );
  }
  if (error) {
    return (
      <p className="rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
        {error}
      </p>
    );
  }
  if (!result) return null;

  const isLive = Boolean(streamer && "viewerCount" in streamer);
  const live = isLive ? (streamer as LiveStreamer) : null;
  const offline = !isLive ? (streamer as OfflineStreamer | null) : null;

  return (
    <div
      title={live?.streamTitle || undefined}
      className="grid grid-cols-12 items-center gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-600 dark:bg-slate-700"
    >
      <a
        href={result.twitchUrl}
        target="_blank"
        rel="noopener noreferrer"
        title={`Aller au profil de ${result.displayName}`}
        className="col-span-2 flex items-center justify-center rounded-full"
      >
        <img
          src={result.profileImageUrl || FALLBACK_AVATAR}
          alt={result.displayName}
          className="w-full rounded-full object-cover"
          onError={(e) => {
            const img = e.currentTarget;
            if (img.src !== FALLBACK_AVATAR) img.src = FALLBACK_AVATAR;
          }}
        />
      </a>

      <div className="min-w-0 grid grid-cols-1 col-span-8">
        <h4 className="mb-2 truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
          {result.displayName}
        </h4>

        {live ? (
          <>
            <p className="truncate text-xs text-slate-600 dark:text-slate-300">
              {live.gameName}
            </p>
            {live.streamTitle && (
              <p
                className="mb-2 truncate text-[11px] text-slate-500 dark:text-slate-400"
                title={live.streamTitle}
              >
                {live.streamTitle}
              </p>
            )}
            <p className="inline-flex items-center gap-1 text-xs text-violet-600 dark:text-violet-400">
              <HiUsers className="h-3 w-3" />
              {formatViewers(live.viewerCount)}
            </p>
            <div className="flex items-center gap-1">
              <span className="relative flex size-2 mr-1">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-violet-500" />
              </span>
              <p className="text-xs text-violet-600 dark:text-violet-400">
                {formatStartedAt(live.startedAt)}
              </p>
            </div>
          </>
        ) : (
          <p className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <HiOutlineClock className="h-3 w-3" />
            {offline?.lastStreamedAt
              ? formatTimeAgo(offline.lastStreamedAt)
              : "Hors ligne"}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2 col-span-2">
        <a
          href={result.twitchUrl}
          target="_blank"
          rel="noopener noreferrer"
          title={ live ? `Voir live de ${result.displayName}` : `Voir le profil de ${result.displayName}`}
          className="rounded bg-violet-100 px-2 py-1 text-xs font-medium text-violet-700 hover:bg-violet-200 dark:bg-violet-900/40 dark:text-violet-300 dark:hover:bg-violet-900/60 cursor-pointer flex items-center justify-center gap-1"
        >
          {live ? "Voir le live" : "Voir le profil"}
        </a>

        <button
          type="button"
          title={`${inWatchlist ? "Vous avez déjà ajouté" : "Ajouter"} ${result.displayName} à votre watchlist`}
          disabled={inWatchlist}
          onClick={onAdd}
          className="rounded bg-violet-600 px-2 py-1 text-xs font-medium text-white disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-700 dark:disabled:text-slate-500 cursor-pointer"
        >
          {inWatchlist ? "Ajouté" : "Ajouter"}
        </button>
      </div>
    </div>
  );
}
