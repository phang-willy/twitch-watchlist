import type { LiveStreamer } from "@/lib/types";

export type LiveSortKey =
  | "viewers-asc"
  | "viewers-desc"
  | "since-asc"
  | "since-desc"
  | "name-asc"
  | "name-desc";

export function sortLiveStreamers(
  live: LiveStreamer[],
  sortBy: LiveSortKey
): LiveStreamer[] {
  const items = [...live];

  switch (sortBy) {
    case "viewers-asc":
      return items.sort((a, b) => a.viewerCount - b.viewerCount);
    case "viewers-desc":
      return items.sort((a, b) => b.viewerCount - a.viewerCount);
    case "since-asc":
      return items.sort(
        (a, b) =>
          new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
      );
    case "since-desc":
      return items.sort(
        (a, b) =>
          new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
      );
    case "name-asc":
      return items.sort((a, b) =>
        a.displayName.localeCompare(b.displayName, "fr")
      );
    case "name-desc":
      return items.sort((a, b) =>
        b.displayName.localeCompare(a.displayName, "fr")
      );
    default:
      return items;
  }
}

